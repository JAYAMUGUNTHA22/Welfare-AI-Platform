import { ArrowRight, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchScore } from './MatchScore';
import { VerificationBadge } from './VerificationBadge';
import { useTranslation } from 'react-i18next';
import { getSchemeTranslation } from '@/data/schemeTranslations';
import { getSchemeCatalogText } from '@/utils/schemeCatalogTranslations';
import { SchemeApplicationAction } from '@/components/shared/SchemeApplicationAction';
import { SchemeDetailsButton, SchemeDetailsLink } from '@/components/shared/SchemeDetailsLink';

const reasonIcon = {
  match: <CheckCircle2 className="h-4 w-4 text-success-500 shrink-0" />,
  partial: <AlertTriangle className="h-4 w-4 text-warning-500 shrink-0" />,
  missing: <AlertCircle className="h-4 w-4 text-error-400 shrink-0" />,
};

const schemeTranslationKeys = {
  'pm-scholarship': 'pmScholarship',
  'ayushman-bharat': 'ayushmanBharat',
  'pm-kisan': 'pmKisan',
  'pmay-housing': 'pmayHousing',
  'atal-pension-yojana': 'atalPension',
  'mudra-loan': 'mudraLoan',
  'stand-up-india': 'standUpIndia',
  mgnrega: 'mgnrega',
  'tata-skills': 'tataSkills',
};

export function SchemeCard({ scheme, showMatchReasons = false }) {
  const { t, i18n } = useTranslation();
  const sid = scheme.schemeId || scheme.id;
  const schemeNameKey = schemeTranslationKeys[sid] || sid;
  const matchReasons = scheme.matchReasons || [];
  const translated = getSchemeTranslation(sid, i18n.language, scheme);
  return (
    <Card className="flex flex-col gap-4 p-5" hover>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <SchemeDetailsLink
            scheme={scheme}
            to={`/schemes/${sid}`}
            state={{ recommendation: { matchScore: scheme.matchScore, matchScoreLabel: scheme.matchScoreLabel, matchTier: scheme.matchTier, matchReasons, recommendationNote: scheme.recommendationNote } }}
            className="group"
          >
            <h3 className="text-base font-bold text-navy-900 group-hover:text-primary-700 transition-colors">
              {translated.name || t(`schemeNames.${schemeNameKey}`, { defaultValue: getSchemeCatalogText(scheme.name, i18n.language) })}
            </h3>
          </SchemeDetailsLink>
          <p className="mt-1 text-sm text-gray-500">{translated.provider || getSchemeCatalogText(scheme.provider, i18n.language)}</p>
          {scheme.verification && <div className="mt-2"><VerificationBadge status={scheme.verification} /></div>}
        </div>
        {Number.isFinite(Number(scheme.matchScore)) && scheme.matchScore !== '' && (
          <MatchScore score={Number(scheme.matchScore)} size="md" scoreLabel={scheme.matchScoreLabel} />
        )}
      </div>

      <p className="line-clamp-3 text-sm text-navy-600">{translated.benefit || getSchemeCatalogText(scheme.benefitSummary, i18n.language)}</p>

      {scheme.eligibilityStatus && (
        <div className="space-y-1.5">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${scheme.eligibilityStatus === 'Potentially eligible' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            {scheme.eligibilityStatus}
          </span>
          {scheme.missingInformation?.length > 0 && (
            <p className="text-xs text-slate-600">Still to check: {scheme.missingInformation.join(', ')}.</p>
          )}
        </div>
      )}

      {showMatchReasons && matchReasons.length > 0 && (
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('scheme.whyMatches')}</p>
          <ul className="space-y-1.5">
            {matchReasons.map((reason, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-navy-600">
                {reasonIcon[reason.status]}
                {t(`schemeData.${reason.label}`, { defaultValue: reason.label })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        <SchemeDetailsButton scheme={scheme} to={`/schemes/${sid}`} state={{ recommendation: { matchScore: scheme.matchScore, matchScoreLabel: scheme.matchScoreLabel, matchTier: scheme.matchTier, matchReasons, recommendationNote: scheme.recommendationNote } }} variant="outline" size="sm">{t('scheme.viewDetails')}</SchemeDetailsButton>
        <SchemeApplicationAction scheme={scheme} applyLabel={t('scheme.apply')} variant="primary" size="sm" />
      </div>
    </Card>
  );
}
