import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, MessageSquare, CheckCircle, Send, 
  Calendar, Phone, User, Check, RefreshCw, Sparkles, 
  UserPlus, MapPin, Milk, X, Clock, CheckCircle2 
} from 'lucide-react';
import { 
  fetchVendorDisputesApi, resolveDisputeApi, 
  fetchVendorMessageThreadsApi, vendorReplyMessageApi,
  fetchVendorRequestsApi, acceptMilkRequestApi, rejectMilkRequestApi 
} from '../services/api';
import { VendorDisputeItem, VendorMessageThread, MilkRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';

export default function VendorInboxView() {
  const { t, lang } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'REQUESTS' | 'DISPUTES' | 'CHATS'>('REQUESTS');

  // Milk Requests State
  const [requests, setRequests] = useState<MilkRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

  // Disputes State
  const [disputes, setDisputes] = useState<VendorDisputeItem[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [resolvedQty, setResolvedQty] = useState<string>('0.5');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  // Chats State
  const [threads, setThreads] = useState<VendorMessageThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    setLoadingRequests(true);
    setLoadingDisputes(true);
    setLoadingThreads(true);
    try {
      const [reqs, dis, th] = await Promise.all([
        fetchVendorRequestsApi(1), // Default vendor Sanjay Yadav
        fetchVendorDisputesApi(),
        fetchVendorMessageThreadsApi()
      ]);
      setRequests(reqs);
      setDisputes(dis);
      setThreads(th);
      if (th.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(th[0].customer_id);
      }
      // If there are pending requests, default to REQUESTS, else if disputes, default to DISPUTES
      const pendingCount = reqs.filter(r => r.status === 'Pending').length;
      if (pendingCount > 0) {
        setActiveSubTab('REQUESTS');
      } else if (dis.length > 0) {
        setActiveSubTab('DISPUTES');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
      setLoadingDisputes(false);
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptRequest = async (requestId: number) => {
    setProcessingRequestId(requestId);
    try {
      const res = await acceptMilkRequestApi(requestId);
      setToastMsg(lang === 'hi' ? 'अनुरोध स्वीकार कर लिया गया! नया ग्राहक आपकी सूची में जुड़ गया।' : 'Request accepted! Customer added to your list.');
      setTimeout(() => setToastMsg(''), 4500);
      const updated = await fetchVendorRequestsApi(1);
      setRequests(updated);
    } catch (err: any) {
      alert("स्वीकार करने में त्रुटि: " + err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!window.confirm(lang === 'hi' ? 'क्या आप इस अनुरोध को अस्वीकार करना चाहते हैं?' : 'Decline this milk request?')) return;
    setProcessingRequestId(requestId);
    try {
      await rejectMilkRequestApi(requestId);
      setToastMsg(lang === 'hi' ? 'अनुरोध अस्वीकार कर दिया गया' : 'Request declined');
      setTimeout(() => setToastMsg(''), 3500);
      const updated = await fetchVendorRequestsApi(1);
      setRequests(updated);
    } catch (err: any) {
      alert("अस्वीकार करने में त्रुटि: " + err.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvingId === null) return;
    setSubmittingResolve(true);
    try {
      await resolveDisputeApi(resolvingId, parseFloat(resolvedQty) || 0, resolutionNote);
      setToastMsg(lang === 'hi' ? 'आपत्ति का निवारण सफलतापूर्वक दर्ज हो गया!' : 'Query resolved successfully!');
      setTimeout(() => setToastMsg(''), 3500);
      setResolvingId(null);
      setResolutionNote('');
      const updated = await fetchVendorDisputesApi();
      setDisputes(updated);
    } catch (err: any) {
      alert(err.message || 'Error resolving query');
    } finally {
      setSubmittingResolve(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await vendorReplyMessageApi(selectedCustomerId, replyText.trim());
      setReplyText('');
      const updatedThreads = await fetchVendorMessageThreadsApi();
      setThreads(updatedThreads);
    } catch (err: any) {
      alert(err.message || 'Error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const selectedThread = threads.find(t => t.customer_id === selectedCustomerId);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      
      {/* View Header */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('inboxTitle')}</h2>
            {pendingRequests.length > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {pendingRequests.length} {t('requestsCount')}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{t('inboxSub')}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-black">
          
          {/* TAB 1: Milk Requests */}
          <button
            onClick={() => setActiveSubTab('REQUESTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeSubTab === 'REQUESTS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t('requestsTab')}</span>
            {pendingRequests.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'REQUESTS' ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
              }`}>
                {pendingRequests.length}
              </span>
            )}
          </button>

          {/* TAB 2: Disputes */}
          <button
            onClick={() => setActiveSubTab('DISPUTES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeSubTab === 'DISPUTES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('disputeQueriesTab')}</span>
            {disputes.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'DISPUTES' ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
              }`}>
                {disputes.length}
              </span>
            )}
          </button>

          {/* TAB 3: Direct Chats */}
          <button
            onClick={() => setActiveSubTab('CHATS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeSubTab === 'CHATS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('chatThreadsTab')}</span>
            {threads.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'CHATS' ? 'bg-white text-blue-700' : 'bg-slate-300 text-slate-700'
              }`}>
                {threads.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SUBTAB 1: MILK REQUESTS (Location-Based Leads) */}
      {activeSubTab === 'REQUESTS' && (
        <div className="space-y-3.5">
          {loadingRequests ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold">{lang === 'hi' ? 'अनुरोध लोड हो रहे हैं...' : 'Loading requests...'}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <Milk className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-black text-slate-800">
                {lang === 'hi' ? 'कोई नया दूध अनुरोध नहीं है' : 'No milk requests yet'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {lang === 'hi'
                  ? 'जब ग्राहक आपके इलाके में ऑनलाइन दूधिया खोजेंगे और आपको अनुरोध भेजेंगे, तो वे यहाँ दिखाई देंगे।'
                  : 'When customers find you via location search and request milk delivery, they will appear here.'}
              </p>
            </div>
          ) : (
            requests.map((req) => {
              const isPending = req.status === 'Pending';
              const isAccepted = req.status === 'Accepted';
              const isProcessing = processingRequestId === req.id;

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl p-4 sm:p-5 shadow-xs border transition ${
                    isPending
                      ? 'border-blue-300 bg-blue-50/20'
                      : isAccepted
                      ? 'border-emerald-200 bg-white opacity-85'
                      : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-base">{req.customer_name}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isPending 
                            ? 'bg-amber-100 text-amber-800' 
                            : isAccepted 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {req.status === 'Pending' ? (lang === 'hi' ? 'लंबित अनुरोध' : 'Pending') : req.status === 'Accepted' ? (lang === 'hi' ? 'स्वीकृत ✓' : 'Accepted ✓') : (lang === 'hi' ? 'अस्वीकृत' : 'Declined')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.customer_phone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.address}</span>
                        </span>
                      </div>

                      {/* Request Specifications */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs font-bold">
                        <span className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-xl">
                          🥛 {req.quantity} L ({req.milk_type})
                        </span>
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{req.delivery_time === 'Morning' ? t('morning') : req.delivery_time === 'Evening' ? t('evening') : t('bothTimes')}</span>
                        </span>
                        {req.start_date && (
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{lang === 'hi' ? 'शुरुआत:' : 'Start:'} {req.start_date}</span>
                          </span>
                        )}
                      </div>

                      {req.notes && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-100/70 p-2 rounded-xl italic">
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex sm:flex-col gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs shadow-sm active:scale-95 transition flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isProcessing ? '...' : t('acceptRequest')}</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req.id)}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-4 py-2 rounded-xl text-xs active:scale-95 transition"
                        >
                          {t('rejectRequest')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUBTAB 2: DISPUTES & QUERIES */}
      {activeSubTab === 'DISPUTES' && (
        <div className="space-y-3">
          {loadingDisputes ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold">{lang === 'hi' ? 'आपत्तियां लोड हो रही हैं...' : 'Loading queries...'}</p>
            </div>
          ) : disputes.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-black text-slate-800">{t('noDisputes')}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'hi' ? 'सभी डिलीवरी रिकॉर्ड ग्राहकों द्वारा स्वीकृत हैं।' : 'All delivery logs are verified by customers.'}
              </p>
            </div>
          ) : (
            disputes.map((d) => (
              <div 
                key={d.log_id} 
                className="bg-white rounded-3xl p-5 shadow-xs border border-rose-200 bg-rose-50/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-base">{d.customer_name}</h4>
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        {t('pendingBadge')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{d.date}</span>
                      </span>
                      <span>•</span>
                      <span>{t('recordedQty')}: <strong className="text-slate-900">{d.quantity} L</strong></span>
                      {d.customer_phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{d.customer_phone}</span>
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 font-medium">
                      <span className="font-bold text-rose-900">{t('reasonLabel')}:</span> "{d.dispute_reason}"
                    </div>
                  </div>

                  <div className="sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        setResolvingId(d.log_id);
                        setResolvedQty(String(d.quantity));
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs active:scale-95 transition"
                    >
                      {t('actionResolve')}
                    </button>
                  </div>
                </div>

                {/* Inline Resolve Form Modal */}
                {resolvingId === d.log_id && (
                  <form onSubmit={handleResolveSubmit} className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl animate-in fade-in duration-150">
                    <h5 className="font-black text-xs text-slate-800 uppercase tracking-wider mb-2">
                      {t('resolveDisputeTitle')}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t('resolvedQtyLabel')}
                        </label>
                        <input 
                          type="number"
                          step="0.5"
                          min="0"
                          required
                          value={resolvedQty}
                          onChange={(e) => setResolvedQty(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t('resolutionNoteLabel')}
                        </label>
                        <input 
                          type="text"
                          placeholder="उदा. ग्राहक की सहमति से 0.5L किया गया"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setResolvingId(null)}
                        className="px-3 py-1.5 text-slate-600 font-bold text-xs hover:bg-slate-200 rounded-lg"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={submittingResolve}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-1.5 rounded-lg text-xs shadow-xs"
                      >
                        {submittingResolve ? '...' : t('confirmResolve')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 3: DIRECT CHATS */}
      {activeSubTab === 'CHATS' && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Threads List Sidebar */}
          <div className="border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-3 space-y-2 max-h-[480px] overflow-y-auto">
            {loadingThreads ? (
              <div className="text-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Loading threads...</p>
              </div>
            ) : threads.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">{t('noMessages')}</p>
            ) : (
              threads.map((th) => (
                <button
                  key={th.customer_id}
                  onClick={() => setSelectedCustomerId(th.customer_id)}
                  className={`w-full text-left p-2.5 rounded-2xl transition flex items-center gap-2.5 ${
                    selectedCustomerId === th.customer_id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
                    {th.customer_name[0]?.toUpperCase() || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{th.customer_name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{th.last_message}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Active Chat Thread */}
          <div className="md:col-span-2 flex flex-col justify-between h-[480px]">
            {selectedThread ? (
              <>
                {/* Header */}
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{selectedThread.customer_name}</h4>
                    <p className="text-xs text-slate-500">{selectedThread.customer_phone || selectedThread.address}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {lang === 'hi' ? 'सक्रिय ग्राहक' : 'Active Customer'}
                  </span>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-2">
                  {selectedThread.messages.map((m) => {
                    const isVendor = m.sender_role === 'vendor';
                    return (
                      <div key={m.id} className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium shadow-xs ${
                          isVendor 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'
                        }`}>
                          <p className="text-[10px] font-bold opacity-80 mb-0.5">{m.sender_name}</p>
                          <p className="text-sm">{m.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Composer */}
                <form onSubmit={handleSendReply} className="flex gap-2 pt-2 border-t border-slate-100">
                  <input 
                    type="text"
                    required
                    placeholder={t('typeReplyPlaceholder')}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl font-black text-xs shadow-xs disabled:opacity-40 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('sendReply')}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-6 text-slate-400">
                <p className="text-xs">{t('selectCustomer')}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
