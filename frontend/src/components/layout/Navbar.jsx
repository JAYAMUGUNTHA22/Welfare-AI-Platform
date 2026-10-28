import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShieldCheck,
  LogIn,
  UserPlus,
  Sparkles,
  Globe,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from 'react-i18next';
import { changePreferredLanguage, supportedLanguages } from '@/utils/languagePreferences';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleLanguageChange = (event) => { void changePreferredLanguage(event.target.value); };
  const navLinks = [
    { label: "mySchemes", to: "/my-schemes" },
    { label: "findSchemes", to: "/schemes" },
    { label: "categories", to: "/#categories" },
    { label: "howItWorks", to: "/#how-it-works" },
    { label: "about", to: "/#trust" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="landing-brand-icon flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-navy-900">WelfareAI</span>
            <span className="ml-1.5 hidden text-xs font-semibold text-sky-700 sm:inline">
              {t('navTagline')}
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="rounded-xl px-3 py-2.5 text-[15px] font-semibold text-slate-700 transition-colors hover:text-sky-800 hover:bg-sky-50"
            >
              {link.label === 'mySchemes'
                ? t('menu.mySchemes', { defaultValue: 'My Schemes' })
                : t(`nav.${link.label}`, { defaultValue: link.label })}
            </Link>
          ))}

          {/* Language Dropdown Selector */}
          <div className="relative ml-2">
            <Globe className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-600" />
            <select
              value={i18n.language}
              onChange={handleLanguageChange}
              className="rounded-lg border border-sky-100 bg-white py-1.5 pl-8 pr-3 text-sm font-medium text-slate-700 focus:border-sky-400 cursor-pointer"
              aria-label={t('common.changeLanguage', { defaultValue: 'Select language' })}
            >
              {supportedLanguages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Login / Profile Actions */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 ml-2">
              <Button to="/dashboard" variant="primary" size="sm" className="landing-nav-primary gap-1.5">
                <LayoutDashboard className="h-4 w-4" /> {t('nav.dashboard', { defaultValue: 'Dashboard' })}
              </Button>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-200 p-2 text-navy-600 hover:bg-gray-50 hover:text-error-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button to="/login" variant="ghost" size="sm">
                <LogIn className="h-4 w-4" /> {t('login')}
              </Button>
              <Button to="/register" variant="primary" size="sm" className="landing-nav-primary">
                <UserPlus className="h-4 w-4" /> {t('signUp')}
              </Button>
            </div>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-navy-700 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-gray-100 bg-white md:hidden animate-slide-down">
          <div className="container-page space-y-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-3 text-base font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-800"
              >
                {link.label === 'mySchemes'
                  ? t('menu.mySchemes', { defaultValue: 'My Schemes' })
                  : t(`nav.${link.label}`, { defaultValue: link.label })}
              </Link>
            ))}
            <div className="flex items-center gap-2 px-3 py-2">
              <Globe className="h-4 w-4 text-sky-600" />
              <select
                value={i18n.language}
                onChange={handleLanguageChange}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
                aria-label={t('common.changeLanguage', { defaultValue: 'Select language' })}
              >
                {supportedLanguages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {isLoggedIn ? (
              <div className="flex flex-col gap-2 pt-2">
              <Button to="/dashboard" variant="primary" size="sm" className="landing-nav-primary w-full justify-center">
                  <LayoutDashboard className="h-4 w-4" /> {t('nav.dashboard', { defaultValue: 'Dashboard' })}
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" className="w-full justify-center text-error-600 border-error-200">
                  <LogOut className="h-4 w-4" /> {t('logout', { defaultValue: 'Logout' })}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button to="/login" variant="outline" size="sm" className="flex-1">
                  <LogIn className="h-4 w-4" /> {t('login')}
                </Button>
                <Button to="/register" variant="primary" size="sm" className="landing-nav-primary flex-1">
                  <UserPlus className="h-4 w-4" /> {t('signUp')}
                </Button>
              </div>
            )}
            <Link
              to="/assistant"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-navy-50 px-3 py-2.5 text-sm font-semibold text-navy-700"
            >
                <Sparkles className="h-4 w-4 text-sky-600" /> {t('askAssistant')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
