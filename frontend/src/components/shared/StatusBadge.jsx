import { CheckCircle2, AlertCircle, Clock, XCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const labels = {
  submitted: 'Submitted', document_verification: 'Document Verification', eligibility_review: 'Eligibility Review',
  department_review: 'Department Review', approved: 'Approved', rejected: 'Rejected', benefit_disbursed: 'Benefit Disbursed',
  processing: 'Processing', received: 'Received', pending: 'Pending', delayed: 'Delayed',
  verified: 'Verified', expired: 'Expired', expiring: 'Expiring Soon',
  completed: 'Completed', current: 'In Progress',
};

const config = {
  submitted: { icon: Info, color: 'text-navy-700 bg-navy-50 border-navy-200' },
  document_verification: { icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  eligibility_review: { icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  department_review: { icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  approved: { icon: CheckCircle2, color: 'text-success-700 bg-success-50 border-success-200' },
  rejected: { icon: XCircle, color: 'text-error-700 bg-error-50 border-error-200' },
  benefit_disbursed: { icon: CheckCircle2, color: 'text-success-700 bg-success-50 border-success-200' },
  processing: { icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  received: { icon: CheckCircle2, color: 'text-success-700 bg-success-50 border-success-200' },
  pending: { icon: Clock, color: 'text-warning-700 bg-warning-50 border-warning-200' },
  delayed: { icon: AlertCircle, color: 'text-error-700 bg-error-50 border-error-200' },
  verified: { icon: CheckCircle2, color: 'text-success-700 bg-success-50 border-success-200' },
  expired: { icon: XCircle, color: 'text-error-700 bg-error-50 border-error-200' },
  expiring: { icon: AlertCircle, color: 'text-warning-700 bg-warning-50 border-warning-200' },
  completed: { icon: CheckCircle2, color: 'text-success-700 bg-success-50 border-success-200' },
  current: { icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' },
};

export function StatusBadge({ status, label }) {
  const { t } = useTranslation();
  const { icon: Icon, color } = config[status] ?? { icon: Info, color: 'text-navy-700 bg-navy-50 border-navy-200' };
  
  // Try to convert label text to camelCase for translation key (e.g. "Document Verification" -> "documentVerification")
  const defaultText = label ?? labels[status] ?? status;
  const key = defaultText.charAt(0).toLowerCase() + defaultText.slice(1).replace(/\s+(.)/g, (_, c) => c.toUpperCase());
  const text = t(`ui.statusBadge.${status}`, { defaultValue: t(key, { defaultValue: defaultText }) });

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${color}`}>
      <Icon className="h-3.5 w-3.5" />{text}
    </span>
  );
}
