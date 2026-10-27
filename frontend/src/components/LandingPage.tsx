import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Zap, Users, Star, Award, 
  MapPin, Phone, MessageCircle, ArrowRight, Headphones,
  ShieldCheck, HelpCircle, FileText, CheckCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PublicPageType } from './Navbar';

interface LandingPageProps {
  onOpenAuth: (role: 'vendor' | 'customer', tab?: 'LOGIN' | 'REGISTER') => void;
  onOpenFindMilkman: (query?: string) => void;
  onNavigatePage?: (page: PublicPageType) => void;
}

export default function LandingPage({ onOpenAuth, onOpenFindMilkman, onNavigatePage }: LandingPageProps) {
  const [localSearch, setLocalSearch] = useState('');
  const { t, lang } = useLanguage();
  const [activeBanner, setActiveBanner] = useState(0);

  const banners = [
    {
      image: '/banners/banner-1.jpg',
      badge: lang === 'hi' ? "🥛 भारत का नंबर 1 डिजिटल दूध बहीखाता" : "🥛 India's #1 Digital Milk Diary",
      title: lang === 'hi' ? "कागजी डायरी छोड़िए, फोन पर 1-क्लिक में दूध का हिसाब रखिए!" : "Ditch Paper Diaries. Track Milk Delivery & Billing in 1-Click!",
      desc: lang === 'hi' 
        ? "दूधिया और ग्राहक दोनों के लिए बेहद आसान। बोलकर एंट्री करें, ऑटोमैटिक मासिक बिल बनाएं और सीधे WhatsApp पर भेजें।"
        : "Super simple for milk vendors & households. Voice-powered logging, automated monthly ledger, and instant WhatsApp bill sharing with UPI.",
    },
    {
      image: '/banners/banner-2.jpg',
      badge: lang === 'hi' ? "🎙️ बोलकर एंट्री (Voice Assistant)" : "🎙️ Voice-Powered Logging (Natural Speech)",
      title: lang === 'hi' ? "'राकेश को 2 लीटर दूध और शर्मा जी की छुट्टी दर्ज करो'" : "'Add 2 Liters for Rakesh and Skip Sharma Ji Today'",
      desc: lang === 'hi'
        ? "माइक दबाइए और देसी हिंदी में बोलिए। ऐप अपने आप समझकर पूरा हिसाब सही कर देगा।"
        : "Tap the mic and speak naturally. The app extracts customer names and updates daily quantities automatically.",
    },
    {
      image: '/banners/banner-3.jpg',
      badge: lang === 'hi' ? "📲 1-क्लिक WhatsApp बिलिंग व UPI" : "📲 1-Click WhatsApp Bills & UPI QR",
      title: lang === 'hi' ? "महीने के अंत में हिसाब का झंझट खत्म!" : "No More Month-End Billing Headaches!",
      desc: lang === 'hi'
        ? "ग्राहकों को सीधे उनके WhatsApp पर बिल और PhonePe/GPay का UPI लिंक भेजें। ग्राहक घर बैठे हिसाब चेक करें।"
        : "Send itemized bills straight to customer WhatsApp chats with Google Pay & PhonePe UPI QR links.",
    }
  ];

  // Auto-advance banner every 6.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrevBanner = () => {
    setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNextBanner = () => {
    setActiveBanner((prev) => (prev + 1) % banners.length);
  };

  const handleNav = (page: PublicPageType) => {
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

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-800 flex flex-col font-sans">
      {/* Top Banner Bar - Dairy Navy Trust Anchor */}
      <div className="bg-blue-900 text-blue-100 text-xs py-2 px-4 text-center font-bold tracking-wide">
        {t('announcement')}
      </div>

      {/* Hero Interactive Banner Carousel with Photographic Backgrounds */}
      <section className="relative overflow-hidden py-16 sm:py-24 md:py-28 px-4 text-white min-h-[520px] sm:min-h-[580px] md:min-h-[640px] flex items-center justify-center bg-slate-950">
        
        {/* Photographic Background Images with Smooth Crossfade Transition */}
        {banners.map((b, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              activeBanner === i ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={b.image}
              alt={b.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Cinematic Gradient Overlays for Guaranteed Text Legibility & Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/35 to-slate-950/80" />
          </div>
        ))}

        {/* Decorative Grid Light */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none z-10" />

        {/* Previous / Next Arrow Controls */}
        <button
          type="button"
          onClick={handlePrevBanner}
          className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white items-center justify-center transition active:scale-90 shadow-lg shadow-black/40"
          aria-label="Previous banner"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={handleNextBanner}
          className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white items-center justify-center transition active:scale-90 shadow-lg shadow-black/40"
          aria-label="Next banner"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Content */}
        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/25 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-black mb-6 shadow-md backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{banners[activeBanner].badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-md">
            {banners[activeBanner].title}
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
            {banners[activeBanner].desc}
          </p>

          {/* Action CTAs - Primary Dairy Blue for Trust */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('vendor', 'LOGIN')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-600/40 text-sm sm:text-base active:scale-95 transition flex items-center gap-2"
            >
              <span>{t('ctaVendor')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('customer', 'LOGIN')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl backdrop-blur-md border border-white/25 text-sm sm:text-base active:scale-95 transition shadow-lg shadow-black/20"
            >
              {t('ctaCustomer')}
            </button>
          </div>

          {/* Banner Selector Dots */}
          <div className="flex justify-center items-center gap-2.5 mt-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeBanner === i 
                    ? 'w-10 bg-blue-400 shadow-md shadow-blue-400/50' 
                    : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Location-Based Milkman Discovery Bar */}
      <section className="bg-white border-b border-slate-200 py-6 px-4 shadow-xs">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 px-3 flex-1 w-full">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenFindMilkman(localSearch);
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenFindMilkman(localSearch)}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black transition active:scale-95 shrink-0 shadow-xs"
            >
              {t('findMilkman')}
            </button>
          </div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">{t('metric1Val')}</div>
            <div className="text-xs text-slate-500 font-bold mt-1">{t('metric1Desc')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">{t('metric2Val')}</div>
            <div className="text-xs text-slate-500 font-bold mt-1">{t('metric2Desc')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">{t('metric3Val')}</div>
            <div className="text-xs text-slate-500 font-bold mt-1">{t('metric3Desc')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">{t('metric4Val')}</div>
            <div className="text-xs text-slate-500 font-bold mt-1">{t('metric4Desc')}</div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-14 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase text-blue-700 tracking-wider bg-blue-100 px-3 py-1 rounded-full">
            {t('featuresBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {t('featuresHeading')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            {t('featuresSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">{t('feat1Title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('feat1Desc')}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">{t('feat2Title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('feat2Desc')}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-800 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">{t('feat3Title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('feat3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* About Us Spotlight Section */}
      <section className="bg-slate-100/70 py-14 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                  {t('aboutBadge')}
                </span>
              </div>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {lang === 'hi' ? 'स्थापना: 2024' : 'Est. 2024'}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
              {t('aboutHeading')}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {t('aboutP1')}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('aboutP2')}
            </p>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleNav('ABOUT')}
                className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-800 transition active:scale-95"
              >
                <span>{lang === 'hi' ? 'हमारे बारे में पूरी जानकारी पढ़ें' : 'Read Full About Us Details'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-400">
                {lang === 'hi' ? 'बिना किसी कागजी झंझट के संपूर्ण समाधान' : 'Modern SaaS Built for Dairy Supply'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Customer & Vendor Testimonials */}
      <section className="py-14 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase text-blue-700 tracking-wider bg-blue-100 px-3 py-1 rounded-full">
            {t('testiBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {t('testiHeading')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1 text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
              "{t('testi1Quote')}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                DP
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{t('testi1Name')}</p>
                <p className="text-xs text-slate-500">{t('testi1Role')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1 text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
              "{t('testi2Quote')}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                DH
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{t('testi2Name')}</p>
                <p className="text-xs text-slate-500">{t('testi2Role')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section - Deep Dairy Blue Theme */}
      <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white py-14 px-4 border-t border-blue-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase text-blue-300 tracking-wider bg-white/10 px-3 py-1 rounded-full">
              {t('contactBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              {t('contactHeading')}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl mx-auto">
              {t('contactSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            {/* Support Desk Card */}
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10 flex flex-col justify-between">
              <div>
                <Headphones className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold">{t('contactFounderName')}</h4>
                <p className="text-xs text-blue-200 mt-1">{t('contactFounderRole')}</p>
              </div>
              <button
                type="button"
                onClick={() => handleNav('CONTACT')}
                className="mt-3 text-[11px] font-bold text-blue-300 hover:text-white underline pt-2 border-t border-white/10"
              >
                {lang === 'hi' ? 'संपर्क फ़ॉर्म खोलें' : 'Open Contact Form'}
              </button>
            </div>

            {/* Primary Phone & WhatsApp */}
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10 flex flex-col justify-between">
              <div>
                <Phone className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold">{t('primaryPhoneTitle')}</h4>
                <a 
                  href="tel:+919971880670" 
                  className="text-sm font-black text-white hover:text-emerald-300 block mt-1 tracking-wide"
                >
                  +91 9971880670
                </a>
              </div>
              <a 
                href="https://wa.me/919971880670?text=Namaste%20Milk%20Hisab%20Team%2C%20I%20want%20to%20know%20more%20about%20Milk%20Hisab" 
                target="_blank" 
                rel="noreferrer" 
                className="mt-3 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-xs transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{t('waAction')}</span>
              </a>
            </div>

            {/* Alternate Phone */}
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10 flex flex-col justify-between">
              <div>
                <Phone className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold">{t('altPhoneTitle')}</h4>
                <a 
                  href="tel:8053278764" 
                  className="text-sm font-black text-white hover:text-amber-300 block mt-1 tracking-wide"
                >
                  8053278764
                </a>
              </div>
              <a 
                href="tel:8053278764" 
                className="mt-3 inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3 rounded-xl border border-white/15 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>

            {/* Office & Pan-India */}
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10 flex flex-col justify-between">
              <div>
                <MapPin className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold">{t('officeTitle')}</h4>
                <p className="text-xs text-blue-200 mt-1">{t('officeVal')}</p>
              </div>
              <p className="text-[11px] text-slate-300 mt-3 pt-2 border-t border-white/10">All India Digital Dairy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Menu Navigation Links */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 px-4 border-t border-slate-900">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <p className="text-base font-black text-white tracking-tight">
                Milk Hisab • Digital Milk Ledger
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'hi' 
                  ? 'सन् 2024 में स्थापित • देश भर के दूधियों और परिवारों के लिए भरोसेमंद डिजिटल डायरी'
                  : 'Established in 2024 • Trusted by dairy vendors & households across India'}
              </p>
            </div>

            {/* Footer Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
              <button 
                type="button" 
                onClick={() => handleNav('ABOUT')}
                className="hover:text-white transition"
              >
                {t('menuAbout')}
              </button>
              <span className="text-slate-700">•</span>
              <button 
                type="button" 
                onClick={() => handleNav('CONTACT')}
                className="hover:text-white transition"
              >
                {t('menuContact')}
              </button>
              <span className="text-slate-700">•</span>
              <button 
                type="button" 
                onClick={() => handleNav('TERMS')}
                className="hover:text-white transition"
              >
                {t('menuTerms')}
              </button>
              <span className="text-slate-700">•</span>
              <button 
                type="button" 
                onClick={() => handleNav('PRIVACY')}
                className="hover:text-white transition"
              >
                {t('menuPrivacy')}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
            <p>
              Helpline: <a href="tel:+919971880670" className="hover:text-white underline">+91 9971880670</a> (WhatsApp), <a href="tel:8053278764" className="hover:text-white underline">8053278764</a> | support@milkhisab.in
            </p>
            <p>Made with ❤️ for Indian Dairy Vendors and Families.</p>
          </div>

        </div>
      </footer>
    </div>
  );
}
