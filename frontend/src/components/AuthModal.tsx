import React, { useState, useEffect } from 'react';
import { X, User, Store, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { loginApi, registerVendorApi, registerCustomerApi, fetchVendorsList } from '../services/api';
import { AuthState, VendorInfo } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (auth: AuthState) => void;
  initialRole?: 'vendor' | 'customer';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialRole = 'vendor' }: AuthModalProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'vendor' | 'customer'>(initialRole);
  
  // Login fields (clean and blank by default)
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  // Vendor register fields
  const [vendorName, setVendorName] = useState('');
  const [vendorBusiness, setVendorBusiness] = useState('');
  const [vendorUpi, setVendorUpi] = useState('');

  // Customer register fields
  const [custName, setCustName] = useState('');
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

  const handleQuickDemoLogin = async (demoRole: 'vendor' | 'customer') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await loginApi('1234', demoRole, '1234');
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
      setErrorMsg(err.message || t('demoLoginError'));
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
          pin
        });
        const data = await loginApi(phone, 'vendor', pin);
        onSuccess({ 
          role: 'vendor', 
          user: data.user, 
          customer: null,
          token: data.token || null,
          expires_at: data.expires_at || null,
          last_active_at: Date.now(),
        });
      } else {
        await registerCustomerApi({
          name: custName,
          phone,
          address: custAddress,
          default_quantity: parseFloat(custQty) || 1.0,
          milk_type: custType,
          price_per_liter: parseFloat(custPrice) || 60.0,
          vendor_id: selectedVendorId,
          pin
        });
        const data = await loginApi(phone, 'customer', pin);
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
        {/* Top Header - Dairy Navy Trust Anchor */}
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

        {/* Tab & Role Selector */}
        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
            <button
              onClick={() => { setTab('LOGIN'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                tab === 'LOGIN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('tabLogin')}
            </button>
            <button
              onClick={() => { setTab('REGISTER'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                tab === 'REGISTER' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t('tabRegister')}
            </button>
          </div>

          {/* Role Chooser */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setRole('vendor')}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition ${
                role === 'vendor'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Store className={`w-5 h-5 ${role === 'vendor' ? 'text-blue-700' : 'text-slate-400'}`} />
              <span className="text-xs font-bold leading-tight text-center">
                {t('roleVendorTitle')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition ${
                role === 'customer'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className={`w-5 h-5 ${role === 'customer' ? 'text-blue-700' : 'text-slate-400'}`} />
              <span className="text-xs font-bold leading-tight text-center">
                {t('roleCustomerTitle')}
              </span>
            </button>
          </div>

          {/* Highlighted Dummy Credentials Box */}
          {tab === 'LOGIN' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-blue-900 uppercase">{t('dummyCredTitle')}</p>
                  <p className="text-xs font-medium text-blue-800">
                    {t('dummyCredDesc')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setPhone('1234'); setPin('1234'); }}
                className="text-[11px] font-black bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-xl shadow-xs transition"
              >
                {t('autoFill')}
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Login Form */}
          {tab === 'LOGIN' ? (
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  {t('passwordLabel')}
                </label>
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('vendorUpiLabel')}</label>
                    <input
                      type="text"
                      placeholder=""
                      value={vendorUpi}
                      onChange={(e) => setVendorUpi(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
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
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">{t('qtyLabel')}</label>
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
