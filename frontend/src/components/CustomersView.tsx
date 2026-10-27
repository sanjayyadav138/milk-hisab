import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Phone, MapPin, Milk, X, ArrowDownCircle, ArrowUpCircle, KeyRound } from 'lucide-react';
import { fetchCustomers, createCustomer } from '../services/api';
import { Customer } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CustomersViewProps {
  onResetCustomerPin?: (customerId: number, customerName: string) => void;
}

export default function CustomersView({ onResetCustomerPin }: CustomersViewProps = {}) {
  const { t, lang } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [contactTypeFilter, setContactTypeFilter] = useState<'ALL' | 'BUYER' | 'SUPPLIER'>('ALL');

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    address: string;
    default_quantity: number;
    milk_type: string;
    price_per_liter: number;
    customer_type: 'BUYER' | 'SUPPLIER';
  }>({
    name: '',
    phone: '',
    address: '',
    default_quantity: 1.0,
    milk_type: 'Cow',
    price_per_liter: 60.0,
    customer_type: 'BUYER'
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
        price_per_liter: parseFloat(String(formData.price_per_liter)),
        customer_type: formData.customer_type
      });
      setIsAdding(false);
      setFormData({
        name: '',
        phone: '',
        address: '',
        default_quantity: 1.0,
        milk_type: 'Cow',
        price_per_liter: 60.0,
        customer_type: 'BUYER'
      });
      loadCustomers();
    } catch (err: any) {
      alert("संपर्क जोड़ने में त्रुटि: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const buyers = customers.filter(c => (c.customer_type || 'BUYER') === 'BUYER');
  const suppliers = customers.filter(c => c.customer_type === 'SUPPLIER');

  const filtered = customers.filter(c => {
    // 1. Role filter
    if (contactTypeFilter === 'BUYER' && (c.customer_type || 'BUYER') !== 'BUYER') return false;
    if (contactTypeFilter === 'SUPPLIER' && c.customer_type !== 'SUPPLIER') return false;

    // 2. Search
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))
    );
  });

  return (
    <div className="pb-32 max-w-2xl mx-auto px-3 sm:px-4 pt-4">
      
      {/* Top Bar with Add Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('customersTitle')}</h2>
          <p className="text-xs text-slate-500 font-medium">
            {buyers.length} {lang === 'hi' ? 'ग्राहक (बिक्री)' : 'Customers'} • {suppliers.length} {lang === 'hi' ? 'घर (संकलन)' : 'Collection Homes'}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'hi' ? '+ नया जोड़ें' : '+ Add New'}</span>
        </button>
      </div>

      {/* Filter Tabs: All vs Customers (Delivery) vs Suppliers (Collection) */}
      <div className="grid grid-cols-3 gap-1.5 mb-3 p-1 bg-slate-100 rounded-2xl text-xs font-black">
        <button
          onClick={() => setContactTypeFilter('ALL')}
          className={`py-2 rounded-xl transition ${
            contactTypeFilter === 'ALL'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {t('allContactsTab')} ({customers.length})
        </button>
        
        <button
          onClick={() => setContactTypeFilter('BUYER')}
          className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
            contactTypeFilter === 'BUYER'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <span>📤 {lang === 'hi' ? 'ग्राहक' : 'Customers'}</span>
          <span className="text-[10px] opacity-80">({buyers.length})</span>
        </button>

        <button
          onClick={() => setContactTypeFilter('SUPPLIER')}
          className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
            contactTypeFilter === 'SUPPLIER'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-blue-700 hover:bg-blue-50'
          }`}
        >
          <span>📥 {lang === 'hi' ? 'संकलन (4 घर)' : 'Suppliers'}</span>
          <span className="text-[10px] opacity-80">({suppliers.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'hi' ? 'नाम, गाँव या फ़ोन नंबर से खोजें...' : 'Search by name, address or phone...'}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm font-medium shadow-xs focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Add Customer / Supplier Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">
                {formData.customer_type === 'SUPPLIER'
                  ? (lang === 'hi' ? 'दूध देने वाला घर/किसान जोड़ें (संकलन)' : 'Add Milk Supplier (Collection Home)')
                  : (lang === 'hi' ? 'नया ग्राहक जोड़ें (दूध वितरण)' : 'Add New Customer (Milk Delivery)')}
              </h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              
              {/* Persona / Flow Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('newContactType')}</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      customer_type: 'BUYER',
                      price_per_liter: 60.0
                    })}
                    className={`py-2 rounded-xl transition ${
                      formData.customer_type === 'BUYER'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📤 {lang === 'hi' ? 'ग्राहक (दूध देना)' : 'Customer (Delivery)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      customer_type: 'SUPPLIER',
                      price_per_liter: 50.0
                    })}
                    className={`py-2 rounded-xl transition ${
                      formData.customer_type === 'SUPPLIER'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📥 {lang === 'hi' ? 'घर/किसान (दूध लेना)' : 'Supplier (Collection)'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('custNameLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={formData.customer_type === 'SUPPLIER' ? (lang === 'hi' ? 'उदा. रामू काका (घर #1)' : 'e.g. Ramu Kaka (Home #1)') : t('custNamePlaceholder')}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {formData.customer_type === 'SUPPLIER' ? (lang === 'hi' ? 'दैनिक संकलन (L)' : 'Daily Collection (L)') : t('qtyLabel')}
                  </label>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {formData.customer_type === 'SUPPLIER' ? t('rateBuy') : t('rateSell')}
                  </label>
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
                  className="flex-1 py-3 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-2xl transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-white font-black text-sm bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-md transition active:scale-95"
                >
                  {submitting ? (lang === 'hi' ? 'जोड़ रहे हैं...' : 'Adding...') : t('saveCustomerBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer / Supplier List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-500">{t('loadingBills')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <p className="font-bold text-slate-700">{t('noCustomers')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('addFirstCustomer')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const isSupplier = c.customer_type === 'SUPPLIER';

            return (
              <div 
                key={c.id}
                className={`bg-white rounded-2xl p-4 shadow-xs border transition ${
                  isSupplier 
                    ? 'border-blue-200 hover:border-blue-400' 
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-base">{c.name}</h4>
                      {isSupplier ? (
                        <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ArrowDownCircle className="w-3 h-3 text-blue-600" />
                          {t('supplierHomeBadge')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ArrowUpCircle className="w-3 h-3 text-emerald-600" />
                          {t('customerBadge')}
                        </span>
                      )}
                    </div>

                    {c.phone && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </p>
                    )}

                    {c.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.address}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black ${
                      isSupplier ? 'bg-blue-50 text-blue-900' : 'bg-emerald-50 text-emerald-900'
                    }`}>
                      {c.default_quantity}L {c.milk_type}
                    </div>
                    <p className="text-xs font-black text-slate-700 mt-1">
                      ₹{c.price_per_liter} / L
                    </p>
                    {onResetCustomerPin && (
                      <button
                        type="button"
                        onClick={() => onResetCustomerPin(c.id, c.name)}
                        className="mt-2 text-[11px] font-bold text-slate-600 hover:text-amber-700 flex items-center gap-1 bg-slate-100 hover:bg-amber-50 px-2 py-1 rounded-lg transition ml-auto"
                        title={lang === 'hi' ? 'ग्राहक का पिन बदलें' : 'Change/Reset Customer PIN'}
                      >
                        <KeyRound className="w-3 h-3 text-amber-500" />
                        <span>{lang === 'hi' ? 'पिन बदलें' : 'PIN'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
