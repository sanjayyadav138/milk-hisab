import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Milk, Users, FileText, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import DailyChecklist from './components/DailyChecklist';
import CustomersView from './components/CustomersView';
import LedgerBillingView from './components/LedgerBillingView';
import CustomerPortal from './components/CustomerPortal';
import { AuthState } from './types';
import { validateSessionApi } from './services/api';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

const AUTH_STORAGE_KEY = 'doodh_ledger_auth_session';
const INACTIVITY_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days inactivity window

interface Notice {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

function MainApp() {
  const { t } = useLanguage();

  // Load auth session from localStorage with expiration check (SES-01)
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const savedStr = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedStr) {
        const saved: AuthState = JSON.parse(savedStr);
        const now = Date.now();
        // Check hard token expiry
        if (saved.expires_at && now > saved.expires_at) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return { role: null, user: null, customer: null, token: null, expires_at: null, last_active_at: null };
        }
        // Check inactivity timeout
        if (saved.last_active_at && (now - saved.last_active_at > INACTIVITY_TIMEOUT_MS)) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          return { role: null, user: null, customer: null, token: null, expires_at: null, last_active_at: null };
        }
        return saved;
      }
    } catch (e) {
      console.error('Failed to parse auth session', e);
    }
    return { role: null, user: null, customer: null, token: null, expires_at: null, last_active_at: null };
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'vendor' | 'customer'>('vendor');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [vendorTab, setVendorTab] = useState<'DAILY' | 'CUSTOMERS' | 'LEDGER'>('DAILY');
  const [notice, setNotice] = useState<Notice | null>(null);

  const lastActivityUpdateRef = useRef<number>(Date.now());

  // Show notice helper
  const showNotice = useCallback((type: Notice['type'], message: string) => {
    setNotice({ type, message });
    setTimeout(() => {
      setNotice((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Save auth state to localStorage
  useEffect(() => {
    try {
      if (auth.role) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save auth session', e);
    }
  }, [auth]);

  // SES-03: Logout flow
  const handleLogout = useCallback((isExpired = false) => {
    setAuth({ role: null, user: null, customer: null, token: null, expires_at: null, last_active_at: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.hash = '#/';
    if (isExpired) {
      showNotice('warning', t('sessionExpiredNotice'));
      setAuthModalRole('vendor');
      setAuthModalOpen(true);
    }
  }, [showNotice, t]);

  // SES-01: Validate session on app launch
  useEffect(() => {
    if (!auth.role) return;
    const entityId = auth.role === 'vendor' ? auth.user?.id : auth.customer?.id;
    if (!entityId) return;

    validateSessionApi(auth.role, entityId, auth.token)
      .then((res) => {
        if (res.valid) {
          setAuth((prev) => ({
            ...prev,
            user: res.user || prev.user,
            customer: res.customer || prev.customer,
          }));
        }
      })
      .catch((err) => {
        console.warn('Session verification failed on mount:', err);
        handleLogout(true);
      });
  }, []); // Run once on mount

  // SES-02: User Inactivity Tracking & Token Expiry Check
  useEffect(() => {
    if (!auth.role) return;

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle updates to state to once every 30 seconds
      if (now - lastActivityUpdateRef.current > 30000) {
        lastActivityUpdateRef.current = now;
        setAuth((prev) => (prev.role ? { ...prev, last_active_at: now } : prev));
      }
    };

    window.addEventListener('click', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    // Periodic check for token expiry and inactivity
    const interval = setInterval(() => {
      const now = Date.now();
      if (auth.expires_at && now > auth.expires_at) {
        handleLogout(true);
      } else if (auth.last_active_at && (now - auth.last_active_at > INACTIVITY_TIMEOUT_MS)) {
        handleLogout(true);
      }
    }, 60000);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      clearInterval(interval);
    };
  }, [auth.role, auth.expires_at, auth.last_active_at, handleLogout]);

  // Module 9: Role-Based Dashboard Routing & Protection (DSH-01, DSH-02, DSH-03)
  useEffect(() => {
    const handleRouteGuard = () => {
      const hash = window.location.hash || '#/';

      if (auth.role === 'vendor') {
        // Customer route unauthorized protection (DSH-03)
        if (hash.startsWith('#/customer')) {
          showNotice('warning', t('unauthorizedCustomerNotice'));
          window.location.hash = '#/vendor/dashboard';
        } else if (hash === '#/' || hash === '') {
          window.location.hash = '#/vendor/dashboard';
        }
      } else if (auth.role === 'customer') {
        // Vendor route unauthorized protection (DSH-03)
        if (hash.startsWith('#/vendor')) {
          showNotice('warning', t('unauthorizedVendorNotice'));
          window.location.hash = '#/customer/dashboard';
        } else if (hash === '#/' || hash === '') {
          window.location.hash = '#/customer/dashboard';
        }
      } else {
        // Unauthenticated visitor trying to access protected routes (DSH-03)
        if (hash.startsWith('#/vendor') || hash.startsWith('#/customer')) {
          window.location.hash = '#/';
          showNotice('info', t('sessionExpiredNotice'));
          setAuthModalRole('vendor');
          setAuthModalOpen(true);
        }
      }
    };

    handleRouteGuard();
    window.addEventListener('hashchange', handleRouteGuard);
    return () => window.removeEventListener('hashchange', handleRouteGuard);
  }, [auth.role, showNotice, t]);

  const handleOpenAuth = (role: 'vendor' | 'customer' = 'vendor') => {
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (newAuth: AuthState) => {
    const enrichedAuth: AuthState = {
      ...newAuth,
      token: newAuth.token || `tok_${Date.now()}`,
      expires_at: newAuth.expires_at || Date.now() + 30 * 24 * 60 * 60 * 1000,
      last_active_at: Date.now(),
    };
    setAuth(enrichedAuth);
    if (enrichedAuth.role === 'vendor') {
      window.location.hash = '#/vendor/dashboard';
    } else if (enrichedAuth.role === 'customer') {
      window.location.hash = '#/customer/dashboard';
    }
  };

  const handleProfileUpdated = (updatedAuth: AuthState) => {
    setAuth(updatedAuth);
    showNotice('success', t('profileUpdatedSuccess'));
  };

  const handleNavigateDashboard = () => {
    if (auth.role === 'vendor') {
      setVendorTab('DAILY');
      window.location.hash = '#/vendor/dashboard';
    } else if (auth.role === 'customer') {
      window.location.hash = '#/customer/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col font-sans">
      {/* Top Navbar with Profile Dropdown (PRF-01, PRF-02) */}
      <Navbar 
        auth={auth} 
        onLogout={() => handleLogout(false)} 
        onOpenAuth={handleOpenAuth}
        onGoHome={() => {
          if (!auth.role) {
            window.location.hash = '#/';
          } else {
            handleNavigateDashboard();
          }
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onNavigateDashboard={handleNavigateDashboard}
      />

      {/* Floating System Notice / Alert Banner */}
      {notice && (
        <div className="fixed top-16 sm:top-20 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md animate-in slide-in-from-top duration-200">
          <div className={`p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 ${
            notice.type === 'warning' 
              ? 'bg-amber-50 border-amber-300 text-amber-900' 
              : notice.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : notice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}>
            <div className="mt-0.5 shrink-0">
              {notice.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
              {notice.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {notice.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              {notice.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <p className="text-xs font-bold flex-1 leading-snug">{notice.message}</p>
            <button 
              onClick={() => setNotice(null)}
              className="p-1 rounded-lg hover:bg-black/5 transition text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Condition */}
      <main className="flex-1">
        {/* Landing Page for Unauthenticated Visitors */}
        {!auth.role && (
          <LandingPage onOpenAuth={handleOpenAuth} />
        )}

        {/* Customer Portal (DSH-02) */}
        {auth.role === 'customer' && auth.customer && (
          <CustomerPortal 
            customer={auth.customer} 
            onLogout={() => handleLogout(false)} 
          />
        )}

        {/* Vendor Control Panel (DSH-01) */}
        {auth.role === 'vendor' && auth.user && (
          <div className="pb-20 sm:pb-8">
            {vendorTab === 'DAILY' && <DailyChecklist />}
            {vendorTab === 'CUSTOMERS' && <CustomersView />}
            {vendorTab === 'LEDGER' && <LedgerBillingView />}

            {/* Bottom Mobile Navigation for Milkman */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 shadow-2xl">
              <div className="max-w-2xl mx-auto grid grid-cols-3 h-16">
                <button
                  onClick={() => setVendorTab('DAILY')}
                  className={`flex flex-col items-center justify-center transition active:scale-95 ${
                    vendorTab === 'DAILY' 
                      ? 'text-blue-700 font-black' 
                      : 'text-slate-500 font-medium hover:text-slate-800'
                  }`}
                >
                  <div className={`p-1 rounded-xl ${vendorTab === 'DAILY' ? 'bg-blue-100' : ''}`}>
                    <Milk className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] mt-0.5">{t('navDaily')}</span>
                </button>

                <button
                  onClick={() => setVendorTab('CUSTOMERS')}
                  className={`flex flex-col items-center justify-center transition active:scale-95 ${
                    vendorTab === 'CUSTOMERS' 
                      ? 'text-blue-700 font-black' 
                      : 'text-slate-500 font-medium hover:text-slate-800'
                  }`}
                >
                  <div className={`p-1 rounded-xl ${vendorTab === 'CUSTOMERS' ? 'bg-blue-100' : ''}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] mt-0.5">{t('navCustomers')}</span>
                </button>

                <button
                  onClick={() => setVendorTab('LEDGER')}
                  className={`flex flex-col items-center justify-center transition active:scale-95 ${
                    vendorTab === 'LEDGER' 
                      ? 'text-blue-700 font-black' 
                      : 'text-slate-500 font-medium hover:text-slate-800'
                  }`}
                >
                  <div className={`p-1 rounded-xl ${vendorTab === 'LEDGER' ? 'bg-blue-100' : ''}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] mt-0.5">{t('navLedger')}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </main>

      {/* Profile Details Modal (PRF-03, PRF-04) */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        auth={auth}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialRole={authModalRole}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}