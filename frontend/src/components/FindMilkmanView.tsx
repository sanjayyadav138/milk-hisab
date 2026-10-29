import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Milk, Clock, Phone, Sparkles, 
  ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck, 
  Send, SlidersHorizontal, RotateCcw, X, Star, Check, Calendar 
} from 'lucide-react';
import { searchVendorsApi, createMilkRequestApi } from '../services/api';
import { VendorSearchResult, AuthState } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FindMilkmanViewProps {
  initialQuery?: string;
  auth?: AuthState;
  onBack: () => void;
}

export default function FindMilkmanView({ initialQuery = '', auth, onBack }: FindMilkmanViewProps) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [vendors, setVendors] = useState<VendorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [milkTypeFilter, setMilkTypeFilter] = useState<'ALL' | 'Cow' | 'Buffalo'>('ALL');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(100);
  const [timingFilter, setTimingFilter] = useState<'ALL' | 'Morning' | 'Evening'>('ALL');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Selected vendor for milk request
  const [selectedVendor, setSelectedVendor] = useState<VendorSearchResult | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Request form state (for unauthenticated visitors)
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
    handleSearch(initialQuery);
  }, [initialQuery]);

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

  const handleResetFilters = () => {
    setQuery('');
    setMilkTypeFilter('ALL');
    setMaxPriceFilter(100);
    setTimingFilter('ALL');
    handleSearch('');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleOpenRequest = (vendor: VendorSearchResult) => {
    setSelectedVendor(vendor);
    setRequestSubmitted(false);

    if (auth?.role === 'customer' && auth.customer) {
      setReqForm({
        customer_name: auth.customer.name,
        customer_phone: auth.customer.phone || '',
        address: auth.customer.address || '',
        locality: vendor.area || vendor.city || '',
        milk_type: auth.customer.milk_type || 'Cow',
        quantity: auth.customer.default_quantity || 1.5,
        delivery_time: 'Morning',
        start_date: tomorrowStr,
        notes: ''
      });
    } else {
      setReqForm({
        customer_name: '',
        customer_phone: '',
        address: '',
        locality: vendor.area || vendor.city || '',
        milk_type: 'Cow',
        quantity: 1.5,
        delivery_time: 'Morning',
        start_date: tomorrowStr,
        notes: ''
      });
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    if (!reqForm.customer_name.trim() || !reqForm.customer_phone.trim()) {
      alert(lang === 'hi' ? 'कृपया नाम और फोन नंबर दर्ज करें' : 'Please provide Name and Phone');
      return;
    }

    setSubmitting(true);
    try {
      await createMilkRequestApi(selectedVendor.id, {
        customer_name: reqForm.customer_name.trim(),
        customer_phone: reqForm.customer_phone.trim(),
        address: reqForm.address.trim() || selectedVendor.area || selectedVendor.city || 'स्थानीय',
        locality: reqForm.locality.trim() || selectedVendor.area || '',
        city: selectedVendor.city,
        pincode: selectedVendor.pincode,
        milk_type: reqForm.milk_type,
        quantity: Number(reqForm.quantity) || 1.0,
        delivery_time: reqForm.delivery_time,
        start_date: reqForm.start_date,
        notes: reqForm.notes.trim() || undefined
      });
      setRequestSubmitted(true);
    } catch (err: any) {
      alert(lang === 'hi' ? 'अनुरोध भेजने में समस्या आई: ' + err.message : 'Error sending request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredVendors = vendors.filter(v => {
    if (milkTypeFilter === 'Cow' && !v.price_cow) return false;
    if (milkTypeFilter === 'Buffalo' && !v.price_buffalo) return false;
    if (maxPriceFilter < 100) {
      const minPrice = Math.min(v.price_cow || 999, v.price_buffalo || 999);
      if (minPrice > maxPriceFilter) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition active:scale-95"
              title={lang === 'hi' ? 'वापस जाएँ' : 'Go back'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {lang === 'hi' ? 'अपने क्षेत्र का दूधिया खोजें' : 'Find Your Local Milkman'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'hi' 
                  ? 'गाँव, सेक्टर या पिनकोड से प्रमाणित दूधियों की सूची देखें और सीधे दूध मंगवाएँ' 
                  : 'Discover verified dairy vendors, compare cow & buffalo milk rates, and subscribe'}
              </p>
            </div>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex-1 py-2 px-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'फ़िल्टर व खोज' : 'Filters & Search'}</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Layout: Left Filters + Right Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className={`lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-5 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {lang === 'hi' ? 'खोज व फ़िल्टर' : 'Filter Milkmen'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1"
                title={lang === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset filters'}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{lang === 'hi' ? 'रीसेट' : 'Reset'}</span>
              </button>
            </div>

            {/* Location Search Bar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                {lang === 'hi' ? 'इलाका, गाँव या पिनकोड' : 'Location or Pincode'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={lang === 'hi' ? "उदा. जमालपुर, सेक्टर 56..." : "e.g. Jamalpur, 122503..."}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                {lang === 'hi' ? 'खोजें (Search)' : 'Search'}
              </button>
            </div>

            {/* Milk Type Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                {lang === 'hi' ? 'दूध का प्रकार' : 'Milk Type'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'ALL', label: lang === 'hi' ? 'सभी' : 'All' },
                  { key: 'Cow', label: lang === 'hi' ? 'गाय' : 'Cow' },
                  { key: 'Buffalo', label: lang === 'hi' ? 'भैंस' : 'Buffalo' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMilkTypeFilter(item.key as any)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                      milkTypeFilter === item.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  {lang === 'hi' ? 'अधिकतम भाव' : 'Max Rate'}
                </label>
                <span className="text-xs font-black text-blue-700">
                  {maxPriceFilter === 100 ? (lang === 'hi' ? 'सभी भाव' : 'Any') : `₹${maxPriceFilter}/L`}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>₹50</span>
                <span>₹75</span>
                <span>₹100+</span>
              </div>
            </div>

            {/* Quick Location Shortcuts */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
                {lang === 'hi' ? 'लोकप्रिय क्षेत्र' : 'Popular Areas'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['Jamalpur', 'Gurugram', '122503', 'Sector 47', 'Main Bazar'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => { setQuery(loc); handleSearch(loc); }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-semibold rounded-lg transition"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* RIGHT MAIN AREA: MILKMAN RESULTS */}
          <main className="lg:col-span-3 space-y-4">
            
            {/* Results Status Bar */}
            <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 text-xs text-slate-600 font-bold">
              <span>
                {loading 
                  ? (lang === 'hi' ? 'दूधिया खोजे जा रहे हैं...' : 'Searching milkmen...') 
                  : (lang === 'hi' ? `${filteredVendors.length} दूधिया उपलब्ध` : `Showing ${filteredVendors.length} milkmen`)}
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                {lang === 'hi' ? '✓ सीधे दूधिया से संपर्क' : '✓ Direct Dairy Connect'}
              </span>
            </div>

            {/* Vendor Cards Grid */}
            {loading ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-600">
                  {lang === 'hi' ? 'प्रमाणित दूधियों की सूची लोड हो रही है...' : 'Finding verified dairy milkmen near you...'}
                </p>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800">
                  {lang === 'hi' ? 'इस क्षेत्र में कोई दूधिया नहीं मिला' : 'No milkmen found for this search'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {lang === 'hi' 
                    ? 'कृपया कोई अन्य गाँव, कॉलोनी या पिनकोड डालकर खोजें अथवा फ़िल्टर रीसेट करें।' 
                    : 'Try searching with another pincode, village or locality, or reset the filters.'}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  {lang === 'hi' ? 'सभी दूधिया देखें' : 'View All Milkmen'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVendors.map((vendor) => (
                  <div 
                    key={vendor.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar + Name + Verified Badge */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 overflow-hidden">
                          {vendor.avatar_url ? (
                            <img src={vendor.avatar_url} alt={vendor.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(vendor.name[0] || 'V').toUpperCase()}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {vendor.business_name}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" title="Verified Dairy" />
                          </div>
                          <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                            {vendor.name}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{vendor.area}, {vendor.city} ({vendor.pincode})</span>
                          </p>
                        </div>
                      </div>

                      {/* Pricing Badges */}
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2">
                          <p className="text-[10px] font-bold text-emerald-800 uppercase">
                            {lang === 'hi' ? 'गाय का दूध' : 'Cow Milk'}
                          </p>
                          <p className="text-sm font-bold text-emerald-900 mt-0.5">
                            ₹{vendor.price_cow} <span className="text-[10px] font-normal">/ L</span>
                          </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-2">
                          <p className="text-[10px] font-bold text-blue-800 uppercase">
                            {lang === 'hi' ? 'भैंस का दूध' : 'Buffalo Milk'}
                          </p>
                          <p className="text-sm font-bold text-blue-900 mt-0.5">
                            ₹{vendor.price_buffalo} <span className="text-[10px] font-normal">/ L</span>
                          </p>
                        </div>
                      </div>

                      {/* Delivery Timings & Coverage */}
                      <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{vendor.morning_time} | {vendor.evening_time}</span>
                        </div>
                        {vendor.service_areas && (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="text-slate-500 line-clamp-1">{vendor.service_areas}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenRequest(vendor)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'hi' ? 'दूध का अनुरोध करें (Request Milk)' : 'Request Milk Delivery'}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </main>
        </div>

      </div>

      {/* Request Modal / Drawer */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 px-5 py-4 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-base sm:text-lg">
                  {lang === 'hi' ? 'दूध डिलीवरी का अनुरोध' : 'Request Milk Delivery'}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  {selectedVendor.business_name || selectedVendor.name} • {selectedVendor.area || selectedVendor.city}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedVendor(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {requestSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">
                      {lang === 'hi' ? 'अनुरोध सफलतापूर्वक भेजा गया! ✓' : 'Request Sent Successfully! ✓'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-sm mx-auto">
                      {lang === 'hi' 
                        ? `दूधिया ${selectedVendor.name} जी को आपका अनुरोध मिल गया है। वे जल्द ही आपसे संपर्क करके सप्लाई शुरू करेंगे।`
                        : `Your request has been sent to ${selectedVendor.name}. They will contact you shortly to begin delivery.`}
                    </p>
                  </div>

                  {/* Summary card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                      {lang === 'hi' ? 'अनुरोध का विवरण:' : 'Request Summary:'}
                    </p>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{lang === 'hi' ? 'मात्रा व प्रकार:' : 'Quantity & Type:'}</span>
                      <span className="text-blue-700">{reqForm.quantity}L ({reqForm.milk_type === 'Cow' ? (lang === 'hi' ? 'गाय का दूध' : 'Cow Milk') : (lang === 'hi' ? 'भैंस का दूध' : 'Buffalo Milk')})</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{lang === 'hi' ? 'शुरुआत तारीख:' : 'Start Date:'}</span>
                      <span className="text-slate-900 font-black">{reqForm.start_date}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{lang === 'hi' ? 'डिलीवरी समय:' : 'Delivery Time:'}</span>
                      <span>{reqForm.delivery_time === 'Morning' ? t('morning') : reqForm.delivery_time === 'Evening' ? t('evening') : t('bothTimes')}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedVendor(null)}
                    className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    {lang === 'hi' ? 'ठीक है (Done)' : 'Close'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-4">

                  {/* Customer Identity Block */}
                  {auth?.role === 'customer' && auth.customer ? (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {auth.customer.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-black text-slate-900 truncate">{auth.customer.name}</p>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold shrink-0">
                              ✓ {lang === 'hi' ? 'सत्यापित खाता' : 'Verified'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">
                            📞 {auth.customer.phone} {reqForm.address ? `• 📍 ${reqForm.address}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                        {lang === 'hi' ? 'आपकी जानकारी (Customer Details):' : 'Your Details:'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('nameLabel')} *</label>
                          <input
                            type="text"
                            required
                            placeholder=""
                            value={reqForm.customer_name}
                            onChange={(e) => setReqForm({ ...reqForm, customer_name: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('phoneLabel')} *</label>
                          <input
                            type="tel"
                            required
                            placeholder=""
                            value={reqForm.customer_phone}
                            onChange={(e) => setReqForm({ ...reqForm, customer_phone: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('addressLabel')} *</label>
                        <input
                          type="text"
                          required
                          placeholder=""
                          value={reqForm.address}
                          onChange={(e) => setReqForm({ ...reqForm, address: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* If logged in customer has no address on file, ask for it */}
                  {auth?.role === 'customer' && auth.customer && !auth.customer.address && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        📍 {t('addressLabel')} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder=""
                        value={reqForm.address}
                        onChange={(e) => setReqForm({ ...reqForm, address: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* 1. HOW MUCH MILK (दूध मात्रा व प्रकार) */}
                  <div className="bg-blue-50/40 p-3.5 rounded-2xl border border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Milk className="w-4 h-4 text-blue-600" />
                        <span>{lang === 'hi' ? '1. कितना दूध चाहिए? (Daily Quantity)' : '1. How much milk? (Daily Quantity)'}</span>
                      </label>
                      <span className="text-[11px] font-bold text-blue-700">
                        ₹{(reqForm.quantity * (reqForm.milk_type === 'Cow' ? (selectedVendor.price_cow || 60) : (selectedVendor.price_buffalo || 70))).toFixed(0)} / {lang === 'hi' ? 'दिन' : 'day'}
                      </span>
                    </div>

                    {/* Stepper + Quick chips */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setReqForm(p => ({ ...p, quantity: Math.max(0.5, Math.round((p.quantity - 0.5) * 10) / 10) }))}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-700 active:scale-95 transition"
                        >
                          -
                        </button>
                        <span className="w-16 text-center font-black text-base text-slate-900">
                          {reqForm.quantity} L
                        </span>
                        <button
                          type="button"
                          onClick={() => setReqForm(p => ({ ...p, quantity: Math.min(20, Math.round((p.quantity + 0.5) * 10) / 10) }))}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-700 active:scale-95 transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {[0.5, 1.0, 1.5, 2.0, 3.0].map(q => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setReqForm(p => ({ ...p, quantity: q }))}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition ${
                              reqForm.quantity === q
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {q}L
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Milk Type Selection */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setReqForm(p => ({ ...p, milk_type: 'Cow' }))}
                        className={`p-2.5 rounded-2xl border text-left transition ${
                          reqForm.milk_type === 'Cow'
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-black text-slate-900">🐮 {t('cowMilk')}</p>
                        <p className="text-[11px] text-blue-700 font-bold mt-0.5">₹{selectedVendor.price_cow || 60}/L</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReqForm(p => ({ ...p, milk_type: 'Buffalo' }))}
                        className={`p-2.5 rounded-2xl border text-left transition ${
                          reqForm.milk_type === 'Buffalo'
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-black text-slate-900">🐃 {t('buffaloMilk')}</p>
                        <p className="text-[11px] text-blue-700 font-bold mt-0.5">₹{selectedVendor.price_buffalo || 70}/L</p>
                      </button>
                    </div>
                  </div>

                  {/* 2. FROM WHEN TO START (कब से शुरू करना है) */}
                  <div className="bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <span>{lang === 'hi' ? '2. कब से शुरू करना है? (Start Date)' : '2. From when to start? (Start Date)'}</span>
                      </label>
                      <span className="text-[11px] font-bold text-amber-900">
                        {reqForm.start_date === todayStr ? (lang === 'hi' ? 'आज से शुरू' : 'Starting Today') : reqForm.start_date === tomorrowStr ? (lang === 'hi' ? 'कल से शुरू' : 'Starting Tomorrow') : reqForm.start_date}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setReqForm(p => ({ ...p, start_date: todayStr }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          reqForm.start_date === todayStr
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lang === 'hi' ? 'आज से (Today)' : 'Today'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReqForm(p => ({ ...p, start_date: tomorrowStr }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          reqForm.start_date === tomorrowStr
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lang === 'hi' ? 'कल से (Tomorrow)' : 'Tomorrow'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {lang === 'hi' ? 'तारीख चुनें:' : 'Select Exact Date:'}
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          required
                          value={reqForm.start_date}
                          onChange={(e) => setReqForm({ ...reqForm, start_date: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {lang === 'hi' ? 'सप्लाई का समय:' : 'Delivery Timing:'}
                        </label>
                        <select
                          value={reqForm.delivery_time}
                          onChange={(e) => setReqForm({ ...reqForm, delivery_time: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                        >
                          <option value="Morning">🌅 {t('morning')}</option>
                          <option value="Evening">🌆 {t('evening')}</option>
                          <option value="Both">☀️ {t('bothTimes')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Special Instructions */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      📝 {lang === 'hi' ? 'विशेष निर्देश / नोट (वैकल्पिक):' : 'Special Instructions (Optional):'}
                    </label>
                    <input
                      type="text"
                      placeholder=""
                      value={reqForm.notes}
                      onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'दूध सप्लाई शुरू करने का अनुरोध भेजें' : 'Send Milk Request'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
