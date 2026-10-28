import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Heart, Baby, Users, Stethoscope, Accessibility, Wheat, Briefcase, Home, Wallet, Rocket, Award, MapPin, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';
import { getSchemeCategoryLabel } from '@/utils/schemeCatalogTranslations';


const iconMap = {
  education: GraduationCap, women: Heart, children: Baby, 'senior-citizens': Users,
  healthcare: Stethoscope, 'disability-support': Accessibility, agriculture: Wheat,
  employment: Briefcase, housing: Home, 'financial-assistance': Wallet,
  entrepreneurship: Rocket, scholarships: Award,
  'agriculture-rural-environment': Wheat,
  'education-learning': GraduationCap,
  'business-entrepreneurship': Rocket,
  'social-welfare-empowerment': Wallet,
  'women-and-child': Heart,
  'skills-employment': Briefcase,
  'banking-financial-services-and-insurance': Wallet,
  'health-wellness': Stethoscope,
  'sports-culture': Award,
  'housing-shelter': Home,
  'science-it-communications': Award,
  'transport-infrastructure': MapPin,
  'utility-sanitation': ShieldCheck,
  'travel-tourism': MapPin,
  'public-safety-law-justice': ShieldCheck,
};

/* Maps category id → i18n description key */
const categoryDescriptionKeys = {
  'agriculture-rural-environment': 'catDescAgriculture',
  'education-learning': 'catDescEducation',
  'business-entrepreneurship': 'catDescBusiness',
  'social-welfare-empowerment': 'catDescSocialWelfare',
  'women-and-child': 'catDescWomenChild',
  'skills-employment': 'catDescSkills',
  'banking-financial-services-and-insurance': 'catDescBanking',
  'health-wellness': 'catDescHealth',
  'sports-culture': 'catDescSports',
  'housing-shelter': 'catDescHousing',
  'science-it-communications': 'catDescScience',
  'transport-infrastructure': 'catDescTransport',
  'utility-sanitation': 'catDescUtility',
  'travel-tourism': 'catDescTravel',
  'public-safety-law-justice': 'catDescPublicSafety',
};

export function CategoryCard({ category, onClick }) {
  const { t, i18n } = useTranslation();
  const Icon = iconMap[category.id] || Award;
  const dynamicCount = category.schemeCount;
  const translatedName = getSchemeCategoryLabel(category.name, i18n.language);
  const descKey = categoryDescriptionKeys[category.id];
  const translatedDesc = descKey ? t(descKey, { defaultValue: category.description }) : category.description;
  return (
    <Link to={`/category/${category.id}`} className="block group text-left h-full" onClick={onClick}>
      <Card className="landing-category-card p-5 h-full transition-all duration-200 group-hover:border-sky-300 group-hover:shadow-lg cursor-pointer flex flex-col justify-between" hover>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-50 text-sky-700 shadow-sm transition-all group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-800 transition-colors">{translatedName}</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{translatedDesc}</p>
            <p className="mt-3 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">{dynamicCount} {t('categoryPage.schemes', { defaultValue: 'schemes' })}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-sky-100 pt-3 text-sm font-bold text-sky-700 transition-colors group-hover:text-sky-900">
          {t('exploreCategory', { defaultValue: 'Explore Schemes' })} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </Link>
  );
}
