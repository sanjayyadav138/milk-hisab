import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, MapPin, Milk, X } from 'lucide-react';
import { fetchCustomers, createCustomer } from '../services/api';
import { Customer } from '../types';
import { useLanguage } from '../context/LanguageContext';

export default function CustomersView() {
  const { t, lang } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    default_quantity: 1.0,
    milk_type: 'Cow',
    price_per_liter: 60.0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      await createCustomer({
        ...formData,
        default_quantity: parseFloat(String(formData.default_quantity)),
        price_per_liter: parseFloat(String(formData.price_per_liter))
      });
      setIsAdding(false);
      setFormData({
        name: '',
        phone: '',
        address: '',
        default_quantity: 1.0,
        milk_type: 'Cow',
        price_per_liter: 60.0
      });
      loadCustomers();
    } catch (err: any) {
      alert("ग्राहक जोड़ने में त्रुटि: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.address && c.address.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="pb-32 max-w-2xl mx-auto px-3 sm:px-4 pt-4">
      {/* Top Bar with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('customersTitle')}</h2>
          <p className="text-xs text-slate-500 font-medium">{customers.length} {t('customersSub')}</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('newCustomerBtn')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm font-medium shadow-xs focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Add Customer Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">{t('addCustomerTitle')}</h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('custNameLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('custNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('mobileLabel')}</label>
                <input
                  type="tel"
                  placeholder="उदा. 9811122233"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('custAddressLabel')}</label>
                <input
                  type="text"
                  placeholder={t('custAddressPlaceholder')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('qtyLabel')}</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={formData.default_quantity}
                    onChange={(e) => setFormData({ ...formData, default_quantity: parseFloat(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('pricePerLiterLabel')}</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formData.price_per_liter}
                    onChange={(e) => setFormData({ ...formData, price_per_liter: parseFloat(e.target.value) || 60 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('milkTypeLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cow', 'Buffalo', 'Mixed'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, milk_type: type })}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        formData.milk_type === type 
                          ? 'border-blue-600 bg-blue-50 text-blue-900' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'Cow' ? t('cowMilk') : type === 'Buffalo' ? t('buffaloMilk') : t('mixedMilk')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 active:scale-95 transition"
                >
                  {submitting ? t('savingCustomer') : t('saveCustomerBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-500">{t('loadingCustomers')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <p className="text-slate-500 font-semibold">{t('noCustomersFound')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 hover:border-emerald-300 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-900">{c.name}</h4>
                  {c.address && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.address}</span>
                    </p>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1 hover:underline">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </a>
                  )}
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 rounded-xl font-black text-sm">
                    {c.default_quantity}L {lang === 'hi' ? '/ दिन' : '/ day'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                    {c.milk_type} • ₹{c.price_per_liter}/L
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
