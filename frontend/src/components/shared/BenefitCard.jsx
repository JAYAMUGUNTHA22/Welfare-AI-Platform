import { Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTranslation } from 'react-i18next';

export function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

export function BenefitCard({ benefit }) {
  const { t } = useTranslation();
  const remaining = benefit.expectedAmount - benefit.receivedAmount;
  const pct = benefit.expectedAmount > 0 ? (benefit.receivedAmount / benefit.expectedAmount) * 100 : 0;
  const installments = Array.isArray(benefit.installments) ? benefit.installments : [];

  return (
    <div className="benefit-rich-card rounded-2xl border border-sky-100 bg-white p-5 shadow-card transition-all hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-navy-900">{t(`schemeData.${benefit.schemeName}`, { defaultValue: benefit.schemeName })}</h3>
          <p className="mt-1 text-xs text-gray-500">{t('expected')} {t('by_prefix')} {t(benefit.expectedDate.toLowerCase().replace(/\s+/g, ''), { defaultValue: benefit.expectedDate })}</p>
        </div>
        <StatusBadge status={benefit.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">{t('expected')}</p>
          <p className="mt-1 text-sm font-bold text-navy-800">{formatCurrency(benefit.expectedAmount)}</p>
        </div>
        <div className="rounded-xl bg-success-50 p-3">
          <p className="text-xs text-success-600">{t('received')}</p>
          <p className="mt-1 text-sm font-bold text-success-700">{formatCurrency(benefit.receivedAmount)}</p>
        </div>
        <div className="rounded-xl bg-warning-50 p-3">
          <p className="text-xs text-warning-600">{t('remaining')}</p>
          <p className="mt-1 text-sm font-bold text-warning-700">{formatCurrency(remaining)}</p>
        </div>
      </div>

      <div className="mt-4"><ProgressBar value={pct} size="sm" barClassName="bg-success-500" /></div>

      {installments.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('installments')}</p>
          <div className="space-y-2">
            {installments.map((inst, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-navy-600"><Clock className="h-3.5 w-3.5 text-gray-400" />{inst.date}</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-navy-800">{formatCurrency(inst.amount)}</span>
                  <StatusBadge status={inst.status === 'received' ? 'received' : 'pending'} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
