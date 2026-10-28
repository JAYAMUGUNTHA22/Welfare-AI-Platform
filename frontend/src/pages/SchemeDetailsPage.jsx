import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Calendar, Building2, Wallet, FileText, ArrowRight, CheckCircle2, ClipboardList, XCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { VerificationBadge } from '@/components/shared/VerificationBadge';
import { SchemeApplicationAction } from '@/components/shared/SchemeApplicationAction';
import { useApplicationTracking } from '@/contexts/ApplicationTrackingContext';
import { MatchScore } from '@/components/shared/MatchScore';
import { schemes } from '@/data/mockData';
import { getAllSchemes, getDocumentsApi } from '@/services/api';
import { getSchemeTranslation } from '@/data/schemeTranslations';
import { getSchemeCatalogText, getSchemeCategoryLabel } from '@/utils/schemeCatalogTranslations';
import { loadMyschemeSchemes } from '@/data/myschemeDataset';

const schemeTranslationKeys = { 'pm-scholarship': 'pmScholarship', 'ayushman-bharat': 'ayushmanBharat', 'pm-kisan': 'pmKisan', 'pmay-housing': 'pmayHousing', 'atal-pension-yojana': 'atalPension', 'mudra-loan': 'mudraLoan', 'stand-up-india': 'standUpIndia', mgnrega: 'mgnrega', 'tata-skills': 'tataSkills' };

function getDetailText(value) {
  if (Array.isArray(value)) return value.map((item) => typeof item === 'string' ? item : item?.criterion_text || '').filter(Boolean);
  return typeof value === 'string' && value.trim() ? [value.trim()] : [];
}

function getApplicationSteps(value) {
  const text = getDetailText(value).join('\n');
  const steps = [...text.matchAll(/Step\s*\d+\s*:\s*([\s\S]*?)(?=Step\s*\d+\s*:|$)/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean);
  if (steps.length) return steps;
  return getDetailText(value).flatMap((item) => item
    .split(/\r?\n|;|•|(?<=[.!?])\s+(?=(?:Go|Visit|Open|Register|Fill|Complete|Attach|Upload|Submit|Apply|Pay|Contact|Take|Collect|Send|Then|Finally)\b)/i)
    .map((step) => step.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean));
}

function getDocumentItems(value) {
  return getDetailText(value).flatMap((text) => text
    .split(/\r?\n|;|•|\s+(?=\d+[.)]\s)|(?<=[.!?])\s+(?=[A-Z])/)
    .map((item) => item.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean));
}

function normalizeDocumentName(value) {
  return String(value || '').toLowerCase().replace(/\baadhaar\b/g, 'aadhar').replace(/[^a-z0-9]/g, '');
}

function documentMatches(required, uploaded) {
  const requirement = normalizeDocumentName(required);
  const available = `${normalizeDocumentName(uploaded?.name)}${normalizeDocumentName(uploaded?.category)}`;
  const aliases = [
    [/aadhar|identity|uid/, /aadhar|identity|uid/], [/bank|passbook|account/, /bank|passbook|account/],
    [/income|salary|itr/, /income|salary|itr/], [/caste|category|community/, /caste|category|community/],
    [/address|residence|domicile/, /address|residence|domicile/], [/mark.?sheet|education|school/, /mark.?sheet|education|school/],
    [/photo|photograph/, /photo|photograph/], [/ration|bpl/, /ration|bpl/], [/birth|age/, /birth|age/],
    [/labou?r|registration|worker/, /labou?r|registration|worker/],
  ];
  return (requirement.length > 3 && available.includes(requirement)) || aliases.some(([wanted, held]) => wanted.test(requirement) && held.test(available));
}

export function SchemeDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { handleSchemeDetailsBack } = useApplicationTracking();
  const { t, i18n } = useTranslation();
  const [schemeData, setScheme] = useState(() => schemes.find((item) => item.id === id));
  const scheme = schemeData && location.state?.recommendation
    ? { ...schemeData, ...location.state.recommendation }
    : schemeData;
  const [loading, setLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsUnlocked, setDocumentsUnlocked] = useState(false);

  useEffect(() => {
    let active = true;
    getDocumentsApi().then((data) => {
      if (active) { setUploadedDocuments(data.documents || []); setDocumentsUnlocked(true); }
    }).catch(() => { if (active) setDocumentsUnlocked(false); })
      .finally(() => { if (active) setDocumentsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const localScheme = schemes.find((item) => item.id === id || item.schemeId === id);
    if (localScheme) {
      setScheme(localScheme);
      setLoading(false);
      return;
    }

    let active = true;
    setScheme(null);
    setLoading(true);
    async function loadScheme() {
      try {
        const backendSchemes = await getAllSchemes().catch((error) => {
          console.warn('Could not load backend scheme details; checking the MyScheme dataset.', error);
          return [];
        });
        const found = backendSchemes.find((item) => (item.schemeId || item._id) === id);
        if (found) {
          if (active) setScheme(found);
          return;
        }

        const datasetSchemes = await loadMyschemeSchemes();
        if (active) setScheme(datasetSchemes.find((item) => item.schemeId === id) || null);
      } catch (error) {
        console.error('Failed to load scheme details', error);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadScheme();
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (location.hash !== '#application-process') return;
    document.getElementById('application-process')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [id, location.hash, schemeData]);

  if (loading) {
    return <DashboardLayout backTo="/my-schemes"><p className="py-12 text-center text-gray-500">{t('eligibility.loading')}</p></DashboardLayout>;
  }
  if (!scheme) {
    return <DashboardLayout backTo="/my-schemes"><p className="py-12 text-center text-gray-500">{t('noSchemes')}</p></DashboardLayout>;
  }

  const schemeId = scheme.schemeId || scheme.id;
  const translated = getSchemeTranslation(schemeId, i18n.language, scheme);
  const translateScheme = (value) => getSchemeCatalogText(value || '', i18n.language);
  const name = translated.name || t(`schemeNames.${schemeTranslationKeys[schemeId] || schemeId}`, { defaultValue: translateScheme(scheme.name) });
  const summary = translated.description || translateScheme(scheme.details || scheme.overview || scheme.shortExplanation);
  const benefits = getDetailText(translateScheme(scheme.benefitSummary || scheme.benefits || scheme.benefitAmount)).flatMap((text) => text.split(/\r?\n|;|•|(?<=[.!?])\s+(?=[A-Z₹])/).map((item) => item.trim()).filter(Boolean));
  // Use translated fields if available, otherwise fallback to original data
  const criteria = translated.eligibility
    ? getDetailText(translated.eligibility)
    : scheme.eligibilityCriteria?.length
      ? scheme.eligibilityCriteria.map((criterion) => translateScheme(criterion.criterion_text || criterion)).filter(Boolean)
      : getDetailText(translateScheme(scheme.eligibility));
  const applicationSteps = translated.applicationProcess
    ? getApplicationSteps(translated.applicationProcess)
    : getApplicationSteps(translateScheme(scheme.applicationProcess || scheme.applicationMethod));
  const requiredDocuments = translated.documentsRequired
    ? getDocumentItems(translated.documentsRequired)
    : getDocumentItems(translateScheme(scheme.documentsRequired));

  return (
    <DashboardLayout backTo="/my-schemes" onBack={() => handleSchemeDetailsBack(scheme, '/my-schemes')}>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            {scheme.verification && <div className="mb-2"><VerificationBadge status={scheme.verification} size="md" /></div>}
            <h1 className="text-2xl font-bold text-navy-900 lg:text-3xl">{name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500"><Building2 className="h-4 w-4" /> {translated.provider || translateScheme(scheme.provider)}</p>
            {scheme.schemeCategories?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {scheme.schemeCategories.map((category) => (
                  <span key={category} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{getSchemeCategoryLabel(category, i18n.language)}</span>
                ))}
              </div>
            )}
            {summary && <p className="mt-4 line-clamp-4 max-w-4xl text-base leading-relaxed text-slate-800">{summary}</p>}
          </div>
          {Number.isFinite(scheme.matchScore) && (
            <div className="flex flex-col items-center gap-3">
              <MatchScore score={scheme.matchScore} size="lg" />
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${scheme.matchScore > 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{t('scheme.potentiallyEligible')}</span>
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {!scheme.myschemeSlug && <Button to={`/schemes/${schemeId}/eligibility`} size="lg" className="flex-1">{t('scheme.checkEligibility')} <ArrowRight className="h-5 w-5" /></Button>}
          <SchemeApplicationAction scheme={scheme} applyLabel={t('applicationAction.applyOriginalWebsite')} unavailableLabel={t('applicationAction.unavailable')} variant="outline" size="lg" className="flex-1" />
        </div>
      </div>

      <Tabs items={[{
        id: 'overview',
        label: t('scheme.overview'),
        content: (
          <div className="space-y-6">
            {summary && (
              <Card className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-navy-900">{t('scheme.about', { defaultValue: 'About this scheme' })}</h2>
                </div>
                <p className="whitespace-pre-line text-base leading-relaxed text-slate-900">{summary}</p>
              </Card>
            )}
            {benefits.length > 0 && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-navy-900">{t('scheme.benefits', { defaultValue: 'Benefits' })}</h2>
                </div>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-base leading-relaxed text-slate-900 shadow-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{index + 1}</span>
                      <span className="pt-0.5">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {criteria.length > 0 && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-navy-900">{t('scheme.eligibility', { defaultValue: 'Eligibility requirements' })}</h2>
                </div>
                <ul className="space-y-3">
                  {criteria.map((criterion, index) => (
                    <li key={index} className="flex gap-3 rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-navy-700">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">{index + 1}</span>
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
                {scheme.eligibilityCriteria?.some((criterion) => criterion.verification_status === 'needs_official_verification') && (
                  <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                    Eligibility information is extracted from the MyScheme dataset and may need verification. Confirm the current requirements on the official website before applying.
                  </p>
                )}
              </Card>
            )}
            {applicationSteps.length > 0 && (
              <Card id="application-process" className="scroll-mt-8 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-navy-900">{t('scheme.howToApply', { defaultValue: 'How to apply' })}</h2>
                </div>
                <ol className="space-y-3">
                  {applicationSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-base leading-relaxed text-slate-900">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-700 text-sm font-bold text-white">{index + 1}</span>
                      <span className="pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}
            {requiredDocuments.length > 0 && (
              <Card className="p-6">
                <div className="mb-5 flex items-center gap-4 rounded-2xl bg-sky-100 px-5 py-4">
                  <FileText className="h-9 w-9 shrink-0 text-blue-800" />
                  <h2 className="text-2xl font-extrabold text-blue-900">{t('scheme.requiredDocuments', { defaultValue: 'Required Documents' })}</h2>
                </div>
                {!documentsLoading && !documentsUnlocked && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-950">Unlock your document vault to compare these requirements with your uploaded files. Your files stay private.</p>}
                <ul className="grid grid-cols-1 gap-3">
                  {requiredDocuments.map((document, index) => {
                    const matched = uploadedDocuments.some((uploaded) => documentMatches(document, uploaded));
                    const known = documentsUnlocked && !documentsLoading;
                    return <li key={index} className={`flex min-h-[88px] items-center gap-5 rounded-2xl border-2 px-5 py-4 text-lg font-semibold ${known && matched ? 'border-sky-100 bg-sky-50/50 text-blue-950' : known ? 'border-red-100 bg-red-50/50 text-red-950' : 'border-slate-200 bg-slate-50 text-slate-900'}`}>
                      <FileText className="h-10 w-10 shrink-0 text-blue-800" />
                      <span>{document}</span>
                      {documentsLoading ? <Loader2 className="ml-auto h-9 w-9 animate-spin text-slate-500" /> : known && matched ? <CheckCircle2 className="ml-auto h-12 w-12 shrink-0 text-green-600" strokeWidth={2.8} /> : known ? <XCircle className="ml-auto h-12 w-12 shrink-0 text-red-600" strokeWidth={2.8} /> : null}
                    </li>;
                  })}
                </ul>
                {!documentsUnlocked && !documentsLoading && <Button to="/documents" variant="outline" className="mt-4">Open document vault <ArrowRight className="h-4 w-4" /></Button>}
              </Card>
            )}
            {scheme.deadline && (
              <Card className="flex items-center gap-3 p-5">
                <Calendar className="h-5 w-5 text-accent-600" />
                <p className="text-sm text-navy-700"><span className="font-semibold">{t('scheme.deadline')}:</span> {scheme.deadline}</p>
              </Card>
            )}
            {Number.isFinite(scheme.matchScore) && (
              <Card className="p-5">
                <h3 className={`mb-3 text-lg font-extrabold ${scheme.matchScore > 50 ? 'text-emerald-800' : 'text-red-800'}`}>{t('scheme.yourMatch')}: {scheme.matchScore}%</h3>
                <ul className="space-y-2">
                  {(scheme.matchReasons || []).map((reason, index) => (
                    <li key={index} className="text-base font-medium text-slate-900">{reason.label}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-gray-500">{scheme.recommendationNote}</p>
              </Card>
            )}
          </div>
        ),
      }]} />
    </DashboardLayout>
  );
}
