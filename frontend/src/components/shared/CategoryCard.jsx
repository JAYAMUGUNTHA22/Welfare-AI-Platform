import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Heart, Baby, Users, Stethoscope, Accessibility, Wheat, Briefcase, Home, Wallet, Rocket, Award, MapPin, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';

import { schemes } from '@/data/mockData';

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

export function CategoryCard({ category, onClick }) {
  const Icon = iconMap[category.id] || Award;
  const dynamicCount = category.schemeCount;
  return (
    <Link to={`/category/${category.id}`} className="block group text-left h-full" onClick={onClick}>
      <Card className="p-5 h-full transition-all duration-200 group-hover:border-primary-400 group-hover:shadow-md cursor-pointer flex flex-col justify-between" hover>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-navy-900 group-hover:text-primary-700 transition-colors">{category.name}</h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">{category.description}</p>
            <p className="mt-2 text-xs font-semibold text-primary-600">{dynamicCount} schemes</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:text-primary-700 transition-colors pt-2 border-t border-gray-100">
          Explore Schemes <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}
