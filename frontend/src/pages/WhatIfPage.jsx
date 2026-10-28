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
import { getMe, simulateEligibilityApi } from '@/services/api';
import { useTranslation } from 'react-i18next';

export function WhatIfPage() {
  const { t } = useTranslation();

  const [realUser, setRealUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  // Simulator Form State (Temporary modified values)
  const [age, setAge] = useState(24);
  const [annualIncomeINR, setAnnualIncomeINR] = useState(300000);
  const [occupation, setOccupation] = useState('Student');
  const [state, setState] = useState('Maharashtra');
  const [socialCategory, setSocialCategory] = useState('General');
  const [education, setEducation] = useState('12th Pass');
  const [familySize, setFamilySize] = useState(4);
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [disabilityStatus, setDisabilityStatus] = useState(false);
  const [studentStatus, setStudentStatus] = useState(false);
  const [farmerStatus, setFarmerStatus] = useState(false);

  const [simulationResult, setSimulationResult] = useState(null);

  // Load actual MongoDB profile on mount
  useEffect(() => {
    async function initSimulator() {
      try {
        setLoading(true);
        const { user } = await getMe();
        if (user) {
          setRealUser(user);
          populateFormWithUser(user);
          await runSimulation(user);
        }
      } catch (err) {
        console.error('Failed to load profile for simulation:', err);
      } finally {
        setLoading(false);
      }
    }
    initSimulator();
  }, []);

  const populateFormWithUser = (user) => {
    const userAge = Number(user.age) || 24;
    const userIncome = Number(user.annualIncomeINR) || (user.income ? parseIncomeString(user.income) : 300000);
    const userOcc = user.occupation || 'Student';
    const userState = user.state || 'Tamil Nadu';
    const userCategory = user.socialCategory || 'General';
    const userEdu = user.education || '12th Pass';
    const userFamily = Number(user.familySize) || 4;
    const userMarital = user.maritalStatus || 'Single';

    setAge(userAge);
    setAnnualIncomeINR(userIncome);
    setOccupation(userOcc);
    setState(userState);
    setSocialCategory(userCategory);
    setEducation(userEdu);
    setFamilySize(userFamily);
    setMaritalStatus(userMarital);
    setDisabilityStatus(Boolean(user.disabilityStatus));
    setStudentStatus(Boolean(user.studentStatus || userOcc.toLowerCase().includes('student')));
    setFarmerStatus(Boolean(user.farmerStatus || userOcc.toLowerCase().includes('farmer')));
  };

  const parseIncomeString = (str) => {
    if (!str) return 300000;
    const s = String(str).toLowerCase();
    if (s.includes('1 lakh')) return 90000;
    if (s.includes('1-2.5')) return 180000;
    if (s.includes('2.5-5')) return 300000;
    if (s.includes('5-10')) return 750000;
    if (s.includes('above')) return 1200000;
    const nums = s.replace(/[^0-9]/g, '');
    return nums ? parseInt(nums, 10) : 300000;
  };

  const runSimulation = async (overrideForm = null) => {
    try {
      setSimulating(true);
      const payload = overrideForm || {
        age: Number(age),
        annualIncomeINR: Number(annualIncomeINR),
        occupation,
        state,
        socialCategory,
        education,
        familySize: Number(familySize),
        maritalStatus,
        disabilityStatus: Boolean(disabilityStatus),
        studentStatus: Boolean(studentStatus),
        farmerStatus: Boolean(farmerStatus),
      };

      const result = await simulateEligibilityApi(payload);
      setSimulationResult(result);
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
      runSimulation(realUser);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title={t('whatIfTitle')} subtitle={t('whatIfSub')}>
        <div className="flex h-64 items-center justify-center">
          <p className="animate-pulse text-gray-500">Loading your profile data from MongoDB...</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentProfile = simulationResult?.currentProfile || realUser;
  const summary = simulationResult?.summary || {};
  const schemesList = simulationResult?.schemes || [];
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
              <h2 className="text-xl font-bold text-sky-900">Real Eligibility Simulation Engine</h2>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Simulates your profile against active welfare schemes in MongoDB Atlas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleReset} className="border-sky-200 bg-white text-sky-800 hover:bg-sky-50">
              <RotateCcw className="h-4 w-4" /> Reset to Actual Profile
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
                  <h2 className="text-base font-bold text-navy-900">What-If Scenario</h2>
                </div>
                <Badge variant="accent" className="text-xs">Temporary Only</Badge>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Calendar className="h-3.5 w-3.5 text-primary-600" /> Age (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Wallet className="h-3.5 w-3.5 text-primary-600" /> Annual Family Income (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={annualIncomeINR}
                    onChange={(e) => setAnnualIncomeINR(e.target.value)}
                    className="input-base"
                    required
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Current: ₹{Number(annualIncomeINR).toLocaleString('en-IN')}
                  </p>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Briefcase className="h-3.5 w-3.5 text-primary-600" /> Occupation
                  </label>
                  <select
                    value={occupation}
                    onChange={(e) => {
                      const occ = e.target.value;
                      setOccupation(occ);
                      if (occ === 'Student') setStudentStatus(true);
                      if (occ === 'Farmer') setFarmerStatus(true);
                    }}
                    className="input-base"
                  >
                    {occupations.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <MapPin className="h-3.5 w-3.5 text-primary-600" /> State
                  </label>
                  <select value={state} onChange={(e) => setState(e.target.value)} className="input-base">
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Users className="h-3.5 w-3.5 text-primary-600" /> Social Category
                  </label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    className="input-base"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <GraduationCap className="h-3.5 w-3.5 text-primary-600" /> Education Level
                  </label>
                  <select value={education} onChange={(e) => setEducation(e.target.value)} className="input-base">
                    <option value="Below 10th">Below 10th</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post-Graduate">Post-Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="label-base flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <Users className="h-3.5 w-3.5 text-primary-600" /> Family Size
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
                      checked={studentStatus}
                      onChange={(e) => setStudentStatus(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Student Status (Currently Enrolled)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-navy-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={farmerStatus}
                      onChange={(e) => setFarmerStatus(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Farmer Status (Landholding Farmer)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-navy-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disabilityStatus}
                      onChange={(e) => setDisabilityStatus(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Disability Status (PwD)
                  </label>
                </div>

                <div className="pt-2 space-y-2">
                  <Button type="submit" size="lg" className="w-full" disabled={simulating}>
                    <Sparkles className="h-4 w-4" /> {simulating ? 'Calculating...' : 'Run What-If Simulation'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleReset} className="w-full">
                    <RotateCcw className="h-3.5 w-3.5" /> Reset to Current Profile
                  </Button>
                </div>
              </form>
            </Card>

            {/* Read-Only Card: Your Current Profile */}
            <Card className="p-5 border-gray-200 bg-gray-50/50">
              <div className="mb-3 flex items-center justify-between border-b pb-2 border-gray-200">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary-700" />
                  <h3 className="text-sm font-bold text-navy-900">Your Current Profile</h3>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white">MongoDB Atlas</Badge>
              </div>

              {currentProfile && (
                <div className="grid grid-cols-2 gap-2 text-xs text-navy-900">
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Name</span>
                    <span className="font-semibold">{currentProfile.fullName || realUser?.fullName || 'Citizen'}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Age</span>
                    <span className="font-semibold">{currentProfile.age} yrs</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Annual Income</span>
                    <span className="font-semibold">₹{Number(currentProfile.annualIncomeINR || 300000).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Occupation</span>
                    <span className="font-semibold">{currentProfile.occupation || 'N/A'}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">State</span>
                    <span className="font-semibold">{currentProfile.state || 'N/A'}</span>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Social Category</span>
                    <span className="font-semibold">{currentProfile.socialCategory || 'General'}</span>
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
                <p className="text-xs font-medium text-primary-700 uppercase tracking-wider">Current Eligible</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">{summary.currentEligibleCount ?? 0} Schemes</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Based on MongoDB Profile</p>
              </Card>

              <Card className="p-4 bg-accent-50/50 border-accent-200">
                <p className="text-xs font-medium text-accent-700 uppercase tracking-wider">Simulated Eligible</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">{summary.simulatedEligibleCount ?? 0} Schemes</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Based on What-If Scenario</p>
              </Card>

              <Card className="p-4 bg-success-50/50 border-success-200">
                <p className="text-xs font-medium text-success-700 uppercase tracking-wider">New Opportunities</p>
                <p className="mt-1 text-2xl font-bold text-success-700">+{summary.newOpportunitiesCount ?? 0}</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Additional Schemes Unlocked</p>
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
                    <h3 className="text-base font-bold text-navy-900">New Opportunity Unlocked!</h3>
                    <p className="mt-1 text-xs text-navy-700 leading-relaxed">
                      Changing your parameters makes you eligible for <strong>{newOpportunities.length} additional scheme(s)</strong>:
                    </p>
                    <div className="mt-3 space-y-2">
                      {newOpportunities.map((op) => (
                        <div key={op.schemeId} className="flex items-center justify-between rounded-xl bg-white p-3 border border-success-200">
                          <div>
                            <p className="text-sm font-bold text-navy-900">{op.name}</p>
                            <p className="text-xs text-gray-600">{op.benefitSummary}</p>
                          </div>
                          <Badge variant="success">Eligible Now</Badge>
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
                    <h3 className="text-base font-bold text-navy-900">Status Change / Lost Eligibility</h3>
                    <p className="mt-1 text-xs text-navy-700 leading-relaxed">
                      This scenario causes <strong>{lostEligibilities.length} previously eligible scheme(s)</strong> to become unavailable:
                    </p>
                    <div className="mt-3 space-y-2">
                      {lostEligibilities.map((op) => (
                        <div key={op.schemeId} className="rounded-xl bg-white p-3 border border-error-200">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-navy-900">{op.name}</p>
                            <Badge variant="error">Not Eligible</Badge>
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
                <h3 className="text-base font-bold text-navy-900">Real-Time Scheme Comparison</h3>
                <span className="text-xs text-gray-500">Evaluated against MongoDB Schemes</span>
              </div>

              <div className="space-y-4">
                {schemesList.map((schemeItem) => {
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
                            <h4 className="text-sm font-bold text-navy-900">{schemeItem.name}</h4>
                            <span className="text-[11px] text-gray-500">({schemeItem.provider})</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{schemeItem.benefitSummary}</p>
                        </div>

                        {/* Status Badges Side-by-Side */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center">
                            <span className="block text-[10px] text-gray-400 font-semibold uppercase">Current</span>
                            {curr.isEligible ? (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle2 className="h-3 w-3" /> Eligible
                              </Badge>
                            ) : (
                              <Badge variant="error" className="text-xs">
                                <XCircle className="h-3 w-3" /> Not Eligible
                              </Badge>
                            )}
                          </div>

                          <span className="text-gray-300 font-bold">→</span>

                          <div className="text-center">
                            <span className="block text-[10px] text-gray-500 font-semibold uppercase">Simulated</span>
                            {sim.isEligible ? (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle2 className="h-3 w-3" /> Eligible
                              </Badge>
                            ) : (
                              <Badge variant="error" className="text-xs">
                                <XCircle className="h-3 w-3" /> Not Eligible
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reasons & Explanations */}
                      <div className="mt-3 rounded-lg bg-gray-50 p-3 border border-gray-100 text-xs space-y-1.5">
                        <p className="text-navy-900">
                          <span className="font-semibold text-gray-700">Current situation: </span>
                          {curr.isEligible ? 'Eligible' : 'Not Eligible'} — {curr.reason}
                        </p>

                        <p className="text-navy-900">
                          <span className="font-semibold text-primary-700">What-if scenario: </span>
                          {sim.isEligible ? 'Eligible' : 'Not Eligible'} — {sim.reason}
                        </p>

                        {schemeItem.changeType !== 'unchanged' && (
                          <p className={`font-medium pt-1 ${
                            schemeItem.changeType === 'new_opportunity'
                              ? 'text-success-700'
                              : schemeItem.changeType === 'lost_eligibility'
                              ? 'text-error-700'
                              : 'text-gray-600'
                          }`}>
                            <span className="font-semibold">Change result: </span>
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
