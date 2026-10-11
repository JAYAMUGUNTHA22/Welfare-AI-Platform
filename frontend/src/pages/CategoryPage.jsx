import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight,
  CheckCircle2, Sparkles, Filter,
  ShieldCheck, Award, GraduationCap, Heart, Baby, Users, Stethoscope,
  Accessibility, Wheat, Briefcase, Home, Wallet, Rocket, MapPin, Building2,
  User, IndianRupee, Calendar
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { categories, datasetSchemes } from '@/data/mockData';
import { useTranslation } from 'react-i18next';

const iconMap = {
  education: GraduationCap, women: Heart, children: Baby, 'senior-citizens': Users,
  healthcare: Stethoscope, 'disability-support': Accessibility, agriculture: Wheat,
  employment: Briefcase, housing: Home, 'financial-assistance': Wallet,
  entrepreneurship: Rocket, scholarships: Award,
};

const PAGE_SIZE = 12;

// Colour coding for social category badges
const catBadgeStyle = {
  SC:      'bg-blue-50 text-blue-700 border-blue-200',
  ST:      'bg-orange-50 text-orange-700 border-orange-200',
  OBC:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  EWS:     'bg-pink-50 text-pink-700 border-pink-200',
  General: 'bg-gray-100 text-gray-700 border-gray-300',
};

export function CategoryPage() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery]     = useState('');
  const [stateFilter, setStateFilter]     = useState('all');
  const [socialFilter, setSocialFilter]   = useState('all');
  const [page, setPage]                   = useState(1);

  // Reset page whenever filters change
  useEffect(() => { setPage(1); }, [id, searchQuery, stateFilter, socialFilter]);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const categoryInfo = categories.find(c => c.id === id) || {
    id: id || 'welfare',
    name: (id || 'Welfare').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: 'Explore welfare schemes and benefits tailored for this sector.',
    schemeCount: 0,
    icon: 'Award',
  };

  const IconComponent = iconMap[categoryInfo.id] || Award;

  // All schemes for this category (primary OR tag match)
  const categorySchemes = useMemo(() => {
    const selLower = (id || '').toLowerCase();
    return datasetSchemes.filter(s => {
      const cat  = (s.category || '').toLowerCase();
      const tags = (s.tags || []).map(t => t.toLowerCase());
      return cat === selLower || tags.includes(selLower);
    });
  }, [id]);

  // Unique states & social categories for filter chips
  const uniqueStates  = useMemo(() => [...new Set(categorySchemes.map(s => s.state).filter(Boolean))].sort(), [categorySchemes]);
  const uniqueSocial  = useMemo(() => [...new Set(categorySchemes.map(s => s.socialCategory).filter(Boolean))].sort(), [categorySchemes]);

  // Apply search + filters
  const filteredSchemes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return categorySchemes.filter(s => {
      const matchSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.state?.toLowerCase().includes(q) ||
        s.socialCategory?.toLowerCase().includes(q) ||
        s.benefitSummary?.toLowerCase().includes(q);
      const matchState  = stateFilter  === 'all' || s.state          === stateFilter;
      const matchSocial = socialFilter === 'all' || s.socialCategory === socialFilter;
      return matchSearch && matchState && matchSocial;
    });
  }, [categorySchemes, searchQuery, stateFilter, socialFilter]);

  const totalPages   = Math.max(1, Math.ceil(filteredSchemes.length / PAGE_SIZE));
  const pagedSchemes = filteredSchemes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const otherCategories = categories.filter(c => c.id !== categoryInfo.id && c.schemeCount > 0);

  const formatIncome = raw => {
    const n = parseInt(raw, 10);
    if (isNaN(n)) return raw;
    return `₹${(n / 100000).toFixed(1)}L`;
  };

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
        <div className="mb-10 overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-navy-950 via-navy-900 to-primary-950 text-white shadow-xl">
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
                    {categoryInfo.name} Welfare Schemes
                  </h1>
                  <p className="mt-3 text-sm sm:text-base text-purple-200 max-w-2xl leading-relaxed">
                    {categoryInfo.description}. Explore comprehensive benefits, subsidies, and social security programs available under this category.
                  </p>
                </div>
              </div>

              {/* Count box */}
              <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md shadow-lg lg:min-w-[200px]">
                <span className="text-4xl font-black text-white block">{categorySchemes.length}</span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-200 block mt-1">Total Entries</span>
                <span className="text-2xl font-black text-emerald-300 block mt-2">{filteredSchemes.length}</span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 block">Matching Filters</span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/10 pt-6">
              <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
                <span className="text-2xs font-bold text-purple-200 uppercase block">Dataset Entries</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">{categorySchemes.length} records</span>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
                <span className="text-2xs font-bold text-purple-200 uppercase block">States Covered</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">{uniqueStates.length} states</span>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
                <span className="text-2xs font-bold text-purple-200 uppercase block">Application Mode</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">Online Portal + CSC</span>
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
                <span className="text-2xs font-bold text-purple-200 uppercase block">Coverage</span>
                <span className="text-xs font-extrabold text-white mt-0.5 block">All Indian States</span>
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
              placeholder={`Search in ${categoryInfo.name} (scheme name, state, category…)`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-base pl-10 py-2.5 w-full"
            />
          </div>

          {/* State chips */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Filter by State
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStateFilter('all')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${stateFilter === 'all' ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-navy-700 hover:bg-gray-200'}`}
              >
                All States
              </button>
              {uniqueStates.map(s => (
                <button
                  key={s}
                  onClick={() => setStateFilter(s)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${stateFilter === s ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-navy-700 hover:bg-gray-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Social category chips */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <User className="h-3 w-3" /> Filter by Social Category
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSocialFilter('all')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${socialFilter === 'all' ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-navy-700 hover:bg-gray-200'}`}
              >
                All Categories
              </button>
              {uniqueSocial.map(c => (
                <button
                  key={c}
                  onClick={() => setSocialFilter(c)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${socialFilter === c ? 'bg-primary-600 text-white shadow-xs' : 'bg-gray-100 text-navy-700 hover:bg-gray-200'}`}
                >
                  {c}
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

          {filteredSchemes.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xs">
              <Building2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-base font-bold text-navy-900">No schemes found</h3>
              <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filters.</p>
              <button
                className="mt-4 rounded-lg px-4 py-2 text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                onClick={() => { setSearchQuery(''); setStateFilter('all'); setSocialFilter('all'); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pagedSchemes.map(scheme => (
                <Card
                  key={scheme.id}
                  className="flex flex-col justify-between p-5 transition-all hover:border-primary-400 hover:shadow-lg border-2 group"
                >
                  {/* Header badges */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-2xs font-extrabold text-primary-700 capitalize">
                      {categoryInfo.name}
                    </span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-2xs font-black text-emerald-700">
                      ✓ Verified
                    </span>
                  </div>

                  {/* Scheme name */}
                  <Link to={`/schemes/${scheme.schemeId}`} className="group block mb-1">
                    <h3 className="text-base font-extrabold text-navy-900 group-hover:text-primary-600 transition-colors leading-snug">
                      {scheme.name}
                    </h3>
                  </Link>
                  <p className="text-2xs font-semibold text-gray-400 mb-3">{scheme.provider}</p>

                  {/* Dataset profile badges */}
                  <div className="mb-3 grid grid-cols-2 gap-1.5">
                    <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1.5">
                      <MapPin className="h-3 w-3 text-primary-500 shrink-0" />
                      <span className="text-2xs font-bold text-navy-800 truncate">{scheme.state}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${catBadgeStyle[scheme.socialCategory] || catBadgeStyle.General}`}>
                      <User className="h-3 w-3 shrink-0" />
                      <span className="text-2xs font-bold truncate">{scheme.socialCategory}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1.5">
                      <Calendar className="h-3 w-3 text-purple-500 shrink-0" />
                      <span className="text-2xs font-bold text-navy-800">Age {scheme.age} yrs</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1.5">
                      <IndianRupee className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="text-2xs font-bold text-emerald-800">{formatIncome(scheme.annualIncome)}/yr</span>
                    </div>
                  </div>

                  {/* Benefit highlight */}
                  <div className="mb-3 rounded-xl border border-primary-100 bg-gradient-to-r from-purple-50 to-primary-50/60 p-3">
                    <p className="text-2xs font-black uppercase tracking-wider text-primary-700 mb-0.5">🎁 Benefit</p>
                    <p className="text-xs font-bold text-navy-900 leading-snug">{scheme.benefitSummary}</p>
                    {scheme.benefitAmount && (
                      <span className="mt-1.5 inline-block rounded-md bg-primary-600 px-2 py-0.5 text-2xs font-bold text-white">
                        {scheme.benefitAmount}
                      </span>
                    )}
                  </div>

                  {/* Key benefits */}
                  {scheme.benefits && scheme.benefits.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {scheme.benefits.slice(0, 2).map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-2xs text-navy-700 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Action */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100 mt-auto">
                    <Button to={`/schemes/${scheme.schemeId}`} variant="outline" size="sm" className="flex-1 justify-center text-xs">
                      Details
                    </Button>
                    <Button to={`/schemes/${scheme.schemeId}`} variant="primary" size="sm" className="flex-1 justify-center gap-1 text-xs shadow-xs">
                      Apply <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
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
