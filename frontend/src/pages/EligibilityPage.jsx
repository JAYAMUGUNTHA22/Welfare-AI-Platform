import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, MapPin, User, Wallet } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchScore } from '@/components/shared/MatchScore';
import { getMe, getRecommendedSchemes } from '@/services/api';
import { getSchemeTranslation } from '@/data/schemeTranslations';
import { getSchemeCatalogText } from '@/utils/schemeCatalogTranslations';
import { useTranslation } from 'react-i18next';

const categoryRules = {
  'pm-scholarship': ['SC'],
};
const schemeTranslationKeys = { 'pm-scholarship': 'pmScholarship', 'ayushman-bharat': 'ayushmanBharat', 'pm-kisan': 'pmKisan', 'pmay-housing': 'pmayHousing', 'atal-pension-yojana': 'atalPension', 'mudra-loan': 'mudraLoan', 'stand-up-india': 'standUpIndia', mgnrega: 'mgnrega', 'tata-skills': 'tataSkills' };

function Factor({ label, value, status = 'matched', icon: Icon, t }) {
  const isMatched = status === 'matched';
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isMatched ? 'text-success-600' : 'text-warning-600'}`} />
      <div>
        <p className="text-sm font-semibold text-navy-900">{label}</p>
        <p className="mt-1 text-sm text-gray-600">{value}</p>
        <p className={`mt-2 text-xs font-semibold ${isMatched ? 'text-success-700' : 'text-warning-700'}`}>
          {isMatched ? t('eligibility.matched') : t('eligibility.pending')}
        </p>
      </div>
    </div>
  );
}

export function EligibilityPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEligibility() {
      try {
        const [{ user: currentUser }, recommendations] = await Promise.all([
          getMe(),
          getRecommendedSchemes(),
        ]);
        setUser(currentUser);
        setScheme(recommendations.find((item) => (item.schemeId || item._id) === id) || null);
      } catch (error) {
        console.error('Failed to load eligibility details', error);
      } finally {
        setLoading(false);
      }
    }
    loadEligibility();
  }, [id]);

  if (loading) {
    return <DashboardLayout backTo={`/schemes/${id}`}><p className="py-12 text-center text-gray-500">{t('eligibility.loading')}</p></DashboardLayout>;
  }

  if (!scheme) {
    return <DashboardLayout backTo="/schemes"><p className="py-12 text-center text-gray-500">{t('eligibility.unavailable')}</p></DashboardLayout>;
  }

  const allowedCategories = scheme.eligibleCategories || categoryRules[scheme.schemeId];
  const translated = getSchemeTranslation(scheme.schemeId || scheme.id, i18n.language, scheme);
  const category = user?.socialCategory || 'General';
  const categoryMatches = !allowedCategories || allowedCategories.includes(category);
  const annualIncome = user?.annualIncomeINR || user?.income;
  const factors = [
    { label: t('eligibility.location'), value: user?.state ? t('eligibility.locationValue', { state: user.state }) : t('eligibility.locationMissing'), status: user?.state ? 'matched' : 'pending', icon: MapPin },
    { label: t('eligibility.age'), value: user?.age ? t('eligibility.ageValue', { age: user.age }) : t('eligibility.ageMissing'), status: user?.age ? 'matched' : 'pending', icon: User },
    { label: t('eligibility.socialCategory'), value: `${t('eligibility.categoryValue', { category })}${allowedCategories ? ` ${t('eligibility.categoryAccepts', { categories: allowedCategories.join(', ') })}` : ''}`, status: categoryMatches ? 'matched' : 'pending', icon: User },
    { label: t('eligibility.income'), value: annualIncome ? t('eligibility.incomeValue', { income: Number(annualIncome).toLocaleString('en-IN') }) : t('eligibility.incomeMissing'), status: annualIncome ? 'matched' : 'pending', icon: Wallet },
  ];

  return (
    <DashboardLayout backTo={`/schemes/${id}`}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold text-primary-600">{t('eligibility.assessment')}</p>
            <h1 className="mt-1 text-2xl font-bold text-navy-900">{t('eligibility.title')}</h1>
            <p className="mt-2 text-sm text-gray-500">{t('eligibility.subtitle')}</p>
          </div>
          <MatchScore score={scheme.matchScore || 0} size="lg" />
        </div>

        <Card className="border-success-200 bg-success-50/50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success-600" />
            <div>
              <h2 className="font-bold text-navy-900">{translated.name || t(`schemeNames.${schemeTranslationKeys[scheme.schemeId || scheme.id] || scheme.schemeId || scheme.id}`, { defaultValue: getSchemeCatalogText(scheme.name, i18n.language) })}</h2>
              <p className="mt-1 text-sm leading-relaxed text-navy-700">{t('eligibility.profileMatches')}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold text-navy-900">{t('eligibility.profileMatchesTitle')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {factors.map((factor) => <Factor key={factor.label} {...factor} t={t} />)}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
            <div>
              <h2 className="font-bold text-navy-900">{t('eligibility.prepareTitle')}</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{t('eligibility.prepareText', { provider: translated.provider || getSchemeCatalogText(scheme.provider, i18n.language) })}</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to={`/schemes/${id}`} variant="outline" className="flex-1">{t('eligibility.back')}</Button>
          <Button to={`/schemes/${id}`} className="flex-1">{t('eligibility.continue')} <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
