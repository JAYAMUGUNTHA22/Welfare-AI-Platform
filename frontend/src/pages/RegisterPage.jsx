import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Mail, Phone, MapPin, ArrowRight, Globe, CreditCard, FileText, Users, IndianRupee, Calendar, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { states } from '@/data/mockData';
import { registerCitizen } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { changePreferredLanguage, normalizeLanguage, supportedLanguages } from '@/utils/languagePreferences';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => normalizeLanguage(localStorage.getItem('userLanguage') || 'English'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.target;
    const citizenData = {
      fullName: form.name.value.trim(),
      email: form.email.value.trim(),
      mobile: form.mobile.value.trim(),
      state: form.state.value,
      password: form.password.value,
      language,
      aadharNumber: form.aadharNumber.value.trim(),
      rationCard: form.rationCard.value.trim(),
      age: form.age.value ? Number(form.age.value) : undefined,
      gender: form.gender.value || undefined,
      occupation: form.occupation.value,
      socialCategory: form.socialCategory.value,
      annualIncomeINR: form.annualIncomeINR.value ? Number(form.annualIncomeINR.value) : undefined,
    };

    try {
      const { token, user } = await registerCitizen(citizenData);
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      // Persist the chosen language
      localStorage.setItem('userLanguage', language);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50/40 to-white">
      <div className="container-page flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-navy-900">{t('createAccount')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('registerSub')}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card lg:p-8">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="label-base">{t('fullName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input id="name" name="name" type="text" placeholder={t('fullNamePlaceholder')} className="input-base pl-10" required />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="label-base">{t('emailAddress')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input id="email" name="email" type="email" placeholder="you@example.com" className="input-base pl-10" required />
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="label-base">{t('mobileNumber')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input id="mobile" name="mobile" type="tel" placeholder="+91 98765 43210" className="input-base pl-10" required />
                </div>
              </div>

              <div>
                <label htmlFor="state" className="label-base">
                  <MapPin className="mr-1 inline h-4 w-4" /> {t('profile.state')}
                </label>
                <select id="state" name="state" className="input-base" required>
                  <option value="">{t('selectYourState')}</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="aadharNumber" className="label-base">{t('aadhar')}</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input id="aadharNumber" name="aadharNumber" type="text" placeholder={t('aadharPlaceholder')} className="input-base pl-10" />
                </div>
              </div>

              <div>
                <label htmlFor="rationCard" className="label-base">{t('rationCard')}</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input id="rationCard" name="rationCard" type="text" placeholder={t('rationPlaceholder')} className="input-base pl-10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="label-base">
                    <Calendar className="mr-1 inline h-4 w-4" /> {t('age')}
                  </label>
                  <input id="age" name="age" type="number" min="1" max="120" placeholder={t('enterAge')} className="input-base" />
                </div>
                <div>
                  <label htmlFor="socialCategory" className="label-base">
                    <Users className="mr-1 inline h-4 w-4" /> {t('profile.socialCategory')}
                  </label>
                  <select id="socialCategory" name="socialCategory" className="input-base">
                    <option value="">{t('selectCategory')}</option>
                    {['General', 'OBC', 'SC', 'ST', 'EWS'].map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="label-base">Gender (optional)</label>
                <select id="gender" name="gender" className="input-base">
                  <option value="">Prefer not to say</option>
                  {['Female', 'Male', 'Other'].map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="occupation" className="label-base">
                  <Briefcase className="mr-1 inline h-4 w-4" /> {t('profile.occupation')}
                </label>
                <select id="occupation" name="occupation" className="input-base">
                  <option value="">Select your occupation</option>
                  {['Student', 'Farmer', 'Salaried Employee', 'Self-employed / Entrepreneur', 'Worker / Labourer', 'Unemployed', 'Other'].map((occupation) => (
                    <option key={occupation} value={occupation}>{occupation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="annualIncomeINR" className="label-base">
                  <IndianRupee className="mr-1 inline h-4 w-4" /> {t('annualIncome')}
                </label>
                <input id="annualIncomeINR" name="annualIncomeINR" type="number" min="0" placeholder={t('incomePlaceholder')} className="input-base" />
              </div>

              <div>
                <label htmlFor="password" className="label-base">{t('password')}</label>
                <input id="password" name="password" type="password" placeholder={t('createPassword')} className="input-base" minLength={6} required />
              </div>

              <label className="flex items-start gap-2 text-sm text-navy-600">
                <input type="checkbox" className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" required />
                <span>{t('terms')}</span>
              </label>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? t('creatingAccount') : <>{t('createAccount')} <ArrowRight className="h-5 w-5" /></>}
              </Button>
            </form>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <label htmlFor="lang" className="label-base">
                <Globe className="mr-1 inline h-4 w-4" /> {t('common.language', { defaultValue: 'Language' })}
              </label>
              <select id="lang" value={language} onChange={(event) => { setLanguage(event.target.value); void changePreferredLanguage(event.target.value); }} className="input-base">
                {supportedLanguages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 text-center">
              <Button to="/dashboard" variant="ghost" size="md" className="w-full">
                <User className="h-4 w-4" /> Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
