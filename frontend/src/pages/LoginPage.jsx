import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, Lock, Eye, EyeOff, Globe, AlertCircle, Sparkles, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { login } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { changePreferredLanguage, normalizeLanguage, supportedLanguages } from '@/utils/languagePreferences';

const DEMO_EMAIL    = 'demo@welfareai.in';
const DEMO_PASSWORD = 'Demo@1234';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode]               = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [copied, setCopied]             = useState(false);
  const [language, setLanguage]         = useState(() => normalizeLanguage(localStorage.getItem('userLanguage') || 'English'));

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setMode('email');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const redirectTarget = location.state?.from || '/dashboard';

  const handleLanguageChange = (lng) => {
    setLanguage(lng);
    void changePreferredLanguage(lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'email') {
        const data = await login({ email, password });
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        navigate(redirectTarget, { replace: true });
      } else {
        // Mobile/OTP login — navigates without a real token (demo mode only)
        navigate(redirectTarget, { replace: true });
      }
    } catch (err) {
      // ⚠️ IMPORTANT: No fallback bypass here — must show the real error
      setError(
        err.message ||
          t('invalidCredentials', {
            defaultValue: 'Invalid email or password. Please try again.',
          })
      );
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
            <h1 className="mt-4 text-2xl font-bold text-navy-900">{t('authWelcome')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('authLoginSub')}</p>
          </div>

          {/* ── Demo credentials banner ── */}
          <div className="mb-5 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 via-sky-50 to-primary-50 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-xs font-black uppercase tracking-wider text-primary-700">Demo Account</span>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700 transition-colors shadow-xs"
              >
                {copied ? <CheckCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Filled!' : 'Use Demo'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white border border-primary-100 px-3 py-2">
                <p className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-xs font-extrabold text-navy-900 mt-0.5 break-all">{DEMO_EMAIL}</p>
              </div>
              <div className="rounded-lg bg-white border border-primary-100 px-3 py-2">
                <p className="text-2xs font-bold text-gray-400 uppercase tracking-wider">Password</p>
                <p className="text-xs font-extrabold text-navy-900 mt-0.5">{DEMO_PASSWORD}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card lg:p-8">
            {/* Mode toggle */}
            <div className="mb-5 flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setMode('email')}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  mode === 'email' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Mail className="mr-1.5 inline h-4 w-4" /> {t('emailAddress')}
              </button>
              <button
                type="button"
                onClick={() => setMode('mobile')}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  mode === 'mobile' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Phone className="mr-1.5 inline h-4 w-4" /> {t('mobileNumber')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'email' ? (
                <div>
                  <label htmlFor="login-email" className="label-base">
                    {t('emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-base pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="login-mobile" className="label-base">
                    {t('mobileNumber')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      id="login-mobile"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="input-base pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="login-password" className="label-base">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('enterPassword')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-base pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm text-navy-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  {t('rememberMe')}
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t('loggingIn', { defaultValue: 'Signing in...' })}
                  </span>
                ) : (
                  t('login')
                )}
              </Button>
            </form>

            {/* Language selector */}
            <div className="mt-5 border-t border-gray-100 pt-4">
              <label htmlFor="login-lang" className="label-base mb-1.5">
                <Globe className="mr-1 inline h-4 w-4" />{' '}
                {t('common.language', { defaultValue: 'Language' })}
              </label>
              <select
                id="login-lang"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="input-base"
              >
                {supportedLanguages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <p className="text-center text-sm text-navy-600">
                {t('noAccount')}{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  {t('signUp')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
