import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, SlidersHorizontal, CheckCircle2, AlertCircle,
  ArrowRight, User, Calendar, MapPin, Briefcase, Wallet, Clock,
  RefreshCw, ShieldCheck, Filter, ChevronDown, Award, TrendingUp, X, Heart, GraduationCap, Wheat
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMe, saveSchemeRecommendations } from '@/services/api';
import { applications } from '@/data/mockData';
import { useTranslation } from 'react-i18next';
import { getSchemeApplicationUrl } from '@/utils/schemeLinks';
import { getPersonalizedSchemeRecommendations, loadMyschemeSchemes } from '@/data/myschemeDataset';

const visibleCategories = [
  { id: 'agriculture-rural-environment', label: 'Agriculture', description: 'Support for farmers and rural communities', icon: Wheat },
  { id: 'education-learning', label: 'Education', description: 'Learning opportunities and student support', icon: GraduationCap },
  { id: 'sports-culture', label: 'Sports', description: 'Sports participation and cultural programs', icon: Award },
  { id: 'social-welfare-empowerment', label: 'Social Welfare', description: 'Community support and social empowerment', icon: Wallet },
  { id: 'women-and-child', label: 'Women and Child', description: 'Programs supporting women, children, and families', icon: Heart },
  { id: 'skills-employment', label: 'Skills', description: 'Training, skills, and employment support', icon: Briefcase },
  { id: 'banking-financial-services-and-insurance', label: 'Banking', description: 'Financial services and insurance support', icon: Wallet },
];

export function MySchemesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [categorySchemes, setCategorySchemes] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryLoadAttempt, setCategoryLoadAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMatchTier, setSelectedMatchTier] = useState('All');
  const [sortBy, setSortBy] = useState('relevant');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadUserAndSchemes();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setCategorySchemes([]);
      setCategoryError(null);
      setCategoryLoading(false);
      return undefined;
    }

    let active = true;
    setCategoryLoading(true);
    setCategoryError(null);
    loadMyschemeSchemes()
      .then((allSchemes) => {
        if (active) setCategorySchemes(allSchemes.filter((scheme) => scheme.tags?.includes(selectedCategory)));
      })
      .catch((loadError) => {
        console.error('Failed to load category schemes', loadError);
        if (active) setCategoryError('We could not load schemes for this category. Please try again.');
      })
      .finally(() => {
        if (active) setCategoryLoading(false);
      });

    return () => { active = false; };
  }, [selectedCategory, categoryLoadAttempt]);

  const loadUserAndSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedUser = null;
      try {
        fetchedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      } catch (cacheError) {
        console.warn('Could not read the cached user profile', cacheError);
      }
      try {
        const meRes = await getMe();
        fetchedUser = meRes?.user || meRes || fetchedUser;
      } catch (profileError) {
        console.warn('Could not refresh the user profile; using the saved profile if available.', profileError);
      }

      const userProfile = {
        state: fetchedUser?.state || '',
        age: fetchedUser?.age || null,
        gender: fetchedUser?.gender || '',
        occupation: fetchedUser?.occupation || '',
        income: fetchedUser?.income || '',
        annualIncomeINR: fetchedUser?.annualIncomeINR,
        socialCategory: fetchedUser?.socialCategory || '',
        isDifferentlyAbled: fetchedUser?.isDifferentlyAbled,
        isWidow: fetchedUser?.isWidow,
        motherWidowed: fetchedUser?.motherWidowed,
        educationLevel: fetchedUser?.educationLevel || '',
        currentCourse: fetchedUser?.currentCourse || '',
        employmentStatus: fetchedUser?.employmentStatus || '',
        familySize: fetchedUser?.familySize,
        dependants: fetchedUser?.dependants,
        residenceType: fetchedUser?.residenceType || '',
        isFarmer: fetchedUser?.isFarmer,
        firstGraduate: fetchedUser?.firstGraduate,
        specialCircumstances: fetchedUser?.specialCircumstances || '',
        fullName: fetchedUser?.fullName || 'You',
      };
      setUser(userProfile);
      const recommendations = await getPersonalizedSchemeRecommendations(userProfile);
      setRecommendedSchemes(recommendations);
      await saveSchemeRecommendations(userProfile, recommendations);
    } catch (err) {
      console.error('Failed to load personalized recommendations', err);
      setError('We could not load your personalized recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter & Search Logic
  let filteredSchemes = recommendedSchemes.filter((scheme) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = scheme.name?.toLowerCase().includes(q);
      const providerMatch = scheme.provider?.toLowerCase().includes(q);
      const benefitMatch = scheme.benefitSummary?.toLowerCase().includes(q);
      const descMatch = scheme.overview?.toLowerCase().includes(q) || scheme.shortExplanation?.toLowerCase().includes(q);
      if (!nameMatch && !providerMatch && !benefitMatch && !descMatch) return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && !scheme.tags?.includes(selectedCategory)) return false;

    // Match tier filter
    if (selectedMatchTier !== 'All') {
      if (scheme.matchTier !== selectedMatchTier) return false;
    }

    return true;
  });

  // Sort logic
  if (sortBy === 'relevant') {
    filteredSchemes.sort((a, b) => (
      (b.rankingScore || 0) - (a.rankingScore || 0)
      || (b.matchScore || 0) - (a.matchScore || 0)
    ));
  } else if (sortBy === 'a-z') {
    filteredSchemes.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'deadline') {
    filteredSchemes.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
  }

  let categorySearchResults = categorySchemes.filter((scheme) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return [scheme.name, scheme.provider, scheme.benefitSummary, scheme.details, scheme.eligibility]
      .some((value) => value?.toLowerCase().includes(query));
  });
  if (sortBy === 'a-z') categorySearchResults = [...categorySearchResults].sort((a, b) => a.name.localeCompare(b.name));
  categorySearchResults = categorySearchResults.slice(0, 10);
  const isShowingCategory = selectedCategory !== 'All';
  const schemesToDisplay = isShowingCategory ? categorySearchResults : filteredSchemes;

  // Calculated Stats
  const highlyRelevantCount = recommendedSchemes.filter(s => s.matchScore >= 90).length;
  const strongMatchesCount = recommendedSchemes.filter(s => s.matchScore >= 50 && s.matchScore < 90).length;
  const approachingDeadlineCount = recommendedSchemes.filter(s => s.deadline && s.deadline !== '—' && !s.deadline.includes('Open')).length;
  const hasProfileData = Boolean(
    user?.state || user?.age || user?.gender || user?.occupation || user?.income
    || user?.educationLevel || user?.currentCourse || user?.employmentStatus
    || user?.residenceType || user?.specialCircumstances
    || user?.isFarmer != null || user?.firstGraduate != null
    || user?.annualIncomeINR != null || user?.familySize != null || user?.dependants != null || user?.socialCategory
  );

  const categoriesList = visibleCategories;
  const matchTiersList = ['All', 'Strong Match', 'Potential Match', 'Needs Review'];

  return (
    <DashboardLayout
      title="My Schemes"
      subtitle="Personalized welfare schemes selected for you based on your profile."
    >
      <div className="myschemes-page">
      {/* SECTION 1: Personalized Profile Summary Header */}
      <div className="myschemes-curated mb-6 rounded-2xl border p-6 shadow-lg lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-sky-700 border border-sky-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" /> ✨ Recommended for You
            </div>
            <h2 className="text-xl font-extrabold text-sky-800 sm:text-2xl">
              Curated for {user?.fullName || 'You'}
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              Recommendations are ranked using your profile and the eligibility details available in the MyScheme dataset. Confirm all requirements on the official scheme website before applying.
            </p>

            {/* Profile Metadata Chips */}
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              {user?.state && (
                <span className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-800 border border-sky-200">
                  <MapPin className="h-3.5 w-3.5 text-sky-600" /> {user.state}
                </span>
              )}
              {user?.age && (
                <span className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-800 border border-sky-200">
                  <Calendar className="h-3.5 w-3.5 text-sky-600" /> Age {user.age}
                </span>
              )}
              {user?.occupation && (
                <span className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-800 border border-sky-200">
                  <Briefcase className="h-3.5 w-3.5 text-sky-600" /> {user.occupation}
                </span>
              )}
              {user?.income && (
                <span className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-800 border border-sky-200">
                  <Wallet className="h-3.5 w-3.5 text-sky-600" /> {user.income}
                </span>
              )}
              {user?.annualIncomeINR != null && (
                <span className="flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-800 border border-sky-200">
                  <Wallet className="h-3.5 w-3.5 text-sky-600" /> ₹{Number(user.annualIncomeINR).toLocaleString('en-IN')} annual income
                </span>
              )}
              {user?.socialCategory && (
                <span className="rounded-lg bg-sky-50 px-3 py-1.5 font-bold text-sky-800 border border-sky-200">
                  {user.socialCategory} category
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 pt-2 lg:pt-0">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white border border-sky-600 px-4 py-2.5 text-xs font-bold transition-all shadow-sm"
            >
              <User className="h-4 w-4" /> Edit Profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: Recommendation Statistics Bar */}
      {!loading && !error && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-primary-200 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-navy-900">{recommendedSchemes.length}</p>
              <p className="text-xs font-medium text-gray-500">Schemes Matched for Profile</p>
            </div>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-200 text-sky-800">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-sky-950">{highlyRelevantCount}</p>
              <p className="text-xs font-medium text-sky-700">Highly Relevant Schemes</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-200 text-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-950">{strongMatchesCount}</p>
              <p className="text-xs font-medium text-emerald-700">Strong Matches</p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-200 text-amber-800">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-amber-950">{approachingDeadlineCount}</p>
              <p className="text-xs font-medium text-amber-700">Deadlines Approaching</p>
            </div>
          </div>
        </div>
      )}

      <section className="mb-7">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Category</h2>
            <p className="mt-1 text-sm text-slate-500">Browse schemes by the areas that matter to you.</p>
          </div>
          {selectedCategory !== 'All' && <button onClick={() => { setSelectedCategory('All'); setSelectedMatchTier('All'); setSearchQuery(''); }} className="text-sm font-semibold text-sky-700 hover:text-sky-800">Show all</button>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categoriesList.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => navigate(`/category/${id}`)}
              aria-label={`Browse ${label} schemes`}
              className={`myschemes-category-card group rounded-2xl border bg-white p-5 text-left transition-all ${selectedCategory === id ? 'border-sky-400 ring-2 ring-sky-100' : 'border-slate-100'}`}
            >
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-50 text-sky-600 transition-colors group-hover:from-sky-500 group-hover:to-blue-600 group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <span className="block font-bold text-slate-800">{label}</span>
              <span className="mt-1 block min-h-10 text-xs leading-relaxed text-slate-500">{description}</span>
              <span className="mt-3 block text-xs font-semibold text-sky-700">Explore category <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></span>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: Search & Filters Toolbar */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search schemes, benefits, or departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-navy-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-hidden"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs font-bold text-navy-700 focus:border-primary-500 cursor-pointer"
            >
              <option value="relevant">Sort: Most Relevant</option>
              <option value="a-z">Sort: Name (A-Z)</option>
              <option value="deadline">Sort: Deadline Soon</option>
            </select>

            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex md:hidden items-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs font-bold text-navy-700"
            >
              <Filter className="h-4 w-4 text-primary-600" /> Filters
            </button>
          </div>
        </div>

        {/* Match level filter */}
        <div className="mt-4 hidden md:flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <div className="ml-auto flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-gray-400">Match Level:</span>
            <select
              disabled={isShowingCategory}
              value={selectedMatchTier}
              onChange={(e) => setSelectedMatchTier(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white py-1 px-2.5 text-xs font-bold text-navy-700 focus:border-primary-500 cursor-pointer"
            >
              {matchTiersList.map((tier) => (
                <option key={tier} value={tier}>{tier}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {showMobileFilters && (
          <div className="mt-4 border-t border-gray-100 pt-3 md:hidden space-y-3">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1.5">Match Level</p>
              <select
                disabled={isShowingCategory}
                value={selectedMatchTier}
                onChange={(e) => setSelectedMatchTier(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs font-bold"
              >
                {matchTiersList.map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Scheme Results Grid */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            {isShowingCategory ? `${visibleCategories.find(({ id }) => id === selectedCategory)?.label || 'Category'} schemes` : 'Recommended schemes'}
            {!categoryLoading && <span className="ml-2 text-sm font-semibold text-slate-500">({schemesToDisplay.length})</span>}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isShowingCategory ? 'Showing up to 10 schemes from the selected category, with benefit and eligibility details.' : 'Personalized recommendations based on your profile.'}
          </p>
        </div>
      </div>

      {(isShowingCategory ? categoryLoading : loading) ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="h-4 w-1/3 rounded bg-gray-200 mb-4" />
              <div className="h-6 w-3/4 rounded bg-gray-200 mb-2" />
              <div className="h-4 w-1/2 rounded bg-gray-100 mb-6" />
              <div className="h-16 w-full rounded bg-sky-50 mb-4" />
              <div className="h-20 w-full rounded bg-gray-50 mb-4" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (isShowingCategory ? categoryError : error) ? (
        <div className="rounded-2xl border border-error-200 bg-error-50/50 p-8 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-error-500" />
          <h3 className="mt-2 text-base font-bold text-navy-900">{isShowingCategory ? 'Category Load Error' : 'Recommendation Load Error'}</h3>
          <p className="mt-1 text-sm text-navy-600">{isShowingCategory ? categoryError : error}</p>
          <Button onClick={() => isShowingCategory ? setCategoryLoadAttempt((attempt) => attempt + 1) : loadUserAndSchemes()} variant="outline" size="sm" className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" /> Retry Loading
          </Button>
        </div>
      ) : schemesToDisplay.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xs">
          <Filter className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <h3 className="text-base font-bold text-navy-900">
            {isShowingCategory ? 'No schemes found in this category' : hasProfileData ? 'No schemes found matching your filter' : 'Add profile details to get personalized scheme suggestions'}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {isShowingCategory ? 'Try another category or clear your search.' : hasProfileData
              ? 'Try clearing search keywords or resetting match level filters.'
              : 'Enter your age, occupation, income, and category in Find Schemes.'}
          </p>
          {!isShowingCategory && !hasProfileData && (
            <Button to="/schemes" variant="outline" size="sm" className="mt-4">Open Find Schemes</Button>
          )}
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedMatchTier('All');
            }}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {schemesToDisplay.map((scheme) => {
            const sid = scheme.schemeId || scheme.id;
            const applicationUrl = getSchemeApplicationUrl(scheme);
            if (isShowingCategory) {
              const categoryLabel = visibleCategories.find(({ id }) => id === selectedCategory)?.label || 'Welfare';
              return (
                <Card key={sid} className="flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-6 shadow-card transition-all hover:border-sky-300 hover:shadow-xl">
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-2 border-b border-sky-100 pb-3">
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-2xs font-black uppercase text-sky-700">{categoryLabel}</span>
                      {scheme.level && <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-2xs font-semibold text-cyan-800">{scheme.level} scheme</span>}
                    </div>
                    <Link to={`/schemes/${sid}`} className="group block mb-1">
                      <h3 className="text-lg font-extrabold text-slate-800 transition-colors group-hover:text-sky-700">{scheme.name}</h3>
                    </Link>
                    <p className="mb-4 text-xs font-medium text-slate-500">{scheme.provider}</p>
                    <div className="mb-3 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-3.5">
                      <p className="mb-1 text-2xs font-black uppercase tracking-wider text-sky-700">Benefit</p>
                      <p className="line-clamp-4 text-xs font-semibold leading-relaxed text-slate-700">{scheme.benefitSummary || 'See scheme details for information about the benefits.'}</p>
                    </div>
                    {scheme.eligibility && (
                      <div className="mb-4 rounded-xl bg-slate-50 p-3.5">
                        <p className="mb-1 text-2xs font-black uppercase tracking-wider text-slate-500">Eligibility</p>
                        <p className="line-clamp-4 text-xs leading-relaxed text-slate-600">{scheme.eligibility}</p>
                      </div>
                    )}
                    {scheme.details && <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-slate-500">{scheme.details}</p>}
                  </div>
                  <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
                    <Button to={`/schemes/${sid}`} variant="outline" size="sm" className="flex-1 justify-center">View Details</Button>
                    <Button href={applicationUrl || undefined} disabled={!applicationUrl} title={!applicationUrl ? 'Application website is not provided in the scheme data.' : undefined} target="_blank" rel="noopener noreferrer" variant="primary" size="sm" className="flex-1 justify-center gap-1">
                      {applicationUrl ? 'Apply Now' : 'Apply link unavailable'} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            }
            const eligibilityAssessment = {
              label: scheme.eligibilityStatus || 'Needs more information',
              reason: scheme.missingInformation?.length
                ? `Check these scheme requirements: ${scheme.missingInformation.join(', ')}.`
                : 'The available profile information appears to fit the criteria the catalogue could compare. Confirm all scheme rules before applying.',
            };
            const assessmentColor = eligibilityAssessment.label === 'Potentially eligible'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : eligibilityAssessment.label === 'Needs more information'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-slate-200 bg-slate-100 text-slate-700';

            // Check if user has applied
            const app = applications.find(a => a.schemeId === sid || a.schemeName === scheme.name);
            const appStatus = app ? app.status : null;

            return (
              <Card
                key={sid}
                className="flex flex-col justify-between rounded-2xl border-2 border-primary-100 bg-white p-6 shadow-card hover:border-primary-400 hover:shadow-xl transition-all"
              >
                <div>
                  {/* Card Header: Category & Match Tier Badge */}
                  <div className="mb-4 flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <span className="truncate rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-2xs font-black uppercase text-sky-700">
                      {visibleCategories.find(({ id }) => scheme.tags?.includes(id))?.label || 'Welfare Scheme'}
                    </span>

                    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${assessmentColor}`}>
                      {eligibilityAssessment.label}
                    </div>
                  </div>

                  {/* Title & Department */}
                  <Link
                    to={`/schemes/${sid}`}
                    state={{ recommendation: { matchScore: scheme.matchScore, matchScoreLabel: scheme.matchScoreLabel, matchTier: scheme.matchTier, matchReasons: scheme.matchReasons, recommendationNote: scheme.recommendationNote } }}
                    className="group block mb-1"
                  >
                    <h3 className="text-lg font-extrabold text-navy-900 group-hover:text-primary-600 transition-colors">
                      {scheme.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-medium text-gray-500 mb-3">{scheme.provider}</p>

                  {/* Primary Benefit Summary */}
                  <div className="mb-4 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 p-3.5">
                    <span className="text-2xs font-black uppercase tracking-wider text-primary-700 block mb-0.5">
                      Benefit:
                    </span>
                    <p className="line-clamp-3 text-xs font-bold leading-snug text-navy-900">
                      {scheme.benefitSummary || 'See scheme details for information about the benefits.'}
                    </p>
                  </div>

                  <p className="mb-4 text-xs text-gray-500">
                    {eligibilityAssessment.reason}
                  </p>

                  {/* Application Status Badge if exists */}
                  {appStatus && (
                    <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-bold">
                      <span>Status:</span>
                      <span className="capitalize">{appStatus}</span>
                    </div>
                  )}

                  {/* Deadline Info */}
                </div>

                {/* Card Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
                  <Button to={`/schemes/${sid}`} state={{ recommendation: { matchScore: scheme.matchScore, matchScoreLabel: scheme.matchScoreLabel, matchTier: scheme.matchTier, matchReasons: scheme.matchReasons, recommendationNote: scheme.recommendationNote } }} variant="outline" size="sm" className="flex-1 justify-center">
                    View Details
                  </Button>
                  <Button href={applicationUrl || undefined} disabled={!applicationUrl} title={!applicationUrl ? 'Application website is not provided in the scheme data.' : undefined} target="_blank" rel="noopener noreferrer" variant="primary" size="sm" className="flex-1 justify-center gap-1">
                    {applicationUrl ? 'Apply Now' : 'Apply link unavailable'} <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
