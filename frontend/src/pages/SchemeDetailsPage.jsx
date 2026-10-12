import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Calendar, Building2, Wallet, FileText, ArrowRight, CheckCircle2, ClipboardList, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { VerificationBadge } from '@/components/shared/VerificationBadge';
import { MatchScore } from '@/components/shared/MatchScore';
import { schemes } from '@/data/mockData';
import { getAllSchemes } from '@/services/api';
import { getSchemeTranslation } from '@/data/schemeTranslations';
import { getSchemeApplicationUrl } from '@/utils/schemeLinks';
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
  return steps.length ? steps : getDetailText(value);
}

function getDocumentItems(value) {
  return getDetailText(value).flatMap((text) => text.split(/\r?\n|;|•/).map((item) => item.trim()).filter(Boolean));
}

export function SchemeDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [schemeData, setScheme] = useState(() => schemes.find((item) => item.id === id));
  const scheme = schemeData && location.state?.recommendation
    ? { ...schemeData, ...location.state.recommendation }
    : schemeData;
  const [loading, setLoading] = useState(false);

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

  if (loading) {
    return <DashboardLayout backTo="/schemes"><p className="py-12 text-center text-gray-500">{t('eligibility.loading')}</p></DashboardLayout>;
  }
  if (!scheme) {
    return <DashboardLayout backTo="/schemes"><p className="py-12 text-center text-gray-500">{t('noSchemes')}</p></DashboardLayout>;
  }

  const schemeId = scheme.schemeId || scheme.id;
  const applicationUrl = getSchemeApplicationUrl(scheme);
  const translated = getSchemeTranslation(schemeId, i18n.language, scheme);
  const translateScheme = (value) => t(`schemeData.${value}`, { defaultValue: value || '' });
  const name = translated.name || t(`schemeNames.${schemeTranslationKeys[schemeId] || schemeId}`, { defaultValue: translateScheme(scheme.name) });
  const summary = translated.description || scheme.details || scheme.overview || scheme.shortExplanation;
  const benefits = getDetailText(scheme.benefitSummary || scheme.benefits || scheme.benefitAmount);
  const criteria = scheme.eligibilityCriteria?.length
    ? scheme.eligibilityCriteria.map((criterion) => criterion.criterion_text || criterion).filter(Boolean)
    : getDetailText(scheme.eligibility);
  const applicationSteps = getApplicationSteps(scheme.applicationProcess || scheme.applicationMethod);
  const requiredDocuments = getDocumentItems(scheme.documentsRequired);

  return (
    <DashboardLayout backTo="/schemes">
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            {scheme.verification && <div className="mb-2"><VerificationBadge status={scheme.verification} size="md" /></div>}
            <h1 className="text-2xl font-bold text-navy-900 lg:text-3xl">{name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500"><Building2 className="h-4 w-4" /> {translated.provider || translateScheme(scheme.provider)}</p>
            {scheme.schemeCategories?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {scheme.schemeCategories.map((category) => (
                  <span key={category} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">{category}</span>
                ))}
              </div>
            )}
            {summary && <p className="mt-4 line-clamp-4 max-w-4xl text-sm leading-relaxed text-navy-600">{summary}</p>}
          </div>
          {Number.isFinite(scheme.matchScore) && (
            <div className="flex flex-col items-center gap-3">
              <MatchScore score={scheme.matchScore} size="lg" />
              <span className="text-xs font-semibold text-primary-600">{t('scheme.potentiallyEligible')}</span>
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {!scheme.myschemeSlug && <Button to={`/schemes/${schemeId}/eligibility`} size="lg" className="flex-1">{t('scheme.checkEligibility')} <ArrowRight className="h-5 w-5" /></Button>}
          <Button href={applicationUrl || undefined} disabled={!applicationUrl} title={!applicationUrl ? 'Application website is not provided in the scheme data.' : undefined} target="_blank" rel="noopener noreferrer" variant="outline" size="lg" className="flex-1">{applicationUrl ? t('scheme.apply') : 'Apply link unavailable'} <ExternalLink className="h-4 w-4" /></Button>
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
                  <h2 className="text-lg font-bold text-navy-900">About this scheme</h2>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-navy-700">{summary}</p>
              </Card>
            )}
            {benefits.length > 0 && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-navy-900">Benefits</h2>
                </div>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex gap-3 text-sm leading-relaxed text-navy-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{benefit}</span>
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
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-navy-900">How to apply</h2>
                </div>
                <ol className="space-y-3">
                  {applicationSteps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm leading-relaxed text-navy-700">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">{index + 1}</span>
                      <span className="pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}
            {requiredDocuments.length > 0 && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-navy-900">Documents required</h2>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {requiredDocuments.map((document, index) => (
                    <li key={index} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-navy-700">{document}</li>
                  ))}
                </ul>
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
                <h3 className="mb-3 text-base font-bold text-navy-900">{t('scheme.yourMatch')}: {scheme.matchScore}%</h3>
                <ul className="space-y-2">
                  {(scheme.matchReasons || []).map((reason, index) => (
                    <li key={index} className="text-sm text-navy-700">{reason.label}</li>
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
