import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, ArrowRight, Globe, ChevronDown, 
  LayoutDashboard, UserCircle, ShieldCheck, Check
} from 'lucide-react';
import { AuthState } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  auth: AuthState;
  onLogout: () => void;
  onOpenAuth: (role: 'vendor' | 'customer', tab?: 'LOGIN' | 'REGISTER') => void;
  onGoHome: () => void;
  onOpenProfile: () => void;
  onNavigateDashboard: () => void;
}

export default function Navbar({ 
  auth, 
  onLogout, 
  onOpenAuth, 
  onGoHome, 
  onOpenProfile, 
  onNavigateDashboard 
}: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const isVendor = auth.role === 'vendor' && auth.user;
  const isCustomer = auth.role === 'customer' && auth.customer;
  const isLoggedIn = isVendor || isCustomer;

  const displayName = isVendor 
    ? auth.user!.name 
    : isCustomer 
      ? auth.customer!.name 
      : '';

  const displaySubtitle = isVendor 
    ? auth.user!.business_name 
    : isCustomer 
      ? t('customerRole') 
      : '';

  const displayPhone = isVendor 
    ? auth.user!.phone 
    : isCustomer 
      ? auth.customer!.phone || '' 
      : '';

  const avatarUrl = isVendor 
    ? auth.user!.avatar_url 
    : isCustomer 
      ? auth.customer!.avatar_url 
      : null;

  const initial = (displayName.trim()[0] || 'U').toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between">
        
        {/* Brand - Logo Only */}
        <div 
          onClick={onGoHome} 
          className="cursor-pointer hover:opacity-90 transition flex items-center"
          title="Milk Hisab Home"
        >
          <img 
            src="/logo.png" 
            alt="Milk Hisab Logo" 
            className="h-12 sm:h-14 md:h-16 w-auto object-contain select-none" 
          />
        </div>

        {/* User Persona & Language Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Segmented Language Switcher Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1 shrink-0 hidden sm:block" />
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all active:scale-95 ${
                  lang === 'hi'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all active:scale-95 ${
                  lang === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Logged-In User Profile Avatar & Dropdown (PRF-01 & PRF-02) */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 sm:gap-2.5 p-1 sm:pr-3 rounded-2xl border transition-all active:scale-98 ${
                  dropdownOpen 
                    ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs' 
                    : isVendor
                      ? 'bg-blue-50/60 hover:bg-blue-50 border-blue-200 shadow-2xs'
                      : 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200 shadow-2xs'
                }`}
                aria-expanded={dropdownOpen}
                aria-label="User account menu"
              >
                {/* Avatar Circle */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-xs shrink-0 overflow-hidden ${
                  isVendor ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-emerald-600 to-teal-800'
                }`}>
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={displayName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>

                {/* User Info (Hidden on very narrow mobile) */}
                <div className="text-left hidden sm:block max-w-[140px] md:max-w-[180px]">
                  <p className="text-xs font-black text-slate-900 leading-tight truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold truncate">
                    {displaySubtitle}
                  </p>
                </div>

                {/* Dropdown Chevron */}
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  {/* Dropdown Header: User Details Card */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-xs shrink-0 overflow-hidden ${
                      isVendor ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-emerald-600 to-teal-800'
                    }`}>
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt={displayName} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-black text-slate-900 truncate">{displayName}</p>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 truncate">{displayPhone}</p>
                      <span className={`inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full ${
                        isVendor ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isVendor ? t('vendorRole') : t('customerRole')}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Action Items */}
                  <div className="p-1.5 space-y-0.5">
                    {/* Dashboard */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigateDashboard();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition active:scale-98"
                    >
                      <div className="w-7 h-7 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs font-bold">{t('dashboard')}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{t('viewDashboard')}</p>
                      </div>
                    </button>

                    {/* Profile Details (PRF-03) */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition active:scale-98"
                    >
                      <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <UserCircle className="w-4 h-4" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-xs font-bold">{t('profileTitle')}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{t('editProfile')}</p>
                      </div>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="my-1 border-t border-slate-100" />

                  {/* Logout (SES-03) */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition active:scale-98"
                    >
                      <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">{t('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-Out Simple Login CTA */
            <button
              onClick={() => onOpenAuth('vendor', 'LOGIN')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-black shadow-md shadow-blue-500/20 active:scale-95 transition flex items-center gap-1.5"
            >
              <span>{t('simpleLogin')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
}