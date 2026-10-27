import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Milk, Clock, Phone, Sparkles, 
  ArrowLeft, CheckCircle2, ArrowRight, ShieldCheck, 
  Send, SlidersHorizontal, RotateCcw, X, Star, Check 
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

  const handleOpenRequest = async (vendor: VendorSearchResult) => {
    setSelectedVendor(vendor);
    setRequestSubmitted(false);

    // If logged in as customer, instant 1-click request!
    if (auth?.role === 'customer' && auth.customer) {
      setSubmitting(true);
      try {
        await createMilkRequestApi(vendor.id, {
          customer_name: auth.customer.name,
          customer_phone: auth.customer.phone || '',
          address: auth.customer.address || '',
          locality: vendor.area || '',
          milk_type: auth.customer.milk_type || 'Cow',
          quantity: auth.customer.default_quantity || 1.0,
          delivery_time: 'Morning',
          start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          notes: 'Direct 1-click request from verified Milk Hisab customer profile'
        });
        setRequestSubmitted(true);
      } catch (err: any) {
        alert(err.message || 'Failed to submit request');
      } finally {
        setSubmitting(false);
      }
    } else {
      setReqForm({
        ...reqForm,
        milk_type: 'Cow',
        locality: vendor.area || ''
      });
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;
    setSubmitting(true);
    try {
      await createMilkRequestApi(selectedVendor.id, reqForm);
      setRequestSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
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

      {/* Request Modal / Drawer (For unauthenticated visitors or confirmation) */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="bg-gradient-to-r from-blue-700 to-indigo-900 px-5 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {lang === 'hi' ? 'दूध डिलीवरी अनुरोध' : 'Request Milk Delivery'}
                </h3>
                <p className="text-xs text-blue-100">{selectedVendor.business_name} ({selectedVendor.name})</p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedVendor(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {requestSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {lang === 'hi' ? 'अनुरोध सफलतापूर्वक भेजा गया!' : 'Request Sent Successfully!'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                    {lang === 'hi' 
                      ? `${selectedVendor.name} जी को आपका अनुरोध मिल गया है। वे जल्द ही आपसे संपर्क करके दूध सप्लाई शुरू करेंगे।`
                      : `Your milk request has been sent to ${selectedVendor.name}. They will confirm and start delivery.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedVendor(null)}
                    className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    {lang === 'hi' ? 'ठीक है (Done)' : 'Close'}
                  </button>
                </div>
              ) : (
                /* Guest Request Form */
                <form onSubmit={handleGuestSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('nameLabel')}</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={reqForm.customer_name}
                      onChange={(e) => setReqForm({ ...reqForm, customer_name: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('phoneLabel')}</label>
                    <input
                      type="tel"
                      required
                      placeholder=""
                      value={reqForm.customer_phone}
                      onChange={(e) => setReqForm({ ...reqForm, customer_phone: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('addressLabel')}</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={reqForm.address}
                      onChange={(e) => setReqForm({ ...reqForm, address: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('qtyLabel')}</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        required
                        value={reqForm.quantity}
                        onChange={(e) => setReqForm({ ...reqForm, quantity: parseFloat(e.target.value) || 1.0 })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('milkTypeLabel')}</label>
                      <select
                        value={reqForm.milk_type}
                        onChange={(e) => setReqForm({ ...reqForm, milk_type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:border-blue-600 focus:outline-none bg-white"
                      >
                        <option value="Cow">{t('cowMilk')} (₹{selectedVendor.price_cow}/L)</option>
                        <option value="Buffalo">{t('buffaloMilk')} (₹{selectedVendor.price_buffalo}/L)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'अनुरोध भेजें (Send Request)' : 'Submit Request'}</span>
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
