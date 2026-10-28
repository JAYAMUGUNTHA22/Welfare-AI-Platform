import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { getSchemeApplicationLink } from '@/utils/schemeLinks';
import { useApplicationTracking } from '@/contexts/ApplicationTrackingContext';

function useSchemeDetailsClick(scheme, to) {
  const { beginOfflineReview } = useApplicationTracking();
  return (event) => {
    const applicationLink = getSchemeApplicationLink(scheme);
    if (!applicationLink?.url) {
      event.preventDefault();
      beginOfflineReview(scheme, to);
    }
  };
}

export function SchemeDetailsLink({ scheme, to, state, className = '', children, ...props }) {
  const onDetailsClick = useSchemeDetailsClick(scheme, to);
  return <Link to={to} state={state} className={className} onClick={onDetailsClick} {...props}>{children}</Link>;
}

export function SchemeDetailsButton({ scheme, to, state, children, ...props }) {
  const onDetailsClick = useSchemeDetailsClick(scheme, to);
  return <Button to={to} state={state} onClick={onDetailsClick} {...props}>{children}</Button>;
}
