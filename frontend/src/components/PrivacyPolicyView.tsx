import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, EyeOff, Server, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PrivacyPolicyViewProps {
  onBack?: () => void;
}

export default function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 font-sans">
      
      {/* Top Breadcrumb / Back Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (onBack) onBack();
              else window.location.hash = '#/';
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}</span>
          </button>
          <span className="text-xs font-bold text-slate-500">
            {lang === 'hi' ? 'DPDP Act 2023 अनुरूप' : 'DPDP Act 2023 Compliant'}
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4">
            <Lock className="w-4 h-4" />
            <span>{lang === 'hi' ? 'डेटा गोपनीयता' : 'Data Privacy'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {lang === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'Milk Hisab में हम आपकी व्यक्तिगत जानकारी और दैनिक दूध बहीखाते की पूर्ण गोपनीयता और सुरक्षा के प्रति 100% प्रतिबद्ध हैं।'
              : 'At Milk Hisab, we prioritize the confidentiality, integrity, and security of your daily milk ledger data.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          {/* Section 1: Introduction */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>{lang === 'hi' ? 'प्रस्तावना व प्रतिबद्धता (Introduction)' : 'Introduction & Scope'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'यह गोपनीयता नीति बताती है कि जब आप Milk Hisab ("हम", "हमारा" या "प्लेटफ़ॉर्म") का उपयोग करते हैं, तो हम आपकी जानकारी को कैसे एकत्र, उपयोग, सुरक्षित और संसाधित करते हैं। हम भारत के सूचना प्रौद्योगिकी अधिनियम (IT Act, 2000) तथा डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act, 2023) के सभी प्रावधानों का कड़ाई से पालन करते हैं।'
                : 'This Privacy Policy explains how Milk Hisab ("we", "us", or "our") collects, uses, protects, and discloses information gathered through milkhisab.in. We adhere strictly to the Information Technology Act, 2000 and the Digital Personal Data Protection (DPDP) Act, 2023 of India.'}
            </p>
          </section>

          {/* Section 2: What we collect */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>{lang === 'hi' ? 'हम कौन-सी जानकारी एकत्र करते हैं (Information We Collect)' : 'Information We Collect'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'प्लेटफ़ॉर्म के सुचारू संचालन हेतु हम केवल वही जानकारी एकत्र करते हैं जो दूध के हिसाब और डिलीवरी के लिए अत्यंत आवश्यक है:'
                : 'We collect only the essential information required to operate daily milk ledgers and delivery coordination:'}
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1 text-slate-600">
              <li>{lang === 'hi' ? 'संपर्क जानकारी: नाम, मोबाइल फ़ोन नंबर, डिलीवरी का पता/मकान नंबर, इलाका/गाँव व शहर।' : 'Contact details: Name, phone number, delivery house address, village/locality, and city.'}</li>
              <li>{lang === 'hi' ? 'दैनिक दूध लॉग: दूध का प्रकार (गाय/भैंस), दैनिक मात्रा (लीटर), तारीखवार डिलीवरी या छुट्टी (Skip) की स्थिति।' : 'Daily delivery logs: Milk type (Cow/Buffalo), daily quantity in liters, dates of delivery or skip.'}</li>
              <li>{lang === 'hi' ? 'बिलिंग व भुगतान रिकॉर्ड: मासिक कुल योग, भुगतान की गई राशि, भुगतान का माध्यम (Cash/UPI) और भुगतान का समय।' : 'Billing & Payment data: Monthly aggregates, recorded amount paid, payment mode (Cash/UPI), and timestamps.'}</li>
              <li>{lang === 'hi' ? 'पूछताछ विवरण: यदि आप संपर्क फ़ॉर्म भरते हैं, तो आपका नाम, ईमेल, स्थान और टिप्पणी।' : 'Inquiry details: Information provided when submitting support or contact requests.'}</li>
            </ul>
          </section>

          {/* Section 3: How we use */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>{lang === 'hi' ? 'जानकारी का उपयोग (How We Use Information)' : 'How We Use Information'}</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>{lang === 'hi' ? 'दैनिक दूध डिलीवरी सूची और मासिक बहीखाता तैयार करने हेतु।' : 'To generate daily delivery checklists and compute automated monthly ledgers.'}</li>
              <li>{lang === 'hi' ? 'ग्राहकों को उनके WhatsApp पर सटीक बिल व UPI भुगतान लिंक प्रेषित करने हेतु।' : 'To generate WhatsApp invoice messages and UPI deep links for payment settlements.'}</li>
              <li>{lang === 'hi' ? 'उपभोक्ताओं को उनके इलाके में नजदीकी सत्यापित दूधिया खोजने में मदद करने हेतु।' : 'To facilitate location-based search for verified dairy milkmen in nearby localities.'}</li>
              <li>{lang === 'hi' ? 'ग्राहक और दूधिया के बीच चैट व आपत्ति निवारण (Dispute Resolution) को सक्षम बनाने हेतु।' : 'To enable seamless communication and delivery query resolution between parties.'}</li>
            </ul>
          </section>

          {/* Section 4: Absolute Non-Sale */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>{lang === 'hi' ? 'डेटा की बिक्री पर पूर्ण प्रतिबंध (Strict Non-Disclosure)' : 'Absolute Non-Sale Policy'}</span>
            </h3>
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 font-medium text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                <EyeOff className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  {lang === 'hi'
                    ? 'हमारा स्पष्ट संकल्प: Milk Hisab आपके फ़ोन नंबर या दूध के डेटा को किसी भी तीसरे पक्ष, विज्ञापन एजेंसी या टेलीमार्केटर को कभी नहीं बेचता, किराए पर नहीं देता और न ही साझा करता है। आपका डेटा केवल आपके और आपके दूधिया के बीच सुरक्षित रहता है।'
                    : 'Our Firm Commitment: Milk Hisab NEVER sells, rents, leases, or trades user telephone numbers, addresses, or milk records to third-party advertisers, data brokers, or marketing firms.'}
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Security */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">5.</span>
              <span>{lang === 'hi' ? 'डेटा सुरक्षा एवं भंडारण (Data Security & Cloud Storage)' : 'Data Security & Storage'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'आपका डेटा सुरक्षित क्लाउड सर्वर पर एन्क्रिप्टेड रूप में संग्रहित किया जाता है। डेटाबेस में दैनिक स्वचालित बैकअप और WAL (Write-Ahead Logging) सुरक्षा तकनीक का उपयोग किया जाता है ताकि सर्वर बंद होने की स्थिति में भी एक भी लीटर का हिसाब न खोए।'
                : 'Your records are stored on hardened cloud servers equipped with automated daily encrypted backups and Write-Ahead Logging (WAL) database integrity to prevent data loss.'}
            </p>
          </section>

          {/* Section 6: User Rights */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">6.</span>
              <span>{lang === 'hi' ? 'आपके अधिकार (Your Rights & Control)' : 'Your Rights & Data Control'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'उपभोक्ताओं और दूधियों को अपने खाते की जानकारी देखने, संपादित करने या खाता हटाने (Delete Account) का पूरा अधिकार है। यदि आप अपनी जानकारी हटाना चाहते हैं, तो आप सीधे सपोर्ट टीम से अनुरोध कर सकते हैं।'
                : 'Users retain full rights to access, correct, review, or request permanent deletion of their account records by contacting our grievance and support department.'}
            </p>
          </section>

          {/* Section 7: Grievance Officer */}
          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">7.</span>
              <span>{lang === 'hi' ? 'शिकायत अधिकारी (Grievance Officer)' : 'Grievance Redressal Officer'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'डेटा संरक्षण या गोपनीयता संबंधी किसी भी चिंता हेतु आप हमारे नोडल शिकायत अधिकारी से संपर्क कर सकते हैं:'
                : 'In accordance with the Indian Information Technology Rules, the contact details of the Grievance Officer are:'}
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2 space-y-1 text-xs">
              <p><strong>{lang === 'hi' ? 'पद:' : 'Designation:'}</strong> Grievance & Compliance Officer</p>
              <p><strong>{lang === 'hi' ? 'ईमेल:' : 'Email:'}</strong> support@milkhisab.in / grievance@milkhisab.in</p>
              <p><strong>{lang === 'hi' ? 'पता:' : 'Address:'}</strong> Milk Hisab HQ, Sector 48, Sohna Road, Gurugram, Haryana - 122018</p>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
