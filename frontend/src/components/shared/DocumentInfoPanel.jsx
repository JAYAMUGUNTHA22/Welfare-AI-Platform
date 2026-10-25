import { useState } from 'react';
import { Sparkles, User, Calendar, CreditCard, Banknote, Tag, MapPin, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { extractDocumentDataApi } from '@/services/api';

const FIELD_ICONS = {
  age:             <Calendar className="h-3.5 w-3.5" />,
  aadhaarNumber:   <CreditCard className="h-3.5 w-3.5" />,
  panNumber:       <CreditCard className="h-3.5 w-3.5" />,
  annualIncome:    <Banknote className="h-3.5 w-3.5" />,
  socialCategory:  <Tag className="h-3.5 w-3.5" />,
  address:         <MapPin className="h-3.5 w-3.5" />,
  dateOfBirth:     <Calendar className="h-3.5 w-3.5" />,
  state:           <MapPin className="h-3.5 w-3.5" />,
  fullName:        <User className="h-3.5 w-3.5" />,
};

/** Mask Aadhaar to show only last 4 digits */
function maskAadhaar(num) {
  if (!num) return '';
  return 'XXXX XXXX ' + String(num).slice(-4);
}

/** Mask PAN to show only first 3 and last 2 chars */
function maskPAN(pan) {
  if (!pan) return '';
  return pan.slice(0, 3) + '*****' + pan.slice(-2);
}

function hasAnyData(ed) {
  if (!ed) return false;
  return !!(
    ed.age || ed.aadhaarNumber || ed.panNumber || ed.annualIncome ||
    ed.socialCategory || ed.dateOfBirth || ed.address || ed.state || ed.fullName
  );
}

export function DocumentInfoPanel({ document, onExtracted }) {
  const { t } = useTranslation();
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [localExtracted, setLocalExtracted] = useState(null);

  const ed = localExtracted || document?.extractedData;
  const hasData = hasAnyData(ed);

  // Auto-expand immediately if the document already has extracted data
  const [expanded, setExpanded] = useState(() => hasAnyData(document?.extractedData));

  const handleExtract = async (e) => {
    e.stopPropagation();
    setExtracting(true);
    setError(null);
    try {
      const docId = document._id || document.id;
      const res = await extractDocumentDataApi(docId);
      setLocalExtracted(res.extractedData);
      setExpanded(true);
      if (onExtracted) onExtracted(res);
    } catch (err) {
      setError(err.message || t('extractionFailed', { defaultValue: 'Extraction failed' }));
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="mt-2 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/60 to-white overflow-hidden">
      {/* Header trigger row */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer select-none"
        onClick={() => hasData && setExpanded(v => !v)}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary-600" />
          <span className="text-[11px] font-bold text-primary-700 uppercase tracking-wide">
            {t('aiExtracted', { defaultValue: 'AI-Extracted Info' })}
          </span>
          {hasData && (
            <span className="rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold text-primary-700">
              {Math.round(ed.confidence || 55)}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {!hasData ? (
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting}
              className="flex items-center gap-1 rounded-lg bg-primary-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              {extracting ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> {t('extracting', { defaultValue: 'Extracting…' })}</>
              ) : (
                <><Sparkles className="h-3 w-3" /> {t('extractData', { defaultValue: 'Extract Data' })}</>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5 text-[10px] text-success-600 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> {t('extracted', { defaultValue: 'Extracted' })}
              </span>
              {expanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-3 mb-2 flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-[11px] text-red-700 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Expanded extracted fields */}
      {hasData && expanded && (
        <div className="grid grid-cols-2 gap-1.5 px-3 pb-3 pt-0.5">
          {ed.fullName && (
            <ExtractedField icon={FIELD_ICONS.fullName} label={t('fullName', { defaultValue: 'Name' })} value={ed.fullName} fullWidth />
          )}
          {ed.age && (
            <ExtractedField icon={FIELD_ICONS.age} label={t('age', { defaultValue: 'Age' })} value={`${ed.age} ${t('years', { defaultValue: 'yrs' })}`} />
          )}
          {ed.dateOfBirth && (
            <ExtractedField icon={FIELD_ICONS.dateOfBirth} label={t('dateOfBirth', { defaultValue: 'Date of Birth' })} value={ed.dateOfBirth} />
          )}
          {ed.aadhaarNumber && (
            <ExtractedField icon={FIELD_ICONS.aadhaarNumber} label={t('aadhaarNumber', { defaultValue: 'Aadhaar' })} value={maskAadhaar(ed.aadhaarNumber)} />
          )}
          {ed.panNumber && (
            <ExtractedField icon={FIELD_ICONS.panNumber} label={t('panNumber', { defaultValue: 'PAN' })} value={maskPAN(ed.panNumber)} />
          )}
          {ed.annualIncome && (
            <ExtractedField icon={FIELD_ICONS.annualIncome} label={t('annualIncome', { defaultValue: 'Annual Income' })} value={ed.incomeText || `₹${ed.annualIncome.toLocaleString('en-IN')}`} />
          )}
          {ed.socialCategory && (
            <ExtractedField icon={FIELD_ICONS.socialCategory} label={t('socialCategory', { defaultValue: 'Category' })} value={ed.socialCategory} />
          )}
          {ed.state && (
            <ExtractedField icon={FIELD_ICONS.state} label={t('state', { defaultValue: 'State' })} value={ed.state} />
          )}
          {ed.address && (
            <ExtractedField icon={FIELD_ICONS.address} label={t('address', { defaultValue: 'Address' })} value={ed.address} fullWidth />
          )}

          <div className="col-span-2 mt-1 flex items-center gap-1 text-[10px] text-gray-400 italic">
            <Sparkles className="h-3 w-3 text-sky-400" />
            {t('extractedNote', { defaultValue: 'Auto-extracted. Verify before use.' })}
          </div>
        </div>
      )}
    </div>
  );
}

function ExtractedField({ icon, label, value, fullWidth }) {
  return (
    <div className={`rounded-lg bg-white border border-sky-100 px-2.5 py-2 ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
        <span className="text-primary-500">{icon}</span>
        {label}
      </div>
      <p className="text-[12px] font-bold text-navy-800 truncate">{value}</p>
    </div>
  );
}
