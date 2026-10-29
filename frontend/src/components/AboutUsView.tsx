import React from 'react';
import { 
  Building2, ShieldCheck, Award, Users, Milk, Sparkles, 
  CheckCircle, HeartHandshake, MapPin, Play, Film, CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AboutUsView() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 font-sans">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white py-14 px-4 relative overflow-hidden">
        {/* Decorative Milk Splash Accent */}
        <img
          src="/media/milk-image2.png"
          alt="Milk splash"
          className="absolute -right-10 -bottom-10 w-72 opacity-15 pointer-events-none select-none hidden sm:block"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4">
            <Building2 className="w-4 h-4" />
            <span>{lang === 'hi' ? 'Milk Hisab के बारे में' : 'About Milk Hisab'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {lang === 'hi' 
              ? 'भारत की पारंपरिक दूध व्यवस्था का आधुनिक डिजिटल बहीखाता' 
              : "Empowering India's Dairy Ecosystem with Digital Transparency"}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {lang === 'hi'
              ? 'साल 2026 में स्थापित Milk Hisab का एकमात्र लक्ष्य देश भर के लाखों मेहनती स्थानीय दूधियों (दूध विक्रेताओं), दुग्ध उत्पादक किसानों और घरेलू उपभोक्ताओं के बीच पूर्ण पारदर्शिता और हिसाब में सहूलियत लाना है।'
              : 'Established in 2026, Milk Hisab was founded to replace archaic paper diaries with voice-powered, transparent digital recordkeeping for dairy vendors, farmers, and households across India.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        
        {/* Core Establishment Overview Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-8">
          
          {/* Panoramic Meadow Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
            <img 
              src="/media/banner-image-2.jpg" 
              alt="Dairy Pasture Cattle" 
              className="w-full h-48 sm:h-64 object-cover group-hover:scale-102 transition duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent flex items-end p-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {lang === 'hi' ? 'देसी गौवंश और शुद्धता' : 'Pure Indigenous Dairy Heritage'}
                </span>
                <p className="text-white text-base sm:text-lg font-bold mt-1">
                  {lang === 'hi' 
                    ? 'गाँव के खेतों से आपके घर के किचन तक — 100% शुद्धता व पारदर्शी हिसाब' 
                    : 'From Village Pastures to Family Kitchens — 100% Integrity & Clarity'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-blue-700 tracking-wider bg-blue-100 px-3 py-1 rounded-full">
              {lang === 'hi' ? 'हमारी स्थापना व पृष्ठभूमि' : 'Our Establishment & Background'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-3">
              {lang === 'hi' ? 'कागज़ की डायरी से डिजिटल क्रांति तक का सफ़र' : 'From Torn Paper Notebooks to Digital Integrity'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed font-normal">
              {lang === 'hi'
                ? 'भारत विश्व का सबसे बड़ा दुग्ध उत्पादक राष्ट्र है। प्रतिदिन करोड़ों घरों में दूध की आपूर्ति स्थानीय दूधियों (दूधिया/ग्वाला) और गाँव के किसानों के माध्यम से होती है। दशकों से यह पूरा लेन-देन फटी-पुरानी कागजी डायरियों, कैलेंडर के पन्नों और मौखिक भरोसे पर निर्भर था। महीने की आखिरी तारीख को छुट्टी के दिनों पर बहस होना, हिसाब की गलतियां और बिल वसूली में महीनों की देरी दोनों पक्षों के लिए सिरदर्द बन जाती थी।'
                : 'India is the world’s largest producer and consumer of milk. Every morning, millions of households rely on local milk vendors and dairy farmers for fresh milk. For decades, this massive unorganized supply chain operated on torn pocket notebooks and wall calendars, leading to disputes over skipped days, calculation errors, and delayed payments.'}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
              {lang === 'hi'
                ? 'इसी गंभीर जमीनी समस्या के समाधान हेतु सन् 2026 में Milk Hisab की स्थापना की गई। इस प्लेटफ़ॉर्म को इस तरह डिज़ाइन किया गया है कि धूप, बारिश और मोटरसाइकिल की सवारी के बीच भी एक दूधिया केवल आवाज़ (Voice Assistant) से 1 सेकंड में दैनिक हिसाब दर्ज कर सके, और ग्राहक अपने स्मार्टफोन पर रीयल-टाइम दूध का हिसाब देख सकें।'
                : 'To solve this grassroots friction, Milk Hisab was established in 2026. Engineered with a mobile-first, voice-enabled interface, it allows milkmen on motorbikes to record entries with natural voice commands in seconds, while empowering consumers to view itemized ledgers in real time.'}
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {lang === 'hi' ? '100% निष्पक्ष व पारदर्शी' : '100% Transparency'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'दूधिया और ग्राहक दोनों को एक ही वास्तविक डिलीवरी रिकॉर्ड दिखता है, जिससे किसी भी प्रकार के मतभेद की कोई गुंजाइश नहीं रहती।'
                  : 'Single source of truth accessible to both the vendor and household, eliminating billing reconciliation friction.'}
              </p>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {lang === 'hi' ? 'देसी बोलचाल व आवाज़' : 'Voice-First Technology'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'टाइपिंग की कोई मजबूरी नहीं। अपनी सामान्य हिंदी या क्षेत्रीय भाषा में बोलकर तुरंत डिलीवरी या छुट्टी दर्ज करें।'
                  : 'Natural language speech recognition built for field workers to log records hands-free without tedious typing.'}
              </p>
            </div>

            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {lang === 'hi' ? 'दोतरफा संकलन व वितरण' : 'Bilateral Supply Chain'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'गाँव के 4-5 घरों से दूध इकट्ठा (संकलन) करने से लेकर शहर के घरों में वितरण तक, खरीद व बिक्री दोनों का संपूर्ण संतुलन।'
                  : 'Complete balance accounting from inward milk procurement at village cattle farms to outward urban retail delivery.'}
              </p>
            </div>
          </div>

          {/* Video Showcase: Modern Dairy Farm & Animal Health */}
          <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-slate-800 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
                  {lang === 'hi' ? 'वीडियो टूर' : 'Farm Video Tour'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
                  <Film className="w-5 h-5 text-emerald-400" />
                  <span>{lang === 'hi' ? 'आधुनिक फार्म प्रबंधन और पशु स्वास्थ्य' : 'Modern Dairy Farm & Cattle Care'}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                {lang === 'hi' 
                  ? 'स्वच्छ शेड, पौष्टिक चारा और स्वस्थ दुधारू पशु — भारत के अग्रणी डेयरी फार्मिंग मानक।'
                  : 'Clean barns, nutritious feed, and healthy cattle — modern Indian dairy farming standards.'}
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video max-h-96 w-full">
              <video
                src="/media/video.mp4"
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Mission & Vision Statements */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>{lang === 'hi' ? 'हमारा मिशन (Our Mission)' : 'Our Mission'}</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'भारत के असंगठित दुग्ध क्षेत्र को बिना किसी शुल्क या जटिलता के आधुनिक तकनीक प्रदान करना, ताकि देश का हर छोटा-बड़ा दूधिया अपनी मेहनत का सही व त्वरित मूल्य प्राप्त कर सके और हर परिवार को शुद्ध दूध का निर्बाध हिसाब मिले।'
                  : 'To digitally modernize India’s traditional unorganized milk distribution sector with zero financial or technical barriers, ensuring milkmen receive timely payments while households enjoy complete clarity on daily milk supply.'}
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'hi' ? 'हमारा विज़न (Our Vision)' : 'Our Vision'}</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
                {lang === 'hi'
                  ? 'देश के कोने-कोने में स्थित हर गाँव, कस्बे और मेट्रो शहर में डिजिटल डायरी का मानक बनना, जहाँ कागजी डायरी का उपयोग पूरी तरह समाप्त हो और हर महीने का हिसाब 1 क्लिक में संपन्न हो।'
                  : 'To become the national digital ledger standard across every village, town, and metropolitan city in India, transforming manual dairy recordkeeping into a seamless 1-click experience.'}
              </p>
            </div>
          </div>

          {/* Key Milestones */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm mb-3">
              {lang === 'hi' ? 'Milk Hisab की प्रमुख विशेषताएं' : 'Core Capabilities of the Platform'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
              {[
                lang === 'hi' ? '1-क्लिक WhatsApp बिल और सुरक्षित UPI QR लिंक' : '1-Click WhatsApp invoices with Google Pay & PhonePe UPI QR',
                lang === 'hi' ? 'देसी हिंदी व अंग्रेजी में संपूर्ण द्विभाषी अनुभव' : 'Bilingual accessibility in both Hindi & English',
                lang === 'hi' ? 'घर बैठे इलाके के भरोसेमंद दूधिया खोजने की सुविधा' : 'Location-based verified local milkman discovery',
                lang === 'hi' ? 'सप्लाई बंद करने या अतिरिक्त दूध हेतु रीयल-टाइम अनुरोध' : 'Customer pre-scheduled delivery pause & extra milk requests',
                lang === 'hi' ? 'परिवार के सदस्यों (Sub-Users) को जोड़ने की स्वतंत्रता' : 'Family member sub-accounts for shared household oversight',
                lang === 'hi' ? 'उच्च स्तर का डेटा एन्क्रिप्शन व 24x7 क्लाउड बैकअप' : 'Cloud data security with automated daily backup redundancy',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2.5 bg-slate-50/80 hover:bg-blue-50/50 transition rounded-xl border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
