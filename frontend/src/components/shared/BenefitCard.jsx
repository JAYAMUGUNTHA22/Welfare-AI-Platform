import { useState } from 'react';
import { CalendarDays, Check, CircleDollarSign, LoaderCircle, Plus, ReceiptText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

export function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

export function BenefitCard({ benefit, onAddPayment, busy = false }) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const payments = Array.isArray(benefit.payments) ? benefit.payments : [];
  const receivedAmount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  async function submitPayment(event) {
    event.preventDefault();
    setError('');
    try {
      await onAddPayment(benefit._id, { amount: Number(amount), receivedAt, reference });
      setAmount('');
      setReference('');
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.message || 'Could not save this payment.');
    }
  }

  return (
    <div className="benefit-rich-card rounded-2xl border border-sky-100 bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-sky-700">{benefit.applicationMethod === 'offline' ? 'Offline scheme' : 'Scheme benefit'}</p>
          <h3 className="mt-1 text-base font-bold text-navy-900">{t(`schemeData.${benefit.schemeName}`, { defaultValue: benefit.schemeName })}</h3>
          <p className="mt-1 text-xs text-gray-500">{benefit.provider}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payments.length ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{payments.length ? 'Payment recorded' : 'Awaiting payment'}</span>
      </div>

      <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/60 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-800">Benefit described by the scheme</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{benefit.benefitSummary || 'The scheme catalogue does not list a benefit amount.'}</p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700"><CircleDollarSign className="h-5 w-5" /></span><div><p className="text-xs text-slate-500">Amount you recorded as received</p><p className="mt-0.5 text-xl font-extrabold text-slate-900">{formatCurrency(receivedAmount)}</p></div></div>
        <Button size="sm" onClick={() => setShowForm((current) => !current)}><Plus className="h-4 w-4" /> Add payment</Button>
      </div>

      {showForm && (
        <form onSubmit={submitPayment} className="mt-4 space-y-3 rounded-xl border border-slate-200 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Amount received (₹)<input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" /></label>
            <label className="text-xs font-semibold text-slate-600">Date received<input required type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" /></label>
          </div>
          <label className="block text-xs font-semibold text-slate-600">Reference (optional)<input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" placeholder="Transaction or acknowledgement number" /></label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Save payment</>}</Button></div>
        </form>
      )}

      {payments.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><ReceiptText className="h-4 w-4" /> Payment history</p>
          <div className="space-y-2">
            {payments.slice().sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)).map((payment) => (
              <div key={payment._id || `${payment.receivedAt}-${payment.amount}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-slate-600"><CalendarDays className="h-4 w-4 text-slate-400" />{new Date(payment.receivedAt).toLocaleDateString('en-IN')}</span>
                <span className="font-bold text-emerald-700">{formatCurrency(Number(payment.amount || 0))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-slate-500">Payment amounts are self-reported. WelfareAI cannot verify government disbursements.</p>
    </div>
  );
}
