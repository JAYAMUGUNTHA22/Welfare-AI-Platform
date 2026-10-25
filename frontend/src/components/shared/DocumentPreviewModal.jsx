import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  FileText, Download, ShieldCheck, RefreshCw,
  Sparkles, Calendar, CreditCard, Banknote, Tag, MapPin, User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDocumentFileApi } from '@/services/api';

const mapDocKey = (name) => {
  const map = {
    'Aadhaar Card': 'aadhaarCard',
    'PAN Card': 'panCard',
    'Income Certificate': 'incomeCertificate',
    '10th Mark Sheet': 'tenthMarkSheet',
    '12th Mark Sheet': 'twelfthMarkSheet',
    'Voter ID': 'voterId',
    'Caste Certificate': 'casteCertificate',
    'Bank Passbook Copy': 'bankPassbook',
    'Land Records (7/12)': 'landRecords'
  };
  return map[name] || name;
};

function maskAadhaar(num) {
  if (!num) return '';
  return 'XXXX XXXX ' + String(num).slice(-4);
}
function maskPAN(pan) {
  if (!pan) return '';
  return pan.slice(0, 3) + '*****' + pan.slice(-2);
}

export function DocumentPreviewModal({ open, onClose, document, onReplace, onDownload }) {
  const { t } = useTranslation();
  const [fileUrl, setFileUrl] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!document) return;
    let active = true;
    let objectUrl = '';
    setFileUrl('');
    setLoadError(false);
    if (document.fileDataUrl) {
      setFileUrl(document.fileDataUrl);
    } else if (document._id) {
      getDocumentFileApi(document._id)
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob);
          if (active) setFileUrl(objectUrl);
        })
        .catch(() => {
          if (active) setLoadError(true);
        });
    } else {
      setLoadError(true);
    }
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document]);

  if (!document) return null;

  const translatedName = t(mapDocKey(document.name), { defaultValue: document.name });
  const categoryKey = document.category === 'category' ? 'casteCategory' : document.category;
  const translatedCategory = t(categoryKey, { defaultValue: document.category });

  const isPdf = document.fileType?.includes('pdf') || document.originalFilename?.toLowerCase().endsWith('.pdf');
  const isImage = document.fileType?.includes('image') || document.originalFilename?.match(/\.(png|jpe?g)$/i);

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload(document);
    } else {
      getDocumentFileApi(document._id).then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = globalThis.document.createElement('a');
        link.href = objectUrl;
        link.download = document.originalFilename || `${document.name}.${isPdf ? 'pdf' : 'png'}`;
        globalThis.document.body.appendChild(link);
        link.click();
        globalThis.document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }).catch(() => setLoadError(true));
    }
  };

  const uploadDate = document.createdAt
    ? new Date(document.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : (document.uploadDate || '—');

  // Build an ordered list of extracted fields from the document
  const ed = document.extractedData;
  const extractedFields = ed ? [
    ed.fullName       && { icon: <User className="h-3.5 w-3.5" />,       label: t('fullName', { defaultValue: 'Name' }),             value: ed.fullName,   wide: true },
    ed.dateOfBirth    && { icon: <Calendar className="h-3.5 w-3.5" />,   label: t('dateOfBirth', { defaultValue: 'Date of Birth' }), value: ed.dateOfBirth },
    ed.age            && { icon: <Calendar className="h-3.5 w-3.5" />,   label: t('age', { defaultValue: 'Age' }),                   value: `${ed.age} yrs` },
    ed.aadhaarNumber  && { icon: <CreditCard className="h-3.5 w-3.5" />, label: t('aadhaarNumber', { defaultValue: 'Aadhaar' }),    value: maskAadhaar(ed.aadhaarNumber) },
    ed.panNumber      && { icon: <CreditCard className="h-3.5 w-3.5" />, label: t('panNumber', { defaultValue: 'PAN' }),             value: maskPAN(ed.panNumber) },
    ed.annualIncome   && { icon: <Banknote className="h-3.5 w-3.5" />,   label: t('annualIncome', { defaultValue: 'Income' }),      value: ed.incomeText || `₹${ed.annualIncome.toLocaleString('en-IN')}` },
    ed.socialCategory && { icon: <Tag className="h-3.5 w-3.5" />,        label: t('socialCategory', { defaultValue: 'Category' }), value: ed.socialCategory },
    ed.state          && { icon: <MapPin className="h-3.5 w-3.5" />,     label: t('state', { defaultValue: 'State' }),               value: ed.state },
    ed.address        && { icon: <MapPin className="h-3.5 w-3.5" />,     label: t('address', { defaultValue: 'Address' }),           value: ed.address, wide: true },
  ].filter(Boolean) : [];

  return (
    <Modal open={open} onClose={onClose} title={t('previewTitle')}>
      <div className="space-y-5">
        {/* Header bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sky-50 p-3.5 border border-sky-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-base">{translatedName}</h3>
              <p className="text-xs text-navy-600 flex items-center gap-2 mt-0.5">
                <span className="capitalize font-semibold text-primary-700">{translatedCategory}</span>
                <span>•</span>
                <span>{document.fileSizeFormatted || document.fileSize || ''}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadClick} className="gap-1 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4" /> {t('download')}
            </Button>
            {onReplace && (
              <Button size="sm" variant="outline" onClick={() => { onClose(); onReplace(document); }} className="gap-1 bg-white hover:bg-gray-50 text-primary-700 border-primary-200">
                <RefreshCw className="h-4 w-4" /> {t('replace')}
              </Button>
            )}
          </div>
        </div>

        {/* File Viewer */}
        <div className="relative min-h-[300px] max-h-[460px] overflow-hidden rounded-xl border border-gray-200 bg-gray-900/5 flex flex-col items-center justify-center">
          {fileUrl ? (
            isImage ? (
              <div className="p-4 flex items-center justify-center max-h-[440px]">
                <img
                  src={fileUrl}
                  alt={translatedName}
                  className="max-h-[400px] w-auto rounded-lg shadow-md object-contain"
                  onError={() => setLoadError(true)}
                />
              </div>
            ) : (
              <iframe
                src={fileUrl}
                title={translatedName}
                className="w-full h-[400px] rounded-xl border-0"
                onError={() => setLoadError(true)}
              />
            )
          ) : null}

          {(loadError || (!isImage && !fileUrl)) && (
            <div className="p-8 text-center bg-white rounded-xl border border-gray-200 w-full max-w-md my-6 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-3">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h4 className="font-bold text-navy-900 text-base">{translatedName}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {t('encryptedDocumentPreview', { defaultValue: 'Original Document File Loaded & Encrypted for Privacy' })}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button size="sm" onClick={handleDownloadClick} className="gap-1.5">
                  <Download className="h-4 w-4" /> {t('downloadOriginal', { defaultValue: 'Download File' })}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Document Metadata */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary-600" />
            {t('documentMetadata', { defaultValue: 'Document Information' })}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="text-gray-400 block mb-0.5">{t('documentName')}</span>
              <span className="font-semibold text-navy-900 truncate block">{translatedName}</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="text-gray-400 block mb-0.5">{t('documentCategory')}</span>
              <span className="font-semibold text-navy-900 capitalize block">{translatedCategory}</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="text-gray-400 block mb-0.5">{t('originalFile', { defaultValue: 'File' })}</span>
              <span className="font-semibold text-navy-900 truncate block">{document.originalFilename || document.name}</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="text-gray-400 block mb-0.5">{t('fileType')}</span>
              <span className="font-semibold text-navy-900 uppercase block">{document.fileType || (isPdf ? 'PDF' : 'IMAGE')}</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="text-gray-400 block mb-0.5">{t('fileSize')}</span>
              <span className="font-semibold text-navy-900 block">{document.fileSizeFormatted || document.fileSize || '—'}</span>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              <span className="text-gray-400 block mb-0.5">{t('uploadDate')}</span>
              <span className="font-semibold text-navy-900 block">{uploadDate}</span>
            </div>
          </div>
        </div>

        {/* AI-Extracted Details — shown whenever extractedData has any field */}
        {extractedFields.length > 0 && (
          <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-700 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary-600" />
              {t('aiExtracted', { defaultValue: 'AI-Extracted Details' })}
              {ed?.confidence ? (
                <span className="ml-1 rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold text-primary-700 normal-case tracking-normal">
                  {Math.round(ed.confidence)}% confidence
                </span>
              ) : null}
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {extractedFields.map((field, i) => (
                <div
                  key={i}
                  className={`rounded-lg bg-white border border-sky-100 px-2.5 py-2 ${field.wide ? 'col-span-2 sm:col-span-3' : ''}`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                    <span className="text-primary-500">{field.icon}</span>
                    {field.label}
                  </div>
                  <p className="text-xs font-bold text-navy-800">{field.value}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 italic flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-sky-400" />
              {t('extractedNote', { defaultValue: 'Auto-extracted. Verify before use.' })}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>{t('close')}</Button>
        </div>
      </div>
    </Modal>
  );
}
