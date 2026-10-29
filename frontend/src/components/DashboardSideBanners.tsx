import React from 'react';
import { 
  Milk, ShieldCheck, Sparkles, CheckCircle2, 
  Smartphone, MessageCircle, Heart, Award, ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DashboardSideBannersProps {
  role: 'vendor' | 'customer';
}

export default function DashboardSideBanners({ role }: DashboardSideBannersProps) {
  const { lang } = useLanguage();

  if (role === 'customer') {
    return (
      <>
        {/* Left Side Banner - Customer */}
        <aside className="hidden xl:flex flex-col gap-4 fixed left-3 2xl:left-8 top-20 w-60 2xl:w-72 z-10 pointer-events-auto max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
          {/* Card 1: Pure Fresh Milk Quality Showcase */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-blue-100 hover:shadow-xl transition group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 p-3 text-center border border-blue-100/60">
              <img 
                src="/media/milk-image2.png" 
                alt="Fresh Pure Milk" 
                className="w-36 2xl:w-44 mx-auto object-contain drop-shadow-md group-hover:scale-105 transition duration-500" 
              />
              <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                {lang === 'hi' ? '100% शुद्ध देशी दूध' : '100% Pure Fresh Milk'}
              </span>
              <h4 className="text-xs 2xl:text-sm font-black text-slate-800 mt-1">
                {lang === 'hi' ? 'फार्म से सीधे आपके परिवार तक' : 'Direct from Farm to Family'}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                {lang === 'hi' ? 'ताज़ा, पौष्टिक और मिलावट-मुक्त दुग्ध आपूर्ति' : 'Fresh, wholesome, unadulterated dairy supply'}
              </p>
            </div>

            <div className="space-y-2 mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'hi' ? 'दैनिक ताज़ा आपूर्ति की गारंटी' : 'Guaranteed Daily Delivery'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'hi' ? 'सटीक माप और शुद्ध गुणवत्ता' : 'Standard Pure Measure'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'hi' ? 'पारदर्शी दैनिक डिजिटल हिसाब' : 'Transparent Daily Digital Log'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Desi Cow Sketch Emblem */}
          <div className="bg-gradient-to-br from-emerald-50/90 via-white to-blue-50/70 rounded-3xl p-3.5 shadow-sm border border-emerald-100/80 flex items-center gap-3">
            <img 
              src="/media/cow-image.png" 
              alt="Desi Cow" 
              className="w-12 h-12 object-contain opacity-85 shrink-0" 
            />
            <div className="min-w-0">
              <p className="text-[11px] font-black text-emerald-900 leading-tight">
                {lang === 'hi' ? 'स्वस्थ गौवंश व शुद्धता' : 'Healthy Cattle, Pure Milk'}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">
                {lang === 'hi' ? 'प्राकृतिक आहार व उचित देखभाल' : 'Nutritious feed and animal wellness'}
              </p>
            </div>
          </div>
        </aside>

        {/* Right Side Banner - Customer */}
        <aside className="hidden xl:flex flex-col gap-4 fixed right-3 2xl:right-8 top-20 w-60 2xl:w-72 z-10 pointer-events-auto max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
          {/* Card 1: Alpine Meadow Landscape */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-slate-200 hover:shadow-xl transition group overflow-hidden">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100">
              <img 
                src="/media/banner-image1.png" 
                alt="Green Meadow Cows" 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[10px] font-black text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded-md">
                  {lang === 'hi' ? 'हरी चरागाह गौशाला' : 'Green Pastures'}
                </span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <h4 className="text-xs 2xl:text-sm font-black text-slate-800">
                {lang === 'hi' ? 'डिजिटल सुविधा व भरोसा' : 'Digital Convenience & Trust'}
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {lang === 'hi' ? 'फोन पर हर तारीख का हिसाब उपलब्ध' : 'Itemized daily ledger at your fingertips'}
              </p>
            </div>

            <div className="space-y-2 mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{lang === 'hi' ? '1-क्लिक WhatsApp अलर्ट' : 'Instant WhatsApp delivery alerts'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{lang === 'hi' ? 'UPI पेमेंट QR से आसान भुगतान' : 'Pay in seconds via GPay / PhonePe'}</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span>{lang === 'hi' ? 'छुट्टी या बदलाव सीधे दर्ज करें' : 'Pre-schedule skips with zero calls'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Milk Splash Drops Accent */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-3.5 shadow-md flex items-center justify-between gap-3 relative overflow-hidden">
            <img 
              src="/media/milk-image.png" 
              alt="Milk drops" 
              className="absolute -right-2 -bottom-2 w-16 opacity-35 pointer-events-none select-none" 
            />
            <div className="relative z-10 min-w-0">
              <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">
                {lang === 'hi' ? 'सुझाव (Pro-Tip)' : 'Pro Tip'}
              </span>
              <p className="text-[11px] font-bold mt-0.5 text-blue-100 leading-tight">
                {lang === 'hi' ? 'कल दूध नहीं चाहिए? 1-क्लिक में Skip Milk दबाएं' : 'Heading out tomorrow? Use 1-click Skip Milk'}
              </p>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Vendor Role Sidebars
  return (
    <>
      {/* Left Side Banner - Vendor */}
      <aside className="hidden xl:flex flex-col gap-4 fixed left-3 2xl:left-8 top-20 w-60 2xl:w-72 z-10 pointer-events-auto max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
        {/* Card 1: Smart Dairy Cloud Management */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-blue-100 hover:shadow-xl transition group">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 p-3 text-center border border-blue-100/60">
            <img 
              src="/media/milk-image2.png" 
              alt="Fresh Pure Milk" 
              className="w-36 2xl:w-44 mx-auto object-contain drop-shadow-md group-hover:scale-105 transition duration-500" 
            />
            <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
              {lang === 'hi' ? 'स्मार्ट दुग्ध बहीखाता' : 'Smart Dairy Ledger'}
            </span>
            <h4 className="text-xs 2xl:text-sm font-black text-slate-800 mt-1">
              {lang === 'hi' ? 'कागज़ की डायरी छोड़ें, डिजिटल बनें' : 'Paperless Dairy Operation'}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              {lang === 'hi' ? 'मोटरसाइकिल पर भी 1 सेकंड में दैनिक हिसाब दर्ज करें' : 'Log daily deliveries in seconds even on the go'}
            </p>
          </div>

          <div className="space-y-2 mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{lang === 'hi' ? 'देसी आवाज़ (Voice) से त्वरित एंट्री' : 'Voice-assisted hands-free entry'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{lang === 'hi' ? 'संकलन व वितरण का स्वचालित संतुलन' : 'Bilateral collection & distribution'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{lang === 'hi' ? 'शेष बचा दूध (Surplus) तुरंत देखें' : 'Real-time surplus stock calculation'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Desi Cow Sketch Emblem */}
        <div className="bg-gradient-to-br from-emerald-50/90 via-white to-blue-50/70 rounded-3xl p-3.5 shadow-sm border border-emerald-100/80 flex items-center gap-3">
          <img 
            src="/media/cow-image.png" 
            alt="Desi Cow" 
            className="w-12 h-12 object-contain opacity-85 shrink-0" 
          />
          <div className="min-w-0">
            <p className="text-[11px] font-black text-emerald-900 leading-tight">
              {lang === 'hi' ? 'शुद्ध देसी गौ दुग्ध क्रांति' : 'Pure Indigenous Dairy Movement'}
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">
              {lang === 'hi' ? 'मेहनती दूधियों और किसानों का सच्चा साथी' : 'Built for hardworking dairy vendors'}
            </p>
          </div>
        </div>
      </aside>

      {/* Right Side Banner - Vendor */}
      <aside className="hidden xl:flex flex-col gap-4 fixed right-3 2xl:right-8 top-20 w-60 2xl:w-72 z-10 pointer-events-auto max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-none">
        {/* Card 1: Pasture Image & Automated Billing */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-slate-200 hover:shadow-xl transition group overflow-hidden">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100">
            <img 
              src="/media/banner-image1.png" 
              alt="Pasture Cows" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[10px] font-black text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded-md">
                {lang === 'hi' ? 'तेज़ व पारदर्शी वसूली' : 'Faster Collections'}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <h4 className="text-xs 2xl:text-sm font-black text-slate-800">
              {lang === 'hi' ? '1-क्लिक WhatsApp बिलिंग' : '1-Click WhatsApp Invoices'}
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {lang === 'hi' ? 'महीने के अंत में बहस और देरी का झंझट खत्म' : 'No end-of-month tallying or disputes'}
            </p>
          </div>

          <div className="space-y-2 mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-600">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{lang === 'hi' ? 'सीधा ग्राहक के WhatsApp पर सुंदर बिल' : 'Direct itemized PDF/text bills on WhatsApp'}</span>
            </div>
            <div className="flex items-start gap-2">
              <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>{lang === 'hi' ? 'आपका सीधा बैंक UPI QR कोड शामिल' : 'Embedded Google Pay & PhonePe UPI QR'}</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
              <span>{lang === 'hi' ? '24x7 सुरक्षित ऑटोमैटिक बैकअप' : 'Cloud data security & daily backups'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Milk Drops Pro Tip Accent */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-3.5 shadow-md flex items-center justify-between gap-3 relative overflow-hidden">
          <img 
            src="/media/milk-image.png" 
            alt="Milk drops" 
            className="absolute -right-2 -bottom-2 w-16 opacity-35 pointer-events-none select-none" 
          />
          <div className="relative z-10 min-w-0">
            <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider">
              {lang === 'hi' ? 'सुझाव (Tip)' : 'Pro Tip'}
            </span>
            <p className="text-[11px] font-bold mt-0.5 text-blue-100 leading-tight">
              {lang === 'hi' ? 'माइक बटन दबाएं और बोलें: "राकेश को 2L दूध दर्ज करो"' : 'Tap Mic & speak: "Add 2L for Rakesh"'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
