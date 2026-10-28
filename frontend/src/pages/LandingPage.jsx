import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Sparkles, ArrowRight, MapPin, Calendar, Briefcase, Wallet, Lock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { CategoryCard } from '@/components/shared/CategoryCard';
import { states, occupations, incomeBrackets } from '@/data/mockData';
import { myschemeCategories } from '@/data/myschemeCategories';
import { useTranslation } from 'react-i18next';

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ state: '', age: '', occupation: '', income: '' });

  // Navigation flow for Find My Schemes button:
  // Logged in -> My Schemes (/applications)
  // Not Logged in -> Login (/login) with state: { from: '/applications' }
  const handleFindMySchemesClick = (e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/applications');
    } else {
      navigate('/login', { state: { from: '/applications' } });
    }
  };

  // Submit situation form to Explore Schemes page with search state
  const handleSituationFormSubmit = (e) => {
    e.preventDefault();
    navigate('/schemes', {
      state: {
        situation: form,
        autoRecommend: true
      }
    });
  };

  return (
    <div className="landing-page min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="landing-hero relative overflow-hidden">
        <div className="container-page relative flex items-center py-16 lg:py-20">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:gap-10">
            <div className="landing-hero-copy text-left">
              <h1 className="landing-hero-title landing-hero-title-gradient font-extrabold tracking-tight">
                {t('heroTitle')}
              </h1>
              <p className="landing-hero-description mt-6 max-w-2xl text-slate-600">
                {t('heroDesc')}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button onClick={() => document.getElementById('eligibility-checker')?.scrollIntoView({ behavior: 'smooth' })} size="lg" className="landing-hero-button landing-primary-button w-full rounded-xl sm:w-auto">
                  {t('checkEligibilityBtn')} <ArrowRight className="h-5 w-5" />
                </Button>
                <Button to="/schemes" variant="outline" size="lg" className="landing-hero-button landing-outline-button w-full rounded-xl sm:w-auto">
                  {t('exploreSchemes')} <Sparkles className="h-4 w-4 text-amber-500" />
                </Button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <Button onClick={handleFindMySchemesClick} variant="ghost" size="sm" className="h-auto px-0 text-sky-800 hover:bg-transparent hover:text-blue-700">
                  <Search className="h-4 w-4" /> {t('findMySchemes')}
                </Button>
                <Button to="/assistant" variant="ghost" size="sm" className="h-auto px-0 text-sky-800 hover:bg-transparent hover:text-blue-700">
                  <Sparkles className="h-4 w-4" /> {t('askAssistant')}
                </Button>
              </div>
            </div>
            <div className="landing-hero-image-slot mx-auto">
              <img
                src="/images/welfare-ai-hero.webp"
                alt="AI-powered welfare scheme eligibility checks and benefit tracking"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Anonymous Scheme Discovery Form */}
      <section id="eligibility-checker" className="container-page scroll-mt-24 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-sky-100 bg-white/95 p-6 shadow-xl shadow-sky-900/5 lg:p-8">
              <div className="mb-5 text-center">
                <h2 className="text-xl font-bold text-navy-900">{t('situationTitle')}</h2>
                <p className="mt-1 text-sm text-gray-500">{t('situationSub')}</p>
              </div>
              <form onSubmit={handleSituationFormSubmit} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="state" className="label-base">
                    <MapPin className="mr-1 inline h-4 w-4 text-sky-700" /> {t('location')}
                  </label>
                  <select id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-base" required>
                    <option value="">{t('selectState')}</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="age" className="label-base">
                    <Calendar className="mr-1 inline h-4 w-4 text-sky-700" /> {t('age')}
                  </label>
                  <input id="age" type="number" min={1} max={120} placeholder={t('enterAge')} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-base" required />
                </div>
                <div>
                  <label htmlFor="occupation" className="label-base">
                    <Briefcase className="mr-1 inline h-4 w-4 text-sky-700" /> {t('occupation')}
                  </label>
                  <select id="occupation" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className="input-base" required>
                    <option value="">{t('selectOccupation')}</option>
                    {occupations.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="income" className="label-base">
                    <Wallet className="mr-1 inline h-4 w-4 text-sky-700" /> {t('annIncome')}
                  </label>
                  <select id="income" value={form.income} onChange={(e) => setForm({ ...form, income: e.target.value })} className="input-base" required>
                    <option value="">{t('selectIncome')}</option>
                    {incomeBrackets.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" className="landing-primary-button w-full">
                    {t('findMySchemes')} <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </form>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
                <Lock className="h-3.5 w-3.5 text-sky-600" /> {t('privacyNote')}
              </p>
            </div>
          </div>
      </section>

      {/* Categories */}
      <section id="categories" className="landing-categories-section py-16 lg:py-20">
        <div className="container-page">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-flex rounded-full border border-sky-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-700">{t('exploreByArea')}</span>
            <h2 className="text-3xl font-extrabold text-sky-950 sm:text-4xl">{t('exploreCategories')}</h2>
            <p className="mt-2 text-base text-slate-600">{t('categoriesSub')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myschemeCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
