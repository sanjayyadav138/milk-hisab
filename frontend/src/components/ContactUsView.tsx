import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, Clock, Send, CheckCircle2, 
  Building, MessageSquare, ArrowLeft, ShieldCheck, Globe 
} from 'lucide-react';
import { submitContactInquiryApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface ContactUsViewProps {
  onBack?: () => void;
}

export default function ContactUsView({ onBack }: ContactUsViewProps) {
  const { lang } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    comments: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.location.trim() || !formData.comments.trim()) {
      setErrorMsg(lang === 'hi' ? 'कृपया सभी फ़ील्ड भरें।' : 'Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await submitContactInquiryApi(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        location: '',
        comments: ''
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting inquiry');
    } finally {
      setSubmitting(false);
    }
  };

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
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {lang === 'hi' ? 'सपोर्ट सक्रिय' : 'Support Active'}
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>{lang === 'hi' ? 'संपर्क सूत्र व सहायता' : 'Contact Us & Support'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            {lang === 'hi' ? 'हमसे सीधे संपर्क करें' : 'Get in Touch with Milk Hisab'}
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'अपनी डेयरी को डिजिटल बनाने, हिसाब संबंधी पूछताछ या तकनीकी सहायता के लिए नीचे दिया गया फ़ॉर्म भरें। हमारी समर्पित टीम 24 घंटे में आपसे संपर्क करेगी।'
              : 'Have questions, need help setting up your dairy, or want dedicated onboarding? Submit the form below and our team will get in touch.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-6">
        
        {/* Contact Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
          
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {lang === 'hi' ? 'संपर्क फ़ॉर्म (Contact Inquiry Form)' : 'Submit Your Inquiry'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'hi' ? 'सभी विवरण सावधानीपूर्वक भरें। आपका डेटा सुरक्षित और गोपनीय रखा जाता है।' : 'Please provide accurate details so our support specialists can assist you promptly.'}
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {lang === 'hi' ? 'आपकी पूछताछ सफलतापूर्वक प्राप्त हो गई!' : 'Thank you! Your inquiry has been received.'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                {lang === 'hi'
                  ? 'हमारे कस्टमर सपोर्ट और टेक्निकल टीम के प्रतिनिधि शीघ्र ही आपके फ़ोन नंबर या ईमेल पर संपर्क करेंगे।'
                  : 'Our support representative will review your inquiry and reach out to your phone or email within 24 business hours.'}
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
              >
                {lang === 'hi' ? 'नया संदेश भेजें' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'hi' ? 'पूरा नाम (Full Name) *' : 'Full Name *'}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder={lang === 'hi' ? 'उदा. अमित कुमार' : 'e.g. Amit Kumar'}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'hi' ? 'फ़ोन नंबर (Phone Number) *' : 'Phone Number *'}
                  </label>
                  <input 
                    type="tel"
                    required
                    placeholder="+91 98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'hi' ? 'ईमेल आईडी (Email Address) *' : 'Email Address *'}
                  </label>
                  <input 
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    {lang === 'hi' ? 'स्थान / शहर / राज्य (Location / City) *' : 'Location / City / State *'}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder={lang === 'hi' ? 'उदा. गुरुग्राम, हरियाणा' : 'e.g. Gurugram, Haryana'}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {lang === 'hi' ? 'संदेश या टिप्पणी (Comments / Message) *' : 'Comments / Message *'}
                </label>
                <textarea 
                  rows={4}
                  required
                  placeholder={lang === 'hi' ? 'यहाँ अपनी आवश्यकता या सवाल लिखें...' : 'Describe your query, business requirements or feedback...'}
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 text-xs sm:text-sm active:scale-95 transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>{lang === 'hi' ? 'भेजा जा रहा है...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{lang === 'hi' ? 'पूछताछ सबमिट करें (Submit Inquiry)' : 'Submit Inquiry'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* HEAD OFFICE & OFFICIAL CONTACT DETAILS BELOW FORM */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                <Building className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  {lang === 'hi' ? 'प्रधान कार्यालय एवं संपर्क विवरण' : 'Head Office & Official Contact Details'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'hi' ? 'पंजीकृत कार्यालय व ग्राहक सहायता केंद्र' : 'Registered Corporate Office & Support Center'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Head Office Address */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                      {lang === 'hi' ? 'प्रधान कार्यालय (Head Office)' : 'Corporate Headquarters'}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                      Milk Hisab Digital Technologies
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Plot 42, Tech Horizon Park, Sector 48, Sohna Road,<br />
                      Gurugram, Haryana – 122018, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Helplines */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                      {lang === 'hi' ? 'हेल्पलाइन व WhatsApp' : 'Phone & WhatsApp Helplines'}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                      +91 9971880670 / +91 8053278764
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'hi' ? 'सीधे WhatsApp पर भी संदेश भेज सकते हैं।' : 'Official WhatsApp support available directly.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Emails */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                      {lang === 'hi' ? 'आधिकारिक ईमेल (Email)' : 'Official Inquiries & Support'}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                      support@milkhisab.in
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      contact@milkhisab.in
                    </p>
                  </div>
                </div>
              </div>

              {/* Operating Hours & Nationwide Coverage */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider">
                      {lang === 'hi' ? 'कार्य समय व सेवा क्षेत्र' : 'Working Hours & Coverage'}
                    </h4>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                      सोमवार – शनिवार: 8:00 AM – 8:00 PM IST
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'hi' ? 'अखिल भारतीय सेवा (Pan-India Digital Dairy Support)' : 'Nationwide Service across India'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
