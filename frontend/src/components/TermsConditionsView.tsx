import React from 'react';
import { FileText, ArrowLeft, Shield, Scale, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface TermsConditionsViewProps {
  onBack?: () => void;
}

export default function TermsConditionsView({ onBack }: TermsConditionsViewProps) {
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
            {lang === 'hi' ? 'अंतिम अपडेट: अक्टूबर 2026' : 'Last Updated: October 2026'}
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4">
            <Scale className="w-4 h-4" />
            <span>{lang === 'hi' ? 'कानूनी नियम' : 'Legal Terms'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {lang === 'hi' ? 'नियम एवं शर्तें (Terms and Conditions)' : 'Terms & Conditions'}
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'Milk Hisab प्लेटफ़ॉर्म (वेबसाइट, मोबाइल ऐप्लिकेशन व एपीआई) का उपयोग करने से पहले कृपया इन नियमों को ध्यानपूर्वक पढ़ें।'
              : 'Please read these terms and conditions carefully before using the Milk Hisab digital platform and services.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>{lang === 'hi' ? 'नियमों की स्वीकृति (Acceptance of Terms)' : 'Acceptance of Terms'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'Milk Hisab (milkhisab.in) वेबसाइट, वेब ऐप या संबंधित किसी भी सेवा का उपयोग करने पर आप यह स्वीकार करते हैं कि आप इन नियमों और शर्तों तथा हमारी गोपनीयता नीति (Privacy Policy) से पूरी तरह बाध्य हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया प्लेटफ़ॉर्म का उपयोग न करें।'
                : 'By accessing or using Milk Hisab (milkhisab.in), its web applications, or related services, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to all terms, you must discontinue using the platform.'}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>{lang === 'hi' ? 'सेवाओं का विवरण (Description of Services)' : 'Description of Services'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'Milk Hisab एक डिजिटल बहीखाता (SaaS Recordkeeping & Ledger Management Platform) है, जो दुग्ध विक्रेताओं (दूधिया/ग्वाला), दुग्ध संकलन घरों (किसान/सप्लायर) और घरेलू उपभोक्ताओं को दैनिक दूध वितरण, छुट्टी (Skip), अतिरिक्त दूध, मासिक बिलिंग और डिजिटल लेज़र संधारण की सुविधा प्रदान करता है।'
                : 'Milk Hisab is a B2B SaaS digital bookkeeping and ledger management platform designed to help milkmen (vendors), milk collection suppliers (farmers), and residential consumers track daily delivery logs, pauses (skips), extra milk orders, monthly statements, and WhatsApp payment notifications.'}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>{lang === 'hi' ? 'वित्तीय लेनदेन एवं देयता अस्वीकरण (Financial Disclaimer)' : 'Financial Disclaimer & Payments'}</span>
            </h3>
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 font-medium text-xs leading-relaxed">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  {lang === 'hi'
                    ? 'महत्वपूर्ण सूचना: Milk Hisab कोई वित्तीय संस्था, बैंक या पेमेंट गेटवे नहीं है। यह प्लेटफ़ॉर्म केवल दूध की मात्रा का हिसाब जोड़ने और तृतीय-पक्ष UPI (Google Pay, PhonePe, Paytm, BHIM) के भुगतान लिंक तैयार करने में सहायता करता है। दूध की खरीद-बिक्री, दूध की शुद्धता/गुणवत्ता तथा वास्तविक रुपयों का लेन-देन पूर्णतः संबंधित दूधिया और ग्राहक के मध्य का निजी विषय है।'
                    : 'Important Disclaimer: Milk Hisab is not a banking institution, wallet, or payment gateway. The platform merely computes milk quantities and provides UPI intent links for customer convenience. Actual milk trades, quality verification, and financial settlements occur strictly between the milk vendor and consumer.'}
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>{lang === 'hi' ? 'उपयोगकर्ता खाता एवं पिन सुरक्षा (User Accounts & PIN)' : 'User Accounts & Security'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'उपयोगकर्ता अपने मोबाइल नंबर और पिन (PIN/पासवर्ड) की गोपनीयता बनाए रखने के लिए स्वयं उत्तरदायी हैं। आपके खाते के माध्यम से होने वाली किसी भी गतिविधि के लिए आप जिम्मेदार होंगे। यदि आपको किसी अनधिकृत उपयोग का संदेह हो, तो तुरंत अपना पिन बदलें।'
                : 'Users are responsible for safeguarding their login phone number and access PIN credentials. You agree to accept responsibility for all activities that occur under your registered account.'}
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">5.</span>
              <span>{lang === 'hi' ? 'डेटा की शुद्धता एवं आपत्तियां (Data Accuracy & Disputes)' : 'Data Accuracy & Query Resolutions'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'दैनिक रूप से दर्ज की जाने वाली मात्रा दूधिया द्वारा दर्ज की जाती है तथा ग्राहक पोर्टल के माध्यम से उपभोक्ता द्वारा सत्यापित की जा सकती है। यदि किसी तारीख की एंट्री में कोई त्रुटि हो, तो ग्राहक ऐप में दिए गए "Query/आपत्ति" बटन के माध्यम से आपत्ति दर्ज कर सकते हैं, जिसका समाधान दूधिया द्वारा आपसी सहमति से किया जाएगा।'
                : 'Daily log quantities are updated by vendors and visible to customers on their portal. In the event of discrepancy in recorded quantities, customers can raise a Query via the portal, which the vendor resolves through mutual accord.'}
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">6.</span>
              <span>{lang === 'hi' ? 'बौद्धिक संपदा अधिकार (Intellectual Property)' : 'Intellectual Property Rights'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'Milk Hisab नाम, लोगो, सॉफ्टवेयर कोड, ग्राफिक्स, डेटाबेस आर्किटेक्चर और डिज़ाइन सभी कॉपीराइट तथा बौद्धिक संपदा कानूनों द्वारा संरक्षित हैं। बिना पूर्व लिखित अनुमति के इसका व्यावसायिक पुनरुत्पादन या रिवर्स इंजीनियरिंग प्रतिबंधित है।'
                : 'All trademarks, logos, system code, visual designs, and database architectures of Milk Hisab are the proprietary intellectual property of Milk Hisab. Reverse engineering or unauthorized commercial duplication is strictly prohibited.'}
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">7.</span>
              <span>{lang === 'hi' ? 'लागू कानून एवं अधिकार क्षेत्र (Governing Law & Jurisdiction)' : 'Governing Law & Jurisdiction'}</span>
            </h3>
            <p>
              {lang === 'hi'
                ? 'ये नियम एवं शर्तें भारत के कानूनों के अनुसार शासित और व्याख्यायित की जाएंगी। इस प्लेटफ़ॉर्म से संबंधित किसी भी विवाद या कानूनी कार्यवाही का विशेष अधिकार क्षेत्र हरियाणा / नई दिल्ली, भारत की अदालतों के अधीन होगा।'
                : 'These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute arising under these terms shall be subject to the exclusive jurisdiction of the competent courts of Haryana / New Delhi, India.'}
            </p>
          </section>

        </div>

      </div>

    </div>
  );
}
