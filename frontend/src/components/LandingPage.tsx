import React, { useState } from 'react';
import { 
  Sparkles, Zap, Users, Star, Award, 
  MapPin, Phone, MessageCircle, ArrowRight, Headphones,
  ShieldCheck, HelpCircle, FileText, CheckCircle, CheckCircle2,
  Calendar, Milk, Clock, Mic, Check, ChevronRight, Play, Film, Smartphone
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
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [heroRightTab, setHeroRightTab] = useState<'APP_PREVIEW' | 'FARM_VIDEO'>('APP_PREVIEW');

  const featureTabs = [
    {
      id: 0,
      icon: <Mic className="w-5 h-5 text-emerald-600" />,
      badge: lang === 'hi' ? '🎙️ देसी हिंदी वॉइस असिस्टेंट' : '🎙️ Natural Voice Logging',
      title: lang === 'hi' ? 'बोलिए और पूरा हिसाब दर्ज हो जाएगा' : 'Speak Naturally to Log Daily Milk',
      desc: lang === 'hi' 
        ? '"राकेश को 2 लीटर दूध और शर्मा जी की छुट्टी दर्ज करो" — माइक दबाइए और बोलिए, ऐप नाम और मात्रा समझकर तुरंत एंट्री कर देता है।'
        : 'Just speak: "Add 2 liters for Rakesh and skip Sharma Ji today". The AI assistant recognizes Hindi & English names and updates records instantly.',
      highlight: lang === 'hi' ? '10 सेकंड में 50 ग्राहकों की एंट्री पूरी' : 'Log 50 customer deliveries in 10 seconds'
    },
    {
      id: 1,
      icon: <MessageCircle className="w-5 h-5 text-emerald-600" />,
      badge: lang === 'hi' ? '📲 1-क्लिक WhatsApp बिलिंग व UPI' : '📲 Instant WhatsApp Bills with UPI QR',
      title: lang === 'hi' ? 'महीने के अंत में हिसाब का झंझट खत्म' : 'Automated Month-End Billing & Payments',
      desc: lang === 'hi'
        ? 'महीने की आखिरी तारीख को 1-क्लिक में ग्राहक के WhatsApp पर सुंदर बिल और PhonePe / Google Pay का सीधा UPI पेमेंट QR लिंक भेजें।'
        : 'Dispatch itemized monthly statements straight to customer WhatsApp chats complete with Google Pay & PhonePe UPI QR codes.',
      highlight: lang === 'hi' ? '98% समय पर भुगतान वसूली' : '98% on-time payment collections'
    },
    {
      id: 2,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      badge: lang === 'hi' ? '📱 ग्राहक मोबाइल पोर्टल व ट्रैकिंग' : '📱 Customer Mobile Portal & Family Access',
      title: lang === 'hi' ? 'ग्राहक फोन पर रोज़ का हिसाब खुद देखें' : 'Customers Track Daily Milk on Their Phone',
      desc: lang === 'hi'
        ? 'ग्राहक अपने मोबाइल नंबर से लॉगिन करके रोज़ का दूध, छुट्टी की अग्रिम सूचना और पुराना हिसाब बिना किसी फोन कॉल के कभी भी चेक कर सकते हैं।'
        : 'Customers log in with mobile number to check daily delivery logs, schedule skips, and verify monthly balances with zero disputes.',
      highlight: lang === 'hi' ? '0 विवाद और 100% पारदर्शिता' : 'Zero disputes & 100% ledger trust'
    }
  ];

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
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-sans">
      
      {/* Top Banner Bar - Dairy Navy Trust Anchor */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-blue-100 text-xs py-2 px-4 text-center font-bold tracking-wide shadow-xs flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>{t('announcement')}</span>
      </div>

      {/* Hero Section: Modern, Luminous, Professional SaaS Aesthetic */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 py-10 sm:py-14 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        
        {/* Soft Background Radial Blurs */}
        <div className="w-96 h-96 bg-blue-400/10 rounded-full blur-3xl absolute -top-20 -left-20 pointer-events-none" />
        <div className="w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl absolute -top-20 -right-20 pointer-events-none" />

        {/* Floating 3D Milk Splash Aesthetic Accent in Bottom Right */}
        <img
          src="/media/milk-image2.png"
          alt="Fresh Milk Wave Splash"
          className="w-72 sm:w-96 lg:w-[28rem] absolute -bottom-10 -right-10 opacity-15 pointer-events-none select-none hidden md:block"
        />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Luminous Modern Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-bold shadow-xs">
              <img src="/media/cow-image.png" alt="Cow icon" className="w-4 h-4 object-contain inline-block" />
              <span>{lang === 'hi' ? 'आधुनिक डिजिटल दूध बहीखाता 2.0 • 100% सुरक्षित क्लाउड बैकअप' : 'Modern Digital Dairy Cloud 2.0 • 100% Cloud Synced'}</span>
            </div>

            {/* High Impact Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15] text-slate-900">
              {lang === 'hi' ? 'कागजी डायरी छोड़िए,' : 'Say Goodbye to Paper Diaries,'}{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                {lang === 'hi' ? 'फोन पर 1-क्लिक में दूध का हिसाब रखिए' : 'Manage Milk Delivery & Ledger in 1-Click'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              {lang === 'hi'
                ? 'दूधिया और ग्राहक दोनों के लिए बेहद आसान। बोलकर एंट्री करें, ऑटोमैटिक मासिक बिल बनाएं और सीधे WhatsApp व PhonePe/GPay UPI पर हिसाब सुलझाएं।'
                : 'Built for modern dairy milkmen & households. Natural voice logging, automated monthly billing, and instant WhatsApp bill sharing with PhonePe/GPay UPI QR.'}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenAuth('vendor', 'LOGIN')}
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-500/25 text-sm sm:text-base active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('ctaVendor')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('customer', 'LOGIN')}
                className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-2xl border border-slate-200 shadow-sm text-sm sm:text-base active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('ctaCustomer')}</span>
              </button>
            </div>

            {/* Trust Proof Chips */}
            <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-slate-800">4.9/5</span>
                <span>(10,000+ {lang === 'hi' ? 'उपयोगकर्ता' : 'Users'})</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-क्लिक WhatsApp बिलिंग</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>100% सुरक्षित क्लाउड</span>
              </span>
            </div>

          </div>

          {/* Right Hero: Interactive Dual-Mode Showcase (App Simulation OR Real Dairy Farm Video) */}
          <div className="lg:col-span-5 relative">
            
            {/* View Mode Switcher Header */}
            <div className="flex items-center justify-center gap-1 mb-2 bg-slate-200/60 p-1 rounded-2xl w-fit mx-auto text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setHeroRightTab('APP_PREVIEW')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                  heroRightTab === 'APP_PREVIEW'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>{lang === 'hi' ? 'ऐप लाइव प्रिव्यू' : 'App Preview'}</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroRightTab('FARM_VIDEO')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                  heroRightTab === 'FARM_VIDEO'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'hi' ? 'डेयरी फार्म वीडियो' : 'Farm Video Tour'}</span>
              </button>
            </div>

            {/* TAB 1: App Simulation */}
            {heroRightTab === 'APP_PREVIEW' && (
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 ring-1 ring-slate-900/5 transition hover:shadow-3xl animate-in fade-in duration-200">
                
                {/* Mock App Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <Milk className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Milk Hisab Dairy Cloud</h4>
                      <p className="text-[10px] text-slate-500">29 Oct 2026 • आज का हिसाब</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>लाइव सिंक</span>
                  </span>
                </div>

                {/* Bilateral Inward vs Outward Stats Mockup */}
                <div className="grid grid-cols-3 gap-2 my-3">
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-2 text-center">
                    <p className="text-[9px] font-bold text-blue-700 uppercase">संकलन</p>
                    <p className="text-base font-black text-blue-900">45.0 <span className="text-[10px]">L</span></p>
                    <p className="text-[9px] text-blue-600 font-medium">4 घरों से</p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2 text-center">
                    <p className="text-[9px] font-bold text-emerald-700 uppercase">वितरण</p>
                    <p className="text-base font-black text-emerald-900">43.5 <span className="text-[10px]">L</span></p>
                    <p className="text-[9px] text-emerald-600 font-medium">8 ग्राहकों को</p>
                  </div>
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-2 text-center">
                    <p className="text-[9px] font-bold text-indigo-700 uppercase">स्टॉक</p>
                    <p className="text-base font-black text-indigo-900">+1.5 <span className="text-[10px]">L</span></p>
                    <p className="text-[9px] text-indigo-600 font-medium">शेष बचा</p>
                  </div>
                </div>

                {/* Live Customer Delivery Card Preview */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-black text-slate-900">राकेश शर्मा (H.No 12)</h5>
                      <p className="text-[10px] text-slate-500">तय मात्रा: 2.0L गाय का दूध • ₹60/L</p>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      ✓ वितरित (2.0L)
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">दैनिक स्थिति:</span>
                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-xs font-black text-slate-800">
                      <span>2.0 Liters</span>
                    </div>
                  </div>
                </div>

                {/* Voice Log Highlight Chip */}
                <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-emerald-950 truncate">
                      "राकेश को 2L दूध और वर्मा जी की छुट्टी दर्ज करो"
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      ✓ ऐप ने आवाज पहचान कर हिसाब तुरंत अपडेट कर दिया
                    </p>
                  </div>
                </div>

                {/* WhatsApp UPI Bill Simulation Chip */}
                <div className="mt-2.5 p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-900">मासिक WhatsApp बिल तैयार</p>
                      <p className="text-[10px] text-slate-500">कुल: ₹2,400 • GPay/PhonePe QR शामिल</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-1 rounded-lg shrink-0">
                    भेजें 🚀
                  </span>
                </div>

              </div>
            )}

            {/* TAB 2: Real Dairy Farm Video Showcase */}
            {heroRightTab === 'FARM_VIDEO' && (
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-3 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950">
                  <video
                    src="/media/video.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[10px] font-bold bg-emerald-600/90 text-white px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                        <Check className="w-3 h-3" />
                        <span>स्वस्थ पशु, शुद्ध दूध</span>
                      </span>
                      <h4 className="font-black text-sm">आधुनिक डेयरी फार्मिंग एवं पशु स्वास्थ्य</h4>
                      <p className="text-[11px] text-slate-300">स्वच्छ वातावरण से लेकर घर-घर ताज़ा दूध पहुंचाने का डिजिटल साथी</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs font-bold text-slate-700">
                    {lang === 'hi' ? 'भारतीय डेयरी किसानों और स्थानीय दूधियों का सच्चा डिजिटल साथी' : 'Dedicated to India’s hardworking dairy farmers and milkmen'}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Panoramic Dairy Heritage Banner Card */}
      <section className="py-6 px-4 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950 h-52 sm:h-64 md:h-72">
          <img
            src="/media/banner-image-2.jpg"
            alt="Dairy Cows Grazing Pasture"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent flex items-center px-6 sm:px-12 md:px-16 text-left">
            <div className="max-w-xl text-white space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                🌿 {lang === 'hi' ? 'प्राकृतिक पोषण एवं शुद्धता' : 'Natural Care & Farm Purity'}
              </span>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black leading-tight text-white drop-shadow-md">
                {lang === 'hi' ? 'स्वस्थ पशु, ताज़ा दूध और पारदर्शी डिजिटल हिसाब' : 'Healthy Cattle, Fresh Milk & Transparent Ledgers'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow-sm">
                {lang === 'hi' 
                  ? 'देश भर के 10,000+ दूधियों और लाखों परिवारों का अटूट भरोसा।' 
                  : 'Empowering 10,000+ dairy vendors and millions of households across India.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3-Pillar Feature Tabs */}
      <section className="py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase text-blue-700 tracking-wider bg-blue-100 px-3 py-1 rounded-full">
            {lang === 'hi' ? 'मुख्य सुविधाएं (Features)' : 'Key Features'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {lang === 'hi' ? 'दूधिया और ग्राहक दोनों के लिए आधुनिक तकनीक' : 'Modern Dairy Tech for Milkmen & Households'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            {lang === 'hi' ? 'हर रोज़ का हिसाब-किताब हो गया अब बिल्कुल आसान और पारदर्शी।' : 'Daily ledger management simplified with 100% transparency.'}
          </p>
        </div>

        {/* Feature Tab Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {featureTabs.map((f, idx) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFeatureTab(idx)}
              className={`p-4 rounded-2xl text-left border transition cursor-pointer ${
                activeFeatureTab === idx
                  ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10'
                  : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {f.icon}
                <span className="text-xs font-bold text-slate-700">{f.badge}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 leading-snug">{f.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{f.desc}</p>
            </button>
          ))}
        </div>

        {/* Active Tab Detailed Highlight Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 text-left">
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
              {featureTabs[activeFeatureTab].badge}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {featureTabs[activeFeatureTab].title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {featureTabs[activeFeatureTab].desc}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-blue-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{featureTabs[activeFeatureTab].highlight}</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => onOpenAuth('vendor', 'LOGIN')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              {lang === 'hi' ? 'दूधिया के रूप में शुरू करें' : 'Start as Vendor'}
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('customer', 'LOGIN')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {lang === 'hi' ? 'ग्राहक के रूप में देखें' : 'View as Customer'}
            </button>
          </div>
        </div>
      </section>

      {/* Location-Based Milkman Discovery Bar */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 py-10 px-4 text-white shadow-inner">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              {lang === 'hi' ? 'अपने क्षेत्र का सत्यापित दूधिया खोजें' : 'Find Verified Milkmen in Your Area'}
            </h3>
            <p className="text-xs sm:text-sm text-blue-200 mt-1">
              {lang === 'hi' ? 'गाय और भैंस के ताज़ा दूध की दैनिक होम डिलीवरी के लिए स्थानीय दूधियों से सीधे जुड़ें।' : 'Connect directly with local dairies for fresh cow & buffalo milk delivery.'}
            </p>
          </div>

          <div className="bg-white p-2 sm:p-2.5 rounded-2xl flex flex-col sm:flex-row items-center gap-2 shadow-xl">
            <div className="flex items-center gap-2.5 px-3 flex-1 w-full text-slate-800">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenFindMilkman(localSearch);
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenFindMilkman(localSearch)}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shrink-0 shadow-sm cursor-pointer"
            >
              {t('findMilkman')}
            </button>
          </div>

          {/* Quick Area Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-blue-200 font-semibold">{lang === 'hi' ? 'लोकप्रिय क्षेत्र:' : 'Popular Areas:'}</span>
            {['Jamalpur', 'Gurgaon', 'Sector 14', 'Palam Vihar', 'Delhi NCR', 'Manesar'].map(area => (
              <button
                key={area}
                type="button"
                onClick={() => onOpenFindMilkman(area)}
                className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer"
              >
                📍 {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">10,000+</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">{t('metric1Desc')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">10 Sec</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">{t('metric2Desc')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">WhatsApp</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">{t('metric3Desc')}</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">₹0</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">{lang === 'hi' ? 'मुफ़्त रजिस्ट्रेशन' : 'Free Registration'}</div>
          </div>
        </div>
      </section>

      {/* About Us Spotlight Section with Authentic Alpine Pasture Image */}
      <section className="bg-slate-50/70 py-14 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs text-left">
            
            {/* Mountain Pasture Header Banner */}
            <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-slate-900">
              <img
                src="/media/banner-image1.png"
                alt="Dairy Cows on Alpine Meadow"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-5">
                <span className="text-xs font-bold text-white bg-blue-600/90 px-3 py-1 rounded-full backdrop-blur-xs">
                  {lang === 'hi' ? 'शुद्धता और भरोसे की डिजिटल नींव' : 'The Foundation of Dairy Trust & Purity'}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold uppercase text-blue-700 tracking-wider">
                    {t('aboutBadge')}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {lang === 'hi' ? 'स्थापना: 2026' : 'Est. 2026'}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {t('aboutHeading')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {t('aboutP1')}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {t('aboutP2')}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleNav('ABOUT')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition active:scale-95 cursor-pointer"
                >
                  <span>{lang === 'hi' ? 'हमारे बारे में पूरी जानकारी पढ़ें' : 'Read Full About Us Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-slate-400 font-normal">
                  {lang === 'hi' ? 'बिना किसी कागजी झंझट के संपूर्ण समाधान' : 'Modern SaaS Built for Dairy Supply'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Customer & Vendor Testimonials */}
      <section className="py-14 px-4 max-w-5xl mx-auto text-left">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase text-blue-700 tracking-wider bg-blue-100 px-3 py-1 rounded-full">
            {t('testiBadge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
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
      <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white py-14 px-4 border-t border-blue-900 text-left">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase text-blue-300 tracking-wider bg-white/10 px-3 py-1 rounded-full">
              {t('contactBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">
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
                className="mt-3 text-[11px] font-bold text-blue-300 hover:text-white underline pt-2 border-t border-white/10 cursor-pointer"
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
                  className="text-sm font-bold text-white hover:text-emerald-300 block mt-1 tracking-wide"
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
                  className="text-sm font-bold text-white hover:text-amber-300 block mt-1 tracking-wide"
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
              <p className="text-[11px] text-slate-300 mt-3 pt-2 border-t border-white/10">Near Post Office, Jamalpur, Gurgaon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Menu Navigation Links */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-10 px-4 border-t border-slate-900 text-left">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <p className="text-base font-bold text-white tracking-tight">
                Milk Hisab • Digital Milk Ledger
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'hi' 
                  ? 'सन् 2026 में स्थापित • देश भर के दूधियों और परिवारों के लिए भरोसेमंद डिजिटल डायरी'
                  : 'Established in 2026 • Trusted by dairy vendors & households across India'}
              </p>
            </div>

            {/* Footer Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold">
              <button 
                type="button" 
                onClick={() => handleNav('ABOUT')}
                className="hover:text-white transition cursor-pointer"
              >
                {t('menuAbout')}
              </button>
              <span className="text-slate-700">•</span>
              <button 
                type="button" 
                onClick={() => handleNav('CONTACT')}
                className="hover:text-white transition cursor-pointer"
              >
                {t('menuContact')}
              </button>
              <span className="text-slate-700">•</span>
              <button 
                type="button" 
                onClick={() => handleNav('TERMS')}
                className="hover:text-white transition cursor-pointer"
              >
                {t('menuTerms')}
              </button>
              <span className="text-slate-700">•</span>
              <button 
                type="button" 
                onClick={() => handleNav('PRIVACY')}
                className="hover:text-white transition cursor-pointer"
              >
                {t('menuPrivacy')}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
            <p>
              Helpline: <a href="tel:+919971880670" className="hover:text-white underline">+91 9971880670</a> (WhatsApp), <a href="tel:8053278764" className="hover:text-white underline">8053278764</a> | info@milkhisab.in
            </p>
            <p>Near Post Office, Jamalpur, Gurgaon Haryana 122503</p>
          </div>

        </div>
      </footer>
    </div>
  );
}
