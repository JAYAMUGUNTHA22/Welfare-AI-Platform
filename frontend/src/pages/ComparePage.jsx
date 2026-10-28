import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GitCompare, Search, X, Sparkles, Check, CheckCircle2,
  ArrowRight, FileText, Wallet, Info, Layers
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMe } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { getSchemeCatalogText, getSchemeCategoryLabel } from '@/utils/schemeCatalogTranslations';
import { SchemeApplicationAction } from '@/components/shared/SchemeApplicationAction';
import { SchemeDetailsButton } from '@/components/shared/SchemeDetailsLink';
import { getPersonalizedSchemeRecommendations } from '@/data/myschemeDataset';

function statedBenefitAmount(text) {
  const match = String(text || '').match(/(?:₹|rs\.?\s*|inr\s*)\s*([\d,]+(?:\.\d+)?)\s*(crore|cr|lakh|lac|thousand|k)?/i);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ''));
  const unit = (match[2] || '').toLowerCase();
  const multiplier = ['crore', 'cr'].includes(unit) ? 10000000
    : ['lakh', 'lac'].includes(unit) ? 100000
      : ['thousand', 'k'].includes(unit) ? 1000 : 1;
  return value * multiplier;
}

function normalizeDocuments(documents) {
  if (Array.isArray(documents)) return documents.map((item) => String(item).trim()).filter(Boolean);
  if (typeof documents !== 'string' || !documents.trim()) return [];
  return documents.split(/[;,\n•]+/).map((item) => item.trim()).filter(Boolean);
}

function conciseText(value, maxLength = 180) {
  const text = (Array.isArray(value) ? value.join(' ') : String(value || '')).replace(/\s+/g, ' ').trim();
  if (!text) return 'Not listed in the catalogue.';
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

function localizedCatalogText(value, language) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'string' ? item : item?.criterion_text || '')
      .filter(Boolean).map((item) => getSchemeCatalogText(item, language)).join(' ');
  }
  return getSchemeCatalogText(String(value || ''), language);
}

export function ComparePage() {
  const { t, i18n } = useTranslation();
  const ui = (key, options) => t(`ui.compare.${key}`, options);
  const categoryLabel = (value) => {
    const normalized = String(value || '').toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
    const catalogKey = ({ 'agriculture rural environment': 'catAgriculture', agriculture: 'catAgriculture', 'education learning': 'catEducation', education: 'catEducation', 'business entrepreneurship': 'catBusiness', business: 'catBusiness', 'social welfare empowerment': 'catSocialWelfare', 'social welfare': 'catSocialWelfare', 'women and child': 'catWomenChild', 'skills employment': 'catSkills', skills: 'catSkills', 'banking financial services and insurance': 'catBanking', banking: 'catBanking', 'health wellness': 'catHealth', healthcare: 'catHealth', health: 'catHealth', 'housing shelter': 'catHousing', housing: 'catHousing', 'sports culture': 'catSports', sports: 'catSports', 'entrepreneurship & micro-loans': 'catBusiness', 'agriculture & rural employment': 'catAgriculture', 'education & scholarships': 'catEducation', 'retirement & financial security': 'catBanking' })[normalized];
    if (catalogKey) return t(catalogKey, { defaultValue: value });
    return getSchemeCategoryLabel(value, i18n.language) || value;
  };
  const compareText = (scheme, field, fallback) => {
    const id = String(scheme.schemeId || scheme.id || '').toLowerCase();
    const catalog = id === 'aabcs' ? 'aabcs' : id === 'financial-assistance-scheme' ? 'apeda' : id === 'biocare' ? 'biocare' : null;
    return catalog && i18n.language !== 'English'
      ? ui(`${catalog}${field}`)
      : localizedCatalogText(fallback, i18n.language);
  };
  const matchTierLabel = (tier) => {
    const key = ({ 'Strong Match': 'mySchemesPage.strongMatchFilter', 'Potential Match': 'mySchemesPage.potentialMatchFilter', 'Needs Review': 'mySchemesPage.needsReviewFilter' })[tier];
    return key ? t(key, { defaultValue: tier }) : tier;
  };
  const [searchParams] = useSearchParams();

  const [allSchemesList, setAllSchemesList] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected schemes IDs for comparison (Max 3)
  const [selectedIds, setSelectedIds] = useState([]);
  const [isComparing, setIsComparing] = useState(false);

  // Manual Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let cachedProfile = {};
      try { cachedProfile = JSON.parse(localStorage.getItem('currentUser') || '{}') || {}; } catch { /* use account profile */ }
      let profile = cachedProfile;
      try {
        const meRes = await getMe();
        profile = meRes?.user || meRes || cachedProfile;
      } catch { /* use the saved profile when account refresh is unavailable */ }
      setUserProfile(profile);

      const recommendations = await getPersonalizedSchemeRecommendations(profile, 4, { perSource: true });
      const dashboardSchemes = ['state', 'central', 'private'].flatMap((sourceType) =>
        recommendations.filter((scheme) => scheme.sourceType === sourceType).slice(0, 4)
      );
      const uniqueSchemes = [...new Map(dashboardSchemes.map((scheme) => [scheme.schemeId || scheme.id, scheme])).values()];
      const loadedSchemes = uniqueSchemes.map((scheme) => ({
        ...scheme,
        benefitSummary: scheme.benefitSummary || 'No benefit summary is available in the catalogue.',
        benefitAmount: scheme.benefitAmount || 'Amount not stated in catalogue',
        eligibility: typeof scheme.eligibility === 'string' ? [scheme.eligibility] : (scheme.eligibility || []),
        documentsRequired: normalizeDocuments(scheme.documentsRequired),
        processingTime: scheme.processingTime || 'Not stated in the catalogue',
        applicationMethod: scheme.applicationMethod || scheme.applicationProcess || 'See official scheme details',
        deadline: scheme.deadline || 'Check official scheme source',
      }));
      setAllSchemesList(loadedSchemes);

      // Pre-select preset or default first 2 schemes
      const initialIds = searchParams.get('ids')?.split(',').filter(Boolean);
      if (initialIds && initialIds.length >= 2) {
        setSelectedIds(initialIds.slice(0, 3));
        setIsComparing(true);
      } else {
        const suggested = [...loadedSchemes].sort((a, b) => {
          const amountA = statedBenefitAmount(a.benefitSummary);
          const amountB = statedBenefitAmount(b.benefitSummary);
          if (amountA != null && amountB != null && amountA !== amountB) return amountB - amountA;
          if (amountA != null && amountB == null) return -1;
          if (amountB != null && amountA == null) return 1;
          return (b.rankingScore || 0) - (a.rankingScore || 0);
        }).slice(0, 3);
        setSelectedIds(suggested.map((scheme) => scheme.id || scheme.schemeId));
        setIsComparing(suggested.length >= 2);
      }
    } catch (e) {
      console.error('Failed to load schemes', e);
      setError('We could not load your dashboard recommendations. Please try again after refreshing your profile.');
      setAllSchemesList([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSelectScheme = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((s) => s !== id);
        if (next.length < 2) setIsComparing(false);
        return next;
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const removeSelectedScheme = (id) => {
    setSelectedIds((prev) => {
      const next = prev.filter((s) => s !== id);
      if (next.length < 2) setIsComparing(false);
      return next;
    });
  };

  const clearAllSelected = () => {
    setSelectedIds([]);
    setIsComparing(false);
  };

  const selectedSchemes = allSchemesList.filter(
    (s) => selectedIds.includes(s.id) || selectedIds.includes(s.schemeId)
  );

  // Group real schemes dynamically into smart similarity clusters (ONLY groups with >= 2 schemes!)
  const getSmartSimilarityGroups = () => {
    const categoryMap = {};
    allSchemesList.forEach((s) => {
      const catKey = (s.category || 'general').toLowerCase();
      if (!categoryMap[catKey]) categoryMap[catKey] = [];
      categoryMap[catKey].push(s);
    });

    const groups = [];
    Object.keys(categoryMap).forEach((catKey) => {
      const groupSchemes = categoryMap[catKey];
      // CRITICAL RULE: Only present as comparison group if >= 2 schemes exist!
      if (groupSchemes.length >= 2) {
        let title = catKey.charAt(0).toUpperCase() + catKey.slice(1).replace('-', ' ');
        let icon = '✨';

        if (catKey.includes('health')) { title = 'Healthcare & Medical Support'; icon = '🏥'; }
        else if (catKey.includes('education') || catKey.includes('scholarship')) { title = 'Education & Scholarships'; icon = '🎓'; }
        else if (catKey.includes('pension') || catKey.includes('financial') || catKey.includes('senior')) { title = 'Retirement & Financial Security'; icon = '💰'; }
        else if (catKey.includes('housing')) { title = 'Housing & Urban Shelter'; icon = '🏠'; }
        else if (catKey.includes('entrepreneur') || catKey.includes('business')) { title = 'Entrepreneurship & Micro-loans'; icon = '🚀'; }
        else if (catKey.includes('agri') || catKey.includes('employ')) { title = 'Agriculture & Rural Employment'; icon = '🌾'; }

        // Similarity reason badges based on actual fields
        const reasons = [ui('sameCategory'), ui('similarPurpose'), ui('stateAvailability')];

        groups.push({
          id: catKey,
          title,
          icon,
          schemes: groupSchemes.slice(0, 3),
          totalCount: groupSchemes.length,
          reasons,
        });
      }
    });

    return groups;
  };

  const similarityGroups = getSmartSimilarityGroups();

  // Search results for manual selection inside Modal
  const modalSearchResults = modalSearchQuery.trim()
    ? allSchemesList.filter((s) => {
        const q = modalSearchQuery.toLowerCase();
        return (
          s.name?.toLowerCase().includes(q) ||
          s.provider?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          s.benefitSummary?.toLowerCase().includes(q)
        );
      })
    : allSchemesList.slice(0, 6);

  // Evaluate Comparison Rationale
  const evaluateComparisonRationale = (schemesToCompare) => {
    if (schemesToCompare.length < 2) return null;

    // Benefit numerical comparison
    const statedAmounts = schemesToCompare.map((scheme) => statedBenefitAmount(scheme.benefitSummary));
    const comparableAmounts = statedAmounts.filter((amount) => amount != null);
    const maxStatedAmount = comparableAmounts.length ? Math.max(...comparableAmounts) : null;
    const bestBenefitScheme = maxStatedAmount == null
      ? null
      : schemesToCompare.find((scheme) => statedBenefitAmount(scheme.benefitSummary) === maxStatedAmount);

    let topChoice = null;
    let topChoiceReasons = [];

    if (bestBenefitScheme) {
      topChoice = bestBenefitScheme;
      topChoiceReasons = [
        ui('highestAmount', { amount: conciseText(getSchemeCatalogText(topChoice.benefitSummary, i18n.language), 90) }),
        ui('checkFrequency'),
      ];
    } else {
      topChoiceReasons = [ui('noAmounts'), ui('checkEligibility')];
    }

    return {
      topChoice,
      topChoiceReasons,
      bestBenefitScheme,
    };
  };

  const rationale = isComparing ? evaluateComparisonRationale(selectedSchemes) : null;

  return (
    <DashboardLayout
      title={t('compareTitle')}
      subtitle={ui('subtitle')}
    >
      {/* SECTION 1: Top Navigation Bar & Dual Path Callout */}
      <div className="compare-hero mb-8 rounded-2xl border p-6 shadow-lg lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-sky-700 border border-sky-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" /> ✨ {ui('heroLabel')}
            </div>
            <h2 className="text-2xl font-black text-sky-900 sm:text-3xl">
              {ui('heroTitle')}
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              {ui('heroDescription')}
            </p>
          </div>

          {/* DUAL PATH ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => {
                setIsComparing(false);
              }}
              variant={!isComparing ? 'primary' : 'outline'}
              size="md"
              className={!isComparing ? 'shadow-md ring-2 ring-sky-100' : 'bg-white text-sky-800 border-sky-200 hover:bg-sky-50'}
            >
              <Sparkles className="h-4 w-4" /> {ui('smart')}
            </Button>

            <Button
              onClick={() => setManualModalOpen(true)}
              variant="outline"
              size="md"
              className="bg-white text-sky-800 border-sky-200 hover:bg-sky-50 font-extrabold shadow-md cursor-pointer"
            >
              <Search className="h-4 w-4 text-primary-600" /> {ui('manual')}
            </Button>
          </div>
        </div>
      </div>

      {/* VIEW A: DETAILED COMPARISON VIEW */}
      {loading ? (
        <Card className="p-6 text-sm text-slate-600">{t('ui.common.loading')}</Card>
      ) : allSchemesList.length === 0 ? (
        <Card className="p-6">
          <p className="font-bold text-slate-900">{error || ui('noDashboard')}</p>
          <p className="mt-1 text-sm text-slate-600">{t('ui.compare.addProfile')}</p>
          <Button className="mt-4" onClick={() => window.location.assign('/profile')}>{ui('updateProfile')}</Button>
        </Card>
      ) : isComparing ? (
        <div className="space-y-8 animate-slide-down">
          {/* Top Control Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white border border-gray-200 p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary-600" />
              <span className="font-extrabold text-navy-900 text-sm sm:text-base">
                {ui('comparing', { count: selectedSchemes.length })}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={() => setIsComparing(false)} variant="outline" size="sm">
                ← {ui('backSuggestions')}
              </Button>
              <Button onClick={() => setManualModalOpen(true)} variant="outline" size="sm">
                <Search className="h-3.5 w-3.5" /> {ui('change')}
              </Button>
              <button onClick={clearAllSelected} className="text-xs font-bold text-gray-500 hover:text-error-600 px-2">
                {ui('clear')}
              </button>
            </div>
          </div>

          {/* ORGANIZED COMPARISON SECTIONS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th className="w-48 p-4 text-xs font-bold uppercase tracking-wider text-gray-500">{ui('area')}</th>
                    {selectedSchemes.map((s) => (
                      <th key={s.id || s.schemeId} className="min-w-[240px] p-4 align-top">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="rounded-full bg-sky-100 text-sky-800 text-2xs font-extrabold px-2.5 py-0.5 uppercase block w-fit mb-1">
                              {categoryLabel(s.category)}
                            </span>
                            <h4 className="text-base font-extrabold text-navy-900 leading-snug">{getSchemeCatalogText(s.name, i18n.language)}</h4>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{getSchemeCatalogText(s.provider, i18n.language)}</p>
                          </div>
                          <button
                            onClick={() => removeSelectedScheme(s.id || s.schemeId)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-error-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                  {/* BENEFITS SECTION */}
                  <tr className="bg-sky-50/60">
                    <td className="p-4 font-extrabold text-navy-900 flex items-center gap-1.5">
                      <Wallet className="h-4 w-4 text-primary-600" /> {ui('benefitSummary')}
                    </td>
                    {selectedSchemes.map((s) => (
                      <td key={s.id || s.schemeId} className="p-4">
                        <span className="font-black text-primary-900 block text-base">{s.benefitAmount === 'Amount not stated in catalogue' ? ui('amountNotListed') : s.benefitAmount}</span>
                        <p className="text-xs text-navy-700 mt-1 leading-relaxed">{conciseText(compareText(s, 'Benefit', s.benefitSummary))}</p>
                      </td>
                    ))}
                  </tr>

                  {/* PROFILE FIT SECTION */}
                  {userProfile && (
                    <tr className="bg-emerald-50/20">
                      <td className="p-4 font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {ui('profileFit')}
                      </td>
                      {selectedSchemes.map((s) => (
                        <td key={s.id || s.schemeId} className="p-4 text-xs font-bold text-emerald-900">
                          {s.matchScore != null
                            ? `${s.matchScore}% ${ui('profileFit')} · ${matchTierLabel(s.matchTier) || ui('potential')}`
                            : ui('profileFitNote')}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* ELIGIBILITY SECTION */}
                  <tr>
                    <td className="p-4 font-bold text-navy-800 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary-600" /> {ui('eligibility')}
                    </td>
                    {selectedSchemes.map((s) => (
                      <td key={s.id || s.schemeId} className="p-4 text-xs text-navy-700">
                        {conciseText(compareText(s, 'Eligibility', s.eligibility), 180)}
                      </td>
                    ))}
                  </tr>

                  {/* ACTIONS */}
                  <tr className="bg-gray-50/50">
                    <td className="p-4 font-bold text-navy-800">{ui('actions')}</td>
                    {selectedSchemes.map((s) => {
                      const sid = s.id || s.schemeId;
                      return (
                        <td key={sid} className="p-4">
                          <div className="flex flex-col gap-2">
                            <SchemeDetailsButton scheme={s} to={`/schemes/${sid}`} variant="primary" size="sm" className="w-full justify-center">
                              {t('ui.common.viewDetails')}
                            </SchemeDetailsButton>
                            <SchemeApplicationAction scheme={s} variant="outline" size="sm" className="w-full justify-center gap-1" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ✨ SECTION: WHICH MAY BE BETTER FOR YOU? */}
          {rationale && (
            <Card className="p-6 border-2 border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-navy-900">{ui('better')}</h3>
              <p className="text-xs text-gray-500">{ui('recommendationNote')}</p>
                </div>
              </div>

              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-relaxed text-blue-950">
                {ui('officialCheck')}
              </div>

              {rationale.topChoice ? (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800 block mb-1">
                    🏆 {ui('suggestedTop')}
                  </span>
                  <p className="text-lg font-black text-emerald-950">{getSchemeCatalogText(rationale.topChoice.name, i18n.language)}</p>
                  <ul className="mt-2 space-y-1 text-xs text-emerald-900 font-semibold">
                    {rationale.topChoiceReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50/70 p-4">
                  <p className="text-sm font-bold text-navy-900">
                    {ui('noAmounts')}
                  </p>
                </div>
              )}

            </Card>
          )}
        </div>
      ) : (
        /* VIEW B: SMART SIMILAR SCHEMES DISCOVERY LANDING PAGE */
        <div className="space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-xl font-black text-navy-900">✨ {ui('similarTitle')}</h3>
              <p className="text-xs text-gray-500">{ui('similarDescription')}</p>
            </div>

            <Button
              onClick={() => setManualModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer"
            >
              <Search className="h-4 w-4 text-primary-600" /> {ui('manual')}
            </Button>
          </div>

          {/* SMART SIMILARITY SUGGESTION CARDS */}
          {similarityGroups.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs">
              <Layers className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <h4 className="text-base font-bold text-navy-900">{ui('noGroups')}</h4>
              <p className="text-xs text-gray-500 mt-1">{ui('manualHint')}</p>
              <Button onClick={() => setManualModalOpen(true)} variant="primary" size="sm" className="mt-4 gap-2">
                <Search className="h-4 w-4" /> Compare Schemes Manually
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {similarityGroups.map((group) => {
                const groupSchemeIds = group.schemes.map((s) => s.id || s.schemeId);
                return (
                  <div
                    key={group.id}
                    className="flex flex-col justify-between rounded-2xl border-2 border-primary-100 bg-white p-6 shadow-card hover:border-primary-400 hover:shadow-lg transition-all"
                  >
                    <div>
                      {/* Card Group Header */}
                      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{group.icon}</span>
                          <div>
                            <h4 className="text-base font-extrabold text-navy-900">{categoryLabel(group.title)}</h4>
                  <p className="text-2xs text-gray-500">{ui('similarCount', { count: group.totalCount })}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-sky-50 text-sky-700 text-2xs font-extrabold px-2.5 py-1 border border-sky-200">
                          {ui('smartMatch')}
                        </span>
                      </div>

                      {/* Schemes List */}
                      <div className="mb-4 space-y-2.5">
                        {group.schemes.map((s) => (
                          <div key={s.id || s.schemeId} className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                            <p className="font-extrabold text-navy-900 text-xs">{getSchemeCatalogText(s.name, i18n.language)}</p>
                            <p className="text-2xs font-semibold text-primary-700 mt-0.5">{conciseText(getSchemeCatalogText(s.benefitSummary, i18n.language), 140)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Similarity Explanation */}
                      <div className="mb-5 rounded-xl bg-sky-50/70 p-3 border border-sky-100">
                        <p className="text-2xs font-extrabold uppercase tracking-wider text-primary-800 mb-1">
                          {ui('similarBecause')}
                        </p>
                        <ul className="space-y-0.5 text-2xs text-navy-700 font-semibold">
                          {group.reasons.map((reason, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => {
                        setSelectedIds(groupSchemeIds);
                        setIsComparing(true);
                      }}
                      variant="primary"
                      size="md"
                      className="w-full justify-center gap-1.5 shadow-sm"
                    >
                      {ui('compareThese')} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* OPTION 2: MANUAL COMPARISON MODAL DIALOG */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-xs"
            onClick={() => setManualModalOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl animate-scale-in z-10 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-navy-900">{ui('manual')}</h3>
                  <p className="text-xs text-gray-500">{ui('selectManual')}</p>
                </div>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Selection Status & Chips */}
            <div className="mb-4 rounded-xl bg-sky-50/70 p-3 border border-sky-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-primary-900">
                  {ui('selectedCount', { count: selectedIds.length })}
                </span>
                <span className="text-2xs font-medium text-gray-500">{ui('max')}</span>
              </div>

              {selectedSchemes.length === 0 ? (
                <p className="text-xs text-gray-400 italic">{ui('noneSelected')}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSchemes.map((s) => {
                    const sid = s.id || s.schemeId;
                    return (
                      <span
                        key={sid}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white border border-primary-200 px-3 py-1 text-xs font-bold text-navy-900 shadow-2xs"
                      >
                        <span className="truncate max-w-[150px]">{s.name}</span>
                        <button onClick={() => removeSelectedScheme(sid)} className="text-gray-400 hover:text-error-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={ui('searchPlaceholder')}
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-navy-900 focus:border-primary-500 focus:bg-white focus:outline-hidden"
              />
              {modalSearchQuery && (
                <button onClick={() => setModalSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Scheme Suggestions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-5 min-h-[160px]">
              {modalSearchResults.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">{ui('noMatches', { query: modalSearchQuery })}</p>
              ) : (
                modalSearchResults.map((scheme) => {
                  const sid = scheme.id || scheme.schemeId;
                  const isSelected = selectedIds.includes(sid);

                  return (
                    <div
                      key={sid}
                      className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                        isSelected
                          ? 'border-sky-400 bg-sky-50/70'
                          : 'border-gray-100 bg-gray-50/50 hover:bg-sky-50/50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-navy-900 truncate">{getSchemeCatalogText(scheme.name, i18n.language)}</p>
                        <p className="text-2xs text-gray-500 truncate">{getSchemeCatalogText(scheme.provider, i18n.language)} • {getSchemeCatalogText(scheme.benefitSummary, i18n.language)}</p>
                      </div>

                      <button
                        disabled={isSelected || selectedIds.length >= 3}
                        onClick={() => toggleSelectScheme(sid)}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {isSelected ? `✓ ${ui('added')}` : `+ ${ui('add')}`}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 mt-auto">
              <Button onClick={() => setManualModalOpen(false)} variant="outline" size="sm">
                {t('ui.common.cancel')}
              </Button>
              <Button
                disabled={selectedIds.length < 2}
                onClick={() => {
                  setManualModalOpen(false);
                  setIsComparing(true);
                }}
                variant="primary"
                size="sm"
                className="gap-1.5 shadow-sm"
              >
                <GitCompare className="h-4 w-4" />
                {ui('compareCount', { count: selectedIds.length })}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
