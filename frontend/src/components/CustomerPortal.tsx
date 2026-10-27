import React, { useState, useEffect } from 'react';
import { 
  Milk, Calendar, IndianRupee, MessageCircle, Send, 
  Users, UserPlus, CheckCircle2, XCircle, Clock, 
  Phone, ArrowUpRight, Sparkles, AlertCircle, AlertTriangle,
  CalendarOff, X, Check, HelpCircle, KeyRound
} from 'lucide-react';
import { 
  fetchCustomerDashboard, fetchSubUsers, addSubUserApi, 
  fetchMessages, sendMessageApi, raiseDisputeApi, skipMilkDateApi
} from '../services/api';
import { Customer, CustomerDashboardData, SubUser, CustomerMessage } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CustomerPortalProps {
  customer: Customer;
  onLogout: () => void;
  onOpenChangePin?: () => void;
}

export default function CustomerPortal({ customer, onLogout, onOpenChangePin }: CustomerPortalProps) {
  const { lang, t } = useLanguage();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [subusers, setSubusers] = useState<SubUser[]>([]);
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: 'MY_MILK' | 'FAMILY_USERS' | 'MESSAGES'
  const [activeTab, setActiveTab] = useState<'MY_MILK' | 'FAMILY_USERS' | 'MESSAGES'>('MY_MILK');

  // Subuser form state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRelation, setNewUserRelation] = useState('Family Member');
  const [submittingUser, setSubmittingUser] = useState(false);

  // Message input state
  const [newMsgText, setNewMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Dispute state (DIS-01)
  const [disputingLog, setDisputingLog] = useState<{ id: number; date: string; quantity: number } | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Skip Milk state (SKP-01, SKP-02)
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [skipDate, setSkipDate] = useState(tomorrowStr);
  const [skipReason, setSkipReason] = useState('');
  const [skipError, setSkipError] = useState('');
  const [submittingSkip, setSubmittingSkip] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  useEffect(() => {
    loadAll();
  }, [customer.id]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dash, subs, msgs] = await Promise.all([
        fetchCustomerDashboard(customer.id),
        fetchSubUsers(customer.id),
        fetchMessages(customer.id)
      ]);
      setData(dash);
      setSubusers(subs);
      setMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    setSubmittingUser(true);
    try {
      await addSubUserApi(customer.id, {
        name: newUserName,
        phone: newUserPhone,
        relation: newUserRelation
      });
      setIsAddingUser(false);
      setNewUserName('');
      setNewUserPhone('');
      const updated = await fetchSubUsers(customer.id);
      setSubusers(updated);
    } catch (err: any) {
      alert("सदस्य जोड़ने में त्रुटि: " + err.message);
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || newMsgText;
    if (!text.trim()) return;

    setSendingMsg(true);
    try {
      await sendMessageApi(customer.id, {
        sender_name: customer.name,
        sender_role: 'customer',
        message: text
      });
      setNewMsgText('');
      const updated = await fetchMessages(customer.id);
      setMessages(updated);
    } catch (err: any) {
      alert("संदेश भेजने में त्रुटि: " + err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  // DIS-01: Raise Dispute on Entry
  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingLog || !disputeReason.trim()) return;

    setSubmittingDispute(true);
    try {
      await raiseDisputeApi(customer.id, disputingLog.id, disputeReason.trim());
      setDisputingLog(null);
      setDisputeReason('');
      showFeedback('success', lang === 'hi' ? 'आपकी आपत्ति सफलतापूर्वक दूधिया को भेज दी गई है!' : 'Query submitted to vendor successfully!');
      const updated = await fetchCustomerDashboard(customer.id);
      setData(updated);
    } catch (err: any) {
      showFeedback('error', err.message || 'Error submitting query');
    } finally {
      setSubmittingDispute(false);
    }
  };

  // SKP-01 & SKP-02: Skip Milk for Future Date
  const handleSkipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSkipError('');

    const todayStr = new Date().toISOString().split('T')[0];
    if (skipDate <= todayStr) {
      setSkipError(t('sameDaySkipError'));
      return;
    }

    setSubmittingSkip(true);
    try {
      await skipMilkDateApi(customer.id, skipDate, skipReason.trim() || undefined);
      setIsSkipModalOpen(false);
      setSkipReason('');
      showFeedback('success', t('skipSuccess'));
      const updated = await fetchCustomerDashboard(customer.id);
      setData(updated);
    } catch (err: any) {
      setSkipError(err.message || 'Error scheduling skip');
    } finally {
      setSubmittingSkip(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm font-bold text-slate-600">आपका दूध खाता लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  const { vendor, month_summary, today_status, recent_logs } = data;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-28 pt-4">
      {/* Top Greeting Card - Dairy Navy Trust Anchor */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 rounded-3xl p-5 text-white shadow-xl mb-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                {t('customerDashboardTitle')}
              </span>
              <span className="text-xs text-blue-200 font-medium">{customer.address || (lang === 'hi' ? "स्थानीय उपभोक्ता" : "Local Household")}</span>
            </div>
            <h2 className="text-2xl font-black">{customer.name}</h2>
            <p className="text-xs text-blue-100/90 mt-0.5">
              {t('vendorLabel')} <span className="font-bold text-white">{vendor.name}</span> ({vendor.business_name})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenChangePin}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
              title={lang === 'hi' ? 'सुरक्षा पिन बदलें' : 'Change PIN'}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पिन बदलें' : 'Change PIN'}</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl transition"
            >
              {t('logout')}
            </button>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 text-center">
            <p className="text-[10px] text-blue-200 uppercase font-black">
              {customer.customer_type === 'SUPPLIER' ? (lang === 'hi' ? 'कुल संकलित दूध' : 'Total Supplied') : t('thisMonthMilk')}
            </p>
            <p className="text-xl font-black mt-0.5">
              {month_summary.total_liters.toFixed(1)} <span className="text-xs font-semibold">L</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 text-center">
            <p className="text-[10px] text-blue-200 uppercase font-black">
              {customer.customer_type === 'SUPPLIER' ? (lang === 'hi' ? 'कुल संकलन मूल्य' : 'Total Value') : t('totalBillCol')}
            </p>
            <p className="text-xl font-black mt-0.5">
              ₹{month_summary.total_amount.toFixed(0)}
            </p>
          </div>

          {/* Dues / Pending in Alert Amber, Zero dues in Fresh Ledger Green */}
          <div className={`${month_summary.balance_due > 0 ? (customer.customer_type === 'SUPPLIER' ? 'bg-blue-400 text-blue-950' : 'bg-amber-400 text-amber-950') : 'bg-emerald-400 text-emerald-950'} rounded-2xl p-2.5 text-center shadow-md`}>
            <p className="text-[10px] uppercase font-black">
              {customer.customer_type === 'SUPPLIER' ? (lang === 'hi' ? 'दूधिया से देय' : 'Due to You') : t('dueCol')}
            </p>
            <p className="text-xl font-black mt-0.5">
              ₹{month_summary.balance_due.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex bg-white p-1.5 rounded-2xl shadow-xs border border-slate-200 mb-4">
        <button
          onClick={() => setActiveTab('MY_MILK')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'MY_MILK' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {customer.customer_type === 'SUPPLIER' ? (lang === 'hi' ? 'दूध संकलन रिकॉर्ड' : 'Supply Records') : t('myMilkTab')}
        </button>
        <button
          onClick={() => setActiveTab('FAMILY_USERS')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'FAMILY_USERS' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('familyTab')} ({subusers.length})
        </button>
        <button
          onClick={() => setActiveTab('MESSAGES')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'MESSAGES' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('messagesTab')} ({messages.length})
        </button>
      </div>

      {/* TAB 1: MY MILK LEDGER & TODAY STATUS */}
      {activeTab === 'MY_MILK' && (
        <div className="space-y-4">
          {/* Today's Live Delivery Status */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('todayMilkTitle')}</span>
              <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                {new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  today_status.status === 'Skipped' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <Milk className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {today_status.quantity} {lang === 'hi' ? 'लीटर' : 'Liters'} {customer.milk_type} {lang === 'hi' ? 'दूध' : 'Milk'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'hi' ? 'दैनिक तय मात्रा:' : 'Daily Target:'} {customer.default_quantity}L • {lang === 'hi' ? 'रेट:' : 'Rate:'} ₹{customer.price_per_liter}/L
                  </p>
                </div>
              </div>

              <div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                  today_status.status === 'Skipped'
                    ? 'bg-rose-100 text-rose-700'
                    : today_status.status === 'Extra'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {today_status.status === 'Skipped' 
                    ? (lang === 'hi' ? 'छुट्टी (OFF)' : 'Skipped (OFF)') 
                    : today_status.status === 'Extra' 
                    ? (lang === 'hi' ? 'अतिरिक्त' : 'Extra') 
                    : (lang === 'hi' ? 'वितरित' : 'Delivered')}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier Receivable Banner OR Buyer Instant UPI Pay Button */}
          {customer.customer_type === 'SUPPLIER' ? (
            month_summary.balance_due > 0 && (
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-5 text-white shadow-lg flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-blue-200">
                    {lang === 'hi' ? 'दूधिया की तरफ से आपको मिलने योग्य राशि' : 'Amount Due to You from Vendor'}
                  </p>
                  <h4 className="text-2xl font-black mt-0.5">₹{month_summary.balance_due.toFixed(0)}</h4>
                  <p className="text-xs text-blue-100 mt-0.5">
                    {lang === 'hi' ? `${vendor.name} (${vendor.phone}) द्वारा देय` : `Payable by ${vendor.name}`}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl text-xs font-bold">
                  📥 {lang === 'hi' ? 'संकलन हिसाब' : 'Procurement'}
                </div>
              </div>
            )
          ) : (
            month_summary.balance_due > 0 && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-lg flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-100">{t('instantPayTitle')}</p>
                  <h4 className="text-2xl font-black mt-0.5">₹{month_summary.balance_due.toFixed(0)}</h4>
                  <p className="text-xs text-emerald-100 mt-0.5">UPI ID: {vendor.upi_id}</p>
                </div>

                <a
                  href={`upi://pay?pa=${vendor.upi_id}&pn=${encodeURIComponent(vendor.business_name)}&am=${month_summary.balance_due}&cu=INR`}
                  className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-3 rounded-2xl font-black text-sm shadow-md active:scale-95 transition flex items-center gap-1.5"
                >
                  <span>Google Pay / PhonePe</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            )
          )}

          {/* Delivery Actions: Pre-schedule Skip Milk (SKP-01, SKP-02) */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-4 border border-amber-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                <CalendarOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950">{t('skipMilkTitle')}</h4>
                <p className="text-xs text-amber-800 font-medium">{t('skipMilkSub')}</p>
              </div>
            </div>
            <button
              onClick={() => { setSkipError(''); setIsSkipModalOpen(true); }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-xs transition active:scale-95 shrink-0"
            >
              {lang === 'hi' ? 'छुट्टी तय करें' : 'Schedule Off'}
            </button>
          </div>

          {/* Delivery History List */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              {lang === 'hi' ? 'तारीख अनुसार दूध डिलीवरी विवरण' : 'Daily Delivery History & Logs'}
            </h4>

            {recent_logs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                {lang === 'hi' ? 'अभी तक कोई रिकॉर्ड दर्ज नहीं है।' : 'No delivery logs recorded yet.'}
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent_logs.map(log => (
                  <div key={log.id} className="py-3 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{log.date}</p>
                        {log.dispute_status === 'Pending' && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {t('disputedBadge')}
                          </span>
                        )}
                        {log.dispute_status === 'Resolved' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {t('resolvedBadge')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {log.dispute_status === 'Pending' && log.dispute_reason ? (
                          <span className="text-rose-700 font-bold">आपत्ति: "{log.dispute_reason}"</span>
                        ) : (
                          log.notes || (log.quantity === 0 ? (lang === 'hi' ? "छुट्टी / बंद" : "Skipped / Off") : (lang === 'hi' ? "नियमित सप्लाई" : "Regular Supply"))
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                        log.quantity === 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-900'
                      }`}>
                        {log.quantity} {lang === 'hi' ? 'लीटर' : 'L'}
                      </span>

                      {/* DIS-01: Raise Query action for delivered days */}
                      {log.quantity > 0 && log.dispute_status !== 'Pending' && (
                        <button
                          onClick={() => {
                            setDisputingLog({ id: log.id, date: log.date, quantity: log.quantity });
                            setDisputeReason('');
                          }}
                          title={t('raiseDispute')}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FAMILY MEMBERS / SUB-USERS */}
      {activeTab === 'FAMILY_USERS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {lang === 'hi' ? 'परिवार के सदस्य (Authorized Users)' : 'Family Members (Authorized Users)'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' ? 'ये सदस्य भी आपके दूध का हिसाब देख सकते हैं और अतिरिक्त ऑर्डर दे सकते हैं।' : 'These members can also view your ledger and place orders.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddingUser(true)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>{lang === 'hi' ? 'सदस्य जोड़ें' : 'Add Member'}</span>
              </button>
            </div>

            {/* Add Subuser Modal */}
            {isAddingUser && (
              <form onSubmit={handleAddSubUser} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700">
                  {lang === 'hi' ? 'नए सदस्य का विवरण' : 'New Member Details'}
                </h4>
                <div>
                  <input
                    type="text"
                    required
                    placeholder={lang === 'hi' ? "सदस्य का नाम (उदा. सुमित्रा देवी)" : "Member Name (e.g. Sumitra Devi)"}
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder={lang === 'hi' ? "मोबाइल नंबर (वैकल्पिक)" : "Mobile Number (Optional)"}
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                  <select
                    value={newUserRelation}
                    onChange={(e) => setNewUserRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  >
                    <option value={lang === 'hi' ? "पत्नी (Wife)" : "Wife"}>{lang === 'hi' ? "पत्नी (Wife)" : "Wife"}</option>
                    <option value={lang === 'hi' ? "पति (Husband)" : "Husband"}>{lang === 'hi' ? "पति (Husband)" : "Husband"}</option>
                    <option value={lang === 'hi' ? "बेटा (Son)" : "Son"}>{lang === 'hi' ? "बेटा (Son)" : "Son"}</option>
                    <option value={lang === 'hi' ? "बेटी (Daughter)" : "Daughter"}>{lang === 'hi' ? "बेटी (Daughter)" : "Daughter"}</option>
                    <option value={lang === 'hi' ? "किराएदार (Tenant)" : "Tenant"}>{lang === 'hi' ? "किराएदार (Tenant)" : "Tenant"}</option>
                    <option value={lang === 'hi' ? "अन्य (Other)" : "Other"}>{lang === 'hi' ? "अन्य (Other)" : "Other"}</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                  >
                    {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingUser}
                    className="flex-1 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-xs"
                  >
                    {submittingUser ? (lang === 'hi' ? "जोड़ा जा रहा है..." : "Adding...") : (lang === 'hi' ? "सुरक्षित करें" : "Save Member")}
                  </button>
                </div>
              </form>
            )}

            {/* Subusers list */}
            {subusers.length === 0 ? (
              <div className="text-center py-6">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">
                  {lang === 'hi' ? 'कोई सदस्य नहीं जुड़ा है।' : 'No family members added yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {subusers.map(sub => (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{sub.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {sub.relation} {sub.phone ? `• ${sub.phone}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg">
                      {lang === 'hi' ? 'सत्यापित सदस्य' : 'Verified Member'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MESSAGES / COMMUNICATE WITH VENDOR */}
      {activeTab === 'MESSAGES' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">
              {lang === 'hi' ? 'दूधिया से संवाद (Message Milkman)' : 'Message Dairy Vendor'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'hi' ? 'दूध की छुट्टी, अतिरिक्त दूध, या शिकायत के लिए सीधे संदेश भेजें।' : 'Send a direct message for extra milk, skip requests, or inquiries.'}
            </p>

            {/* Quick action chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(lang === 'hi' ? [
                "कल 1L अतिरिक्त दूध चाहिए 🙏",
                "रविवार को दूध की छुट्टी रखें 🚫",
                "आज का दूध समय पर मिल गया, धन्यवाद! 👍"
              ] : [
                "Need 1L extra milk tomorrow 🙏",
                "Please skip milk on Sunday 🚫",
                "Received milk on time today, thank you! 👍"
              ]).map((quickText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(quickText)}
                  className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 px-3 py-1.5 rounded-full font-medium transition"
                >
                  {quickText}
                </button>
              ))}
            </div>

            {/* Message Thread */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto mb-4 p-2 bg-slate-50 rounded-2xl">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  {lang === 'hi' ? 'अभी तक कोई बातचीत नहीं हुई है।' : 'No messages yet.'}
                </p>
              ) : (
                messages.map((m, i) => {
                  const isMe = m.sender_role === 'customer';
                  return (
                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium shadow-xs ${
                        isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}>
                        <p className="text-[10px] font-bold opacity-80 mb-0.5">{m.sender_name}</p>
                        <p className="text-sm">{m.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Composer */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={lang === 'hi' ? "यहाँ संदेश लिखें (उदा. कल 0.5L extra)..." : "Type message (e.g. need 0.5L extra)..."}
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={sendingMsg || !newMsgText.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl font-bold shadow-xs disabled:opacity-40 transition flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIS-01: Raise Dispute Modal */}
      {disputingLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white" />
                <div>
                  <h4 className="font-black text-base">{t('disputeModalTitle')}</h4>
                  <p className="text-xs text-rose-100">{disputingLog.date} • {disputingLog.quantity}L</p>
                </div>
              </div>
              <button onClick={() => setDisputingLog(null)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="p-5 space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                {t('disputeModalSub')}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('disputeReasonLabel')}
                </label>
                <textarea 
                  required
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder={t('disputeReasonPlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDisputingLog(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute || !disputeReason.trim()}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
                >
                  {submittingDispute ? (lang === 'hi' ? 'भेजा जा रहा है...' : 'Submitting...') : t('submitDispute')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKP-01 & SKP-02: Schedule Skip Milk Modal */}
      {isSkipModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-500 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarOff className="w-5 h-5 text-white" />
                <div>
                  <h4 className="font-black text-base">{t('skipMilkTitle')}</h4>
                  <p className="text-xs text-amber-100">{t('skipMilkSub')}</p>
                </div>
              </div>
              <button onClick={() => setIsSkipModalOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSkipSubmit} className="p-5 space-y-4">
              {skipError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{skipError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('selectSkipDate')}
                </label>
                <input 
                  type="date"
                  required
                  value={skipDate}
                  onChange={(e) => {
                    setSkipDate(e.target.value);
                    setSkipError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {lang === 'hi' ? '⚠️ नियम: आज की तारीख की छुट्टी ऐप से नहीं होगी, केवल कल या आगे की तारीख चुनें।' : '⚠️ Rule: Only tomorrow or future dates can be scheduled.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('skipReasonOptional')}
                </label>
                <input 
                  type="text"
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder={t('skipReasonPlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSkipModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingSkip}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
                >
                  {submittingSkip ? (lang === 'hi' ? 'सहेज रहे हैं...' : 'Scheduling...') : t('confirmSkipBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Feedback Banner */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom duration-200">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            {feedbackMsg.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="text-xs font-bold flex-1">{feedbackMsg.text}</p>
            <button onClick={() => setFeedbackMsg(null)} className="p-1 text-slate-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
