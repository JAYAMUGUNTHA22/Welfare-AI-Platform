import { Wallet, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BenefitCard } from '@/components/shared/BenefitCard';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { benefits } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

export function BenefitsPage() {
  const { t } = useTranslation();
  const totalExpected = benefits.reduce((s, b) => s + b.expectedAmount, 0);
  const totalReceived = benefits.reduce((s, b) => s + b.receivedAmount, 0);
  const totalRemaining = totalExpected - totalReceived;

  return (
    <DashboardLayout title={t('myBenefitsTitle')} subtitle={t('myBenefitsSubtitle')}>
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard label={t('totalExpected')} value={`₹${totalExpected.toLocaleString('en-IN')}`} icon={Wallet} color="primary" />
        <DashboardCard label={t('totalReceived')} value={`₹${totalReceived.toLocaleString('en-IN')}`} icon={TrendingUp} color="success" />
        <DashboardCard label={t('remaining')} value={`₹${totalRemaining.toLocaleString('en-IN')}`} icon={Wallet} color="warning" />
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800">Benefit details</h2>
          <p className="mt-1 text-sm text-slate-500">Review amounts received, pending payments, and available installment details.</p>
        </div>
        {benefits.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {benefits.map((benefit) => (
              <BenefitCard key={benefit.id} benefit={benefit} />
            ))}
          </div>
        ) : (
          <div className="benefits-empty-state rounded-2xl border p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Wallet className="h-7 w-7" /></div>
            <h3 className="mt-4 text-base font-bold text-slate-800">No benefit payments to show yet</h3>
            <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">When benefit information is available for your schemes, payment progress and any installment details will appear here.</p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
