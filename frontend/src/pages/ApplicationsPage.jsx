import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Banknote, Building2, CalendarDays, CheckCircle2, ExternalLink, FileCheck2, FileText, RotateCw, Sparkles } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMyApplicationsApi } from '@/services/api';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const data = await getMyApplicationsApi();
      // This page is an applied-schemes portfolio. Unconfirmed attempts stay
      // out of the list until the citizen confirms submission.
      setApplications((data.applications || []).filter((application) => application.status === 'submitted'));
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Could not load your applications.');
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

  const totalReceived = applications.reduce((total, application) => total + (application.payments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0), 0);
  const paymentCount = applications.reduce((total, application) => total + (application.payments?.length || 0), 0);

  return (
    <DashboardLayout>
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-sky-800 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border-[36px] border-white/5" />
        <div className="pointer-events-none absolute bottom-[-5rem] right-1/4 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"><Sparkles className="h-3.5 w-3.5" /> YOUR SCHEME PORTFOLIO</div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">My Applications</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">A clear record of the government schemes you’ve confirmed applying for.</p>
          </div>
          <div className="flex gap-3">
            <div className="min-w-32 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"><p className="text-3xl font-extrabold">{applications.length}</p><p className="mt-0.5 text-xs text-blue-100">Schemes applied</p></div>
            <div className="min-w-36 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"><p className="text-xl font-extrabold">{formatCurrency(totalReceived)}</p><p className="mt-0.5 text-xs text-blue-100">Benefits recorded</p></div>
          </div>
        </div>
      </section>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <Card className="p-10 text-center text-slate-500"><RotateCw className="mx-auto mb-3 h-6 w-6 animate-spin" />Loading your applications…</Card>
      ) : applications.length === 0 ? (
        <Card className="relative overflow-hidden px-6 py-14 text-center">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 text-sky-700 shadow-inner"><FileText className="h-8 w-8" /></span>
          <h2 className="mt-5 text-xl font-extrabold text-slate-900">Your application story starts here</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-500">Schemes will appear once you confirm that you submitted an application. Only confirmed applications are shown on this page.</p>
          <Button to="/my-schemes" className="mt-6">Explore my schemes <ArrowRight className="h-4 w-4" /></Button>
        </Card>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Your progress</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">Applied schemes <span className="text-slate-400">({applications.length})</span></h2></div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Confirmed by you · {paymentCount} payment{paymentCount === 1 ? '' : 's'} recorded</div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {applications.map((application, index) => {
              const payments = Array.isArray(application.payments) ? application.payments : [];
              const received = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
              return (
                <Card key={application._id} className="group relative flex h-full flex-col overflow-hidden border border-slate-200/80 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
                  <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-700 ring-1 ring-sky-200/70"><FileCheck2 className="h-6 w-6" /></span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> Applied</span>
                    </div>
                    <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700">Application {String(index + 1).padStart(2, '0')}</p>
                    <h3 className="mt-1.5 text-lg font-extrabold leading-snug text-slate-900">{application.schemeName}</h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Building2 className="h-4 w-4 shrink-0 text-slate-400" />{application.provider || 'Government Scheme'}</p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Submitted</p><p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800"><CalendarDays className="h-3.5 w-3.5 text-sky-600" />{formatDate(application.submittedAt)}</p></div>
                      <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Received</p><p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800"><Banknote className="h-3.5 w-3.5 text-emerald-600" />{formatCurrency(received)}</p></div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-3">
                      <div><p className="text-xs font-bold text-slate-800">Benefit payment history</p><p className="mt-0.5 text-xs text-slate-500">{payments.length ? `${payments.length} payment${payments.length === 1 ? '' : 's'} recorded` : 'No payments recorded yet'}</p></div>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm"><Banknote className="h-4 w-4" /></span>
                    </div>

                    {application.benefitSummary && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600">{application.benefitSummary}</p>}

                    <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 mt-5">
                      {application.applicationUrl && <a href={application.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900">Official site <ExternalLink className="h-3.5 w-3.5" /></a>}
                      <Button to="/benefits" variant="outline" size="sm" className="ml-auto">View benefits <ArrowUpRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-900"><span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />Application confirmations and benefit amounts are self-reported. Check with the relevant department for official application status and payment updates.</p>
        </>
      )}
    </DashboardLayout>
  );
}
