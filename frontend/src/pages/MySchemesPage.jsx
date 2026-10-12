import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Search, SlidersHorizontal, CheckCircle2, AlertCircle,
  ArrowRight, User, Calendar, MapPin, Briefcase, Wallet, Clock,
  RefreshCw, ShieldCheck, Filter, ChevronDown, Award, TrendingUp, X
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMe } from '@/services/api';
import { applications } from '@/data/mockData';
import { useTranslation } from 'react-i18next';
import { getSchemeApplicationUrl } from '@/utils/schemeLinks';
import { getPersonalizedSchemeRecommendations } from '@/data/myschemeDataset';
import { myschemeCategories } from '@/data/myschemeCategories';

function getMatchTier(score) {
  if (score >= 90) return { label: 'Strong Match', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (score >= 50) return { label: 'Potential Match', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  return { label: 'Needs Review', color: 'bg-gray-100 text-gray-700 border-gray-300' };
}

export function MySchemesPage() {
  const { t } = useTranslation();

  const [user, setUser] = useState(null);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
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
        occupation: fetchedUser?.occupation || '',
        income: fetchedUser?.income || '',
        annualIncomeINR: fetchedUser?.annualIncomeINR,
        socialCategory: fetchedUser?.socialCategory || '',
        isDifferentlyAbled: Boolean(fetchedUser?.isDifferentlyAbled),
        isWidow: Boolean(fetchedUser?.isWidow),
        motherWidowed: Boolean(fetchedUser?.motherWidowed),
        fullName: fetchedUser?.fullName || 'You',
      };
      setUser(userProfile);
      setRecommendedSchemes(await getPersonalizedSchemeRecommendations(userProfile));
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
    if (selectedCategory !== 'All' && !scheme.schemeCategories?.includes(selectedCategory)) return false;

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

  // Calculated Stats
  const highlyRelevantCount = recommendedSchemes.filter(s => s.matchScore >= 90).length;
  const strongMatchesCount = recommendedSchemes.filter(s => s.matchScore >= 50 && s.matchScore < 90).length;
  const approachingDeadlineCount = recommendedSchemes.filter(s => s.deadline && s.deadline !== '—' && !s.deadline.includes('Open')).length;
  const hasProfileData = Boolean(
    user?.state || user?.age || user?.occupation || user?.income
    || user?.annualIncomeINR != null || user?.socialCategory
  );

  const categoriesList = ['All', ...myschemeCategories.map((category) => category.name)];
  const matchTiersList = ['All', 'Strong Match', 'Potential Match', 'Needs Review'];

  return (
    <DashboardLayout
      title="My Schemes"
      subtitle="Personalized welfare schemes selected for you based on your profile."
    >
      {/* SECTION 1: Personalized Profile Summary Header */}
      <div className="mb-6 rounded-2xl border border-primary-200 bg-gradient-to-r from-purple-900 via-navy-900 to-primary-900 p-6 text-white shadow-lg lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-accent-300 border border-white/20 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-accent-400" /> ✨ Recommended for You
            </div>
            <h2 className="text-xl font-extrabold text-white sm:text-2xl">
              Curated for {user?.fullName || 'You'}
            </h2>
            <p className="text-xs text-purple-200 sm:text-sm">
              Recommendations are ranked using your profile and the eligibility details available in the MyScheme dataset. Confirm all requirements on the official scheme website before applying.
            </p>

            {/* Profile Metadata Chips */}
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              {user?.state && (
                <span className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 font-bold text-white border border-white/20">
                  <MapPin className="h-3.5 w-3.5 text-accent-400" /> {user.state}
                </span>
              )}
              {user?.age && (
                <span className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 font-bold text-white border border-white/20">
                  <Calendar className="h-3.5 w-3.5 text-accent-400" /> Age {user.age}
                </span>
              )}
              {user?.occupation && (
                <span className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 font-bold text-white border border-white/20">
                  <Briefcase className="h-3.5 w-3.5 text-accent-400" /> {user.occupation}
                </span>
              )}
              {user?.income && (
                <span className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 font-bold text-white border border-white/20">
                  <Wallet className="h-3.5 w-3.5 text-accent-400" /> {user.income}
                </span>
              )}
              {user?.annualIncomeINR != null && (
                <span className="flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 font-bold text-white border border-white/20">
                  <Wallet className="h-3.5 w-3.5 text-accent-400" /> ₹{Number(user.annualIncomeINR).toLocaleString('en-IN')} annual income
                </span>
              )}
              {user?.socialCategory && (
                <span className="rounded-lg bg-white/15 px-3 py-1.5 font-bold text-white border border-white/20">
                  {user.socialCategory} category
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 pt-2 lg:pt-0">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 px-4 py-2.5 text-xs font-bold transition-all shadow-sm"
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

          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 shadow-sm flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-200 text-purple-800">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-purple-950">{highlyRelevantCount}</p>
              <p className="text-xs font-medium text-purple-700">Highly Relevant Schemes</p>
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

        {/* Desktop Filter Chips */}
        <div className="mt-4 hidden md:flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <span className="text-2xs font-bold uppercase tracking-wider text-gray-400 mr-2">Category:</span>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-navy-700 hover:bg-purple-50 hover:text-primary-700'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-gray-400">Match Level:</span>
            <select
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
              <p className="text-xs font-bold text-gray-500 mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                      selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-navy-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1.5">Match Level</p>
              <select
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
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="h-4 w-1/3 rounded bg-gray-200 mb-4" />
              <div className="h-6 w-3/4 rounded bg-gray-200 mb-2" />
              <div className="h-4 w-1/2 rounded bg-gray-100 mb-6" />
              <div className="h-16 w-full rounded bg-purple-50 mb-4" />
              <div className="h-20 w-full rounded bg-gray-50 mb-4" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-error-200 bg-error-50/50 p-8 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-error-500" />
          <h3 className="mt-2 text-base font-bold text-navy-900">Recommendation Load Error</h3>
          <p className="mt-1 text-sm text-navy-600">{error}</p>
          <Button onClick={loadUserAndSchemes} variant="outline" size="sm" className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" /> Retry Loading
          </Button>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xs">
          <Filter className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <h3 className="text-base font-bold text-navy-900">
            {hasProfileData ? 'No schemes found matching your filter' : 'Add profile details to get personalized scheme suggestions'}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {hasProfileData
              ? 'Try clearing search keywords or resetting match level filters.'
              : 'Enter your age, occupation, income, and category in Find Schemes.'}
          </p>
          {!hasProfileData && (
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
          {filteredSchemes.map((scheme) => {
            const sid = scheme.schemeId || scheme.id;
            const applicationUrl = getSchemeApplicationUrl(scheme);
            const tierInfo = getMatchTier(scheme.matchScore ?? 0);

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
                    <span className="truncate rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-2xs font-black uppercase text-purple-700">
                      {scheme.schemeCategories?.[0] || 'Welfare Scheme'}
                    </span>

                    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black shadow-2xs ${tierInfo.color}`}>
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      {scheme.matchScore}% ({tierInfo.label})
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
                  <div className="mb-4 rounded-xl border border-primary-100 bg-gradient-to-r from-purple-50 to-primary-50/50 p-3.5">
                    <span className="text-2xs font-black uppercase tracking-wider text-primary-700 block mb-0.5">
                      Benefit:
                    </span>
                    <p className="line-clamp-3 text-xs font-bold leading-snug text-navy-900">
                      {scheme.benefitSummary || 'See scheme details for information about the benefits.'}
                    </p>
                  </div>

                  <p className="mb-4 text-xs text-gray-500">
                    Eligibility details and profile comparison are available on the scheme details page.
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
    </DashboardLayout>
  );
}
