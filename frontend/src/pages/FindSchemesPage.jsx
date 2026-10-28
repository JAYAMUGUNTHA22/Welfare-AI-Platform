import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search, SlidersHorizontal, X, Sparkles, MapPin, Calendar,
  Briefcase, Wallet, CheckCircle2, AlertCircle, ArrowRight, Info, ShieldCheck
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SchemeCard } from '@/components/shared/SchemeCard';
import { Button } from '@/components/ui/Button';
import { categories as mockCategories, states, occupations, incomeBrackets, schemes as mockSchemes } from '@/data/mockData';
import { useTranslation } from 'react-i18next';
import { getAllSchemes, getMe, saveSchemeRecommendations } from '@/services/api';
import { getSchemeTranslation } from '@/data/schemeTranslations';
import { SchemeApplicationAction } from '@/components/shared/SchemeApplicationAction';
import { SchemeDetailsButton } from '@/components/shared/SchemeDetailsLink';
import { SchemeDetailsLink } from '@/components/shared/SchemeDetailsLink';
import { getPersonalizedSchemeRecommendations } from '@/data/myschemeDataset';
import { getSchemeCatalogText } from '@/utils/schemeCatalogTranslations';

const allCategoriesList = [
  { id: 'education', name: 'Education' },
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'employment', name: 'Employment' },
  { id: 'housing', name: 'Housing' },
  { id: 'agriculture', name: 'Agriculture' },
  { id: 'women', name: 'Women Welfare' },
  { id: 'senior-citizens', name: 'Senior Citizens' },
  { id: 'disability-support', name: 'Disability Support' },
  { id: 'financial-assistance', name: 'Financial Assistance' },
  { id: 'entrepreneurship', name: 'Entrepreneurship' },
];

function getIncomeBracket(profile) {
  if (incomeBrackets.includes(profile.income)) return profile.income;
  const incomeText = String(profile.income || '').toLowerCase();
  if (incomeText.includes('below')) return incomeBrackets[0];
  if (incomeText.includes('1-2.5')) return incomeBrackets[1];
  if (incomeText.includes('2.5-5')) return incomeBrackets[2];
  if (incomeText.includes('5-10')) return incomeBrackets[3];
  if (incomeText.includes('above')) return incomeBrackets[4];
  const income = Number(profile.annualIncomeINR);
  if (!Number.isFinite(income)) return '';
  if (income < 100000) return incomeBrackets[0];
  if (income < 250000) return incomeBrackets[1];
  if (income < 500000) return incomeBrackets[2];
  if (income < 1000000) return incomeBrackets[3];
  return incomeBrackets[4];
}

export function FindSchemesPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationState = useLocation().state;
  const navigate = useNavigate();

  const categoryParam = searchParams.get('category');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || null);
  const [showFilters, setShowFilters] = useState(false);
  const cachedProfile = (() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch (error) {
      console.warn('Could not read the cached user profile', error);
      return null;
    }
  })();

  useEffect(() => {
    const catFromUrl = searchParams.get('category');
    setSelectedCategory(catFromUrl || null);
  }, [searchParams]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  // Situation Form State
  const [situationForm, setSituationForm] = useState({
    state: locationState?.situation?.state ?? cachedProfile?.state ?? '',
    age: String(locationState?.situation?.age ?? cachedProfile?.age ?? ''),
    occupation: locationState?.situation?.occupation ?? cachedProfile?.occupation ?? '',
    income: locationState?.situation?.income ?? getIncomeBracket(cachedProfile || {}),
    socialCategory: locationState?.situation?.socialCategory ?? cachedProfile?.socialCategory ?? '',
    gender: locationState?.situation?.gender ?? cachedProfile?.gender ?? '',
    isDifferentlyAbled: locationState?.situation?.isDifferentlyAbled ?? cachedProfile?.isDifferentlyAbled,
    isWidow: locationState?.situation?.isWidow ?? cachedProfile?.isWidow,
    motherWidowed: locationState?.situation?.motherWidowed ?? cachedProfile?.motherWidowed,
    educationLevel: locationState?.situation?.educationLevel ?? cachedProfile?.educationLevel ?? '',
    currentCourse: locationState?.situation?.currentCourse ?? cachedProfile?.currentCourse ?? '',
    employmentStatus: locationState?.situation?.employmentStatus ?? cachedProfile?.employmentStatus ?? '',
    familySize: locationState?.situation?.familySize ?? cachedProfile?.familySize,
    dependants: locationState?.situation?.dependants ?? cachedProfile?.dependants,
    residenceType: locationState?.situation?.residenceType ?? cachedProfile?.residenceType ?? '',
    isFarmer: locationState?.situation?.isFarmer ?? cachedProfile?.isFarmer,
    firstGraduate: locationState?.situation?.firstGraduate ?? cachedProfile?.firstGraduate,
    specialCircumstances: locationState?.situation?.specialCircumstances ?? cachedProfile?.specialCircumstances ?? '',
  });

  const [formSubmitted, setFormSubmitted] = useState(true);
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [dbSchemes, setDbSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch logged in profile & schemes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [schemesRes, profileRes] = await Promise.allSettled([
          getAllSchemes(),
          getMe()
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.user) {
          const u = profileRes.value.user;
          if (!locationState?.situation) {
            setSituationForm({
              state: u.state || '',
              age: u.age ? String(u.age) : '',
              occupation: u.occupation || '',
              income: getIncomeBracket(u),
              socialCategory: u.socialCategory || '',
              gender: u.gender || '',
              isDifferentlyAbled: u.isDifferentlyAbled,
              isWidow: u.isWidow,
              motherWidowed: u.motherWidowed,
              educationLevel: u.educationLevel || '',
              currentCourse: u.currentCourse || '',
              employmentStatus: u.employmentStatus || '',
              familySize: u.familySize,
              dependants: u.dependants,
              residenceType: u.residenceType || '',
              isFarmer: u.isFarmer,
              firstGraduate: u.firstGraduate,
              specialCircumstances: u.specialCircumstances || '',
            });
          }
        } else if (profileRes.status === 'rejected') {
          console.warn('Could not refresh the profile; using the saved profile if available.', profileRes.reason);
        }

        if (schemesRes.status === 'fulfilled' && schemesRes.value?.length > 0) {
          setDbSchemes(schemesRes.value);
        } else {
          setDbSchemes(mockSchemes);
        }
      } catch (error) {
        console.error('Could not load the scheme catalogue', error);
        setDbSchemes(mockSchemes);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [locationState?.situation]);

  // Use the same source rules for recommendations on the dashboard and discovery pages.
  useEffect(() => {
    let current = true;
    async function loadRecommendations() {
      if (!formSubmitted) return;
      setIsProcessing(true);
      try {
        const matches = await getPersonalizedSchemeRecommendations({
          ...situationForm,
          age: Number(situationForm.age) || null,
        });
        if (current) {
          setRecommendedSchemes(matches);
          await saveSchemeRecommendations({
            ...situationForm,
            age: Number(situationForm.age) || null,
            fullName: cachedProfile?.fullName || '',
            annualIncomeINR: cachedProfile?.annualIncomeINR,
          }, matches);
        }
      } catch (error) {
        console.error('Could not evaluate scheme eligibility against the profile', error);
        if (current) setFormError('We could not evaluate schemes right now. Please try again.');
      } finally {
        if (current) setIsProcessing(false);
      }
    }
    loadRecommendations();
    return () => { current = false; };
  }, [formSubmitted, situationForm]);

  const handleSituationSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (situationForm.age) {
      const ageNum = parseInt(situationForm.age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        setFormError('Please enter a valid age between 1 and 120.');
        return;
      }
    }

    if (!situationForm.state && !situationForm.age && !situationForm.occupation && !situationForm.income && !situationForm.socialCategory) {
      setFormError('Please select at least one demographic field to find matching schemes.');
      return;
    }

    setFormSubmitted(true);
  };

  // Comprehensive Category Filter logic for main scheme gallery
  let gallerySchemes = dbSchemes.length > 0 ? dbSchemes : mockSchemes;

  if (selectedCategory) {
    const categoryMatchMap = {
      'education': ['education', 'scholarships'],
      'scholarships': ['scholarships', 'education'],
      'women': ['women', 'children', 'entrepreneurship'],
      'children': ['children', 'education', 'healthcare', 'women'],
      'senior-citizens': ['senior-citizens', 'financial-assistance', 'healthcare'],
      'healthcare': ['healthcare', 'children', 'senior-citizens', 'disability-support'],
      'disability-support': ['disability-support', 'financial-assistance', 'healthcare'],
      'agriculture': ['agriculture', 'financial-assistance'],
      'employment': ['employment', 'scholarships', 'entrepreneurship'],
      'housing': ['housing'],
      'financial-assistance': ['financial-assistance', 'senior-citizens', 'agriculture', 'women', 'disability-support'],
      'entrepreneurship': ['entrepreneurship', 'employment', 'financial-assistance']
    };

    const selLower = selectedCategory.toLowerCase();
    const matchedCategories = categoryMatchMap[selLower] || [selLower];

    gallerySchemes = gallerySchemes.filter((s) => {
      const cat = (s.category || '').toLowerCase();
      const tags = (s.tags || []).map(t => t.toLowerCase());
      return cat === selLower || matchedCategories.includes(cat) || tags.some(t => matchedCategories.includes(t));
    });
  }

  if (situationForm.state && showFilters) {
    gallerySchemes = gallerySchemes.filter(
      (s) => !s.state || s.state === 'All' || s.state.toLowerCase() === situationForm.state.toLowerCase()
    );
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    gallerySchemes = gallerySchemes.filter(
      (s) => s.name?.toLowerCase().includes(q) ||
             s.provider?.toLowerCase().includes(q) ||
             s.shortExplanation?.toLowerCase().includes(q) ||
             s.overview?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />

      <main className="container-page flex-1 py-8 lg:py-12">
        {/* Page Title & Subtitle */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1 text-xs font-bold text-primary-700 mb-3 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-accent-500" /> MyScheme profile-based discovery
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 sm:text-4xl">{t('findSchemesTitle')}</h1>
          <p className="mt-2 text-base text-navy-600">{t('findSchemesSubtitle')}</p>
        </div>
        
        {/* SECTION 1: Situation Form */}
        <div className="mb-10 rounded-2xl border border-primary-200 bg-white p-6 shadow-card lg:p-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900">{t('situationTitle')}</h2>
                <p className="text-xs text-gray-500">{t('situationSub')}</p>
              </div>
            </div>
            <span className="hidden sm:inline-block rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
              ✓ Dataset Integration Active
            </span>
          </div>

          <form onSubmit={handleSituationSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="label-base">
                <MapPin className="mr-1 inline h-4 w-4 text-primary-600" /> {t('location')}
              </label>
              <select
                value={situationForm.state}
                onChange={(e) => setSituationForm({ ...situationForm, state: e.target.value })}
                className="input-base"
              >
                <option value="">{t('selectState')}</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="label-base">
                <Calendar className="mr-1 inline h-4 w-4 text-primary-600" /> {t('age')}
              </label>
              <input
                type="number"
                min={1}
                max={120}
                placeholder={t('enterAge')}
                value={situationForm.age}
                onChange={(e) => setSituationForm({ ...situationForm, age: e.target.value })}
                className="input-base"
              />
            </div>

            <div>
              <label className="label-base">
                <Briefcase className="mr-1 inline h-4 w-4 text-primary-600" /> {t('occupation')}
              </label>
              <select
                value={situationForm.occupation}
                onChange={(e) => setSituationForm({ ...situationForm, occupation: e.target.value })}
                className="input-base"
              >
                <option value="">{t('selectOccupation')}</option>
                {occupations.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label className="label-base">
                <Wallet className="mr-1 inline h-4 w-4 text-primary-600" /> {t('annIncome')}
              </label>
              <select
                value={situationForm.income}
                onChange={(e) => setSituationForm({ ...situationForm, income: e.target.value })}
                className="input-base"
              >
                <option value="">{t('selectIncome')}</option>
                {incomeBrackets.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="label-base">
                <ShieldCheck className="mr-1 inline h-4 w-4 text-primary-600" /> {t('profile.socialCategory')}
              </label>
              <select
                value={situationForm.socialCategory}
                onChange={(e) => setSituationForm({ ...situationForm, socialCategory: e.target.value })}
                className="input-base"
              >
                <option value="">{t('selectCategory')}</option>
                {['General', 'OBC', 'SC', 'ST', 'EWS'].map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between gap-4 pt-2">
              {formError && <p className="text-xs font-semibold text-error-600">{formError}</p>}
              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSituationForm({ state: '', age: '', occupation: '', income: '', socialCategory: '' });
                    setRecommendedSchemes([]);
                    setFormError('');
                    setFormSubmitted(false);
                  }}
                >
                  <X className="h-4 w-4" /> Reset Form
                </Button>
                <Button type="submit" size="md" disabled={isProcessing} className="gap-2 shadow-sm">
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Finding schemes...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" /> Find Matching Schemes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* SECTION 2: Recommended Schemes Section */}
        {formSubmitted && (
          <div className="mb-14 animate-slide-down">
            {/* Active Criteria Header Banner */}
            <div className="mb-6 rounded-2xl border border-primary-200 bg-gradient-to-r from-sky-600 via-blue-700 to-sky-800 p-6 text-white shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent-400" />
                    <h2 className="text-2xl font-black text-white">{t('recommendedForYou')}</h2>
                  </div>
                  <p className="mt-1 text-xs text-sky-200">
                    Suggestions ranked against the available age, income, occupation, category, and location criteria. Confirm eligibility on the official website.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {situationForm.state && (
                    <span className="rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 font-bold text-white">
                      📍 {situationForm.state}
                    </span>
                  )}
                  {situationForm.occupation && (
                    <span className="rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 font-bold text-white">
                      💼 {situationForm.occupation}
                    </span>
                  )}
                  {situationForm.age && (
                    <span className="rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 font-bold text-white">
                      🎂 Age {situationForm.age}
                    </span>
                  )}
                  {situationForm.income && (
                    <span className="rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 font-bold text-white">
                      💰 {situationForm.income}
                    </span>
                  )}
                  {situationForm.socialCategory && (
                    <span className="rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 font-bold text-white">
                      {situationForm.socialCategory} category
                    </span>
                  )}
                </div>
              </div>
            </div>

            {recommendedSchemes.length === 0 ? (
              <div className="rounded-2xl border border-warning-200 bg-warning-50/50 p-8 text-center shadow-xs">
                <AlertCircle className="mx-auto h-10 w-10 text-warning-500" />
                <h3 className="mt-2 text-base font-bold text-navy-900">{t('noExactMatchesTitle')}</h3>
                <p className="mt-1 text-sm text-navy-600">{t('noExactMatchesDesc')}</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedSchemes.map((scheme) => {
                  const sid = scheme.schemeId || scheme.id;
                  const scoreStyle = scheme.matchScore >= 75
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-amber-50 border-amber-300 text-amber-700';
                  return (
                    <div
                      key={scheme.id || sid}
                      className="flex flex-col justify-between rounded-2xl border-2 border-primary-200 bg-white p-6 shadow-card transition-all hover:border-primary-500 hover:shadow-xl"
                    >
                      <div>
                        {/* Header: Score Badge & Category */}
                        <div className="mb-4 flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                          <span className="truncate rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-extrabold text-primary-700 capitalize">
                            {scheme.schemeCategories?.[0] || 'Government Scheme'}
                          </span>

                          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black shadow-2xs ${scoreStyle}`}>
                            {scheme.matchScore >= 75
                              ? <CheckCircle2 className="h-4 w-4" />
                              : <AlertCircle className="h-4 w-4" />}
                            {scheme.matchScore}% Profile fit
                          </div>
                        </div>

                        {/* Title & Provider */}
                        <SchemeDetailsLink
                          scheme={scheme}
                          to={`/schemes/${sid}`}
                          state={{ recommendation: { matchScore: scheme.matchScore, matchScoreLabel: scheme.matchScoreLabel, matchTier: scheme.matchTier, matchReasons: scheme.matchReasons, recommendationNote: scheme.recommendationNote } }}
                          className="group block mb-1"
                        >
                          <h3 className="text-lg font-extrabold text-navy-900 group-hover:text-primary-600 transition-colors">
                            {getSchemeCatalogText(scheme.name, i18n.language)}
                          </h3>
                        </SchemeDetailsLink>
                        <p className="text-xs font-medium text-gray-500 mb-3">{getSchemeCatalogText(scheme.provider, i18n.language)}</p>

                        {/* Key Benefit Highlight Box */}
                        <div className="mb-4 rounded-xl border border-primary-100 bg-gradient-to-r from-sky-50 to-primary-50/40 p-3.5">
                          <span className="text-2xs font-extrabold uppercase tracking-wider text-primary-700 block mb-0.5">
                            Primary Benefit:
                          </span>
                          <p className="line-clamp-3 text-xs font-bold text-navy-900">
                            {getSchemeCatalogText(scheme.benefitSummary || 'View the scheme details to learn about its benefits.', i18n.language)}
                          </p>
                        </div>
                        <p className="mb-4 text-xs text-gray-500">
                          View eligibility requirements and your profile comparison on the details page.
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <SchemeDetailsButton scheme={scheme} to={`/schemes/${sid}`} state={{ recommendation: { matchScore: scheme.matchScore, matchScoreLabel: scheme.matchScoreLabel, matchTier: scheme.matchTier, matchReasons: scheme.matchReasons, recommendationNote: scheme.recommendationNote } }} variant="outline" size="sm" className="flex-1 justify-center">
                          View Details
                        </SchemeDetailsButton>
                        <SchemeApplicationAction scheme={scheme} variant="primary" size="sm" className="flex-1 justify-center gap-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: Gallery Search & All Schemes */}
        <div className="mb-6">
          <h2 className="mb-4 text-2xl font-extrabold text-navy-900">{t('allAvailableSchemes')}</h2>
          
          {/* Search bar */}
          <div className="mb-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-10 py-3"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> {t('filters')}
            </Button>
          </div>

          {/* Category Banner if Category is selected */}
          {selectedCategory && (
            <div className="mb-6 rounded-2xl border border-primary-200 bg-gradient-to-r from-sky-600 via-blue-700 to-sky-800 p-6 text-white shadow-md flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-white">
                    Category Filter Active
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white capitalize">
                  {allCategoriesList.find(c => c.id.toLowerCase() === selectedCategory.toLowerCase())?.name || selectedCategory.replace('-', ' ')} Schemes
                </h3>
                <p className="mt-1 text-xs text-sky-200">
                  Showing {gallerySchemes.length} official welfare scheme{gallerySchemes.length !== 1 ? 's' : ''} available under this category.
                </p>
              </div>
              <button
                onClick={() => handleCategoryChange(null)}
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 px-3.5 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shrink-0"
              >
                <X className="h-4 w-4" /> Clear Category
              </button>
            </div>
          )}

          {/* Category Chips */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                !selectedCategory
                  ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-navy-700 hover:border-primary-300'
              }`}
            >
              {t('allCategories')}
            </button>
            {allCategoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                    : 'border-gray-200 bg-white text-navy-700 hover:border-primary-300 hover:bg-sky-50/50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Scheme Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallerySchemes.map((scheme) => (
              <SchemeCard key={scheme.schemeId || scheme._id || scheme.id} scheme={scheme} showMatchReasons={false} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
