import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Sparkles, ArrowRight, ShieldCheck, CheckCircle2,
  Building2, HandHeart, Landmark, FileCheck, Info, MapPin,
  Calendar, Briefcase, Wallet, Lock, Globe,
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-100/70 to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-100/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-100/30 blur-3xl" />
        </div>
        <div className="container-page relative py-16 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-700">
              <Sparkles className="h-4 w-4 text-accent-500" /> {t('landingSubtitleBadge', { defaultValue: 'AI-Powered Welfare Scheme Discovery' })}
            </div>
            <h1 className="text-4xl font-extrabold text-navy-900 sm:text-5xl lg:text-6xl leading-tight">{t('landingTitle')}</h1>
            <p className="mt-5 text-lg text-navy-600 leading-relaxed sm:text-xl">{t('landingSub')}</p>
            <div className="mt-4 text-sm font-semibold text-primary-600">{t('simplePersonalized')}</div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={handleFindMySchemesClick} size="lg" className="w-full sm:w-auto">
                <Search className="h-5 w-5" /> {t('findMySchemes')}
              </Button>
              <Button to="/schemes" variant="outline" size="lg" className="w-full sm:w-auto">
                {t('exploreSchemes')} <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4">
              <Button to="/assistant" variant="ghost" size="md">
                <Sparkles className="h-4 w-4 text-accent-500" /> {t('askAssistant')}
              </Button>
            </div>
          </div>

          {/* Anonymous Scheme Discovery Form */}
          <div className="mx-auto mt-14 max-w-3xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card lg:p-8">
              <div className="mb-5 text-center">
                <h2 className="text-xl font-bold text-navy-900">{t('situationTitle')}</h2>
                <p className="mt-1 text-sm text-gray-500">{t('situationSub')}</p>
              </div>
              <form onSubmit={handleSituationFormSubmit} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="state" className="label-base">
                    <MapPin className="mr-1 inline h-4 w-4 text-primary-600" /> {t('location')}
                  </label>
                  <select id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-base" required>
                    <option value="">{t('selectState')}</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="age" className="label-base">
                    <Calendar className="mr-1 inline h-4 w-4 text-primary-600" /> {t('age')}
                  </label>
                  <input id="age" type="number" min={1} max={120} placeholder={t('enterAge')} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="input-base" required />
                </div>
                <div>
                  <label htmlFor="occupation" className="label-base">
                    <Briefcase className="mr-1 inline h-4 w-4 text-primary-600" /> {t('occupation')}
                  </label>
                  <select id="occupation" value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className="input-base" required>
                    <option value="">{t('selectOccupation')}</option>
                    {occupations.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="income" className="label-base">
                    <Wallet className="mr-1 inline h-4 w-4 text-primary-600" /> {t('annIncome')}
                  </label>
                  <select id="income" value={form.income} onChange={(e) => setForm({ ...form, income: e.target.value })} className="input-base" required>
                    <option value="">{t('selectIncome')}</option>
                    {incomeBrackets.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" className="w-full">
                    {t('findMySchemes')} <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </form>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
                <Lock className="h-3.5 w-3.5 text-primary-500" /> {t('privacyNote')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="container-page py-16 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-navy-900">{t('exploreCategories')}</h2>
          <p className="mt-2 text-base text-gray-500">{t('categoriesSub')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myschemeCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
