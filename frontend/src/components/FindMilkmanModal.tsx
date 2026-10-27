import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Milk, Clock, Phone, Sparkles, 
  X, CheckCircle, ArrowRight, ShieldCheck, Send 
} from 'lucide-react';
import { searchVendorsApi, createMilkRequestApi } from '../services/api';
import { VendorSearchResult, AuthState } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FindMilkmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  auth?: AuthState;
}

export default function FindMilkmanModal({ isOpen, onClose, initialQuery = '', auth }: FindMilkmanModalProps) {
  const { t, lang } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [vendors, setVendors] = useState<VendorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selected vendor for milk request
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Request form state
  const [reqForm, setReqForm] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    locality: '',
    milk_type: 'Cow',
    quantity: 1.5,
    delivery_time: 'Morning',
    start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      handleSearch(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const q = searchTerm !== undefined ? searchTerm : query;
      const res = await searchVendorsApi(q.trim());
      setVendors(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequest = async (vendor: VendorSearchResult) => {
    setSelectedVendor(vendor);

    // Requirement 3: If logged in as customer, send request directly with customer details!
    if (auth?.role === 'customer' && auth.customer) {
      setSubmitting(true);
      try {
        const cust = auth.customer;
        await createMilkRequestApi(vendor.id, {
          customer_name: cust.name,
          customer_phone: cust.phone || '',
          address: cust.address || '',
          locality: vendor.area || vendor.city || '',
          city: vendor.city,
          pincode: vendor.pincode,
          milk_type: cust.milk_type || 'Cow',
          quantity: cust.default_quantity || 1.5,
          delivery_time: 'Morning',
          start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          notes: ''
        });
        setRequestSubmitted(true);
      } catch (err: any) {
        alert(lang === 'hi' ? 'अनुरोध भेजने में त्रुटि: ' + err.message : 'Error sending request: ' + err.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Otherwise, show form for unauthenticated visitors
    setRequestSubmitted(false);
    setReqForm(prev => ({
      ...prev,
      locality: vendor.area || vendor.city || ''
    }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    if (!reqForm.customer_name.trim() || !reqForm.customer_phone.trim() || !reqForm.address.trim()) {
      alert(lang === 'hi' ? 'कृपया नाम, फोन और पता दर्ज करें' : 'Please fill Name, Phone and Address');
      return;
    }

    setSubmitting(true);
    try {
      await createMilkRequestApi(selectedVendor.id, {
        customer_name: reqForm.customer_name.trim(),
        customer_phone: reqForm.customer_phone.trim(),
        address: reqForm.address.trim(),
        locality: reqForm.locality.trim() || selectedVendor.area,
        city: selectedVendor.city,
        pincode: selectedVendor.pincode,
        milk_type: reqForm.milk_type,
        quantity: parseFloat(String(reqForm.quantity)) || 1.0,
        delivery_time: reqForm.delivery_time,
        start_date: reqForm.start_date,
        notes: reqForm.notes.trim() || undefined
      });
      setRequestSubmitted(true);
    } catch (err: any) {
      alert("अनुरोध भेजने में त्रुटि: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-2xl">
              <Search className="w-5 h-5 text-blue-300" />
            </span>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-tight">
                {t('searchNearbyMilkman')}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                {lang === 'hi' ? 'सत्यापित दूधिए खोजें व ताज़ा दूध मंगवाएं' : 'Find verified milkmen & request fresh daily milk'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Area Pills */}
        {!selectedVendor && (
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm active:scale-95 transition"
              >
                {lang === 'hi' ? 'खोजें' : 'Search'}
              </button>
            </form>

            {/* Quick Filter Tags */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto text-[11px] font-bold text-slate-600 pb-1">
              <span className="text-slate-400 text-[10px] shrink-0 uppercase tracking-wider">{lang === 'hi' ? 'सुझाव:' : 'Nearby:'}</span>
              {['Jamalpur', '122001', 'Gurugram', 'Mandir Road', 'All'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const val = tag === 'All' ? '' : tag;
                    setQuery(val);
                    handleSearch(val);
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 rounded-xl shrink-0 transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          
          {/* View 1: List of Local Milkmen */}
          {!selectedVendor && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-xs font-semibold text-slate-500">
                    {lang === 'hi' ? 'आपके इलाके में दूधिए खोज रहे हैं...' : 'Searching nearby milkmen...'}
                  </p>
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 p-6">
                  <Milk className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">
                    {lang === 'hi' ? 'इस इलाके में कोई दूधिया नहीं मिला' : 'No milkmen found for this location'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'hi' ? 'कृपया अन्य पिनकोड या इलाके का नाम डालकर खोजें।' : 'Try searching with another pincode or village name.'}
                  </p>
                  <button
                    onClick={() => { setQuery(''); handleSearch(''); }}
                    className="mt-3 text-xs font-bold text-blue-600 underline"
                  >
                    {lang === 'hi' ? 'सभी उपलब्ध दूधिए देखें' : 'View all available milkmen'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <p className="text-xs font-bold text-slate-500">
                    {lang === 'hi' ? `${vendors.length} दूधिए उपलब्ध हैं:` : `${vendors.length} verified milkmen available:`}
                  </p>
                  {vendors.map((vendor) => (
                    <div 
                      key={vendor.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-base">
                            {vendor.name}
                          </h4>
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {lang === 'hi' ? 'सत्यापित' : 'Verified'}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-blue-800 mt-0.5">
                          {vendor.business_name}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium">{vendor.area}, {vendor.city} ({vendor.pincode})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{vendor.morning_time}</span>
                          </span>
                        </div>

                        {vendor.service_areas && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">{lang === 'hi' ? 'सेवा क्षेत्र:' : 'Areas:'}</span> {vendor.service_areas}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs font-bold">
                          <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                            🐄 {lang === 'hi' ? 'गाय:' : 'Cow:'} ₹{vendor.price_cow}/L
                          </span>
                          <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200">
                            🐃 {lang === 'hi' ? 'भैंस:' : 'Buffalo:'} ₹{vendor.price_buffalo}/L
                          </span>
                        </div>
                      </div>

                      <div className="sm:self-center shrink-0">
                        <button
                          onClick={() => handleOpenRequest(vendor)}
                          disabled={submitting}
                          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-md text-xs sm:text-sm active:scale-95 transition flex items-center justify-center gap-1.5"
                        >
                          <span>{t('requestMilk')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View 2: Milk Request Form */}
          {selectedVendor && !requestSubmitted && (
            <div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 mb-3 flex items-center gap-1"
              >
                ← {lang === 'hi' ? 'वापस सूची पर जाएं' : 'Back to vendor list'}
              </button>

              <div className="bg-blue-50/70 rounded-2xl p-3.5 border border-blue-200 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  🥛
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedVendor.name} ({selectedVendor.business_name})
                  </h4>
                  <p className="text-xs text-slate-600">
                    📍 {selectedVendor.area}, {selectedVendor.city} • 🐄 ₹{selectedVendor.price_cow}/L | 🐃 ₹{selectedVendor.price_buffalo}/L
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'hi' ? 'आपका नाम *' : 'Your Name *'}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder=""
                      value={reqForm.customer_name}
                      onChange={(e) => setReqForm({ ...reqForm, customer_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'hi' ? 'फ़ोन नंबर (WhatsApp) *' : 'Phone Number *'}
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder=""
                      value={reqForm.customer_phone}
                      onChange={(e) => setReqForm({ ...reqForm, customer_phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'hi' ? 'घर का पूरा पता (मकान नं., गली, लैंडमार्क) *' : 'Full House Address *'}
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder=""
                    value={reqForm.address}
                    onChange={(e) => setReqForm({ ...reqForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'hi' ? 'दूध प्रकार' : 'Milk Type'}
                    </label>
                    <select
                      value={reqForm.milk_type}
                      onChange={(e) => setReqForm({ ...reqForm, milk_type: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Cow">{lang === 'hi' ? 'गाय (Cow)' : 'Cow'}</option>
                      <option value="Buffalo">{lang === 'hi' ? 'भैंस (Buffalo)' : 'Buffalo'}</option>
                      <option value="Mixed">{lang === 'hi' ? 'मिश्रित (Mixed)' : 'Mixed'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'hi' ? 'दैनिक मात्रा (लीटर)' : 'Daily Qty (L)'}
                    </label>
                    <input 
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="20"
                      value={reqForm.quantity}
                      onChange={(e) => setReqForm({ ...reqForm, quantity: parseFloat(e.target.value) || 1.0 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('preferredTime')}
                    </label>
                    <select
                      value={reqForm.delivery_time}
                      onChange={(e) => setReqForm({ ...reqForm, delivery_time: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Morning">{t('morning')}</option>
                      <option value="Evening">{t('evening')}</option>
                      <option value="Both">{t('bothTimes')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('startDate')}
                    </label>
                    <input 
                      type="date"
                      value={reqForm.start_date}
                      onChange={(e) => setReqForm({ ...reqForm, start_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('specialNotes')}
                    </label>
                    <input 
                      type="text"
                      placeholder=""
                      value={reqForm.notes}
                      onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/20 text-sm active:scale-95 transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>{lang === 'hi' ? 'अनुरोध भेजा जा रहा है...' : 'Sending request...'}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'अनुरोध भेजें (Send Request)' : 'Send Milk Request'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* View 3: Success Confirmation */}
          {selectedVendor && requestSubmitted && (
            <div className="text-center py-8 px-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h4 className="text-xl font-bold text-slate-900">
                {lang === 'hi' ? 'दूध अनुरोध सफलतापूर्वक भेजा गया!' : 'Milk Request Sent Successfully!'}
              </h4>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed font-normal">
                {lang === 'hi'
                  ? `आपका अनुरोध ${selectedVendor.name} (${selectedVendor.business_name}) को प्राप्त हो गया है। दूधिया द्वारा स्वीकार करते ही आपकी सप्लाई शुरू कर दी जाएगी।`
                  : `Your request has been received by ${selectedVendor.name}. Once accepted, your daily milk supply will start.`}
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => { setSelectedVendor(null); setRequestSubmitted(false); onClose(); }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition"
                >
                  {lang === 'hi' ? 'बंद करें (Done)' : 'Close'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
