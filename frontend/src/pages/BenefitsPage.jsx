import { useCallback, useEffect, useState } from 'react';
import { Banknote, Clock3, Wallet, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BenefitCard } from '@/components/shared/BenefitCard';
import { DashboardCard } from '@/components/shared/DashboardCard';
import { Card } from '@/components/ui/Card';
import { addBenefitPaymentApi, getMyApplicationsApi } from '@/services/api';

export function BenefitsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
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

  const totalReceived = applications.reduce((sum, application) => sum + (application.payments || []).reduce((total, payment) => total + Number(payment.amount || 0), 0), 0);
  const schemesWithPayments = applications.filter((application) => application.payments?.length).length;
  const awaitingPayment = applications.length - schemesWithPayments;

  async function addPayment(applicationId, payment) {
    setBusyId(applicationId);
    try {
      await addBenefitPaymentApi(applicationId, payment);
      await refresh();
      window.dispatchEvent(new Event('applications-updated'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout title="My Benefits" subtitle="Record benefit payments you have received from tracked schemes.">
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard label="Schemes tracked" value={applications.length} icon={Wallet} color="primary" />
        <DashboardCard label="Amount recorded as received" value={`₹${totalReceived.toLocaleString('en-IN')}`} icon={TrendingUp} color="success" />
        <DashboardCard label="Awaiting payment record" value={awaitingPayment} icon={Clock3} color="warning" />
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800">Benefit details</h2>
          <p className="mt-1 text-sm text-slate-500">Benefit amounts are added when you record a payment. WelfareAI does not receive payment updates from government departments.</p>
        </div>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <Card className="p-8 text-center text-slate-500"><Banknote className="mx-auto mb-2 h-6 w-6" />Loading your benefits…</Card>
        ) : applications.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {applications.map((application) => (
              <BenefitCard key={application._id} benefit={application} busy={busyId === application._id} onAddPayment={addPayment} />
            ))}
          </div>
        ) : (
          <div className="benefits-empty-state rounded-2xl border p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><Wallet className="h-7 w-7" /></div>
            <h3 className="mt-4 text-base font-bold text-slate-800">No confirmed applications to show yet</h3>
            <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">After you confirm an application in My Applications, its benefit details will appear here. Record each payment when you receive it.</p>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
