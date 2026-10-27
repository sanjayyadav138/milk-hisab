import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, MessageCircle, Calendar, X, 
  ArrowDownCircle, ArrowUpCircle, CheckCircle2 
} from 'lucide-react';
import { fetchMonthlyBills, recordPayment } from '../services/api';
import { MonthlyBill } from '../types';
import { useLanguage } from '../context/LanguageContext';

export default function LedgerBillingView() {
  const { t, lang } = useLanguage();
  const [monthYear, setMonthYear] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [bills, setBills] = useState<MonthlyBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePaymentCustomer, setActivePaymentCustomer] = useState<MonthlyBill | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('UPI');
  const [recording, setRecording] = useState(false);
  const [flowTab, setFlowTab] = useState<'ALL' | 'BUYER' | 'SUPPLIER'>('ALL');

  useEffect(() => {
    loadBills(monthYear);
  }, [monthYear]);

  const loadBills = async (my: string) => {
    setLoading(true);
    try {
      const data = await fetchMonthlyBills(my);
      setBills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || isNaN(Number(payAmount)) || !activePaymentCustomer) return;

    setRecording(true);
    try {
      await recordPayment({
        customer_id: activePaymentCustomer.customer_id,
        month_year: monthYear,
        amount_paid: parseFloat(payAmount),
        payment_mode: payMode,
        notes: `Recorded on ${new Date().toLocaleDateString()}`
      });
      setActivePaymentCustomer(null);
      setPayAmount('');
      loadBills(monthYear);
    } catch (err: any) {
      alert("पेमेंट दर्ज करने में समस्या आई: " + err.message);
    } finally {
      setRecording(false);
    }
  };

  const buyerBills = bills.filter(b => (b.customer_type || 'BUYER') === 'BUYER');
  const supplierBills = bills.filter(b => b.customer_type === 'SUPPLIER');

  // Customer Financials (Receivable / Outward Sales)
  const totalCustomerBill = buyerBills.reduce((sum, b) => sum + b.total_amount, 0);
  const totalCustomerCollected = buyerBills.reduce((sum, b) => sum + b.amount_paid, 0);
  const totalCustomerDue = buyerBills.reduce((sum, b) => sum + b.balance_due, 0);

  // Supplier Financials (Payable / Inward Procurement from 4 homes)
  const totalSupplierCost = supplierBills.reduce((sum, b) => sum + b.total_amount, 0);
  const totalSupplierPaid = supplierBills.reduce((sum, b) => sum + b.amount_paid, 0);
  const totalSupplierDue = supplierBills.reduce((sum, b) => sum + b.balance_due, 0);

  // Filtered List
  const filteredBills = bills.filter(b => {
    if (flowTab === 'BUYER' && (b.customer_type || 'BUYER') !== 'BUYER') return false;
    if (flowTab === 'SUPPLIER' && b.customer_type !== 'SUPPLIER') return false;
    return true;
  });

  return (
    <div className="pb-32 max-w-2xl mx-auto px-3 sm:px-4 pt-4">
      
      {/* Month Selector Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('monthSelect')}</p>
              <input 
                type="month" 
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="text-base sm:text-lg font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bilateral Ledger Tabs */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 bg-slate-100 rounded-2xl text-xs font-black">
          <button
            onClick={() => setFlowTab('ALL')}
            className={`py-2 rounded-xl transition ${
              flowTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('allContactsTab')} ({bills.length})
          </button>
          
          <button
            onClick={() => setFlowTab('BUYER')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              flowTab === 'BUYER'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>📤 {lang === 'hi' ? 'ग्राहक बिल' : 'Customers'}</span>
            <span className="text-[10px] opacity-80">({buyerBills.length})</span>
          </button>

          <button
            onClick={() => setFlowTab('SUPPLIER')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              flowTab === 'SUPPLIER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>📥 {lang === 'hi' ? 'संकलन हिसाब (4 घर)' : 'Suppliers'}</span>
            <span className="text-[10px] opacity-80">({supplierBills.length})</span>
          </button>
        </div>

        {/* Financial Highlights */}
        {flowTab === 'SUPPLIER' ? (
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="bg-blue-50 rounded-2xl p-2.5 text-center border border-blue-100">
              <p className="text-[10px] text-blue-800 font-bold uppercase">{lang === 'hi' ? 'कुल खरीद रकम' : 'Total Cost'}</p>
              <p className="text-base sm:text-lg font-black text-blue-950 mt-0.5">₹{totalSupplierCost.toFixed(0)}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-2.5 text-center border border-emerald-100">
              <p className="text-[10px] text-emerald-700 font-bold uppercase">{lang === 'hi' ? 'दी गई रकम' : 'Paid Out'}</p>
              <p className="text-base sm:text-lg font-black text-emerald-900 mt-0.5">₹{totalSupplierPaid.toFixed(0)}</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-2.5 text-center border border-rose-100">
              <p className="text-[10px] text-rose-700 font-bold uppercase">{lang === 'hi' ? 'किसानों को देने हैं' : 'To Pay'}</p>
              <p className="text-base sm:text-lg font-black text-rose-900 mt-0.5">₹{totalSupplierDue.toFixed(0)}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="bg-blue-50 rounded-2xl p-2.5 text-center border border-blue-100">
              <p className="text-[10px] text-blue-800 font-bold uppercase">{lang === 'hi' ? 'कुल ग्राहक बिल' : 'Total Bills'}</p>
              <p className="text-base sm:text-lg font-black text-blue-950 mt-0.5">₹{totalCustomerBill.toFixed(0)}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-2.5 text-center border border-emerald-100">
              <p className="text-[10px] text-emerald-700 font-bold uppercase">{lang === 'hi' ? 'वसूल हुई राशि' : 'Collected'}</p>
              <p className="text-base sm:text-lg font-black text-emerald-900 mt-0.5">₹{totalCustomerCollected.toFixed(0)}</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-2.5 text-center border border-amber-100">
              <p className="text-[10px] text-amber-700 font-bold uppercase">{lang === 'hi' ? 'ग्राहकों से लेने हैं' : 'Due Balance'}</p>
              <p className="text-base sm:text-lg font-black text-amber-900 mt-0.5">₹{totalCustomerDue.toFixed(0)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-500">{lang === 'hi' ? 'बहीखाता तैयार हो रहा है...' : 'Generating ledger...'}</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <p className="text-slate-500 font-semibold">{lang === 'hi' ? 'इस महीने का कोई डाटा उपलब्ध नहीं है' : 'No ledger data available for this month'}</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredBills.map((bill) => {
            const isSupplier = bill.customer_type === 'SUPPLIER';
            const isFullyPaid = bill.balance_due <= 0 && bill.total_amount > 0;

            return (
              <div 
                key={bill.customer_id}
                className={`bg-white rounded-3xl p-4 sm:p-5 shadow-xs border transition ${
                  isSupplier 
                    ? 'border-blue-200 hover:border-blue-400' 
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                {/* Header: Name, Tag and Balance */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-900">{bill.customer_name}</h4>
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
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {isSupplier ? t('rateBuy') : t('rateSell')}: ₹{bill.price_per_liter}/L • {isSupplier ? (lang === 'hi' ? 'संकलन दिन:' : 'Days:') : (lang === 'hi' ? 'सप्लाई दिन:' : 'Days:')} {bill.delivered_days}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {isSupplier ? (lang === 'hi' ? 'देय राशि (Payable)' : 'Payable') : (lang === 'hi' ? 'बकाया (Due)' : 'Due')}
                    </p>
                    <p className={`text-lg sm:text-xl font-black ${
                      isFullyPaid ? 'text-emerald-600' : isSupplier ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {isFullyPaid ? (lang === 'hi' ? 'चुकता ✓' : 'Settled ✓') : `₹${bill.balance_due.toFixed(0)}`}
                    </p>
                  </div>
                </div>

                {/* Ledger Breakdown Pill Box */}
                <div className="bg-slate-50 rounded-2xl p-3 my-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">{isSupplier ? (lang === 'hi' ? 'कुल संकलित' : 'Collected') : (lang === 'hi' ? 'कुल सप्लाई' : 'Delivered')}</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{bill.total_liters.toFixed(1)} L</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">{isSupplier ? (lang === 'hi' ? 'कुल खरीद' : 'Total Cost') : (lang === 'hi' ? 'कुल बिल' : 'Total Bill')}</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">₹{bill.total_amount.toFixed(0)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">{isSupplier ? (lang === 'hi' ? 'दिया गया' : 'Paid') : (lang === 'hi' ? 'जमा राशि' : 'Received')}</span>
                    <p className="font-bold text-emerald-700 text-sm mt-0.5">₹{bill.amount_paid.toFixed(0)}</p>
                  </div>
                </div>

                {/* Primary Action Buttons: WhatsApp & Record Payment */}
                <div className="flex items-center gap-2 pt-1">
                  {bill.whatsapp_url ? (
                    <a
                      href={bill.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isSupplier ? (lang === 'hi' ? 'WhatsApp संकलन पर्ची' : 'WhatsApp Statement') : t('sendWhatsAppBtn')}</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t('noPhone')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActivePaymentCustomer(bill);
                      setPayAmount(bill.balance_due > 0 ? String(bill.balance_due) : '');
                    }}
                    className={`py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center gap-1 active:scale-95 transition ${
                      isSupplier
                        ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                    }`}
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>{isSupplier ? (lang === 'hi' ? 'भुगतान दर्ज करें' : 'Record Pay') : t('recordPayBtn')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Entry Modal */}
      {activePaymentCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {activePaymentCustomer.customer_type === 'SUPPLIER'
                  ? (lang === 'hi' ? 'किसान / घर को भुगतान दर्ज करें' : 'Record Payment to Supplier')
                  : t('recordPaymentModalTitle')}
              </h3>
              <button 
                onClick={() => setActivePaymentCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 p-3 bg-slate-50 rounded-2xl text-xs">
              <p className="font-bold text-slate-800">{activePaymentCustomer.customer_name}</p>
              <p className="text-slate-500 mt-0.5">
                {activePaymentCustomer.customer_type === 'SUPPLIER'
                  ? `${lang === 'hi' ? 'देय शेष:' : 'Balance to Pay:'} ₹${activePaymentCustomer.balance_due}`
                  : `${lang === 'hi' ? 'बकाया:' : 'Due:'} ₹${activePaymentCustomer.balance_due}`}
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('amountPaidLabel')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="0"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl text-base font-bold focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('modeLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['UPI', 'Cash', 'Online'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPayMode(mode)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        payMode === mode 
                          ? 'border-purple-600 bg-purple-50 text-purple-900' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentCustomer(null)}
                  className="flex-1 py-3 text-slate-600 font-bold text-xs bg-slate-100 hover:bg-slate-200 rounded-2xl transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={recording}
                  className="flex-1 py-3 text-white font-black text-xs bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-md transition active:scale-95"
                >
                  {recording ? (lang === 'hi' ? 'दर्ज हो रहा है...' : 'Saving...') : (lang === 'hi' ? 'जमा करें' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
