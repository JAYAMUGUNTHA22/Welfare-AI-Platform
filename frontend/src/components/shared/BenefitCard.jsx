import { ArrowUpRight, Banknote, Building2, CheckCircle2, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getListedBenefitAmounts } from '@/utils/benefitAmounts';
import { useTranslation } from 'react-i18next';
import { getSchemeCatalogText } from '@/utils/schemeCatalogTranslations';

export function BenefitCard({ benefit }) {
  const { t, i18n } = useTranslation();
  const description = typeof benefit.benefitSummary === 'string' ? benefit.benefitSummary.trim() : '';
  const listedAmounts = getListedBenefitAmounts(description).slice(0, 4);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
      <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-700 ring-1 ring-sky-200/70"><Banknote className="h-6 w-6" /></span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> {t('benefitsPage.applied')}</span>
        </div>
        <h3 className="mt-5 text-lg font-extrabold leading-snug text-slate-900">{getSchemeCatalogText(benefit.schemeName, i18n.language)}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Building2 className="h-4 w-4 shrink-0 text-slate-400" />{getSchemeCatalogText(benefit.provider || 'Government Scheme', i18n.language)}</p>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">{t('benefitsPage.amountHeading')}</p>
          {listedAmounts.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {listedAmounts.map((amount) => <span key={amount} className="rounded-xl bg-white px-3 py-1.5 text-lg font-extrabold text-emerald-900 shadow-sm ring-1 ring-emerald-100">{amount}</span>)}
            </div>
          ) : (
            <p className="mt-2 text-sm font-semibold text-slate-700">{t('benefitsPage.noCashAmount')}</p>
          )}
          <p className="mt-2 text-xs leading-relaxed text-emerald-900/80">{t('benefitsPage.amountCaveat')}</p>
        </div>

        <div className="mt-5 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50/70 p-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-sky-800"><FileText className="h-4 w-4" /> {t('benefitsPage.detailHeading')}</p>
          <p className="mt-3 whitespace-pre-line text-sm font-medium leading-relaxed text-slate-800">{description ? getSchemeCatalogText(description, i18n.language) : t('benefitsPage.noDetails')}</p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 mt-5">
          <p className="max-w-[65%] text-xs leading-relaxed text-slate-500">{t('benefitsPage.departmentNote')}</p>
          {benefit.applicationUrl && <a href={benefit.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900">{t('benefitsPage.schemeSite')} <ExternalLink className="h-3.5 w-3.5" /></a>}
          {!benefit.applicationUrl && <Button to={`/schemes/${encodeURIComponent(benefit.schemeId)}`} variant="outline" size="sm">{t('benefitsPage.details')} <ArrowUpRight className="h-4 w-4" /></Button>}
        </div>
      </div>
    </article>
  );
}
