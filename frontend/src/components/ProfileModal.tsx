import React, { useState } from 'react';
import { X, User, Phone, MapPin, Building, CreditCard, Shield, CheckCircle, Save, KeyRound, Image as ImageIcon } from 'lucide-react';
import { AuthState } from '../types';
import { updateVendorProfileApi, updateCustomerProfileApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthState;
  onProfileUpdated: (updatedAuth: AuthState) => void;
}

export default function ProfileModal({ isOpen, onClose, auth, onProfileUpdated }: ProfileModalProps) {
  const { t } = useLanguage();
  const isVendor = auth.role === 'vendor';
  const isCustomer = auth.role === 'customer';

  // Vendor Fields
  const [vendorName, setVendorName] = useState(auth.user?.name || '');
  const [vendorPhone, setVendorPhone] = useState(auth.user?.phone || '');
  const [vendorBusiness, setVendorBusiness] = useState(auth.user?.business_name || '');
  const [vendorUpi, setVendorUpi] = useState(auth.user?.upi_id || '');
  const [vendorAvatar, setVendorAvatar] = useState(auth.user?.avatar_url || '');

  // Customer Fields
  const [custName, setCustName] = useState(auth.customer?.name || '');
  const [custPhone, setCustPhone] = useState(auth.customer?.phone || '');
  const [custAddress, setCustAddress] = useState(auth.customer?.address || '');
  const [custQty, setCustQty] = useState(auth.customer?.default_quantity?.toString() || '1.0');
  const [custType, setCustType] = useState(auth.customer?.milk_type || 'Cow');
  const [custPrice, setCustPrice] = useState(auth.customer?.price_per_liter?.toString() || '60.0');
  const [custAvatar, setCustAvatar] = useState(auth.customer?.avatar_url || '');

  // PIN field
  const [newPin, setNewPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isVendor && auth.user) {
        const res = await updateVendorProfileApi({
          id: auth.user.id,
          name: vendorName.trim(),
          phone: vendorPhone.trim(),
          business_name: vendorBusiness.trim(),
          upi_id: vendorUpi.trim(),
          avatar_url: vendorAvatar.trim() || undefined,
          pin: newPin.trim() || undefined
        });

        const newAuth: AuthState = {
          ...auth,
          user: res.user
        };
        onProfileUpdated(newAuth);
        setSuccessMsg(t('profileUpdatedSuccess'));
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      } else if (isCustomer && auth.customer) {
        const res = await updateCustomerProfileApi({
          id: auth.customer.id,
          name: custName.trim(),
          phone: custPhone.trim(),
          address: custAddress.trim(),
          default_quantity: parseFloat(custQty) || 1.0,
          milk_type: custType,
          price_per_liter: parseFloat(custPrice) || 60.0,
          avatar_url: custAvatar.trim() || undefined,
          pin: newPin.trim() || undefined
        });

        const newAuth: AuthState = {
          ...auth,
          customer: res.customer
        };
        onProfileUpdated(newAuth);
        setSuccessMsg(t('profileUpdatedSuccess'));
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const displayName = isVendor ? vendorName : custName;
  const initial = (displayName.trim()[0] || 'U').toUpperCase();
  const activeAvatar = isVendor ? vendorAvatar : custAvatar;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Dairy Blue Theme */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-xl shadow-inner shrink-0 overflow-hidden">
              {activeAvatar ? (
                <img 
                  src={activeAvatar} 
                  alt={displayName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                initial
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">{t('profileTitle')}</h3>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isVendor ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950'
                }`}>
                  {isVendor ? t('vendorRole') : t('customerRole')}
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">{t('profileSub')}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Account Overview Box */}
          <div className="bg-[#f9fafb] p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>{t('accountType')}: <strong className="text-slate-900">{isVendor ? t('vendorRole') : t('customerRole')}</strong></span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
              ● {t('activeSession')}
            </span>
          </div>

          {/* Profile Picture / Avatar URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('avatarUrlLabel')}</span>
            </label>
            <input 
              type="url"
              value={isVendor ? vendorAvatar : custAvatar}
              onChange={(e) => isVendor ? setVendorAvatar(e.target.value) : setCustAvatar(e.target.value)}
              placeholder={t('avatarUrlPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>{isVendor ? t('vendorNameLabel') : t('custNameLabel')}</span>
            </label>
            <input 
              type="text"
              required
              value={isVendor ? vendorName : custName}
              onChange={(e) => isVendor ? setVendorName(e.target.value) : setCustName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Registered Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('registeredPhone')} *</span>
            </label>
            <input 
              type="text"
              required
              value={isVendor ? vendorPhone : custPhone}
              onChange={(e) => isVendor ? setVendorPhone(e.target.value) : setCustPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Vendor-Specific Fields */}
          {isVendor && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('vendorBusinessLabel')}</span>
                </label>
                <input 
                  type="text"
                  required
                  value={vendorBusiness}
                  onChange={(e) => setVendorBusiness(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('upiIdLabel')}</span>
                </label>
                <input 
                  type="text"
                  value={vendorUpi}
                  onChange={(e) => setVendorUpi(e.target.value)}
                  placeholder="e.g. 9971880670@upi"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </>
          )}

          {/* Customer-Specific Fields */}
          {isCustomer && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('homeAddress')}</span>
                </label>
                <input 
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('dailyQuantity')}</label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={custQty}
                    onChange={(e) => setCustQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('ratePerLiter')}</label>
                  <input 
                    type="number"
                    step="1"
                    min="10"
                    value={custPrice}
                    onChange={(e) => setCustPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('milkPreference')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cow', 'Buffalo', 'Mixed'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCustType(type)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        custType === type 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Change PIN (Optional) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('changePinLabel')}</span>
            </label>
            <input 
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder={t('changePinPlaceholder')}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
            >
              {t('close')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t('savingChanges') : t('saveChanges')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}