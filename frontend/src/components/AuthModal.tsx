import React, { useState, useEffect } from 'react';
import { 
  X, User, Store, ShieldCheck, ArrowRight, MessageCircle, 
  KeyRound, CheckCircle2, ArrowLeft, Building2, Mail, Phone 
} from 'lucide-react';
import { loginApi, registerVendorApi, registerCustomerApi, fetchVendorsList, forgotPinApi } from '../services/api';
import { AuthState, VendorInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (auth: AuthState) => void;
  initialRole?: 'vendor' | 'customer';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialRole = 'vendor' }: AuthModalProps) {
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'vendor' | 'customer'>(initialRole);
  const [customerCategory, setCustomerCategory] = useState<'BUYER' | 'SUPPLIER'>('BUYER');
  
  // Login fields
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  // Forgot PIN state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotResult, setForgotResult] = useState<{ pin: string; whatsapp_share_url?: string } | null>(null);

  // Vendor register fields
  const [vendorName, setVendorName] = useState('');
  const [vendorBusiness, setVendorBusiness] = useState('');
  const [vendorUpi, setVendorUpi] = useState('');

  // Customer / Supplier register fields
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custQty, setCustQty] = useState('1.5');
  const [custType, setCustType] = useState('Cow');
  const [custPrice, setCustPrice] = useState('60');
  const [vendorsList, setVendorsList] = useState<VendorInfo[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchVendorsList()
      .then((list) => {
        setVendorsList(list);
        if (list.length > 0) setSelectedVendorId(list[0].id);
      })
      .catch((e) => console.warn('Could not load vendors list', e));
  }, []);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await loginApi(phone, role, pin);
      onSuccess({
        role: data.role,
        user: data.user || null,
        customer: data.customer || null,
        token: data.token || null,
        expires_at: data.expires_at || null,
        last_active_at: Date.now(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setForgotResult(null);

    try {
      const res = await forgotPinApi({
        phone: phone.trim(),
        role
      });
      setForgotResult({
        pin: res.pin,
        whatsapp_share_url: res.whatsapp_share_url
      });
      setPin(res.pin);
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'hi' ? 'पिन रीसेट करने में त्रुटि आई' : 'Failed to reset PIN'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (role === 'vendor') {
        await registerVendorApi({
          name: vendorName,
          phone,
          business_name: vendorBusiness || `${vendorName} Dairy`,
          upi_id: vendorUpi || `${phone}@upi`,
          pin: pin.trim() || undefined
        });
        const data = await loginApi(phone, 'vendor', pin.trim() || '1234');
        onSuccess({ 
          role: 'vendor', 
          user: data.user, 
          customer: null,
          token: data.token || null,
          expires_at: data.expires_at || null,
          last_active_at: Date.now(),
        });
      } else {
        const regRes = await registerCustomerApi({
          name: custName,
          phone,
          email: custEmail.trim() || undefined,
          address: custAddress,
          default_quantity: parseFloat(custQty) || 1.0,
          milk_type: custType,
          price_per_liter: parseFloat(custPrice) || 60.0,
          customer_type: customerCategory,
          vendor_id: selectedVendorId,
          pin: pin.trim() || undefined
        });

        const activePin = regRes.pin || pin.trim() || '1234';
        const data = await loginApi(phone, 'customer', activePin);
        onSuccess({ 
          role: 'customer', 
          user: null, 
          customer: data.customer,
          token: data.token || null,
          expires_at: data.expires_at || null,
          last_active_at: Date.now(),
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || t('registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-lg">{t('modalTitle')}</h3>
              <p className="text-xs text-blue-100 font-medium">{t('modalSub')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
            <button
              onClick={() => { setTab('LOGIN'); setIsForgotMode(false); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                tab === 'LOGIN' && !isForgotMode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('tabLogin')}
            </button>
            <button
              onClick={() => { setTab('REGISTER'); setIsForgotMode(false); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                tab === 'REGISTER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('tabRegister')}
            </button>
          </div>

          {/* Role Chooser */}
          {!isForgotMode && (
            <div className={`grid ${tab === 'REGISTER' ? 'grid-cols-3' : 'grid-cols-2'} gap-2 mb-4`}>
              <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition ${
                  role === 'vendor'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Store className={`w-5 h-5 ${role === 'vendor' ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs font-bold leading-tight text-center">
                  {lang === 'hi' ? 'दूधिया (Vendor)' : 'Milkman'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setRole('customer'); setCustomerCategory('BUYER'); }}
                className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition ${
                  role === 'customer' && customerCategory === 'BUYER'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className={`w-5 h-5 ${role === 'customer' && customerCategory === 'BUYER' ? 'text-blue-700' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs font-bold leading-tight text-center">
                  {lang === 'hi' ? 'ग्राहक (Family)' : 'Customer'}
                </span>
              </button>

              {tab === 'REGISTER' && (
                <button
                  type="button"
                  onClick={() => { setRole('customer'); setCustomerCategory('SUPPLIER'); }}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition ${
                    role === 'customer' && customerCategory === 'SUPPLIER'
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className={`w-5 h-5 ${role === 'customer' && customerCategory === 'SUPPLIER' ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span className="text-[11px] sm:text-xs font-bold leading-tight text-center">
                    {lang === 'hi' ? 'संकलन घर (Supplier)' : 'Supplier'}
                  </span>
                </button>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* FORGOT PIN VIEW */}
          {isForgotMode ? (
            <form onSubmit={handleForgotPin} className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900 text-xs">
                <p className="font-bold">{lang === 'hi' ? 'पासवर्ड / पिन भूल गए?' : 'Forgot Security PIN?'}</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {lang === 'hi' 
                    ? 'अपना पंजीकृत मोबाइल नंबर डालें। सिस्टम आपके लिए एक नया सुरक्षित पिन जनरेट करके WhatsApp/SMS पर भेजेगा।' 
                    : 'Enter your registered mobile number to generate and receive a new security PIN.'}
                </p>
              </div>

              {forgotResult ? (
                <div className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      {lang === 'hi' ? 'नया पिन सफलतापूर्वक जनरेट हो गया!' : 'New PIN Generated Successfully!'}
                    </p>
                    <p className="text-2xl font-black text-emerald-800 tracking-widest mt-1">
                      {forgotResult.pin}
                    </p>
                  </div>

                  {forgotResult.whatsapp_share_url && (
                    <a
                      href={forgotResult.whatsapp_share_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'WhatsApp पर विवरण खोलें' : 'Open in WhatsApp'}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => { setIsForgotMode(false); setTab('LOGIN'); }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
                  >
                    {lang === 'hi' ? 'इस पिन से लॉगिन करें' : 'Login with this PIN'}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      {t('usernameLabel')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={lang === 'hi' ? "10 अंकों का मोबाइल नंबर" : "10-digit mobile number"}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 bg-slate-50/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>{lang === 'hi' ? 'नया पिन प्राप्त करें (Get New PIN)' : 'Generate New PIN'}</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => { setIsForgotMode(false); setErrorMsg(''); }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'लॉगिन पर वापस जाएँ' : 'Back to Login'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : tab === 'LOGIN' ? (
            /* Regular Login Form */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  {t('usernameLabel')}
                </label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase">
                    {t('passwordLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotMode(true); setErrorMsg(''); }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {lang === 'hi' ? 'पिन भूल गए?' : 'Forgot PIN?'}
                  </button>
                </div>
                <input
                  type="password"
                  placeholder=""
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{role === 'vendor' ? t('btnContinueVendor') : t('btnContinueCustomer')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3">
              {role === 'vendor' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('vendorNameLabel')}</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('vendorBusinessLabel')}</label>
                    <input
                      type="text"
                      placeholder=""
                      value={vendorBusiness}
                      onChange={(e) => setVendorBusiness(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('mobileLabel')}</label>
                    <input
                      type="tel"
                      required
                      placeholder=""
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                /* Customer or Supplier Register */
                <>
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-blue-900 font-semibold">
                    {customerCategory === 'SUPPLIER'
                      ? (lang === 'hi' ? 'दूध संकलन खाता (दूधिया आपसे दूध खरीदेगा)' : 'Supplier Account (Selling milk to dairy)')
                      : (lang === 'hi' ? 'ग्राहक खाता (दूधिया आपके घर दूध देगा)' : 'Household Account (Receiving milk delivery)')}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('custNameLabel')}</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('mobileLabel')}</label>
                    <input
                      type="tel"
                      required
                      placeholder=""
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      {lang === 'hi' ? 'ईमेल (Email - वैकल्पिक)' : 'Email (Optional)'}
                    </label>
                    <input
                      type="email"
                      placeholder="info@milkhisab.in"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('custAddressLabel')}</label>
                    <input
                      type="text"
                      placeholder=""
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        {customerCategory === 'SUPPLIER' ? (lang === 'hi' ? 'दैनिक संकलन (L)' : 'Daily Supply (L)') : t('qtyLabel')}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={custQty}
                        onChange={(e) => setCustQty(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('milkTypeLabel')}</label>
                      <select
                        value={custType}
                        onChange={(e) => setCustType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-white"
                      >
                        <option value="Cow">{t('cowMilk')}</option>
                        <option value="Buffalo">{t('buffaloMilk')}</option>
                        <option value="Mixed">{t('mixedMilk')}</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition active:scale-98 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? t('registeringLoading') : t('btnRegisterSubmit')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
