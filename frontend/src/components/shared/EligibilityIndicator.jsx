import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTranslation } from 'react-i18next';
import { translateEligibilityReason } from '@/utils/eligibilityReasonTranslations';

const statusConfig = {
  match: { icon: CheckCircle2, color: 'text-success-500', barColor: 'bg-success-500', label: 'Matched' },
  partial: { icon: AlertTriangle, color: 'text-warning-500', barColor: 'bg-warning-500', label: 'Partial' },
  missing: { icon: AlertCircle, color: 'text-error-400', barColor: 'bg-error-400', label: 'Missing' },
};

export function EligibilityIndicator({ factors }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {factors.map((factor) => {
        const cfg = statusConfig[factor.status];
        const Icon = cfg.icon;
        return (
          <div key={factor.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-navy-700">
                <Icon className={`h-4 w-4 ${cfg.color}`} />{translateEligibilityReason(factor.label, t)}
              </span>
              <span className="text-xs font-semibold text-gray-500">{factor.score}% · {t(`ui.status.${factor.status === 'match' ? 'matched' : factor.status}`)}</span>
            </div>
            <ProgressBar value={factor.score} barClassName={cfg.barColor} size="sm" />
          </div>
        );
      })}
    </div>
  );
}
