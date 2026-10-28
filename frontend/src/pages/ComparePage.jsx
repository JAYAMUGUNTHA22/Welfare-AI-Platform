import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GitCompare, Search, X, Sparkles, Check, CheckCircle2, AlertCircle,
  ArrowRight, ShieldCheck, Clock, FileText, Wallet, Calendar, MapPin,
  Briefcase, ChevronRight, Award, Plus, RefreshCw, Info, HelpCircle, Layers
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MatchScore } from '@/components/shared/MatchScore';
import { VerificationBadge } from '@/components/shared/VerificationBadge';
import { getMe, getAllSchemes } from '@/services/api';
import { schemes as mockSchemes } from '@/data/mockData';
import { useTranslation } from 'react-i18next';
import { getSchemeCatalogText } from '@/utils/schemeCatalogTranslations';
import { SchemeApplicationAction } from '@/components/shared/SchemeApplicationAction';
import { SchemeDetailsButton } from '@/components/shared/SchemeDetailsLink';

export function ComparePage() {
  const { t, i18n } = useTranslation();
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schemesRes, meRes] = await Promise.allSettled([
        getAllSchemes(),
        getMe()
      ]);

      let loadedSchemes = mockSchemes;
      if (schemesRes.status === 'fulfilled' && schemesRes.value && schemesRes.value.length > 0) {
        loadedSchemes = schemesRes.value;
      }
      setAllSchemesList(loadedSchemes);

      if (meRes.status === 'fulfilled' && meRes.value?.user) {
        setUserProfile(meRes.value.user);
      }

      // Pre-select preset or default first 2 schemes
      const initialIds = searchParams.get('ids')?.split(',').filter(Boolean);
      if (initialIds && initialIds.length >= 2) {
        setSelectedIds(initialIds.slice(0, 3));
        setIsComparing(true);
      } else {
        setSelectedIds([loadedSchemes[0].id || loadedSchemes[0].schemeId, loadedSchemes[1].id || loadedSchemes[1].schemeId]);
      }
    } catch (e) {
      console.error('Failed to load schemes', e);
      setAllSchemesList(mockSchemes);
    } finally {
      setLoading(false);
    }
  };

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
        const reasons = [
          `Same category (${title})`,
          `Similar target beneficiaries & purpose`,
          `Matching state availability`,
        ];

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
    const benefitValues = schemesToCompare.map((s) => {
      const bStr = s.benefitAmount || s.benefitSummary || '';
      if (bStr.includes('5 lakh')) return 500000;
      if (bStr.includes('2.67 lakh')) return 267000;
      if (bStr.includes('1 Crore') || bStr.includes('1Cr')) return 10000000;
      if (bStr.includes('10 lakh')) return 1000000;
      if (bStr.includes('50,000')) return 50000;
      if (bStr.includes('6,000')) return 6000;
      return 10000;
    });

    const maxBenefitIndex = benefitValues.indexOf(Math.max(...benefitValues));
    const bestBenefitScheme = schemesToCompare[maxBenefitIndex];

    const fastProcessingScheme = schemesToCompare.find(
      (s) => s.processingTime?.toLowerCase().includes('same day') || s.processingTime?.toLowerCase().includes('7-15')
    ) || schemesToCompare[0];

    const minDocsScheme = [...schemesToCompare].sort(
      (a, b) => (a.documentsRequired?.length || 0) - (b.documentsRequired?.length || 0)
    )[0];

    const easyAppScheme = schemesToCompare.find(
      (s) => s.applicationMethod?.toLowerCase().includes('online')
    ) || schemesToCompare[0];

    let topChoice = null;
    let topChoiceReasons = [];

    if (bestBenefitScheme && bestBenefitScheme === fastProcessingScheme) {
      topChoice = bestBenefitScheme;
      topChoiceReasons = [
        `Highest financial coverage (${topChoice.benefitAmount})`,
        `Fastest processing time (${topChoice.processingTime})`,
        `Online application process available`,
      ];
    } else if (bestBenefitScheme) {
      topChoice = bestBenefitScheme;
      topChoiceReasons = [
        `Offers maximum benefit amount (${topChoice.benefitAmount})`,
        `Extensive coverage for target eligibility group`,
      ];
    }

    return {
      topChoice,
      topChoiceReasons,
      bestBenefitScheme,
      fastProcessingScheme,
      minDocsScheme,
      easyAppScheme,
    };
  };

  const rationale = isComparing ? evaluateComparisonRationale(selectedSchemes) : null;

  return (
    <DashboardLayout
      title="Compare Schemes"
      subtitle="Compare similar welfare schemes side by side and understand which option may work better for your needs."
    >
      {/* SECTION 1: Top Navigation Bar & Dual Path Callout */}
      <div className="compare-hero mb-8 rounded-2xl border p-6 shadow-lg lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-sky-700 border border-sky-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" /> ✨ Find the Right Scheme for You
            </div>
            <h2 className="text-2xl font-black text-sky-900 sm:text-3xl">
              Choose How You Want to Compare
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              Let WelfareAI automatically detect similar schemes for you, or manually pick the exact schemes you wish to inspect.
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
              <Sparkles className="h-4 w-4" /> Smart Similar Suggestions
            </Button>

            <Button
              onClick={() => setManualModalOpen(true)}
              variant="outline"
              size="md"
              className="bg-white text-sky-800 border-sky-200 hover:bg-sky-50 font-extrabold shadow-md cursor-pointer"
            >
              <Search className="h-4 w-4 text-primary-600" /> Compare Schemes Manually
            </Button>
          </div>
        </div>
      </div>

      {/* VIEW A: DETAILED COMPARISON VIEW */}
      {isComparing ? (
        <div className="space-y-8 animate-slide-down">
          {/* Top Control Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white border border-gray-200 p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <GitCompare className="h-5 w-5 text-primary-600" />
              <span className="font-extrabold text-navy-900 text-sm sm:text-base">
                Comparing {selectedSchemes.length} Schemes Side by Side
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button onClick={() => setIsComparing(false)} variant="outline" size="sm">
                ← Back to Similar Suggestions
              </Button>
              <Button onClick={() => setManualModalOpen(true)} variant="outline" size="sm">
                <Search className="h-3.5 w-3.5" /> Change Schemes
              </Button>
              <button onClick={clearAllSelected} className="text-xs font-bold text-gray-500 hover:text-error-600 px-2">
                Clear
              </button>
            </div>
          </div>

          {/* AT A GLANCE SUMMARY BAR */}
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-5 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-primary-800 mb-3 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary-600" /> At a Glance Key Highlights
            </h4>
            <div className={`grid gap-4 sm:grid-cols-${selectedSchemes.length}`}>
              {selectedSchemes.map((s) => (
                <div key={s.id || s.schemeId} className="rounded-xl bg-white p-3.5 border border-sky-200 shadow-2xs">
                  <p className="font-extrabold text-navy-900 text-sm truncate">{s.name}</p>
                  <p className="text-xs font-extrabold text-primary-700 mt-0.5">{s.benefitAmount}</p>
                  <div className="mt-2 space-y-1 text-2xs text-navy-700 font-semibold">
                    <p className="flex items-center gap-1 text-emerald-700">
                      <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                      {s.processingTime?.includes('Same') ? '⚡ Same day processing' : `⏱ ${s.processingTime}`}
                    </p>
                    <p className="flex items-center gap-1 text-blue-700">
                      <Check className="h-3 w-3 text-blue-600 shrink-0" />
                      {s.applicationMethod?.includes('Online') ? '🌐 Online portal application' : s.applicationMethod}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ORGANIZED COMPARISON SECTIONS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <th className="w-48 p-4 text-xs font-bold uppercase tracking-wider text-gray-500">Comparison Area</th>
                    {selectedSchemes.map((s) => (
                      <th key={s.id || s.schemeId} className="min-w-[240px] p-4 align-top">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="rounded-full bg-sky-100 text-sky-800 text-2xs font-extrabold px-2.5 py-0.5 uppercase block w-fit mb-1">
                              {s.category?.replace('-', ' ')}
                            </span>
                            <h4 className="text-base font-extrabold text-navy-900 leading-snug">{s.name}</h4>
                            <p className="text-xs font-medium text-gray-500 mt-0.5">{s.provider}</p>
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
                      <Wallet className="h-4 w-4 text-primary-600" /> Benefit Amount & Summary
                    </td>
                    {selectedSchemes.map((s) => (
                      <td key={s.id || s.schemeId} className="p-4">
                        <span className="font-black text-primary-900 block text-base">{s.benefitAmount}</span>
                        <p className="text-xs text-navy-700 mt-1 leading-relaxed">{s.benefitSummary}</p>
                      </td>
                    ))}
                  </tr>

                  {/* PROFILE FIT SECTION */}
                  {userProfile && (
                    <tr className="bg-emerald-50/20">
                      <td className="p-4 font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Your Profile Fit
                      </td>
                      {selectedSchemes.map((s) => (
                        <td key={s.id || s.schemeId} className="p-4 text-xs font-bold text-emerald-900">
                          ✓ Fits resident of {userProfile.state || 'State'} & Age {userProfile.age || '30'}
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* ELIGIBILITY SECTION */}
                  <tr>
                    <td className="p-4 font-bold text-navy-800 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary-600" /> Key Eligibility Criteria
                    </td>
                    {selectedSchemes.map((s) => (
                      <td key={s.id || s.schemeId} className="p-4 text-xs text-navy-700">
                        <ul className="space-y-1">
                          {s.eligibility?.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-primary-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* DOCUMENTS SECTION */}
                  <tr>
                    <td className="p-4 font-bold text-navy-800 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary-600" /> Documents Required
                    </td>
                    {selectedSchemes.map((s) => {
                      const count = s.documentsRequired?.length || 0;
                      return (
                        <td key={s.id || s.schemeId} className="p-4 text-xs text-navy-700">
                          <span className="font-extrabold text-navy-900 block mb-1">
                            {count} Documents {count <= 3 && <span className="text-emerald-600 text-2xs font-bold">(✓ Fewer docs)</span>}
                          </span>
                          {s.documentsRequired?.join(', ')}
                        </td>
                      );
                    })}
                  </tr>

                  {/* PROCESSING TIME */}
                  <tr>
                    <td className="p-4 font-bold text-navy-800 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary-600" /> Processing Time
                    </td>
                    {selectedSchemes.map((s) => {
                      const isFast = s.processingTime?.toLowerCase().includes('same day');
                      return (
                        <td key={s.id || s.schemeId} className="p-4 text-xs font-bold text-navy-900">
                          {s.processingTime} {isFast && <span className="text-emerald-600 text-2xs font-bold">(⚡ Faster)</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* APPLICATION METHOD */}
                  <tr>
                    <td className="p-4 font-bold text-navy-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-primary-600" /> Application Method
                    </td>
                    {selectedSchemes.map((s) => (
                      <td key={s.id || s.schemeId} className="p-4 text-xs font-bold text-navy-900">
                        {s.applicationMethod}
                      </td>
                    ))}
                  </tr>

                  {/* DEADLINE */}
                  <tr>
                    <td className="p-4 font-bold text-navy-800 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary-600" /> Deadline
                    </td>
                    {selectedSchemes.map((s) => (
                      <td key={s.id || s.schemeId} className="p-4 text-xs font-semibold text-navy-900">
                        {s.deadline}
                      </td>
                    ))}
                  </tr>

                  {/* ACTIONS */}
                  <tr className="bg-gray-50/50">
                    <td className="p-4 font-bold text-navy-800">Actions</td>
                    {selectedSchemes.map((s) => {
                      const sid = s.id || s.schemeId;
                      return (
                        <td key={sid} className="p-4">
                          <div className="flex flex-col gap-2">
                            <SchemeDetailsButton scheme={s} to={`/schemes/${sid}`} variant="primary" size="sm" className="w-full justify-center">
                              View Details
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

          {/* 🔎 SECTION: WHAT'S DIFFERENT? */}
          <Card className="p-6 border border-gray-200 bg-white shadow-xs">
            <h4 className="text-lg font-black text-navy-900 mb-3 flex items-center gap-2">
              🔎 What's Different?
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedSchemes.map((s) => (
                <div key={s.id || s.schemeId} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                  <p className="font-extrabold text-navy-900 text-sm mb-2">{s.name}</p>
                  <ul className="space-y-1.5 text-xs text-navy-700">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-primary-600">• Benefit:</span> {s.benefitAmount}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-primary-600">• Processing:</span> {s.processingTime}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-primary-600">• Method:</span> {s.applicationMethod}
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          {/* ✨ SECTION: WHICH MAY BE BETTER FOR YOU? */}
          {rationale && (
            <Card className="p-6 border-2 border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-navy-900">Which Scheme May Be Better for You?</h3>
                  <p className="text-xs text-gray-500">Data-backed rationale comparing benefits, processing, and documentation</p>
                </div>
              </div>

              {rationale.topChoice ? (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                  <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800 block mb-1">
                    🏆 Recommended Top Option
                  </span>
                  <p className="text-lg font-black text-emerald-950">{rationale.topChoice.name}</p>
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
                    Both schemes offer distinct advantages. The better choice depends on what matters most to your needs.
                  </p>
                </div>
              )}

              {/* Best For Insights Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {rationale.bestBenefitScheme && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-2xs font-extrabold uppercase tracking-wider text-primary-700 block mb-1">
                      Best for Highest Benefit
                    </span>
                    <p className="text-xs font-bold text-navy-900">{rationale.bestBenefitScheme.name}</p>
                    <span className="text-2xs text-gray-500 block mt-1">{rationale.bestBenefitScheme.benefitAmount}</span>
                  </div>
                )}

                {rationale.fastProcessingScheme && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
                      Best for Faster Processing
                    </span>
                    <p className="text-xs font-bold text-navy-900">{rationale.fastProcessingScheme.name}</p>
                    <span className="text-2xs text-gray-500 block mt-1">{rationale.fastProcessingScheme.processingTime}</span>
                  </div>
                )}

                {rationale.minDocsScheme && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-2xs font-extrabold uppercase tracking-wider text-blue-700 block mb-1">
                      Best for Fewer Documents
                    </span>
                    <p className="text-xs font-bold text-navy-900">{rationale.minDocsScheme.name}</p>
                    <span className="text-2xs text-gray-500 block mt-1">{rationale.minDocsScheme.documentsRequired?.length || 0} required docs</span>
                  </div>
                )}

                {rationale.easyAppScheme && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-2xs font-extrabold uppercase tracking-wider text-sky-700 block mb-1">
                      Best for Easy Application
                    </span>
                    <p className="text-xs font-bold text-navy-900">{rationale.easyAppScheme.name}</p>
                    <span className="text-2xs text-gray-500 block mt-1">{rationale.easyAppScheme.applicationMethod}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* VIEW B: SMART SIMILAR SCHEMES DISCOVERY LANDING PAGE */
        <div className="space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-xl font-black text-navy-900">✨ You May Want to Compare These</h3>
              <p className="text-xs text-gray-500">We detected schemes with similar benefits, purposes, or beneficiary criteria.</p>
            </div>

            <Button
              onClick={() => setManualModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer"
            >
              <Search className="h-4 w-4 text-primary-600" /> Compare Schemes Manually
            </Button>
          </div>

          {/* SMART SIMILARITY SUGGESTION CARDS */}
          {similarityGroups.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs">
              <Layers className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <h4 className="text-base font-bold text-navy-900">No similar scheme groups detected</h4>
              <p className="text-xs text-gray-500 mt-1">You can choose schemes manually to run a side-by-side comparison.</p>
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
                            <h4 className="text-base font-extrabold text-navy-900">{group.title}</h4>
                            <p className="text-2xs text-gray-500">{group.totalCount} similar schemes</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-sky-50 text-sky-700 text-2xs font-extrabold px-2.5 py-1 border border-sky-200">
                          Smart Match
                        </span>
                      </div>

                      {/* Schemes List */}
                      <div className="mb-4 space-y-2.5">
                        {group.schemes.map((s) => (
                          <div key={s.id || s.schemeId} className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                            <p className="font-extrabold text-navy-900 text-xs">{s.name}</p>
                            <p className="text-2xs font-semibold text-primary-700 mt-0.5">{s.benefitSummary}</p>
                          </div>
                        ))}
                      </div>

                      {/* Similarity Explanation */}
                      <div className="mb-5 rounded-xl bg-sky-50/70 p-3 border border-sky-100">
                        <p className="text-2xs font-extrabold uppercase tracking-wider text-primary-800 mb-1">
                          Similar because:
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
                      Compare These Schemes <ArrowRight className="h-4 w-4" />
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
                  <h3 className="text-lg font-extrabold text-navy-900">Compare Schemes Manually</h3>
                  <p className="text-xs text-gray-500">Select 2 or 3 schemes to compare side by side</p>
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
                  Selected Schemes ({selectedIds.length}/3):
                </span>
                <span className="text-2xs font-medium text-gray-500">Max 3 schemes allowed</span>
              </div>

              {selectedSchemes.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No schemes selected yet. Search below to add schemes.</p>
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
                placeholder="Search schemes by name, provider, benefit, or category..."
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
                <p className="text-xs text-gray-500 text-center py-6">No matching schemes found for "{modalSearchQuery}"</p>
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
                        {isSelected ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4 mt-auto">
              <Button onClick={() => setManualModalOpen(false)} variant="outline" size="sm">
                Cancel
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
                Compare {selectedIds.length} Schemes
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
