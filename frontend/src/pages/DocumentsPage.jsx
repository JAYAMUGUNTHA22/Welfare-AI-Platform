import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FolderOpen, CheckCircle2, AlertCircle, LogIn, Sparkles,
  User, Banknote, CreditCard, Tag, Shield, ShieldCheck, LockKeyhole
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DocumentCard } from '@/components/shared/DocumentCard';
import { DocumentPreviewModal } from '@/components/shared/DocumentPreviewModal';
import { DocumentUploadModal } from '@/components/shared/DocumentUploadModal';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import {
  getDocumentsApi,
  uploadDocumentApi,
  updateDocumentApi,
  deleteDocumentApi,
  getDocumentFileApi,
  getExtractedProfileApi,
  verifyDocumentPassword,
  lockDocumentAccess,
} from '@/services/api';

export function DocumentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [docList,      setDocList]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [notLoggedIn,  setNotLoggedIn]  = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [extractedProfile, setExtractedProfile] = useState(null);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDoc,      setEditingDoc]      = useState(null);
  const [previewDoc,      setPreviewDoc]      = useState(null);
  const [deletingDoc,     setDeletingDoc]     = useState(null);
  const [isDeleting,      setIsDeleting]      = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const categories = [
    { key: 'all',       labelKey: 'allDocuments' },
    { key: 'identity',  labelKey: 'identity' },
    { key: 'income',    labelKey: 'income' },
    { key: 'education', labelKey: 'education' },
    { key: 'residence', labelKey: 'residence' },
    { key: 'category',  labelKey: 'casteCategory' },
    { key: 'other',     labelKey: 'other' },
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token && token !== 'demo-token';
  };

  const loadDocuments = async () => {
    setLoading(true);
    setNotLoggedIn(false);
    if (!isAuthenticated()) {
      setDocList([]);
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }
    try {
      const data = await getDocumentsApi();
      setDocList(data.documents || []);
      // Also fetch extracted profile summary
      try {
        const profileData = await getExtractedProfileApi();
        if (profileData.profile) setExtractedProfile(profileData.profile);
      } catch (_) {}
    } catch (_) {
      setDocList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNotLoggedIn(!isAuthenticated());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isVerified) return undefined;
    const handleExpiredAccess = () => {
      setIsVerified(false);
      setDocList([]);
      setExtractedProfile(null);
      setPreviewDoc(null);
      setShowUploadModal(false);
      setEditingDoc(null);
      setDeletingDoc(null);
      setVerificationError('Your document verification expired. Enter your password again.');
    };
    window.addEventListener('document-access-expired', handleExpiredAccess);
    const expiryTimer = window.setTimeout(handleExpiredAccess, 10 * 60 * 1000);
    return () => {
      window.removeEventListener('document-access-expired', handleExpiredAccess);
      window.clearTimeout(expiryTimer);
      void lockDocumentAccess();
    };
  }, [isVerified]);

  const handleVerifyIdentity = async (event) => {
    event.preventDefault();
    setIsVerifying(true);
    setVerificationError('');
    try {
      await verifyDocumentPassword(verificationPassword);
      setVerificationPassword('');
      setIsVerified(true);
      await loadDocuments();
    } catch (error) {
      setVerificationError(error.message || 'We could not verify your password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Called when a document's extraction is updated
  const handleExtracted = async (doc, result) => {
    // Refresh extracted profile summary
    try {
      const profileData = await getExtractedProfileApi();
      if (profileData.profile) setExtractedProfile(profileData.profile);
    } catch (_) {}
    // Update the doc in state with new extractedData
    setDocList(prev =>
      prev.map(d => (d._id || d.id) === (doc._id || doc.id)
        ? { ...d, extractedData: result.extractedData }
        : d
      )
    );
    showToast(t('dataExtractedSuccess', { defaultValue: 'Profile auto-updated from document!' }));
  };

  const handleSaveDocument = async ({ name, category, file, isReplace, existingId }) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      if (file) formData.append('file', file);

      let savedDoc;
      if (isReplace && existingId) {
        const res = await updateDocumentApi(existingId, formData);
        savedDoc = res.document;
        setDocList(prev => prev.map(d => (d._id || d.id) === existingId ? savedDoc : d));
        showToast(t('updateSuccess', { defaultValue: 'Document updated successfully!' }));
      } else {
        const res = await uploadDocumentApi(formData);
        savedDoc = res.document;
        setDocList(prev => [savedDoc, ...prev]);
        showToast(t('uploadSuccess', { defaultValue: 'Document uploaded! Data extracted from document.' }));
        // Refresh extracted profile
        try {
          const profileData = await getExtractedProfileApi();
          if (profileData.profile) setExtractedProfile(profileData.profile);
        } catch (_) {}
      }
    } catch (err) {
      showToast(err.message || t('uploadFailed', { defaultValue: 'Failed to save document' }), 'error');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);
    const docId = deletingDoc._id || deletingDoc.id;
    try {
      await deleteDocumentApi(docId);
      setDocList(prev => prev.filter(d => (d._id || d.id) !== docId));
      showToast(t('deleteSuccess', { defaultValue: 'Document deleted successfully!' }));
    } catch (err) {
      showToast(err.message || 'Failed to delete document', 'error');
    } finally {
      setIsDeleting(false);
      setDeletingDoc(null);
    }
  };

  const handleDownload = async (doc) => {
    if (doc.fileDataUrl) {
      const link = document.createElement('a');
      link.href = doc.fileDataUrl;
      link.download = doc.originalFilename || `${doc.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (doc._id) {
      try {
        const blob = await getDocumentFileApi(doc._id);
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = doc.originalFilename || `${doc.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } catch (error) {
        showToast(error.message || 'Could not download this document.', 'error');
      }
    }
  };

  const filtered = activeCategory === 'all'
    ? docList
    : docList.filter(d => d.category === activeCategory);

  // ── Extracted profile summary banner ────────────────────────────────────────
  const ProfileSummaryBanner = () => {
    if (!extractedProfile || extractedProfile.extractedFields?.length === 0) return null;
    const ep = extractedProfile;
    return (
      <div className="mb-6 rounded-2xl border border-primary-100 bg-gradient-to-r from-sky-50 via-sky-50 to-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-black text-navy-900">{t('docProfileTitle', { defaultValue: 'Profile Extracted from Documents' })}</p>
            <p className="text-[11px] text-gray-500">{t('docProfileSub', { defaultValue: 'Auto-filled from your uploaded documents' })}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {ep.age && <ProfileChip icon={<User className="h-3 w-3" />} label={t('age', { defaultValue: 'Age' })} value={`${ep.age} ${t('years', { defaultValue: 'yrs' })}`} />}
          {ep.annualIncome && <ProfileChip icon={<Banknote className="h-3 w-3" />} label={t('annualIncome', { defaultValue: 'Annual Income' })} value={ep.incomeText || `₹${ep.annualIncome.toLocaleString('en-IN')}`} />}
          {ep.aadhaarNumber && <ProfileChip icon={<CreditCard className="h-3 w-3" />} label={t('aadhaarNumber', { defaultValue: 'Aadhaar' })} value={'XXXX XXXX ' + String(ep.aadhaarNumber).slice(-4)} />}
          {ep.socialCategory && <ProfileChip icon={<Tag className="h-3 w-3" />} label={t('socialCategory', { defaultValue: 'Category' })} value={ep.socialCategory} />}
        </div>
        <p className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
          <Shield className="h-3 w-3" />
          {t('profileAutoUpdated', { defaultValue: 'Your eligibility profile has been auto-updated from these documents.' })}
        </p>
      </div>
    );
  };

  function ProfileChip({ icon, label, value }) {
    return (
      <div className="rounded-xl bg-white border border-sky-100 px-3 py-2">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
          <span className="text-primary-500">{icon}</span> {label}
        </div>
        <p className="text-xs font-extrabold text-navy-800 truncate">{value}</p>
      </div>
    );
  }

  return (
    <DashboardLayout title={t('documentVaultTitle')} subtitle={t('documentVaultSubtitle')}>
      {/* Toast */}
      {isVerified && toast && (
        <div className={`mb-5 flex items-center justify-between gap-3 rounded-xl p-4 border shadow-sm animate-slide-down ${
          toast.type === 'error' ? 'bg-error-50 text-error-800 border-error-200' : 'bg-success-50 text-success-800 border-success-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'error'
              ? <AlertCircle className="h-5 w-5 text-error-600" />
              : <CheckCircle2 className="h-5 w-5 text-success-600" />
            }
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-xs font-bold opacity-75 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Extracted profile summary */}
      {isVerified && !loading && <ProfileSummaryBanner />}

      {/* Filter + Upload bar */}
      {isVerified && <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeCategory === cat.key
                  ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-navy-700 hover:border-primary-300 hover:bg-sky-50/50'
              }`}
            >
              {t(cat.labelKey, { defaultValue: cat.key })}
            </button>
          ))}
        </div>

        <Button
          onClick={() => {
            if (!isAuthenticated()) {
              navigate('/login', { state: { from: '/documents' } });
              return;
            }
            setEditingDoc(null);
            setShowUploadModal(true);
          }}
          className="gap-2 shadow-sm shrink-0"
        >
          <Upload className="h-4 w-4" />
          {t('uploadDocument')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsVerified(false);
            setDocList([]);
            setExtractedProfile(null);
            setPreviewDoc(null);
            setShowUploadModal(false);
            setEditingDoc(null);
            setDeletingDoc(null);
            setVerificationPassword('');
            setVerificationError('');
          }}
          className="gap-2 shrink-0"
        >
          <LockKeyhole className="h-4 w-4" /> Lock Documents
        </Button>
      </div>}

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : notLoggedIn ? (
        <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
            <LogIn className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-navy-900">
            {t('loginToUpload', { defaultValue: 'Log in to access your documents' })}
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            {t('loginToUploadDesc', { defaultValue: 'Sign in to securely upload, manage and verify your government documents.' })}
          </p>
          <Button onClick={() => navigate('/login', { state: { from: '/documents' } })} className="mt-6 gap-2">
            <LogIn className="h-4 w-4" />
            {t('login', { defaultValue: 'Sign In' })}
          </Button>
          <p className="mt-3 text-xs text-gray-400">
            {t('noAccount', { defaultValue: "Don't have an account?" })}{' '}
            <a href="/register" className="text-primary-600 font-semibold hover:underline">
              {t('signUp', { defaultValue: 'Register here' })}
            </a>
          </p>
        </div>
      ) : !isVerified ? (
        <div className="mx-auto max-w-md rounded-2xl border border-primary-100 bg-white p-6 shadow-card sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-center text-xl font-extrabold text-navy-900">Verify it’s you</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your account password to view or upload sensitive documents. Verification expires after 10 minutes.
          </p>
          <form onSubmit={handleVerifyIdentity} className="mt-6 space-y-4">
            <div>
              <label htmlFor="documents-password" className="label-base">Account password</label>
              <input
                id="documents-password"
                type="password"
                autoComplete="current-password"
                required
                value={verificationPassword}
                onChange={(event) => setVerificationPassword(event.target.value)}
                className="input-base"
                placeholder="Enter your password"
              />
            </div>
            {verificationError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {verificationError}
              </p>
            )}
            <Button type="submit" disabled={isVerifying || !verificationPassword} className="w-full gap-2">
              {isVerifying ? 'Verifying…' : <><ShieldCheck className="h-4 w-4" /> Verify and continue</>}
            </Button>
          </form>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-xs">
          <FolderOpen className="mx-auto h-12 w-12 text-primary-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">{t('noDocuments')}</p>
          <p className="mt-1 text-xs text-gray-400">
            {t('uploadFirstDoc', { defaultValue: 'Upload your first document to get started.' })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setEditingDoc(null); setShowUploadModal(true); }}
            className="mt-4 gap-1.5"
          >
            <Upload className="h-4 w-4" /> {t('uploadDocument')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map(doc => (
            <DocumentCard
              key={doc._id || doc.id}
              document={doc}
              onView={d => setPreviewDoc(d)}
              onDownload={handleDownload}
              onReplace={d => { setEditingDoc(d); setShowUploadModal(true); }}
              onDelete={d => setDeletingDoc(d)}
              onExtracted={handleExtracted}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DocumentPreviewModal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        onReplace={d => { setEditingDoc(d); setShowUploadModal(true); }}
        onDownload={handleDownload}
      />

      <DocumentUploadModal
        open={showUploadModal}
        onClose={() => { setShowUploadModal(false); setEditingDoc(null); }}
        onSave={handleSaveDocument}
        existingDocument={editingDoc}
      />

      <DeleteConfirmModal
        open={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDeleteConfirm}
        documentName={deletingDoc?.name}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
}
