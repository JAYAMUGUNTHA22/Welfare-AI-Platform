import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Search, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight,
  ShieldCheck, Award, GraduationCap, Heart, Baby, Users, Stethoscope,
  Accessibility, Wheat, Briefcase, Home, Wallet, Rocket, MapPin, Building2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { myschemeCategories } from '@/data/myschemeCategories';
import { loadMyschemeSchemes } from '@/data/myschemeDataset';
import { getSchemeApplicationUrl } from '@/utils/schemeLinks';

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

const PAGE_SIZE = 10;

export function CategoryPage() {
  const { id } = useParams();

  const [searchQuery, setSearchQuery]     = useState('');
  const [levelFilter, setLevelFilter]     = useState('all');
  const [page, setPage]                   = useState(1);
  const [allSchemes, setAllSchemes]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [loadError, setLoadError]         = useState('');

  // Reset page whenever filters change
  useEffect(() => { setPage(1); }, [id, searchQuery, levelFilter]);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  useEffect(() => {
    let active = true;

    loadMyschemeSchemes()
      .then((schemes) => {
        if (active) setAllSchemes(schemes);
      })
      .catch((error) => {
        console.error('Failed to load MyScheme category data', error);
        if (active) setLoadError('We could not load schemes for this category. Please try again later.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const categoryInfo = myschemeCategories.find(c => c.id === id) || {
    id: id || 'welfare',
    name: (id || 'Welfare').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: 'Explore welfare schemes and benefits tailored for this sector.',
    schemeCount: 0,
    icon: 'Award',
  };

  const IconComponent = iconMap[categoryInfo.id] || Award;

  // Match the selected category against the categories assigned in schemeCategory.
  const categorySchemes = useMemo(() => {
    const selLower = (id || '').toLowerCase();
    const uniqueSchemes = new Map();
    allSchemes.forEach((scheme) => {
      if (scheme.tags.includes(selLower) && !uniqueSchemes.has(scheme.schemeId)) {
        uniqueSchemes.set(scheme.schemeId, scheme);
      }
    });
    return [...uniqueSchemes.values()];
  }, [allSchemes, id]);

  const centralSchemeCount = categorySchemes.filter((scheme) => scheme.level === 'Central').length;
  const stateSchemeCount = categorySchemes.filter((scheme) => scheme.level === 'State').length;

  // Apply search + filters
  const filteredSchemes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return categorySchemes.filter(s => {
      const matchSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.details?.toLowerCase().includes(q) ||
        s.benefitSummary?.toLowerCase().includes(q);
      const matchLevel = levelFilter === 'all' || s.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [categorySchemes, searchQuery, levelFilter]);

  const totalPages   = Math.max(1, Math.ceil(filteredSchemes.length / PAGE_SIZE));
  const pagedSchemes = filteredSchemes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const otherCategories = myschemeCategories.filter(c => c.id !== categoryInfo.id && c.schemeCount > 0);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />

      <main className="container-page flex-1 py-8 lg:py-12">
        {/* Back */}
        <div className="mb-6">
          <Link to="/#categories" className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to All Categories
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-10 overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-sky-600 via-blue-700 to-sky-800 text-white shadow-xl">
          <div className="relative p-6 sm:p-10 lg:p-12">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-500/20 text-white border border-primary-400/30 backdrop-blur-md shadow-inner">
                  <IconComponent className="h-8 w-8 text-primary-300" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full bg-primary-500/20 border border-primary-400/30 px-3.5 py-1 text-xs font-bold text-primary-200">
                      Official Government Sector
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Dataset
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl tracking-tight">
                    {categoryInfo.name} Schemes
                  </h1>
                  <p className="mt-3 text-sm sm:text-base text-sky-200 max-w-2xl leading-relaxed">
                    {categoryInfo.description}. Explore comprehensive benefits, subsidies, and social security programs available under this category.
                  </p>
                </div>
              </div>

              {/* Count box */}
              <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md shadow-lg lg:min-w-[200px]">
                <span className="text-4xl font-black text-white block">
                  {loading ? categoryInfo.schemeCount : categorySchemes.length}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-200 block mt-1">Total Schemes</span>
                <span className="text-2xl font-black text-emerald-300 block mt-2">{filteredSchemes.length}</span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">Matching Filters</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-6">
              <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
                <span className="text-2xs font-bold text-sky-200 uppercase block">Schemes Listed</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">{categorySchemes.length} schemes</span>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
                <span className="text-2xs font-bold text-sky-200 uppercase block">Central Schemes</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">{centralSchemeCount}</span>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
                <span className="text-2xs font-bold text-sky-200 uppercase block">State Schemes</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">{stateSchemeCount}</span>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
                <span className="text-2xs font-bold text-sky-200 uppercase block">Source</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">MyScheme</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-card space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search in ${categoryInfo.name} schemes`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-base pl-10 py-2.5 w-full"
            />
          </div>

          {/* Scheme level chips */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Filter by Scheme Level
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLevelFilter('all')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${levelFilter === 'all' ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-navy-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              {['Central', 'State'].map(level => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${levelFilter === level ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-navy-700 hover:bg-gray-200'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scheme grid */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-navy-900">
              Schemes ({filteredSchemes.length})
              <span className="ml-2 text-sm font-semibold text-gray-400">· Page {page} of {totalPages}</span>
            </h2>
            <span className="text-xs font-semibold text-gray-500 hidden sm:block">
              Showing {pagedSchemes.length} of {filteredSchemes.length} entries
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xs text-sm text-gray-500">
              Loading schemes from MyScheme…
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center shadow-xs text-sm text-red-700">
              {loadError}
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xs">
              <Building2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-base font-bold text-navy-900">No schemes found</h3>
              <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</p>
              <button
                className="mt-4 rounded-lg px-4 py-2 text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                onClick={() => { setSearchQuery(''); setLevelFilter('all'); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pagedSchemes.map(scheme => {
                const applicationUrl = getSchemeApplicationUrl(scheme);
                return (
                <Card
                  key={scheme.id}
                  className="flex flex-col justify-between p-5 transition-all hover:border-primary-400 hover:shadow-lg border-2 group"
                >
                  {/* Header badges */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-2xs font-extrabold text-primary-700 capitalize">
                      {categoryInfo.name}
                    </span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-2xs font-black text-emerald-700">
                      ✓ Verified
                    </span>
                  </div>

                  {/* Scheme name */}
                  <Link to={`/schemes/${scheme.schemeId || scheme.id}`} className="group block mb-1">
                    <h3 className="text-base font-extrabold text-navy-900 group-hover:text-primary-600 transition-colors leading-snug">
                      {scheme.name}
                    </h3>
                  </Link>
                  <p className="text-2xs font-semibold text-gray-400 mb-3">{scheme.provider}</p>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {scheme.schemeCategories.map(category => (
                      <span key={category} className="rounded-full bg-gray-100 px-2.5 py-1 text-2xs font-semibold text-gray-600">
                        {category}
                      </span>
                    ))}
                    {scheme.level && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-2xs font-semibold text-blue-700">
                        {scheme.level}
                      </span>
                    )}
                  </div>

                  {/* Benefit highlight */}
                  <div className="mb-3 rounded-xl border border-primary-100 bg-gradient-to-r from-sky-50 to-primary-50/60 p-3">
                    <p className="text-2xs font-black uppercase tracking-wider text-primary-700 mb-0.5">🎁 Benefit</p>
                    <p className="text-xs font-bold text-navy-900 leading-snug line-clamp-4">{scheme.benefitSummary || scheme.details}</p>
                  </div>

                  {scheme.details && (
                    <p className="mb-3 text-xs leading-relaxed text-navy-700 line-clamp-3">
                      {scheme.details}
                    </p>
                  )}

                  {/* Action */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 mt-auto">
                    <Button to={`/schemes/${scheme.schemeId || scheme.id}`} variant="outline" size="sm" className="flex-1 justify-center text-xs">
                      Details
                    </Button>
                    <Button href={applicationUrl || undefined} disabled={!applicationUrl} title={!applicationUrl ? 'Application website is not provided in the scheme data.' : undefined} target="_blank" rel="noopener noreferrer" variant="primary" size="sm" className="flex-1 justify-center gap-1 text-xs shadow-xs">
                      {applicationUrl ? 'Apply' : 'Apply link unavailable'} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mb-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold bg-white border border-gray-200 text-navy-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            {/* Page number pills */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (page <= 4) {
                p = i + 1;
              } else if (page >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = page - 3 + i;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded-lg w-9 h-9 text-xs font-bold transition-all ${
                    p === page
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-navy-700 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold bg-white border border-gray-200 text-navy-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Other categories */}
        <div className="border-t border-gray-200 pt-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-navy-900">Explore Other Welfare Sectors</h2>
              <p className="text-xs text-gray-500">Discover benefits across other active welfare categories.</p>
            </div>
            <Link to="/#categories" className="text-xs font-bold text-primary-600 hover:text-primary-700">
              View All →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherCategories.slice(0, 4).map(cat => {
              const CatIcon = iconMap[cat.id] || Award;
              return (
                <Link key={cat.id} to={`/category/${cat.id}`} className="group block">
                  <Card className="p-4 transition-all hover:border-primary-400 hover:shadow-md cursor-pointer h-full flex flex-col justify-between" hover>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <CatIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-navy-900 group-hover:text-primary-600 transition-colors">{cat.name}</h3>
                        <p className="text-xs font-semibold text-primary-600">{cat.schemeCount} schemes</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
