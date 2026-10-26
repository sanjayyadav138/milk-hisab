import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, MessageCircle, Calendar, X 
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

  // Grand totals
  const totalRevenue = bills.reduce((sum, b) => sum + b.total_amount, 0);
  const totalCollected = bills.reduce((sum, b) => sum + b.amount_paid, 0);
  const totalPending = bills.reduce((sum, b) => sum + b.balance_due, 0);
  const totalMilkSold = bills.reduce((sum, b) => sum + b.total_liters, 0);

  return (
    <div className="pb-32 max-w-2xl mx-auto px-3 sm:px-4 pt-4">
      {/* Month Selector Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 mb-4">
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

          <div className="text-right">
            <span className="text-xs font-bold text-slate-500">{t('totalMilk')}</span>
            <p className="text-base sm:text-lg font-black text-slate-900">
              {totalMilkSold.toFixed(1)} L
            </p>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-blue-50 rounded-2xl p-2.5 text-center border border-blue-100">
            <p className="text-[11px] text-blue-800 font-bold uppercase">{t('totalBillCol')}</p>
            <p className="text-lg sm:text-xl font-black text-blue-950 mt-0.5">
              ₹{totalRevenue.toFixed(0)}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-2.5 text-center border border-emerald-100">
            <p className="text-[11px] text-emerald-700 font-bold uppercase">{t('paidCol')}</p>
            <p className="text-lg sm:text-xl font-black text-emerald-900 mt-0.5">
              ₹{totalCollected.toFixed(0)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-2.5 text-center border border-amber-100">
            <p className="text-[11px] text-amber-700 font-bold uppercase">{t('dueCol')}</p>
            <p className="text-lg sm:text-xl font-black text-amber-900 mt-0.5">
              ₹{totalPending.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Ledger Bills */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-500">{lang === 'hi' ? 'बिल तैयार किए जा रहे हैं...' : 'Generating bills...'}</p>
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <p className="text-slate-500 font-semibold">{lang === 'hi' ? 'इस महीने का कोई डाटा उपलब्ध नहीं है' : 'No ledger data available for this month'}</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {bills.map((bill) => {
            const isFullyPaid = bill.balance_due <= 0 && bill.total_amount > 0;
            return (
              <div 
                key={bill.customer_id}
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200 hover:border-purple-300 transition"
              >
                {/* Header: Name and Balance Due */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-black text-slate-900">{bill.customer_name}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      रेट: ₹{bill.price_per_liter}/L • सप्लाई: {bill.delivered_days} दिन • छुट्टी: {bill.skipped_days} दिन
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">बकाया (Balance)</p>
                    <p className={`text-xl font-black ${
                      isFullyPaid ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {isFullyPaid ? 'चुकता (Paid)' : `₹${bill.balance_due.toFixed(0)}`}
                    </p>
                  </div>
                </div>

                {/* Ledger Breakdown Pill Box */}
                <div className="bg-slate-50 rounded-2xl p-3 my-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">कुल दूध</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{bill.total_liters.toFixed(1)} L</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">कुल बिल</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">₹{bill.total_amount.toFixed(0)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">जमा राशि</span>
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
                      className="flex-1 py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>{t('waBillBtn')}</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      title="ग्राहक का फोन नंबर दर्ज नहीं है"
                      className="flex-1 py-3 px-3 rounded-2xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t('waBillBtn')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActivePaymentCustomer(bill);
                      setPayAmount(String(bill.balance_due > 0 ? bill.balance_due : ''));
                    }}
                    className="py-3 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-blue-200 active:scale-95 transition"
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span>{t('recordPayBtn')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Payment Dialog */}
      {activePaymentCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">भुगतान दर्ज करें (Record Payment)</h3>
              <button 
                onClick={() => setActivePaymentCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">ग्राहक का नाम</p>
                <p className="text-base font-bold text-slate-900">{activePaymentCustomer.customer_name}</p>
                <p className="text-xs text-rose-600 font-bold mt-0.5">
                  कुल बकाया: ₹{activePaymentCustomer.balance_due.toFixed(0)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {lang === 'hi' ? 'प्राप्त राशि (Amount in ₹) *' : 'Amount Received (₹) *'}
                </label>
                <input
                  type="number"
                  required
                  step="1"
                  placeholder="1500"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-lg font-black focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {lang === 'hi' ? 'माध्यम (Payment Mode)' : 'Payment Mode'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['UPI', 'Cash'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPayMode(mode)}
                      className={`py-2.5 rounded-xl font-bold text-sm border transition ${
                        payMode === mode
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {mode === 'UPI' 
                        ? (lang === 'hi' ? '📲 ऑनलाइन (UPI)' : '📲 Online (UPI)') 
                        : (lang === 'hi' ? '💵 नकद (Cash)' : '💵 Cash')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentCustomer(null)}
                  className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={recording}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition"
                >
                  {recording ? (lang === 'hi' ? "सेव हो रहा है..." : "Saving...") : (lang === 'hi' ? "जमा सेव करें" : "Save Payment")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
