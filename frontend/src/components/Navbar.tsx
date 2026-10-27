import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, ArrowRight, Globe, ChevronDown, 
  LayoutDashboard, UserCircle, ShieldCheck, Check, Search,
  Menu, X, FileText, PhoneCall, Info, Lock, KeyRound
} from 'lucide-react';
import { AuthState } from '../types';
import { useLanguage } from '../context/LanguageContext';

export type PublicPageType = 'ABOUT' | 'CONTACT' | 'TERMS' | 'PRIVACY';

interface NavbarProps {
  auth: AuthState;
  onLogout: () => void;
  onOpenAuth: (role: 'vendor' | 'customer', tab?: 'LOGIN' | 'REGISTER') => void;
  onGoHome: () => void;
  onOpenProfile: () => void;
  onNavigateDashboard: () => void;
  onOpenFindMilkman?: () => void;
  onOpenChangePin?: () => void;
  onNavigatePage?: (page: PublicPageType) => void;
}

export default function Navbar({ 
  auth, 
  onLogout, 
  onOpenAuth, 
  onGoHome, 
  onOpenProfile, 
  onNavigateDashboard,
  onOpenFindMilkman,
  onNavigatePage,
  onOpenChangePin
}: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  
  // State for Language Dropdown
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // State for Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // State for Mobile Navigation Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close dropdowns on outside click or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLangDropdownOpen(false);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePageNavigation = (page: PublicPageType) => {
    setMobileMenuOpen(false);
    if (onNavigatePage) {
      onNavigatePage(page);
    } else {
      const routes: Record<PublicPageType, string> = {
        ABOUT: '#/about',
        CONTACT: '#/contact',
        TERMS: '#/terms',
        PRIVACY: '#/privacy'
      };
      window.location.hash = routes[page];
    }
  };

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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        
        {/* Left: Brand Logo & Optional Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div 
            onClick={onGoHome} 
            className="cursor-pointer hover:opacity-90 transition flex items-center shrink-0"
            title="Milk Hisab Home"
          >
            <img 
              src="/logo.png" 
              alt="Milk Hisab Logo" 
              className="h-11 sm:h-13 md:h-14 w-auto object-contain select-none" 
            />
          </div>

          {/* Desktop Navigation Menu Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <button
              type="button"
              onClick={() => handlePageNavigation('ABOUT')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 transition"
            >
              {t('menuAbout')}
            </button>
            <button
              type="button"
              onClick={() => handlePageNavigation('CONTACT')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 transition"
            >
              {t('menuContact')}
            </button>
            <button
              type="button"
              onClick={() => handlePageNavigation('TERMS')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 transition"
            >
              {t('menuTerms')}
            </button>
            <button
              type="button"
              onClick={() => handlePageNavigation('PRIVACY')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 transition"
            >
              {t('menuPrivacy')}
            </button>
          </nav>
        </div>

        {/* Right: Actions, Language Dropdown & User Persona */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Find Nearby Milkman Quick Action */}
          <button
            type="button"
            onClick={onOpenFindMilkman}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-2xl text-xs font-bold transition active:scale-95 shadow-2xs shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">{t('findMilkman')}</span>
            <span className="sm:hidden text-[11px]">दूधिया</span>
          </button>
          
          {/* Language Selector Dropdown (Replaced Switch with Icon & Dropdown) */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 shadow-2xs ${
                langDropdownOpen
                  ? 'bg-blue-50 border-blue-400 text-blue-900 ring-2 ring-blue-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              aria-label="Select Language"
              aria-expanded={langDropdownOpen}
            >
              <Globe className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">
                {lang === 'hi' ? 'हिन्दी' : 'English'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                langDropdownOpen ? 'rotate-180 text-blue-600' : ''
              }`} />
            </button>

            {/* Language Menu Dropdown */}
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                  भाषा चुनें (Language)
                </div>
                
                {/* Hindi Option */}
                <button
                  type="button"
                  onClick={() => {
                    setLang('hi');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition ${
                    lang === 'hi' 
                      ? 'bg-blue-50/80 text-blue-800' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🇮🇳</span>
                    <span>हिन्दी (Hindi)</span>
                  </div>
                  {lang === 'hi' && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                {/* English Option */}
                <button
                  type="button"
                  onClick={() => {
                    setLang('en');
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition ${
                    lang === 'en' 
                      ? 'bg-blue-50/80 text-blue-800' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🌐</span>
                    <span>English (English)</span>
                  </div>
                  {lang === 'en' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Logged-In User Profile Avatar & Dropdown */}
          {isLoggedIn ? (
            <div className="relative" ref={profileDropdownRef}>
              {/* Sleek User Profile Avatar Trigger */}
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all active:scale-95 ${
                  profileDropdownOpen 
                    ? 'bg-slate-100 border-slate-300 ring-2 ring-blue-500/10' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
                aria-expanded={profileDropdownOpen}
                aria-label="User account menu"
              >
                {/* Circular Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-2xs overflow-hidden ${
                    isVendor ? 'bg-gradient-to-tr from-blue-700 to-indigo-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-700'
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
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                {/* Compact User Name */}
                <div className="text-left hidden sm:block max-w-[120px] md:max-w-[150px]">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                    {displayName}
                  </p>
                </div>

                {/* Dropdown Chevron */}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {/* Clean Modern Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 ring-1 ring-black/5 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  {/* User Profile Card */}
                  <div className="px-3 py-2.5 bg-slate-50 rounded-xl mb-1 flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 overflow-hidden ${
                      isVendor ? 'bg-gradient-to-tr from-blue-700 to-indigo-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-700'
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
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{displayPhone}</p>
                      <span className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        isVendor ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isVendor ? (lang === 'hi' ? 'दूधिया (Vendor)' : 'Milkman') : (lang === 'hi' ? 'ग्राहक (Customer)' : 'Customer')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-0.5">
                    {/* Dashboard */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigateDashboard();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{t('dashboard')}</span>
                    </button>

                    {/* Profile & Settings (Opens Full Page) */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition"
                    >
                      <UserCircle className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{lang === 'hi' ? 'प्रोफ़ाइल व सेटिंग्स' : 'Profile & Settings'}</span>
                    </button>

                    {/* Change PIN */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onOpenChangePin) onOpenChangePin();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-amber-700 hover:bg-amber-50 transition"
                    >
                      <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{lang === 'hi' ? 'पिन बदलें (Change PIN)' : 'Change PIN'}</span>
                    </button>

                    {/* Divider */}
                    <div className="my-1 border-t border-slate-100" />

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-Out Simple Login CTA */
            <button
              onClick={() => onOpenAuth('vendor', 'LOGIN')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-95 transition flex items-center gap-1.5 shrink-0"
            >
              <span>{t('simpleLogin')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Button for Navigation Links */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition active:scale-95 border border-slate-200"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-blue-700" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer / Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handlePageNavigation('ABOUT')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Info className="w-4 h-4 text-blue-600" />
              <span>{t('menuAbout')}</span>
            </button>
            <button
              type="button"
              onClick={() => handlePageNavigation('CONTACT')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>{t('menuContact')}</span>
            </button>
            <button
              type="button"
              onClick={() => handlePageNavigation('TERMS')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>{t('menuTerms')}</span>
            </button>
            <button
              type="button"
              onClick={() => handlePageNavigation('PRIVACY')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Lock className="w-4 h-4 text-amber-600" />
              <span>{t('menuPrivacy')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
