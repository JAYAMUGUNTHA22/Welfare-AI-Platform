import { useCallback, useEffect, useState } from 'react';
import { Banknote, FileText, Wallet } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BenefitCard } from '@/components/shared/BenefitCard';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { Card } from '@/components/ui/Card';
import { getMyApplicationsApi } from '@/services/api';
import { getListedBenefitAmounts } from '@/utils/benefitAmounts';

export function BenefitsPage() {
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
  const cashBenefitCount = applications.filter((application) => /₹|\bINR\b|\bRs\.?\s*\d/i.test(application.benefitSummary || '')).length;
  const listedAmounts = [...new Set(applications.flatMap((application) => getListedBenefitAmounts(application.benefitSummary)))];
  const featuredAmount = listedAmounts.length === 1 ? listedAmounts[0] : listedAmounts.length > 1 ? `${listedAmounts.length} amounts` : 'Not listed';

  return (
    <DashboardLayout title="My Benefits" subtitle="See the benefit amounts and support described in your applied schemes.">
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard label="Applied schemes" value={applications.length} icon={Wallet} color="primary" />
        <DashboardCard label="Benefit details available" value={benefitDetailsCount} icon={FileText} color="accent" />
        <DashboardCard label={cashBenefitCount === 1 ? 'Benefited amount listed' : 'Amounts listed in schemes'} value={featuredAmount} icon={Banknote} color="success" />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 text-sm leading-relaxed text-sky-950">
        <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
        <p>Benefit information below comes directly from each scheme’s details. You don’t need to enter an amount. The department decides the final approved benefit and payment.</p>
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800">Benefit details</h2>
          <p className="mt-1 text-sm text-slate-500">Scheme-listed financial and non-financial benefits for your confirmed applications.</p>
        </div>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <Card className="p-8 text-center text-slate-500"><Banknote className="mx-auto mb-2 h-6 w-6" />Loading your benefits…</Card>
        ) : applications.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {applications.map((application) => (
              <BenefitCard key={application._id} benefit={application} />
            ))}
          </div>
        ) : (
          <div className="benefits-empty-state rounded-2xl border p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Wallet className="h-7 w-7" /></div>
            <h3 className="mt-4 text-base font-bold text-slate-800">No confirmed applications to show yet</h3>
            <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">Once you confirm applying for a scheme, its listed benefit details will appear here automatically.</p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
