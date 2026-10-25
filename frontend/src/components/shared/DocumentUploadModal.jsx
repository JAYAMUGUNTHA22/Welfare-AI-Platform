import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FileText, Upload, AlertTriangle, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORY_KEYS = [
  { key: 'identity',  labelKey: 'identity' },
  { key: 'income',    labelKey: 'income' },
  { key: 'education', labelKey: 'education' },
  { key: 'residence', labelKey: 'residence' },
  { key: 'category',  labelKey: 'casteCategory' },
  { key: 'other',     labelKey: 'other' },
];

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function DocumentUploadModal({ open, onClose, onSave, existingDocument }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [name,         setName]         = useState('');
  const [category,     setCategory]     = useState('identity');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver,   setIsDragOver]   = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [isUploading,  setIsUploading]  = useState(false);
  const [progress,     setProgress]     = useState(0);

  useEffect(() => {
    if (open) {
      if (existingDocument) {
        setName(existingDocument.name || '');
        setCategory(existingDocument.category || 'identity');
      } else {
        setName('');
        setCategory('identity');
      }
      setSelectedFile(null);
      setErrorMsg('');
      setIsUploading(false);
      setProgress(0);
    }
  }, [open, existingDocument]);

  const validateFile = (file) => {
    if (!file) return false;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const allowedExts  = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      setErrorMsg(t('invalidFileType', { defaultValue: 'Invalid file format. Only PDF, JPG, and PNG files are allowed.' }));
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(t('fileTooLarge', { defaultValue: 'File size exceeds 10MB limit.' }));
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const autoFillName = (file) => {
    if (!name && !existingDocument) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setName(baseName.replace(/[-_]/g, ' '));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) { setSelectedFile(file); autoFillName(file); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) { setSelectedFile(file); autoFillName(file); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(t('documentNameRequired', { defaultValue: 'Document name is required.' }));
      return;
    }
    if (!existingDocument && !selectedFile) {
      setErrorMsg(t('fileRequired', { defaultValue: 'Please select a file to upload.' }));
      return;
    }

    setIsUploading(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress(prev => { if (prev >= 90) { clearInterval(interval); return 90; } return prev + 22; });
    }, 160);

    try {
      await onSave({
        name,
        category,
        file: selectedFile,
        isReplace: !!existingDocument,
        existingId: existingDocument?._id || existingDocument?.id,
      });
      setProgress(100);
      clearInterval(interval);
      setTimeout(() => { setIsUploading(false); onClose(); }, 350);
    } catch (err) {
      clearInterval(interval);
      setIsUploading(false);
      setProgress(0);
      setErrorMsg(err.message || t('uploadFailed', { defaultValue: 'Upload failed. Please try again.' }));
    }
  };

  const isEditing = !!existingDocument;

  return (
    <Modal
      open={open}
      onClose={() => !isUploading && onClose()}
      title={isEditing ? (selectedFile ? t('replaceDocument') : t('updateDocument')) : t('uploadDocument')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Document Name */}
        <div>
          <label className="label-base">{t('documentName')}</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('documentPlaceholder', { defaultValue: 'e.g. Aadhaar Card' })}
            className="input-base"
            disabled={isUploading}
          />
        </div>

        {/* Document Category */}
        <div>
          <label className="label-base">{t('documentCategory')}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-base"
            disabled={isUploading}
          >
            {CATEGORY_KEYS.map(cat => (
              <option key={cat.key} value={cat.key}>
                {t(cat.labelKey, { defaultValue: cat.key })}
              </option>
            ))}
          </select>
        </div>

        {/* File drop zone */}
        <div>
          <label className="label-base">
            {t('documentFile', { defaultValue: 'Document File' })}
            {isEditing && (
              <span className="ml-1 text-gray-400 font-normal text-xs">
                ({t('optionalIfUnchanged', { defaultValue: 'optional if unchanged' })})
              </span>
            )}
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragOver
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 bg-gray-50/50 hover:border-primary-400 hover:bg-sky-50/40'
            }`}
          >
            {selectedFile ? (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-primary-200 shadow-sm w-full max-w-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-navy-900 truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-gray-500">{formatBytes(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-navy-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-2">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-navy-900">{t('dragDrop')}</p>
                <p className="mt-1 text-xs text-gray-400">{t('fileLimitNote')}</p>
              </>
            )}
          </div>
        </div>

        {/* AI extraction notice */}
        <div className="flex items-center gap-2 rounded-xl bg-sky-50 border border-sky-100 px-3 py-2">
          <Sparkles className="h-4 w-4 text-primary-600 shrink-0" />
          <p className="text-[11px] text-primary-700 font-medium">
            {t('aiExtractionNote', { defaultValue: 'AI will automatically extract details like age, income, and category from your document.' })}
          </p>
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium text-navy-700">
              <span>{t('uploading')}</span>
              <span>{progress}%</span>
            </div>
            <ProgressBar progress={progress} />
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isUploading}>
            {t('cancel')}
          </Button>
          <Button type="submit" className="flex-1" disabled={isUploading}>
            {isUploading ? t('uploading') : (isEditing ? t('save') : t('upload'))}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
