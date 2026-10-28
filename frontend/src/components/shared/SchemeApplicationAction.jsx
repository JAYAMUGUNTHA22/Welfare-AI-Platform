import { ArrowRight, ExternalLink, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSchemeApplicationLink } from '@/utils/schemeLinks';
import { useApplicationTracking } from '@/contexts/ApplicationTrackingContext';
import { useTranslation } from 'react-i18next';

export function SchemeApplicationAction({
  scheme,
  variant = 'primary',
  size = 'sm',
  className = '',
  applyLabel,
  unavailableLabel,
}) {
  const applicationLink = getSchemeApplicationLink(scheme);
  const { beginOfflineReview, launchApplication } = useApplicationTracking();
  const { t } = useTranslation();
  const trackExternalLink = (event) => {
    event.preventDefault();
    launchApplication(scheme, applicationLink);
  };

  if (applicationLink?.type === 'offline-instructions') {
    return (
      <Button to={applicationLink.to} onClick={(event) => { event.preventDefault(); beginOfflineReview(scheme, applicationLink.to); }} variant={variant} size={size} className={className}>
        {t('applicationAction.viewOfflineSteps')} <ClipboardList className="h-4 w-4" />
      </Button>
    );
  }

  if (applicationLink?.type === 'offline-form' || applicationLink?.type === 'application-instructions') {
    const isForm = applicationLink.type === 'offline-form';
    return (
      <Button
        href={applicationLink.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackExternalLink}
        variant={variant}
        size={size}
        className={className}
      >
        {isForm ? t('applicationAction.downloadForm') : t('applicationAction.viewInstructions')}
        <ExternalLink className="h-4 w-4" />
      </Button>
    );
  }

  if (applicationLink?.url) {
    const offline = applicationLink.type === 'offline-application';
    return (
      <Button
        href={applicationLink.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackExternalLink}
        variant={variant}
        size={size}
        className={className}
      >
        {offline ? t('applicationAction.offlineDetails') : (applyLabel || t('scheme.apply', { defaultValue: 'Apply Now' }))}
        {offline ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <Button
      disabled
      title="An official online application link or offline process is not available in the scheme data."
      variant={variant}
      size={size}
      className={className}
    >
      {unavailableLabel || t('applicationAction.unavailable')} <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
