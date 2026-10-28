import { User, Mail, Phone, MapPin, Calendar, Globe, Edit, Shield, Users, Sparkles, Banknote, CreditCard, Tag, FileText, RefreshCw, Save, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getMe, getExtractedProfileApi, updateCitizen } from '@/services/api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { states } from '@/data/mockData';

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [docProfile, setDocProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [editValues, setEditValues] = useState({});
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token && token !== 'demo-token';
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const { user } = await getMe();
        setProfile(user);
      } catch (err) {
        // try local cache
        try {
          const cached = localStorage.getItem('currentUser');
          if (cached) setProfile(JSON.parse(cached));
        } catch (_) {}
      }
      // Load extracted profile from documents
      if (isAuthenticated()) {
        try {
          const { profile: ep } = await getExtractedProfileApi();
          setDocProfile(ep);
        } catch (_) {}
      }
    }
    loadProfile();
  }, []);

  const handleRefreshFromDocs = async () => {
    setRefreshing(true);
    try {
      const { profile: ep } = await getExtractedProfileApi();
      setDocProfile(ep);
    } catch (_) {}
    setRefreshing(false);
  };

  const startEditing = () => {
    setSaveError('');
    setSaveSuccess('');
    setEditValues({
      fullName: profile?.fullName || current.name || '',
      state: profile?.state || '',
      age: profile?.age ?? '',
      gender: profile?.gender || '',
      occupation: profile?.occupation || '',
      income: profile?.income || '',
      educationLevel: profile?.educationLevel || '',
      currentCourse: profile?.currentCourse || '',
      employmentStatus: profile?.employmentStatus || '',
      familySize: profile?.familySize ?? '',
      dependants: profile?.dependants ?? '',
      residenceType: profile?.residenceType || '',
      isFarmer: profile?.isFarmer,
      firstGraduate: profile?.firstGraduate,
      specialCircumstances: profile?.specialCircumstances || '',
      district: profile?.district || '',
      landholdingAcres: profile?.landholdingAcres ?? '',
      landOwnership: profile?.landOwnership || '',
      cropTypes: (profile?.cropTypes || []).join(', '),
      farmingActivities: (profile?.farmingActivities || []).join(', '),
      annualIncomeINR: profile?.annualIncomeINR ?? '',
      socialCategory: profile?.socialCategory || '',
      isDifferentlyAbled: profile?.isDifferentlyAbled,
      isWidow: profile?.isWidow,
      motherWidowed: profile?.motherWidowed,
    });
    setEditing(true);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    const updates = {
      fullName: editValues.fullName.trim(),
      state: editValues.state,
      age: editValues.age === '' ? null : Number(editValues.age),
      gender: editValues.gender || '',
      occupation: editValues.occupation.trim(),
      income: editValues.income,
      educationLevel: editValues.educationLevel,
      currentCourse: editValues.currentCourse.trim(),
      employmentStatus: editValues.employmentStatus,
      familySize: editValues.familySize === '' ? null : Number(editValues.familySize),
      dependants: editValues.dependants === '' ? null : Number(editValues.dependants),
      residenceType: editValues.residenceType || '',
      isFarmer: editValues.isFarmer == null || editValues.isFarmer === '' ? null : Boolean(editValues.isFarmer),
      firstGraduate: editValues.firstGraduate == null || editValues.firstGraduate === '' ? null : Boolean(editValues.firstGraduate),
      specialCircumstances: editValues.specialCircumstances.trim(),
      district: editValues.district.trim(),
      landholdingAcres: editValues.landholdingAcres === '' ? null : Number(editValues.landholdingAcres),
      landOwnership: editValues.landOwnership.trim(),
      cropTypes: editValues.cropTypes.split(',').map((value) => value.trim()).filter(Boolean),
      farmingActivities: editValues.farmingActivities.split(',').map((value) => value.trim()).filter(Boolean),
      annualIncomeINR: editValues.annualIncomeINR === '' ? null : Number(editValues.annualIncomeINR),
      socialCategory: editValues.socialCategory || '',
      isDifferentlyAbled: editValues.isDifferentlyAbled == null ? null : Boolean(editValues.isDifferentlyAbled),
      isWidow: editValues.isWidow == null ? null : Boolean(editValues.isWidow),
      motherWidowed: editValues.motherWidowed == null ? null : Boolean(editValues.motherWidowed),
    };

    try {
      const token = localStorage.getItem('token');
      const citizenId = profile?._id || profile?.id;
      let savedProfile;
      if (token && token !== 'demo-token') {
        if (!citizenId) throw new Error('Your account could not be identified. Please sign in again and retry.');
        const response = await updateCitizen(citizenId, updates);
        savedProfile = response.citizen;
      } else {
        savedProfile = { ...profile, ...updates };
      }

      const nextProfile = { ...profile, ...savedProfile, ...updates };
      setProfile(nextProfile);
      localStorage.setItem('currentUser', JSON.stringify(nextProfile));
      setEditing(false);
      setSaveSuccess(token && token !== 'demo-token' ? 'Profile updated. Your scheme recommendations will use the new details.' : 'Profile saved on this device.');
    } catch (error) {
      setSaveError(error.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fallback = { name: 'Citizen', email: 'No Email', mobile: 'No Mobile', state: 'Unknown', age: 0, occupation: 'None', income: 'None', socialCategory: 'General', language: 'English' };

  const current = profile ? {
    name: profile.fullName || fallback.name,
    email: profile.email || fallback.email,
    mobile: profile.mobile || fallback.mobile,
    state: profile.state || fallback.state,
    age: profile.age || (docProfile?.age) || fallback.age,
    occupation: profile.occupation || fallback.occupation,
    income: profile.income || fallback.income,
    annualIncome: profile.annualIncomeINR || docProfile?.annualIncome || null,
    socialCategory: profile.socialCategory || docProfile?.socialCategory || fallback.socialCategory,
    isDifferentlyAbled: Boolean(profile.isDifferentlyAbled),
    isWidow: Boolean(profile.isWidow),
    motherWidowed: Boolean(profile.motherWidowed),
    language: profile.language || fallback.language,
  } : fallback;

  const fields = [
    { label: t('profile.fullName'),       value: current.name,           icon: User },
    { label: t('profile.email'),          value: current.email,          icon: Mail },
    { label: t('profile.mobile'),         value: current.mobile,         icon: Phone },
    { label: t('profile.state'),          value: current.state,          icon: MapPin },
    { label: t('profile.age'),            value: current.age ? `${current.age} ${t('years', { defaultValue: 'yrs' })}` : '—', icon: Calendar },
    { label: t('profile.occupation'),     value: current.occupation,     icon: User },
    { label: t('profile.incomeBracket'),  value: current.income,         icon: Banknote },
    { label: t('profile.socialCategory'), value: current.socialCategory, icon: Users },
    { label: 'Differently abled', value: current.isDifferentlyAbled ? 'Yes' : 'No', icon: Users },
    { label: 'Widow', value: current.isWidow ? 'Yes' : 'No', icon: Users },
    { label: 'Mother is widowed', value: current.motherWidowed ? 'Yes' : 'No', icon: Users },
    { label: t('profile.preferredLanguage'), value: current.language,    icon: Globe },
  ];

  // Document-sourced extra fields
  const docFields = docProfile ? [
    docProfile.age        && { label: t('age', { defaultValue: 'Age (from docs)' }),           value: `${docProfile.age} yrs`,                        icon: Calendar,    from: 'doc' },
    docProfile.aadhaarNumber && { label: t('aadhaarNumber', { defaultValue: 'Aadhaar' }),      value: '••••  ••••  ' + String(docProfile.aadhaarNumber).slice(-4), icon: CreditCard, from: 'doc' },
    docProfile.annualIncome  && { label: t('annualIncome', { defaultValue: 'Annual Income' }), value: docProfile.incomeText || `₹${docProfile.annualIncome.toLocaleString('en-IN')}`,      icon: Banknote,  from: 'doc' },
    docProfile.socialCategory && { label: t('socialCategory', { defaultValue: 'Category' }),  value: docProfile.socialCategory,                       icon: Tag,        from: 'doc' },
  ].filter(Boolean) : [];

  return (
    <DashboardLayout title={t('profile.title')} subtitle={t('profile.subtitle')}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar col */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
              {current.name[0]?.toUpperCase() || 'C'}
            </div>
            <h2 className="mt-4 text-lg font-bold text-navy-900">{current.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{current.email}</p>
            <div className="mt-3 flex justify-center">
              <Badge variant="success" icon={<Shield className="h-3.5 w-3.5" />}>{t('common.citizenAccount')}</Badge>
            </div>
            <Button variant="outline" size="sm" className="mt-6 w-full" onClick={startEditing}>
              <Edit className="h-4 w-4" /> {t('profile.editProfile')}
            </Button>
          </Card>

          {/* Doc count card */}
          {docProfile && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900">{t('documentVaultTitle', { defaultValue: 'Document Vault' })}</p>
                  <p className="text-[11px] text-gray-500">{docProfile.documentCount || 0} {t('allDocuments', { defaultValue: 'documents' })}</p>
                </div>
              </div>
              <div className="rounded-xl bg-primary-50 p-3 text-center">
                <p className="text-2xl font-bold text-primary-700">{docProfile.documentCount || 0}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{t('allDocuments', { defaultValue: 'Uploaded Documents' })}</p>
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="mt-3 w-full rounded-xl border border-primary-200 bg-primary-50 py-2 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors"
              >
                {t('uploadDocument', { defaultValue: 'Manage Documents' })}
              </button>
            </Card>
          )}
        </div>

        {/* Details col */}
        <div className="lg:col-span-2 space-y-4">
          {saveSuccess && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saveSuccess}</p>}
          {editing && (
            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-900">Edit profile</h3>
                  <p className="mt-1 text-sm text-gray-500">These details are used to personalize scheme recommendations.</p>
                </div>
                <button type="button" onClick={() => setEditing(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Cancel profile editing">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {saveError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-navy-700">
                    Full name
                    <input required maxLength={120} value={editValues.fullName || ''} onChange={(event) => setEditValues({ ...editValues, fullName: event.target.value })} className="input-base mt-1" />
                  </label>
                  <label className="text-sm font-medium text-navy-700">
                    State / Union Territory
                    <select required value={editValues.state || ''} onChange={(event) => setEditValues({ ...editValues, state: event.target.value })} className="input-base mt-1">
                      <option value="">Select your state</option>
                      {states.map((state) => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-navy-700">
                    Age
                    <input type="number" min="1" max="120" value={editValues.age ?? ''} onChange={(event) => setEditValues({ ...editValues, age: event.target.value })} className="input-base mt-1" />
                  </label>
                  <label className="text-sm font-medium text-navy-700">
                    Gender (optional)
                    <select value={editValues.gender || ''} onChange={(event) => setEditValues({ ...editValues, gender: event.target.value })} className="input-base mt-1">
                      <option value="">Prefer not to say</option>
                      {['Female', 'Male', 'Other'].map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-navy-700">
                    Occupation
                    <input value={editValues.occupation || ''} onChange={(event) => setEditValues({ ...editValues, occupation: event.target.value })} className="input-base mt-1" />
                  </label>
                  <label className="text-sm font-medium text-navy-700">
                    Annual income range
                    <select value={editValues.income || ''} onChange={(event) => setEditValues({ ...editValues, income: event.target.value })} className="input-base mt-1">
                      <option value="">Select income range</option>
                      {['Below ₹1 lakh', '₹1-2.5 lakh', '₹2.5-5 lakh', '₹5-10 lakh', 'Above ₹10 lakh'].map((income) => <option key={income} value={income}>{income}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-navy-700">
                    Exact annual income (₹, optional)
                    <input type="number" min="0" value={editValues.annualIncomeINR ?? ''} onChange={(event) => setEditValues({ ...editValues, annualIncomeINR: event.target.value })} className="input-base mt-1" />
                  </label>
                  <label className="text-sm font-medium text-navy-700 sm:col-span-2">
                    Social category
                    <select value={editValues.socialCategory || ''} onChange={(event) => setEditValues({ ...editValues, socialCategory: event.target.value })} className="input-base mt-1">
                      <option value="">Select category</option>
                      {['General', 'OBC', 'SC', 'ST', 'EWS'].map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-navy-700">
                    Are you differently abled?
                    <select value={editValues.isDifferentlyAbled == null ? '' : editValues.isDifferentlyAbled ? 'yes' : 'no'} onChange={(event) => setEditValues({ ...editValues, isDifferentlyAbled: event.target.value === '' ? null : event.target.value === 'yes' })} className="input-base mt-1">
                      <option value="">Not specified</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-navy-700">
                    Are you a widow?
                    <select value={editValues.isWidow == null ? '' : editValues.isWidow ? 'yes' : 'no'} onChange={(event) => setEditValues({ ...editValues, isWidow: event.target.value === '' ? null : event.target.value === 'yes' })} className="input-base mt-1">
                      <option value="">Not specified</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium text-navy-700 sm:col-span-2">
                    Is your mother widowed?
                    <select value={editValues.motherWidowed == null ? '' : editValues.motherWidowed ? 'yes' : 'no'} onChange={(event) => setEditValues({ ...editValues, motherWidowed: event.target.value === '' ? null : event.target.value === 'yes' })} className="input-base mt-1">
                      <option value="">Not specified</option>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>
                </div>
                <details className="rounded-xl border border-slate-200 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-700">Optional details for schemes that ask for them</summary>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-navy-700">
                      Education level
                      <select value={editValues.educationLevel || ''} onChange={(event) => setEditValues({ ...editValues, educationLevel: event.target.value })} className="input-base mt-1">
                        <option value="">Not specified</option>
                        {['No formal education', 'Primary', 'Secondary', 'Higher secondary', 'Diploma / ITI', 'Undergraduate', 'Postgraduate', 'Other'].map((level) => <option key={level} value={level}>{level}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-medium text-navy-700">
                      Current course or occupation detail
                      <input value={editValues.currentCourse || ''} onChange={(event) => setEditValues({ ...editValues, currentCourse: event.target.value })} className="input-base mt-1" maxLength={120} />
                    </label>
                    <label className="text-sm font-medium text-navy-700">
                      Employment status
                      <select value={editValues.employmentStatus || ''} onChange={(event) => setEditValues({ ...editValues, employmentStatus: event.target.value })} className="input-base mt-1">
                        <option value="">Not specified</option>
                        {['Employed', 'Self-employed', 'Unemployed', 'Seeking work', 'Retired', 'Student'].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-medium text-navy-700">
                      Residence type
                      <select value={editValues.residenceType || ''} onChange={(event) => setEditValues({ ...editValues, residenceType: event.target.value })} className="input-base mt-1">
                        <option value="">Not specified</option>
                        <option value="Rural">Rural</option><option value="Urban">Urban</option>
                      </select>
                    </label>
                    <label className="text-sm font-medium text-navy-700">Family members
                      <input type="number" min="1" value={editValues.familySize ?? ''} onChange={(event) => setEditValues({ ...editValues, familySize: event.target.value })} className="input-base mt-1" />
                    </label>
                    <label className="text-sm font-medium text-navy-700">Dependants
                      <input type="number" min="0" value={editValues.dependants ?? ''} onChange={(event) => setEditValues({ ...editValues, dependants: event.target.value })} className="input-base mt-1" />
                    </label>
                    <label className="text-sm font-medium text-navy-700">District or block
                      <input value={editValues.district || ''} onChange={(event) => setEditValues({ ...editValues, district: event.target.value })} className="input-base mt-1" maxLength={120} />
                    </label>
                    <label className="text-sm font-medium text-navy-700">Farm size (acres, optional)
                      <input type="number" min="0" step="0.01" value={editValues.landholdingAcres ?? ''} onChange={(event) => setEditValues({ ...editValues, landholdingAcres: event.target.value })} className="input-base mt-1" />
                    </label>
                    <label className="text-sm font-medium text-navy-700">Land ownership or tenancy
                      <select value={editValues.landOwnership || ''} onChange={(event) => setEditValues({ ...editValues, landOwnership: event.target.value })} className="input-base mt-1">
                        <option value="">Not specified</option>
                        {['Owner', 'Tenant', 'Leased', 'Sharecropper', 'Other'].map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-medium text-navy-700">Crops grown (comma-separated)
                      <input value={editValues.cropTypes || ''} onChange={(event) => setEditValues({ ...editValues, cropTypes: event.target.value })} className="input-base mt-1" maxLength={250} placeholder="For example, paddy, chilli" />
                    </label>
                    <label className="text-sm font-medium text-navy-700 sm:col-span-2">Farming activities (optional)
                      <input value={editValues.farmingActivities || ''} onChange={(event) => setEditValues({ ...editValues, farmingActivities: event.target.value })} className="input-base mt-1" maxLength={250} placeholder="For example, crop cultivation, dairy" />
                    </label>
                    {[
                      ['isFarmer', 'Are you a farmer or agricultural worker?'],
                      ['firstGraduate', 'Are you the first graduate in your family?'],
                    ].map(([key, label]) => (
                      <label key={key} className="text-sm font-medium text-navy-700">{label}
                        <select value={editValues[key] == null ? '' : editValues[key] ? 'yes' : 'no'} onChange={(event) => setEditValues({ ...editValues, [key]: event.target.value === '' ? null : event.target.value === 'yes' })} className="input-base mt-1">
                          <option value="">Not specified</option><option value="no">No</option><option value="yes">Yes</option>
                        </select>
                      </label>
                    ))}
                    <label className="text-sm font-medium text-navy-700 sm:col-span-2">Relevant special circumstances (optional)
                      <textarea value={editValues.specialCircumstances || ''} onChange={(event) => setEditValues({ ...editValues, specialCircumstances: event.target.value })} className="input-base mt-1 min-h-20" maxLength={500} placeholder="Only include details relevant to scheme eligibility." />
                    </label>
                  </div>
                </details>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save profile'}</Button>
                </div>
              </form>
            </Card>
          )}
          <Card className="p-6">
            <h3 className="mb-4 text-base font-bold text-navy-900">{t('profile.personalInfo')}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="rounded-xl border border-gray-200 p-4">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Icon className="h-3.5 w-3.5" /> {field.label}
                    </p>
                    <p className="text-sm font-bold text-navy-900">{field.value}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AI-extracted from documents panel */}
          {docFields.length > 0 && (
            <Card className="p-6 border-primary-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900">{t('docProfileTitle', { defaultValue: 'Extracted from Documents' })}</p>
                    <p className="text-[11px] text-gray-500">{t('docProfileSub', { defaultValue: 'Auto-filled from your uploaded documents' })}</p>
                  </div>
                </div>
                <button
                  onClick={handleRefreshFromDocs}
                  disabled={refreshing}
                  className="flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                  {t('refresh', { defaultValue: 'Refresh' })}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {docFields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.label} className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-600">
                        <Icon className="h-3.5 w-3.5" /> {field.label}
                      </p>
                      <p className="text-sm font-bold text-navy-900">{field.value}</p>
                      <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-primary-500 font-medium">
                        <Sparkles className="h-2.5 w-2.5" /> {t('aiExtracted', { defaultValue: 'AI-Extracted' })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-gray-400 italic">
                {t('profileAutoUpdated', { defaultValue: 'Your eligibility profile has been auto-updated from your documents.' })}
              </p>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="mb-3 text-base font-bold text-navy-900">{t('profile.accountSummary')}</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-primary-50 p-4 text-center">
                <p className="text-2xl font-bold text-primary-700">0</p>
                <p className="mt-1 text-xs text-gray-500">{t('dashboard.recommendedSchemes')}</p>
              </div>
              <div className="rounded-xl bg-accent-50 p-4 text-center">
                <p className="text-2xl font-bold text-accent-700">0</p>
                <p className="mt-1 text-xs text-gray-500">{t('dashboard.activeApplications')}</p>
              </div>
              <div className="rounded-xl bg-success-50 p-4 text-center">
                <p className="text-2xl font-bold text-success-700">{docProfile?.documentCount || 0}</p>
                <p className="mt-1 text-xs text-gray-500">{t('dashboard.documents')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
