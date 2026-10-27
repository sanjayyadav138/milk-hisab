import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, User, Phone, MapPin, Building, CreditCard, 
  ShieldCheck, CheckCircle2, Save, KeyRound, Camera, Upload, 
  Clock, IndianRupee, Sparkles, AlertCircle 
} from 'lucide-react';
import { AuthState } from '../types';
import { updateVendorProfileApi, updateCustomerProfileApi, uploadAvatarApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface ProfileViewProps {
  auth: AuthState;
  onProfileUpdated: (updatedAuth: AuthState) => void;
  onBack: () => void;
}

export default function ProfileView({ auth, onProfileUpdated, onBack }: ProfileViewProps) {
  const { lang, t } = useLanguage();
  const isVendor = auth.role === 'vendor';
  const isCustomer = auth.role === 'customer';

  // Vendor Fields
  const [vendorName, setVendorName] = useState(auth.user?.name || '');
  const [vendorPhone, setVendorPhone] = useState(auth.user?.phone || '');
  const [vendorBusiness, setVendorBusiness] = useState(auth.user?.business_name || '');
  const [vendorUpi, setVendorUpi] = useState(auth.user?.upi_id || '');
  const [vendorCity, setVendorCity] = useState(auth.user?.city || 'Gurugram');
  const [vendorArea, setVendorArea] = useState(auth.user?.area || 'Jamalpur / Sohna Road');
  const [vendorPincode, setVendorPincode] = useState(auth.user?.pincode || '122001');
  const [vendorServiceAreas, setVendorServiceAreas] = useState(auth.user?.service_areas || '');
  const [vendorPriceCow, setVendorPriceCow] = useState(auth.user?.price_cow?.toString() || '60');
  const [vendorPriceBuffalo, setVendorPriceBuffalo] = useState(auth.user?.price_buffalo?.toString() || '70');
  const [vendorMorningTime, setVendorMorningTime] = useState(auth.user?.morning_time || '6:00 AM - 8:00 AM');
  const [vendorEveningTime, setVendorEveningTime] = useState(auth.user?.evening_time || '5:30 PM - 7:30 PM');

  // Customer Fields
  const [custName, setCustName] = useState(auth.customer?.name || '');
  const [custPhone, setCustPhone] = useState(auth.customer?.phone || '');
  const [custAddress, setCustAddress] = useState(auth.customer?.address || '');
  const [custQty, setCustQty] = useState(auth.customer?.default_quantity?.toString() || '1.0');
  const [custType, setCustType] = useState(auth.customer?.milk_type || 'Cow');
  const [custPrice, setCustPrice] = useState(auth.customer?.price_per_liter?.toString() || '60.0');

  // Common Avatar & PIN
  const [avatarUrl, setAvatarUrl] = useState(
    isVendor ? auth.user?.avatar_url || '' : auth.customer?.avatar_url || ''
  );
  const [uploadingImg, setUploadingImg] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = isVendor ? vendorName : custName;
  const initial = (displayName.trim()[0] || 'U').toUpperCase();

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(lang === 'hi' ? 'कृपया केवल फोटो (JPG/PNG) चुनें' : 'Please select a valid image file');
      return;
    }

    setUploadingImg(true);
    setErrorMsg('');
    try {
      const res = await uploadAvatarApi(file);
      setAvatarUrl(res.url);
      setSuccessMsg(lang === 'hi' ? 'फोटो अपलोड हो गई!' : 'Photo uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (newPin && newPin.trim().length < 4) {
      setErrorMsg(lang === 'hi' ? 'नया पिन कम से कम 4 अंकों का होना चाहिए' : 'New PIN must be at least 4 digits');
      setLoading(false);
      return;
    }

    if (newPin && newPin !== confirmPin) {
      setErrorMsg(lang === 'hi' ? 'नया पिन और कन्फर्म पिन मेल नहीं खा रहे' : 'New PIN and Confirm PIN do not match');
      setLoading(false);
      return;
    }

    try {
      if (isVendor && auth.user) {
        const res = await updateVendorProfileApi({
          id: auth.user.id,
          name: vendorName.trim(),
          phone: vendorPhone.trim(),
          business_name: vendorBusiness.trim(),
          upi_id: vendorUpi.trim(),
          avatar_url: avatarUrl.trim() || undefined,
          pin: newPin.trim() || undefined
        });

        const newAuth: AuthState = {
          ...auth,
          user: {
            ...res.user,
            city: vendorCity,
            area: vendorArea,
            pincode: vendorPincode,
            service_areas: vendorServiceAreas,
            price_cow: parseFloat(vendorPriceCow) || 60,
            price_buffalo: parseFloat(vendorPriceBuffalo) || 70,
            morning_time: vendorMorningTime,
            evening_time: vendorEveningTime
          }
        };
        onProfileUpdated(newAuth);
        setSuccessMsg(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : 'Profile updated successfully!');
      } else if (isCustomer && auth.customer) {
        const res = await updateCustomerProfileApi({
          id: auth.customer.id,
          name: custName.trim(),
          phone: custPhone.trim(),
          address: custAddress.trim(),
          default_quantity: parseFloat(custQty) || 1.0,
          milk_type: custType,
          price_per_liter: parseFloat(custPrice) || 60.0,
          avatar_url: avatarUrl.trim() || undefined,
          pin: newPin.trim() || undefined
        });

        const newAuth: AuthState = {
          ...auth,
          customer: res.customer
        };
        onProfileUpdated(newAuth);
        setSuccessMsg(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : 'Profile updated successfully!');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>{lang === 'hi' ? 'वापस डैशबोर्ड पर जाएँ' : 'Back to Dashboard'}</span>
          </button>
          
          <div className="text-right">
            <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              isVendor ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isVendor ? (lang === 'hi' ? 'दूधिया प्रोफ़ाइल' : 'Vendor Account') : (lang === 'hi' ? 'ग्राहक प्रोफ़ाइल' : 'Customer Account')}
            </span>
          </div>
        </div>

        {/* Page Title Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Upload Area */}
          <div className="relative group shrink-0">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden font-bold text-3xl text-white ${
              isVendor ? 'bg-gradient-to-br from-blue-600 to-indigo-800' : 'bg-gradient-to-br from-emerald-600 to-teal-800'
            }`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImg}
              className="absolute bottom-0 right-0 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg border-2 border-white transition active:scale-95"
              title={lang === 'hi' ? 'फोटो अपलोड करें' : 'Upload photo'}
            >
              {uploadingImg ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleImageFileChange} 
              className="hidden" 
            />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{displayName}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isVendor ? vendorBusiness : (lang === 'hi' ? 'पंजीकृत परिवार / उपभोक्ता' : 'Registered Household')}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'फोटो बदलें (Upload Photo)' : 'Upload New Photo'}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  {lang === 'hi' ? 'फोटो हटाएं' : 'Remove Photo'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm font-bold shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900 text-xs sm:text-sm font-bold shadow-2xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {lang === 'hi' ? 'व्यक्तिगत जानकारी' : 'Basic Information'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {lang === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={isVendor ? vendorName : custName}
                  onChange={(e) => isVendor ? setVendorName(e.target.value) : setCustName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {lang === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={isVendor ? vendorPhone : custPhone}
                  onChange={(e) => isVendor ? setVendorPhone(e.target.value) : setCustPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vendor Specific Business & Services */}
          {isVendor && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {lang === 'hi' ? 'डेयरी व्यवसाय व सेवा क्षेत्र' : 'Dairy Business & Delivery Coverage'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {lang === 'hi' ? 'डेयरी / व्यवसाय का नाम *' : 'Dairy / Business Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorBusiness}
                    onChange={(e) => setVendorBusiness(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {lang === 'hi' ? 'UPI ID (QR पेमेंट प्राप्ति हेतु)' : 'UPI ID (For Instant Customer Payments)'}
                  </label>
                  <input
                    type="text"
                    value={vendorUpi}
                    onChange={(e) => setVendorUpi(e.target.value)}
                    placeholder="9971880670@upi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {lang === 'hi' ? 'शहर / जिला' : 'City / District'}
                  </label>
                  <input
                    type="text"
                    value={vendorCity}
                    onChange={(e) => setVendorCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {lang === 'hi' ? 'गाँव / प्रमुख इलाका' : 'Village / Area'}
                  </label>
                  <input
                    type="text"
                    value={vendorArea}
                    onChange={(e) => setVendorArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {lang === 'hi' ? 'सेवा क्षेत्र / कॉलोनियां (Service Areas)' : 'Service Areas & Colonies'}
                  </label>
                  <input
                    type="text"
                    value={vendorServiceAreas}
                    onChange={(e) => setVendorServiceAreas(e.target.value)}
                    placeholder={lang === 'hi' ? "उदा. जमालपुर, मेन बाजार, पोस्ट ऑफिस रोड, सेक्टर 47" : "e.g. Jamalpur, Main Bazar, Sector 47"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Milk Rates & Delivery Timings */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-800 uppercase mb-3 flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'hi' ? 'दूध के भाव व डिलीवरी समय' : 'Milk Rates & Delivery Timings'}</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'hi' ? 'गाय का दूध (₹/L)' : 'Cow Milk Rate'}
                    </label>
                    <input
                      type="number"
                      value={vendorPriceCow}
                      onChange={(e) => setVendorPriceCow(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'hi' ? 'भैंस का दूध (₹/L)' : 'Buffalo Milk Rate'}
                    </label>
                    <input
                      type="number"
                      value={vendorPriceBuffalo}
                      onChange={(e) => setVendorPriceBuffalo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'hi' ? 'सुबह का समय' : 'Morning Time'}
                    </label>
                    <input
                      type="text"
                      value={vendorMorningTime}
                      onChange={(e) => setVendorMorningTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {lang === 'hi' ? 'शाम का समय' : 'Evening Time'}
                    </label>
                    <input
                      type="text"
                      value={vendorEveningTime}
                      onChange={(e) => setVendorEveningTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Customer Specific Delivery Preferences */}
          {isCustomer && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {lang === 'hi' ? 'दूध डिलीवरी विवरण व पता' : 'Delivery Address & Preferences'}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {lang === 'hi' ? 'घर / डिलीवरी का पता' : 'Delivery Address'}
                  </label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {lang === 'hi' ? 'दैनिक दूध मात्रा (L)' : 'Default Quantity (Liters)'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={custQty}
                      onChange={(e) => setCustQty(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {lang === 'hi' ? 'दूध प्रकार' : 'Milk Type'}
                    </label>
                    <select
                      value={custType}
                      onChange={(e) => setCustType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="Cow">{lang === 'hi' ? 'गाय का दूध (Cow)' : 'Cow Milk'}</option>
                      <option value="Buffalo">{lang === 'hi' ? 'भैंस का दूध (Buffalo)' : 'Buffalo Milk'}</option>
                      <option value="Mixed">{lang === 'hi' ? 'मिश्रित दूध (Mixed)' : 'Mixed Milk'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Security / Change PIN */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {lang === 'hi' ? 'सुरक्षा पिन बदलें (Change PIN)' : 'Security PIN'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {lang === 'hi' ? 'यदि आप अपना लॉगिन पिन बदलना चाहते हैं तो यहाँ दर्ज करें (वैकल्पिक)' : 'Leave blank if you do not want to change your PIN'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {lang === 'hi' ? 'नया 4-अंकीय पिन' : 'New 4-digit PIN'}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 tracking-wider focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {lang === 'hi' ? 'नया पिन दोबारा डालें' : 'Confirm New PIN'}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 tracking-wider focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition"
            >
              {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'बदलाव सुरक्षित करें (Save Profile)' : 'Save Profile Changes'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
