import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="landing-brand-icon flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white"><ShieldCheck className="h-5 w-5" /></div>
              <span className="text-lg font-bold text-navy-900">WelfareAI</span>
            </div>
            <p className="mt-3 max-w-md text-sm text-gray-500 leading-relaxed">{t('landingSub')}</p>
            <p className="mt-3 text-xs font-semibold text-primary-600">{t('simplePersonalized')}</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy-900">{t('nav.categories')}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/schemes" className="text-gray-500 hover:text-primary-600">{t('exploreSchemes')}</Link></li>
              <li><Link to="/login" className="text-gray-500 hover:text-primary-600">{t('login')}</Link></li>
              <li><Link to="/register" className="text-gray-500 hover:text-primary-600">{t('signUp')}</Link></li>
              <li><Link to="/assistant" className="text-gray-500 hover:text-primary-600">{t('aiAssistTitle')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy-900">{t('nav.categories')}</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/schemes?category=education" className="text-gray-500 hover:text-primary-600">{t('education')}</Link></li>
              <li><Link to="/schemes?category=healthcare" className="text-gray-500 hover:text-primary-600">{t('healthcare')}</Link></li>
              <li><Link to="/schemes?category=employment" className="text-gray-500 hover:text-primary-600">{t('employment')}</Link></li>
              <li><Link to="/schemes?category=housing" className="text-gray-500 hover:text-primary-600">{t('housing')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">{t('footerCopyright')}</p>
          <p className="flex items-center gap-1.5 text-xs text-gray-400">{t('footerBuiltWith')} <Heart className="h-3.5 w-3.5 text-error-400" /> {t('footerForWelfare')}</p>
        </div>
      </div>
    </footer>
  );
}
