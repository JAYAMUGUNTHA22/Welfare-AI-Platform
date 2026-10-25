import { useState } from 'react';
import { FileText, Upload, Eye, Download, Trash2, RefreshCw, MoreVertical, Sparkles } from 'lucide-react';
import { DocumentInfoPanel } from './DocumentInfoPanel';
import { useTranslation } from 'react-i18next';

const mapDocKey = (name) => {
  const map = {
    'Aadhaar Card':        'aadhaarCard',
    'PAN Card':            'panCard',
    'Income Certificate':  'incomeCertificate',
    '10th Mark Sheet':     'tenthMarkSheet',
    '12th Mark Sheet':     'twelfthMarkSheet',
    'Voter ID':            'voterId',
    'Caste Certificate':   'casteCertificate',
    'Bank Passbook Copy':  'bankPassbook',
    'Land Records (7/12)': 'landRecords',
  };
  return map[name] || name;
};

export function DocumentCard({ document, onView, onDownload, onReplace, onDelete, onExtracted }) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const translatedName     = t(mapDocKey(document.name), { defaultValue: document.name });
  const categoryKey        = document.category === 'category' ? 'casteCategory' : document.category;
  const translatedCategory = t(categoryKey, { defaultValue: document.category });

  const hasExtracted = document.extractedData && (
    document.extractedData.age ||
    document.extractedData.aadhaarNumber ||
    document.extractedData.annualIncome ||
    document.extractedData.socialCategory
  );

  // Always derive upload date from createdAt (correct server timestamp)
  const uploadDate = document.createdAt
    ? new Date(document.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : (document.uploadDate || new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }));

  return (
    <div className="group rounded-xl border border-gray-200 bg-white transition-all hover:shadow-card-hover hover:border-primary-200">
      {/* Main row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        {/* Left — icon + text */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100/70 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white shadow-xs">
            <FileText className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-navy-900 truncate">{translatedName}</h3>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 border border-sky-100 capitalize">
                {translatedCategory}
              </span>
              {document.version > 1 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-600">
                  v{document.version}
                </span>
              )}
              {hasExtracted && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-sky-100 to-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                  <Sparkles className="h-2.5 w-2.5" />
                  {t('dataExtracted', { defaultValue: 'Info Extracted' })}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1 font-medium text-gray-600">
                <Upload className="h-3 w-3 text-primary-500" />
                {t('uploadDate')}: {uploadDate}
              </span>
              {(document.fileSizeFormatted || document.fileSize) && (
                <span className="text-gray-400">
                  • {document.fileSizeFormatted || `${(document.fileSize / 1024).toFixed(0)} KB`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right — actions only (no status badge) */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-lg border border-gray-100">
            {/* View */}
            <button
              onClick={() => onView && onView(document)}
              title={t('view')}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-navy-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-primary-600" />
              <span className="hidden md:inline">{t('view')}</span>
            </button>

            {/* Download */}
            <button
              onClick={() => onDownload && onDownload(document)}
              title={t('download')}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-navy-700 hover:bg-sky-50 hover:text-primary-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-navy-600" />
              <span className="hidden md:inline">{t('download')}</span>
            </button>

            {/* AI Extract toggle */}
            <button
              onClick={() => setShowInfo(v => !v)}
              title={t('extractData', { defaultValue: 'Extract Data' })}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                showInfo ? 'bg-primary-600 text-white' : 'text-primary-700 hover:bg-primary-50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{t('aiData', { defaultValue: 'AI Info' })}</span>
            </button>

            {/* More options */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                title={t('moreOptions')}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-200 hover:text-navy-900 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-gray-200 bg-white py-1 shadow-lg animate-slide-down">
                    <button
                      onClick={() => { setShowMenu(false); onReplace && onReplace(document); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-navy-700 hover:bg-sky-50 hover:text-primary-700"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-primary-600" />
                      {t('replace')}
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); onDelete && onDelete(document); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-error-600 hover:bg-error-50 hover:text-error-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('delete')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Info panel (expanded / collapsed) */}
      {showInfo && (
        <div className="border-t border-sky-100 px-4 pb-4 pt-2">
          <DocumentInfoPanel
            document={document}
            onExtracted={(result) => onExtracted && onExtracted(document, result)}
          />
        </div>
      )}
    </div>
  );
}
