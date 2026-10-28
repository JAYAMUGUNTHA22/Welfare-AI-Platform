import { useCallback, useEffect, useState } from 'react';
import { Banknote, FileText, Wallet } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BenefitCard } from '@/components/shared/BenefitCard';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { Card } from '@/components/ui/Card';
import { getMyApplicationsApi } from '@/services/api';
import { getListedBenefitAmounts } from '@/utils/benefitAmounts';
import { useTranslation } from 'react-i18next';

export function BenefitsPage() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await getMyApplicationsApi();
      setApplications((data.applications || []).filter((application) => application.status === 'submitted'));
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load your benefits.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('applications-updated', handleUpdate);
    return () => window.removeEventListener('applications-updated', handleUpdate);
  }, [refresh]);

  const benefitDetailsCount = applications.filter((application) => application.benefitSummary?.trim()).length;
  const listedAmounts = [...new Set(applications.flatMap((application) => getListedBenefitAmounts(application.benefitSummary)))];
  const featuredAmount = listedAmounts.length === 1 ? listedAmounts[0] : listedAmounts.length > 1 ? t('benefitsPage.amountCount', { count: listedAmounts.length }) : t('benefitsPage.notListed');

  return (
    <DashboardLayout title={t('benefitsPage.title')} subtitle={t('benefitsPage.subtitle')}>
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard label={t('benefitsPage.appliedSchemes')} value={applications.length} icon={Wallet} color="primary" />
        <DashboardCard label={t('benefitsPage.detailsAvailable')} value={benefitDetailsCount} icon={FileText} color="accent" />
        <DashboardCard label={listedAmounts.length === 1 ? t('benefitsPage.amountListed') : t('benefitsPage.amountsListed')} value={featuredAmount} icon={Banknote} color="success" />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 text-sm leading-relaxed text-sky-950">
        <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
        <p>{t('benefitsPage.intro')}</p>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800">{t('benefitsPage.sectionTitle')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('benefitsPage.sectionSubtitle')}</p>
        </div>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <Card className="p-8 text-center text-slate-500"><Banknote className="mx-auto mb-2 h-6 w-6" />{t('benefitsPage.loading')}</Card>
        ) : applications.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {applications.map((application) => (
              <BenefitCard key={application._id} benefit={application} />
            ))}
          </div>
        ) : (
          <div className="benefits-empty-state rounded-2xl border p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Wallet className="h-7 w-7" /></div>
            <h3 className="mt-4 text-base font-bold text-slate-800">{t('benefitsPage.noApplicationsTitle')}</h3>
            <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">{t('benefitsPage.noApplicationsBody')}</p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
