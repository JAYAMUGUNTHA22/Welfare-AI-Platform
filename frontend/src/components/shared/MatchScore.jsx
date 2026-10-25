import { useTranslation } from 'react-i18next';

const sizeConfig = {
  sm: { ring: 'h-12 w-12', text: 'text-sm', label: 'text-[10px]' },
  md: { ring: 'h-16 w-16', text: 'text-lg', label: 'text-xs' },
  lg: { ring: 'h-24 w-24', text: 'text-2xl', label: 'text-sm' },
};

export function MatchScore({ score, size = 'md', showLabel = true, scoreLabel }) {
  const { t } = useTranslation();
  const { ring, text, label } = sizeConfig[size];
  const color = score > 50 ? 'text-emerald-700' : 'text-red-700';
  const stroke = score > 50 ? '#059669' : '#dc2626';
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${ring} flex items-center justify-center`}>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="20" cy="20" r="18" fill="none" stroke={stroke} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <span className={`relative font-bold ${color} ${text}`}>{score}%</span>
      </div>
      {showLabel && <span className={`font-semibold text-gray-500 ${label}`}>{scoreLabel || t('scheme.match')}</span>}
    </div>
  );
}
