import { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  User,
  Briefcase,
  GraduationCap,
  MapPin,
  Users,
  Wallet,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { states, occupations } from '@/data/mockData';
import { getMe } from '@/services/api';
import { getPersonalizedSchemeRecommendations } from '@/data/myschemeDataset';
import { getSchemeCatalogText } from '@/utils/schemeCatalogTranslations';
import { useTranslation } from 'react-i18next';

function normalizeEligibilityProfile(profile = {}) {
  return {
    ...profile,
    educationLevel: profile.educationLevel || profile.education || '',
    isDifferentlyAbled: profile.isDifferentlyAbled ?? profile.disabilityStatus ?? null,
    isFarmer: profile.isFarmer ?? profile.farmerStatus ?? null,
  };
}

function shortBenefitSummary(value, maxLength = 150) {
  const text = String(value || 'Benefit details are not listed.').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}

export function WhatIfPage() {
  const { t, i18n } = useTranslation();
  const ui = (key, options) => t(`ui.whatIf.${key}`, options);
  const common = (key) => t(`ui.common.${key}`);

  const [realUser, setRealUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Simulator Form State (Temporary modified values)
  const [age, setAge] = useState('');
  const [annualIncomeINR, setAnnualIncomeINR] = useState('');
  const [occupation, setOccupation] = useState('');
  const [state, setState] = useState('');
  const [socialCategory, setSocialCategory] = useState('');
  const [education, setEducation] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [disabilityStatus, setDisabilityStatus] = useState(null);
  const [studentStatus, setStudentStatus] = useState(null);
  const [farmerStatus, setFarmerStatus] = useState(null);

  const [simulationResult, setSimulationResult] = useState(null);

  // Load once; the first simulation receives the fetched profile explicitly.
  useEffect(() => {
    async function initSimulator() {
      try {
        setLoading(true);
        let user;
        try {
          const result = await getMe();
          user = result?.user || result;
        } catch {
          try { user = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { user = null; }
        }
        if (user) {
          setRealUser(user);
          populateFormWithUser(user);
          await runSimulation(user, user);
        }
      } catch (err) {
        console.error('Failed to load profile for simulation:', err);
      } finally {
        setLoading(false);
      }
    }
    initSimulator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const populateFormWithUser = (user = {}) => {
    const userOcc = user.occupation || '';
    setAge(user.age == null ? '' : String(user.age));
    setAnnualIncomeINR(user.annualIncomeINR == null ? '' : String(user.annualIncomeINR));
    setOccupation(userOcc);
    setState(user.state || '');
    setSocialCategory(user.socialCategory || '');
    setEducation(user.educationLevel || user.education || '');
    setFamilySize(user.familySize == null ? '' : String(user.familySize));
    setMaritalStatus(user.maritalStatus || '');
    setDisabilityStatus(user.isDifferentlyAbled ?? user.disabilityStatus ?? null);
    const hasStudentData = user.studentStatus != null || Boolean(user.currentCourse || user.employmentStatus?.toLowerCase().includes('student') || userOcc.toLowerCase().includes('student'));
    setStudentStatus(hasStudentData ? Boolean(user.studentStatus || user.currentCourse || user.employmentStatus?.toLowerCase().includes('student') || userOcc.toLowerCase().includes('student')) : null);
    setFarmerStatus(user.isFarmer ?? user.farmerStatus ?? (userOcc ? userOcc.toLowerCase().includes('farmer') : null));
  };

  const runSimulation = async (baselineProfile = realUser, scenarioOverride = null) => {
    try {
      setSimulating(true);
      const base = baselineProfile || {};
      const toNumberOrNull = (value) => value === '' || value == null ? null : Number(value);
      const current = normalizeEligibilityProfile(base);
      const scenario = scenarioOverride
        ? normalizeEligibilityProfile({ ...current, ...scenarioOverride })
        : {
        ...current,
        age: toNumberOrNull(age),
        annualIncomeINR: toNumberOrNull(annualIncomeINR),
        income: annualIncomeINR === '' ? (base.income || '') : '',
        occupation,
        state,
        socialCategory,
        educationLevel: education,
        familySize: toNumberOrNull(familySize),
        maritalStatus,
        isDifferentlyAbled: disabilityStatus == null ? (base.isDifferentlyAbled ?? base.disabilityStatus ?? null) : disabilityStatus,
        isFarmer: farmerStatus == null ? current.isFarmer : farmerStatus,
        employmentStatus: studentStatus === true ? 'Currently enrolled student' : studentStatus === false ? '' : (current.employmentStatus || ''),
        currentCourse: studentStatus === true ? (current.currentCourse || 'Currently enrolled') : studentStatus === false ? '' : (current.currentCourse || ''),
      };
      const [currentRecommendations, scenarioRecommendations] = await Promise.all([
        getPersonalizedSchemeRecommendations(current, 5000),
        getPersonalizedSchemeRecommendations(scenario, 5000),
      ]);
      const currentById = new Map(currentRecommendations.map((scheme) => [scheme.schemeId || scheme.id, scheme]));
      const scenarioById = new Map(scenarioRecommendations.map((scheme) => [scheme.schemeId || scheme.id, scheme]));
      const allIds = new Set([...currentById.keys(), ...scenarioById.keys()]);
      const schemes = [...allIds].map((schemeId) => {
        const currentScheme = currentById.get(schemeId);
        const simulatedScheme = scenarioById.get(schemeId);
        const scheme = simulatedScheme || currentScheme;
        const currentSuggested = Boolean(currentScheme);
        const scenarioSuggested = Boolean(simulatedScheme);
        return {
          schemeId,
          name: scheme.name,
          provider: scheme.provider,
          benefitSummary: scheme.benefitSummary,
          current: { isEligible: currentSuggested, reason: currentSuggested ? (currentScheme.eligibilityStatus === 'Needs more information' ? ui('moreDetails') : ui('criteriaMatch')) : ui('notSuggestedReason') },
          simulated: { isEligible: scenarioSuggested, reason: scenarioSuggested ? (simulatedScheme.eligibilityStatus === 'Needs more information' ? ui('moreDetails') : ui('scenarioCriteriaMatch')) : ui('notSuggestedReason') },
          changeType: !currentSuggested && scenarioSuggested ? 'new_opportunity'
            : currentSuggested && !scenarioSuggested ? 'lost_eligibility' : 'unchanged',
          changeExplanation: !currentSuggested && scenarioSuggested ? ui('newExplanation')
            : currentSuggested && !scenarioSuggested ? ui('lostExplanation')
              : ui('noChangeExplanation'),
        };
      });
      const newOpportunities = schemes.filter((scheme) => scheme.changeType === 'new_opportunity');
      const lostEligibilities = schemes.filter((scheme) => scheme.changeType === 'lost_eligibility');
      setSimulationResult({
        currentProfile: current,
        summary: {
          currentEligibleCount: currentRecommendations.length,
          simulatedEligibleCount: scenarioRecommendations.length,
          newOpportunitiesCount: newOpportunities.length,
        },
        schemes,
        newOpportunities,
        lostEligibilities,
      });
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runSimulation();
  };

  const handleReset = () => {
    if (realUser) {
      populateFormWithUser(realUser);
      runSimulation(realUser, realUser);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={t('whatIfTitle')} subtitle={t('whatIfSub')}>
        <div className="flex h-64 items-center justify-center">
          <p className="animate-pulse text-gray-500">{ui('calculating')}</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentProfile = simulationResult?.currentProfile || realUser;
  const summary = simulationResult?.summary || {};
  const schemesList = (simulationResult?.schemes || []).filter((scheme) => scheme.changeType !== 'unchanged');
  const newOpportunities = simulationResult?.newOpportunities || [];
  const lostEligibilities = simulationResult?.lostEligibilities || [];

  return (
    <DashboardLayout title={t('whatIfTitle')} subtitle={t('whatIfSub')}>
      <div className="space-y-6">
        {/* Top Header Section with Real User Info */}
        <div className="whatif-hero flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-sky-100 p-6 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-600" />
              <h2 className="text-xl font-bold text-sky-900">{ui('heading')}</h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {ui('description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleReset} className="border-sky-200 bg-white text-sky-800 hover:bg-sky-50">
              <RotateCcw className="h-4 w-4" /> {ui('reset')}
            </Button>
          </div>
        </div>

        {/* 2-Column Layout: Your Current Profile & What-If Scenario Form */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: What-If Scenario Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-5 border-primary-100 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b pb-3 border-gray-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                  <h2 className="text-base font-bold text-navy-900">{ui('scenario')}</h2>
                </div>
                <Badge variant="accent" className="text-xs">{ui('temporary')}</Badge>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Calendar className="h-3.5 w-3.5 text-primary-600" /> {ui('age')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Wallet className="h-3.5 w-3.5 text-primary-600" /> {ui('annualIncome')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={annualIncomeINR}
                    onChange={(e) => setAnnualIncomeINR(e.target.value)}
                    className="input-base"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    {ui('amountHint', { amount: annualIncomeINR ? `₹${Number(annualIncomeINR).toLocaleString('en-IN')}` : realUser?.income || common('notProvided') })}
                  </p>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Briefcase className="h-3.5 w-3.5 text-primary-600" /> {ui('occupation')}
                  </label>
                  <select
                    value={occupation}
                    onChange={(e) => {
                      const occ = e.target.value;
                      setOccupation(occ);
                      setStudentStatus(occ === 'Student');
                      setFarmerStatus(occ.toLowerCase().includes('farmer'));
                    }}
                    className="input-base"
                  >
                    <option value="">{common('notSpecified')}</option>
                    {occupations.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <MapPin className="h-3.5 w-3.5 text-primary-600" /> {ui('state')}
                  </label>
                  <select value={state} onChange={(e) => setState(e.target.value)} className="input-base">
                    <option value="">{common('notSpecified')}</option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Users className="h-3.5 w-3.5 text-primary-600" /> {ui('socialCategory')}
                  </label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    className="input-base"
                  >
                    <option value="">{common('notSpecified')}</option>
                    <option value="General">{t('ui.whatIf.general')}</option>
                    <option value="OBC">{t('ui.whatIf.obc')}</option>
                    <option value="SC">{t('ui.whatIf.sc')}</option>
                    <option value="ST">{t('ui.whatIf.st')}</option>
                    <option value="EWS">{t('ui.whatIf.ews')}</option>
                  </select>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <GraduationCap className="h-3.5 w-3.5 text-primary-600" /> {ui('education')}
                  </label>
                  <select value={education} onChange={(e) => setEducation(e.target.value)} className="input-base">
                    <option value="">{common('notSpecified')}</option>
                    <option value="Below 10th">{t('ui.whatIf.below10')}</option>
                    <option value="10th Pass">{t('ui.whatIf.pass10')}</option>
                    <option value="12th Pass">{t('ui.whatIf.pass12')}</option>
                    <option value="Graduate">{t('ui.whatIf.graduate')}</option>
                    <option value="Post-Graduate">{t('ui.whatIf.postGraduate')}</option>
                  </select>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Users className="h-3.5 w-3.5 text-primary-600" /> {ui('familySize')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={familySize}
                    onChange={(e) => setFamilySize(e.target.value)}
                    className="input-base"
                  />
                </div>

                {/* Checkbox Status Flags */}
                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-navy-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(studentStatus)}
                      onChange={(e) => setStudentStatus(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    {ui('student')}
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-navy-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(farmerStatus)}
                      onChange={(e) => setFarmerStatus(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    {ui('farmer')}
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-navy-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(disabilityStatus)}
                      onChange={(e) => setDisabilityStatus(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    {ui('disability')}
                  </label>
                </div>

                <div className="pt-2 space-y-2">
                  <Button type="submit" size="lg" className="w-full" disabled={simulating}>
                    <Sparkles className="h-4 w-4" /> {simulating ? ui('calculating') : ui('run')}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleReset} className="w-full">
                    <RotateCcw className="h-3.5 w-3.5" /> {ui('reset')}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Read-Only Card: Your Current Profile */}
            <Card className="p-5 border-gray-200 bg-gray-50/50">
              <div className="mb-3 flex items-center justify-between border-b pb-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary-700" />
                  <h3 className="text-sm font-bold text-navy-900">{ui('currentProfile')}</h3>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white">{ui('savedProfile')}</Badge>
              </div>

              {currentProfile && (
                <div className="grid grid-cols-2 gap-2 text-xs text-navy-900">
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">{ui('name')}</span>
                    <span className="font-semibold">{currentProfile.fullName || realUser?.fullName || t('citizen')}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">{ui('age')}</span>
                    <span className="font-semibold">{currentProfile.age ? `${currentProfile.age} ${ui('years')}` : common('notProvided')}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">{ui('annualIncomeShort')}</span>
                    <span className="font-semibold">{currentProfile.annualIncomeINR != null ? `₹${Number(currentProfile.annualIncomeINR).toLocaleString('en-IN')}` : currentProfile.income || common('notProvided')}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">{ui('occupation')}</span>
                    <span className="font-semibold">{currentProfile.occupation || common('notProvided')}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">{ui('state')}</span>
                    <span className="font-semibold">{currentProfile.state || common('notProvided')}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">{ui('socialCategory')}</span>
                    <span className="font-semibold">{currentProfile.socialCategory || common('notProvided')}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Simulation Output & Comparison Results */}
          <div className="lg:col-span-2 space-y-5">
            {/* Metric Overview Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-4 bg-primary-50/50 border-primary-200">
                <p className="text-xs font-medium text-primary-700 uppercase tracking-wider">{ui('currentMatches')}</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">{summary.currentEligibleCount ?? 0} {t('ui.whatIf.schemes')}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">{ui('savedBasis')}</p>
              </Card>

              <Card className="p-4 bg-accent-50/50 border-accent-200">
                <p className="text-xs font-medium text-accent-700 uppercase tracking-wider">{ui('scenarioMatches')}</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">{summary.simulatedEligibleCount ?? 0} {t('ui.whatIf.schemes')}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">{ui('scenarioBasis')}</p>
              </Card>

              <Card className="p-4 bg-success-50/50 border-success-200">
                <p className="text-xs font-medium text-success-700 uppercase tracking-wider">{ui('newMatches')}</p>
                <p className="mt-1 text-2xl font-bold text-success-700">+{summary.newOpportunitiesCount ?? 0}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">{ui('comparedBasis')}</p>
              </Card>
            </div>

            {/* 🎯 New Opportunities Callout */}
            {newOpportunities.length > 0 && (
              <Card className="border-success-300 bg-gradient-to-r from-success-50 via-emerald-50 to-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-600 text-white shadow-md">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900">{ui('newMatchesTitle')}</h3>
                    <p className="mt-1 text-xs text-navy-700 leading-relaxed">
                      {t('ui.whatIf.newMatchesText', { count: newOpportunities.length })}
                    </p>
                    <div className="mt-3 space-y-2">
                      {newOpportunities.map((op) => (
                        <div key={op.schemeId} className="flex items-center justify-between rounded-xl bg-white p-3 border border-success-200">
                          <div>
                            <p className="text-sm font-bold text-navy-900">{getSchemeCatalogText(op.name, i18n.language)}</p>
                            <p className="text-xs text-gray-600">{shortBenefitSummary(getSchemeCatalogText(op.benefitSummary, i18n.language))}</p>
                          </div>
                          <Badge variant="success">{ui('potentialMatch')}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* ⚠️ Lost Eligibility Callout */}
            {lostEligibilities.length > 0 && (
              <Card className="border-error-300 bg-gradient-to-r from-error-50 via-rose-50 to-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-600 text-white shadow-md">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900">{ui('noLongerSuggested')}</h3>
                    <p className="mt-1 text-xs text-navy-700 leading-relaxed">
                      {ui('noLongerText', { count: lostEligibilities.length })}
                    </p>
                    <div className="mt-3 space-y-2">
                      {lostEligibilities.map((op) => (
                        <div key={op.schemeId} className="rounded-xl bg-white p-3 border border-error-200">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-navy-900">{getSchemeCatalogText(op.name, i18n.language)}</p>
                            <Badge variant="outline">{t('ui.whatIf.reviewDetails')}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-error-700">{op.changeExplanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Full Scheme-by-Scheme Comparison Table / List */}
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between border-b pb-3 border-gray-200">
                <h3 className="text-base font-bold text-navy-900">{ui('listTitle')}</h3>
                <span className="text-xs text-gray-500">{t('ui.whatIf.changeCount', { count: schemesList.length })}</span>
              </div>

              <div className="space-y-4">
                {schemesList.length === 0 ? (
                  <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">{ui('noChanges')}</p>
                ) : schemesList.map((schemeItem) => {
                  const curr = schemeItem.current;
                  const sim = schemeItem.simulated;

                  return (
                    <div
                      key={schemeItem.schemeId}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-all hover:border-primary-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-navy-900">{getSchemeCatalogText(schemeItem.name, i18n.language)}</h4>
                            <span className="text-[11px] text-gray-500">({getSchemeCatalogText(schemeItem.provider, i18n.language)})</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{shortBenefitSummary(getSchemeCatalogText(schemeItem.benefitSummary, i18n.language))}</p>
                        </div>

                        {/* Status Badges Side-by-Side */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center">
                            <span className="block text-[10px] text-gray-400 font-semibold uppercase">{ui('current')}</span>
                            {curr.isEligible ? (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle2 className="h-3 w-3" /> {ui('potentialMatch')}
                              </Badge>
                            ) : (
                              <Badge variant="error" className="text-xs">
                                <XCircle className="h-3 w-3" /> {ui('notSuggested')}
                              </Badge>
                            )}
                          </div>

                          <span className="text-gray-300 font-bold">→</span>

                          <div className="text-center">
                            <span className="block text-[10px] text-gray-500 font-semibold uppercase">{ui('simulated')}</span>
                            {sim.isEligible ? (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle2 className="h-3 w-3" /> {ui('potentialMatch')}
                              </Badge>
                            ) : (
                              <Badge variant="error" className="text-xs">
                                <XCircle className="h-3 w-3" /> {ui('notSuggested')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reasons & Explanations */}
                      <div className="mt-3 rounded-lg bg-gray-50 p-3 border border-gray-100 text-xs space-y-1.5">
                        <p className="text-navy-900">
                          <span className="font-semibold text-gray-700">{t('ui.whatIf.currentSituation')}: </span>
                          {curr.isEligible ? ui('potentialMatch') : ui('notSuggested')} — {curr.reason}
                        </p>

                        <p className="text-navy-900">
                          <span className="font-semibold text-primary-700">{t('ui.whatIf.scenarioSituation')}: </span>
                          {sim.isEligible ? ui('potentialMatch') : ui('notSuggested')} — {sim.reason}
                        </p>

                        {schemeItem.changeType !== 'unchanged' && (
                          <p className={`font-medium pt-1 ${
                            schemeItem.changeType === 'new_opportunity'
                              ? 'text-success-700'
                              : schemeItem.changeType === 'lost_eligibility'
                              ? 'text-error-700'
                              : 'text-gray-600'
                          }`}>
                            <span className="font-semibold">{t('ui.whatIf.changeResult')}: </span>
                            {schemeItem.changeExplanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
