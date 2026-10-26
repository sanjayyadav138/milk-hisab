import React, { useState } from 'react';
import { 
  Sparkles, Zap, Users, Star, Award, 
  MapPin, Phone, MessageCircle, ArrowRight, UserCheck 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  onOpenAuth: (role: 'vendor' | 'customer', tab?: 'LOGIN' | 'REGISTER') => void;
}

export default function LandingPage({ onOpenAuth }: LandingPageProps) {
  const { t, lang } = useLanguage();
  const [activeBanner, setActiveBanner] = useState(0);

  const banners = [
    {
      badge: lang === 'hi' ? "🥛 भारत का नंबर 1 डिजिटल दूध बहीखाता" : "🥛 India's #1 Digital Milk Diary",
      title: lang === 'hi' ? "कागजी डायरी छोड़िए, फोन पर 1-क्लिक में दूध का हिसाब रखिए!" : "Ditch Paper Diaries. Track Milk Delivery & Billing in 1-Click!",
      desc: lang === 'hi' 
        ? "दूधिया और ग्राहक दोनों के लिए बेहद आसान। बोलकर एंट्री करें, ऑटोमैटिक मासिक बिल बनाएं और सीधे WhatsApp पर भेजें।"
        : "Super simple for milk vendors & households. Voice-powered logging, automated monthly ledger, and instant WhatsApp bill sharing with UPI.",
    },
    {
      badge: lang === 'hi' ? "🎙️ बोलकर एंट्री (Voice Assistant)" : "🎙️ Voice-Powered Logging (Natural Speech)",
      title: lang === 'hi' ? "'राकेश को 2 लीटर दूध और शर्मा जी की छुट्टी दर्ज करो'" : "'Add 2 Liters for Rakesh and Skip Sharma Ji Today'",
      desc: lang === 'hi'
        ? "माइक दबाइए और देसी हिंदी में बोलिए। ऐप अपने आप समझकर पूरा हिसाब सही कर देगा।"
        : "Tap the mic and speak naturally. The app extracts customer names and updates daily quantities automatically.",
    },
    {
      badge: lang === 'hi' ? "📲 1-क्लिक WhatsApp बिलिंग व UPI" : "📲 1-Click WhatsApp Bills & UPI QR",
      title: lang === 'hi' ? "महीने के अंत में हिसाब का झंझट खत्म!" : "No More Month-End Billing Headaches!",
      desc: lang === 'hi'
        ? "ग्राहकों को सीधे उनके WhatsApp पर बिल और PhonePe/GPay का UPI लिंक भेजें। ग्राहक घर बैठे हिसाब चेक करें।"
        : "Send itemized bills straight to customer WhatsApp chats with Google Pay & PhonePe UPI QR links.",
    }
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-slate-800 flex flex-col font-sans">
      {/* Top Banner Bar - Dairy Navy Trust Anchor */}
      <div className="bg-blue-900 text-blue-100 text-xs py-2 px-4 text-center font-bold tracking-wide">
        {t('announcement')}
      </div>

      {/* Hero Interactive Banner Carousel */}
      <section className="relative overflow-hidden py-12 md:py-20 px-4 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{banners[activeBanner].badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
            {banners[activeBanner].title}
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {banners[activeBanner].desc}
          </p>

          {/* Action CTAs - Primary Dairy Blue for Trust */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuth('vendor', 'LOGIN')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 text-sm sm:text-base active:scale-95 transition flex items-center gap-2"
            >
              <span>{t('ctaVendor')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenAuth('customer', 'LOGIN')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-2xl backdrop-blur-md border border-white/20 text-sm sm:text-base active:scale-95 transition"
            >
              {t('ctaCustomer')}
            </button>
          </div>

          {/* Banner Selector Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                className={`h-2 rounded-full transition-all ${
                  activeBanner === i ? 'w-8 bg-blue-400' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Decorative Grid Light */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
      </section>

      {/* Trust & Metric Counter */}
      <section className="bg-white border-y border-slate-200 py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-blue-700">{t('metric1Val')}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('metric1Desc')}</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-blue-700">{t('metric2Val')}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('metric2Desc')}</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{t('metric3Val')}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('metric3Desc')}</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-blue-700">{t('metric4Val')}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('metric4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Core Features Pillars */}
      <section className="py-14 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase text-blue-700 tracking-wider bg-blue-100 px-3 py-1 rounded-full">
            {t('featuresBadge')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
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

      {/* About Us Section */}
      <section className="bg-slate-100/70 py-14 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-black uppercase text-blue-700 tracking-wider">
                {t('aboutBadge')}
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
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
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
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                RY
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
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                SJ
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
            {/* Founder Card */}
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-xs border border-white/10 flex flex-col justify-between">
              <div>
                <UserCheck className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold">Sanjay Yadav</h4>
                <p className="text-xs text-blue-200 mt-1">{t('contactFounderRole')}</p>
              </div>
              <p className="text-[11px] text-slate-300 mt-3 pt-2 border-t border-white/10">Milk Hisab Initiative</p>
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
                href="https://wa.me/919971880670?text=Namaste%20Sanjay%20ji%2C%20I%20want%20to%20know%20more%20about%20Milk%20Hisab" 
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

      {/* Footer - Pure Milk Hisab Branding, No 'All Rights Reserved' */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 px-4 border-t border-slate-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-sm font-black text-white tracking-tight">Milk Hisab • Digital Milk Ledger India</p>
            <p className="text-xs text-slate-400 mt-1">
              Founder: <span className="font-bold text-blue-400">Sanjay Yadav</span> | Contact: <a href="tel:+919971880670" className="hover:text-white underline font-semibold">+91 9971880670</a> (WhatsApp), <a href="tel:8053278764" className="hover:text-white underline font-semibold">8053278764</a>
            </p>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <p>Made with ❤️ for Indian Milkmen and Families.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
