import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, CircleHelp, LoaderCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  cancelPendingApplicationApi,
  confirmApplicationApi,
  reserveOfflineApplicationApi,
  startApplicationApi,
} from '@/services/api';

const ApplicationTrackingContext = createContext(null);
const followUpKey = 'welfareai-application-follow-up';

function readFollowUp() {
  try {
    const value = localStorage.getItem(followUpKey) || sessionStorage.getItem(followUpKey);
    const pending = JSON.parse(value || 'null');
    if (pending?.startedAt && Date.now() - pending.startedAt > 24 * 60 * 60 * 1000) {
      storeFollowUp(null);
      return null;
    }
    return pending;
  } catch { return null; }
}

function storeFollowUp(value) {
  try {
    if (value) {
      const serialized = JSON.stringify(value);
      sessionStorage.setItem(followUpKey, serialized);
      // Share the return reminder with another WelfareAI tab if the user
      // closes the official site and the browser focuses that tab instead.
      localStorage.setItem(followUpKey, serialized);
    } else {
      sessionStorage.removeItem(followUpKey);
      localStorage.removeItem(followUpKey);
    }
  } catch { /* Tracking can still continue in the current tab when storage is unavailable. */ }
}

function getSchemeSnapshot(scheme, applicationLink = {}) {
  const applicationText = [scheme?.applicationProcess, scheme?.applicationMethod, scheme?.application]
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .filter((value) => typeof value === 'string')
    .join(' ');
  const schemeId = scheme?.schemeId || scheme?.myschemeSlug || scheme?.slug || scheme?.id;
  const benefitValue = scheme?.benefitSummary ?? scheme?.benefits ?? scheme?.benefitAmount ?? scheme?.benefit_description ?? scheme?.benefit;
  const benefitSummary = (Array.isArray(benefitValue) ? benefitValue : [benefitValue])
    .map((value) => typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : value?.benefit_text || value?.description || value?.amount || '')
    .filter(Boolean)
    .join('\n');

  return {
    schemeId: String(schemeId || ''),
    schemeName: String(scheme?.name || scheme?.scheme_name || 'Government scheme'),
    provider: String(scheme?.provider || scheme?.level || 'Government Scheme'),
    applicationUrl: applicationLink.url || '',
    applicationMethod: applicationLink.type?.startsWith('offline') || /\boffline\b/i.test(applicationText)
      ? 'offline'
      : applicationLink.url ? 'online' : 'unknown',
    benefitSummary,
  };
}

export function ApplicationTrackingProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [followUp, setFollowUp] = useState(null);
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const clearFollowUp = useCallback(() => {
    storeFollowUp(null);
    setFollowUp(null);
    setActionError('');
  }, []);

  const beginOfflineReview = useCallback(async (scheme, destination) => {
    const snapshot = getSchemeSnapshot(scheme);
    if (!snapshot.schemeId) return;
    const detailPath = `/schemes/${encodeURIComponent(snapshot.schemeId)}`;
    const sourcePath = `${location.pathname}${location.search}`;

    // From the details page this action only scrolls to the instructions; it should not reserve a second slot.
    if (location.pathname === detailPath) {
      navigate(destination || detailPath);
      return;
    }
    if (!localStorage.getItem('token')) {
      setInfo({
        title: 'Sign in to track your applications',
        message: 'You can review the scheme steps, but sign in is required to save your application and use the two-scheme limit.',
        action: 'sign-in',
      });
      navigate(destination || detailPath);
      return;
    }

    const current = readFollowUp();
    if (current?.kind === 'offline-review' && current.scheme.schemeId === snapshot.schemeId && current.sourcePath === sourcePath) {
      navigate(destination || detailPath);
      return;
    }

    try {
      const result = await reserveOfflineApplicationApi(snapshot);
      storeFollowUp({
        kind: 'offline-review',
        scheme: snapshot,
        applicationId: result.application._id,
        sourcePath,
        detailPath,
        destination: typeof destination === 'string' ? destination : '',
        visitedDetails: false,
        startedAt: Date.now(),
      });
      navigate(destination || detailPath);
    } catch (error) {
      if (error.message?.includes('already in your application list')) {
        setInfo({ title: 'This scheme is already tracked', message: error.message, action: 'applications' });
        navigate(destination || detailPath);
        return;
      }
      setInfo({ title: 'Could not reserve an application slot', message: error.message || 'Please try again.' });
    }
  }, [location.pathname, location.search, navigate]);

  const launchApplication = useCallback(async (scheme, applicationLink) => {
    if (!localStorage.getItem('token')) {
      setInfo({
        title: 'Sign in to track your applications',
        message: 'Sign in first so we can save this scheme to your application list and enforce the two-scheme limit.',
        action: 'sign-in',
      });
      return;
    }
    if (!applicationLink?.url) return;

    const snapshot = getSchemeSnapshot(scheme, applicationLink);
    const pending = {
      kind: 'external-application',
      scheme: snapshot,
      applicationId: null,
      sourcePath: `${location.pathname}${location.search}`,
      startedAt: Date.now(),
      leftApp: false,
    };
    // Save before opening the tab: opening it can fire `blur` immediately.
    storeFollowUp(pending);

    // Open synchronously from the click so the browser allows the new tab.
    const externalTab = window.open('about:blank', '_blank');
    if (!externalTab) {
      storeFollowUp(null);
      setInfo({ title: 'Allow the application tab', message: 'Your browser blocked the new tab. Allow pop-ups for WelfareAI and try again.' });
      return;
    }
    externalTab.opener = null;

    try {
      const result = await startApplicationApi(snapshot);
      pending.applicationId = result.application._id;
      storeFollowUp(pending);
      externalTab.location.replace(applicationLink.url);
      // If the user returned before the tracking request finished, no later
      // focus event is guaranteed. Show the prompt as soon as the ID is ready.
      if (pending.leftApp && document.visibilityState !== 'hidden') {
        setFollowUp(pending);
        setActionError('');
      }
    } catch (error) {
      externalTab.close();
      storeFollowUp(null);
      setInfo({ title: 'Could not start application tracking', message: error.message || 'Please try again.' });
    }
  }, [location.pathname, location.search]);

  const handleSchemeDetailsBack = useCallback((scheme, destination = '/my-schemes') => {
    const schemeId = String(scheme?.schemeId || scheme?.myschemeSlug || scheme?.slug || scheme?.id || '');
    const pending = readFollowUp();
    if (schemeId && pending?.kind === 'external-application'
      && pending.applicationId && pending.scheme?.schemeId === schemeId) {
      setFollowUp(pending);
      setActionError('');
    }
    navigate(destination);
  }, [navigate]);

  useEffect(() => {
    const handleBlur = () => {
      const pending = readFollowUp();
      if (pending?.kind !== 'external-application') return;
      pending.leftApp = true;
      storeFollowUp(pending);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handleBlur();
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const pending = readFollowUp();
    if (pending?.kind !== 'offline-review') return;

    const currentPath = `${location.pathname}${location.search}`;
    if (location.pathname === pending.detailPath) {
      pending.visitedDetails = true;
      storeFollowUp(pending);
      return;
    }
    if (pending.visitedDetails && currentPath === pending.sourcePath) {
      setFollowUp(pending);
      setActionError('');
    }
  }, [location.pathname, location.search]);

  const answerFollowUp = useCallback(async (submitted) => {
    if (!followUp || busy) return;
    setBusy(true);
    setActionError('');
    try {
      if (submitted) {
        await confirmApplicationApi(followUp.applicationId);
      } else {
        await cancelPendingApplicationApi(followUp.applicationId);
      }

      clearFollowUp();
      window.dispatchEvent(new Event('applications-updated'));
      setInfo({
        title: submitted ? 'Application saved' : 'No application added',
        message: submitted
          ? 'Your confirmation is recorded in My Applications. Scheme-listed benefit details are available in My Benefits; the department decides the final approved amount.'
          : 'You can return to this scheme and apply later. The reserved application slot has been released.',
        action: 'applications',
      });
    } catch (error) {
      setActionError(error.message || 'Could not save this update. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [busy, clearFollowUp, followUp]);

  const value = useMemo(() => ({ launchApplication, beginOfflineReview, handleSchemeDetailsBack }), [beginOfflineReview, handleSchemeDetailsBack, launchApplication]);

  return (
    <ApplicationTrackingContext.Provider value={value}>
      {children}
      <Modal
        open={Boolean(followUp)}
        onClose={() => {}}
        title={followUp?.kind === 'offline-review' ? 'Did you submit this application?' : 'Did you register for this scheme?'}
        className="max-w-md"
      >
        {followUp && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm"><CircleHelp className="h-6 w-6" /></span>
              <div>
                <p className="font-bold text-slate-900">{followUp.scheme.schemeName}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {followUp.kind === 'offline-review'
                    ? 'After reviewing the steps, did you submit the application to the department?'
                    : 'Please confirm whether you completed registration on the official scheme website.'}
                </p>
              </div>
            </div>
            {actionError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => answerFollowUp(false)} disabled={busy}>
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Not yet'}
              </Button>
              <Button onClick={() => answerFollowUp(true)} disabled={busy}>
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Yes, I applied</>}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(info)} onClose={() => setInfo(null)} title={info?.title} className="max-w-md">
        {info && (
          <div className="space-y-5">
            <p className="text-sm leading-relaxed text-slate-600">{info.message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInfo(null)}>Close</Button>
              {info.action === 'sign-in' && <Button onClick={() => { setInfo(null); navigate('/login', { state: { from: location.pathname } }); }}>Sign in</Button>}
              {info.action === 'applications' && <Button onClick={() => { setInfo(null); navigate('/applications'); }}>My Applications</Button>}
            </div>
          </div>
        )}
      </Modal>
    </ApplicationTrackingContext.Provider>
  );
}

export function useApplicationTracking() {
  const context = useContext(ApplicationTrackingContext);
  if (!context) throw new Error('useApplicationTracking must be used inside ApplicationTrackingProvider');
  return context;
}
