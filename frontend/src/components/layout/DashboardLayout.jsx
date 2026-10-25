import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Search, FileText, Wallet, FolderOpen, Sparkles,
  GitCompare, SlidersHorizontal, MessageSquare, User, LogOut,
  ShieldCheck, Menu, X, ChevronLeft, Globe, ChevronDown
} from 'lucide-react';
import { getMe, updateCitizen } from '@/services/api';
import { useTranslation } from 'react-i18next';

const navItems = [
  { label: 'dashboard', to: '/dashboard', icon: Home },
  { label: 'mySchemes', to: '/my-schemes', icon: Sparkles },
  { label: 'myApplications', to: '/applications', icon: FileText },
  { label: 'myBenefits', to: '/benefits', icon: Wallet },
  { label: 'documents', to: '/documents', icon: FolderOpen },
  { label: 'aiAssistant', to: '/assistant', icon: MessageSquare },
  { label: 'whatIf', to: '/what-if', icon: SlidersHorizontal },
  { label: 'compareSchemes', to: '/compare', icon: GitCompare },
  { label: 'feedback', to: '/feedback', icon: MessageSquare },
];

export function DashboardLayout({ children, title, subtitle, backTo }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { user } = await getMe();
        setUser(user);
      } catch (e) {
        console.error('Failed to fetch user in layout', e);
      }
    }
    fetchUser();
  }, []);

  const { t, i18n } = useTranslation();
  const changeLanguage = async (event) => {
    const language = event.target.value;
    i18n.changeLanguage(language);
    if (user?._id) {
      try {
        await updateCitizen(user._id, { language });
        setUser((currentUser) => ({ ...currentUser, language }));
      } catch (error) {
        console.error('Failed to update language', error);
      }
    }
  };
  useEffect(() => {
    if (user?.language) {
      i18n.changeLanguage(user.language);
    }
  }, [user?.language, i18n]);

  return (
    <div className="min-h-screen dashboard-theme">
      {/* Mobile Top Header */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu className="h-6 w-6 text-navy-700" /></button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="dashboard-brand-icon flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white"><ShieldCheck className="h-4 w-4" /></div>
          <span className="font-bold text-navy-900">WelfareAI</span>
        </Link>

        {/* Mobile Top-Right Profile Dropdown */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold ring-2 ring-primary-100"
            aria-label="Profile"
          >
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </button>
          {profileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                <p className="px-2 py-1 text-xs font-bold text-navy-900 truncate">{user?.fullName || 'User'}</p>
                <Link
                  to="/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-navy-700 hover:bg-gray-50"
                >
                  <User className="h-3.5 w-3.5" /> Profile
                </Link>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    localStorage.removeItem('token');
                    navigate('/');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-error-600 hover:bg-error-50"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-sky-950/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="dashboard-sidebar absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-xl animate-slide-down">
            <SidebarContent user={user} location={location} onClose={() => setSidebarOpen(false)} onLogout={() => { localStorage.removeItem('token'); navigate('/'); }} />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="dashboard-sidebar sticky top-0 hidden h-screen w-64 shrink-0 bg-white lg:block">
          <SidebarContent user={user} location={location} onLogout={() => { localStorage.removeItem('token'); navigate('/'); }} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="container-page py-6 lg:py-8">
            {/* Desktop Top Toolbar (Language Selector + Profile Avatar Dropdown) */}
            <div className="mb-6 flex items-center justify-end gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-navy-600">
                <Globe className="h-4 w-4 text-primary-600" />
                <span className="sr-only">{t('common.changeLanguage')}</span>
                <select
                  value={i18n.language}
                  onChange={changeLanguage}
                  aria-label={t('common.changeLanguage')}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-navy-700 focus:border-primary-500 cursor-pointer shadow-2xs"
                >
                  {['English', 'हिंदी', 'தமிழ்'].map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </label>

              {/* Profile Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-sm ring-2 ring-primary-100 hover:ring-primary-300 transition-all cursor-pointer"
                  title="User Profile & Account Settings"
                  aria-label="User Profile"
                >
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </button>

                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                    <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl animate-scale-in">
                      <div className="border-b border-gray-100 pb-3 mb-2 px-2">
                        <p className="font-bold text-navy-900 text-sm truncate">{user?.fullName || 'Citizen User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'citizen@welfare.gov.in'}</p>
                        <span className="mt-1 inline-block rounded-full bg-sky-50 text-primary-700 text-2xs font-extrabold px-2 py-0.5 border border-sky-200">
                          {t('common.citizenAccount', { defaultValue: 'Citizen Account' })}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-navy-700 hover:bg-sky-50 hover:text-primary-700 transition-colors"
                      >
                        <User className="h-4 w-4 text-primary-600" />
                        {t('menu.profile', { defaultValue: 'Profile' })}
                      </Link>
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          localStorage.removeItem('token');
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-error-600 hover:bg-error-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        {t('common.logout', { defaultValue: 'Logout' })}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {backTo && (
              <Link to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary-600">
                <ChevronLeft className="h-4 w-4" /> {t('common.back', { defaultValue: 'Back' })}
              </Link>
            )}
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-navy-900 lg:text-3xl">{title}</h1>
                {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ user, location, onClose, onLogout }) {
  const { t } = useTranslation();
  return (
      <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-sky-100 px-5">
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
          <div className="dashboard-brand-icon flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white"><ShieldCheck className="h-5 w-5" /></div>
          <span className="text-lg font-bold text-navy-900">WelfareAI</span>
        </Link>
        {onClose && <button onClick={onClose} aria-label="Close menu"><X className="h-5 w-5 text-gray-400" /></button>}
      </div>

      {/* Navigation Items (Profile removed from sidebar) */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} onClick={onClose} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
               <Icon className="h-5 w-5" />{t(`menu.${item.label}`)}
            </Link>
          );
        })}
      </nav>

      {/* Admin Dashboard preserved in Sidebar Bottom */}

      
      <div className="border-t border-sky-100 p-3">
        {/* <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5"> */}
          {/* <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div> */}
          {/* <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.fullName || 'User'}</p>
            <p className="truncate text-xs text-white/60">{t('common.citizenAccount')}</p>
          </div> */}
        {/* </div> */}
        {/* <Link to="/admin" onClick={onClose} className="nav-link mb-1"><ShieldCheck className="h-5 w-5" /> {t('common.adminDashboard')}</Link> */}
        <button onClick={onLogout} className="nav-link w-full text-error-600 hover:bg-error-50 hover:text-error-700"><LogOut className="h-5 w-5" /> {t('common.logout')}</button>
      </div>
      
    </div>
  );
}
