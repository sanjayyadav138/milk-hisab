import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, MessageSquare, CheckCircle, Send, 
  Calendar, Phone, User, Check, RefreshCw, Sparkles 
} from 'lucide-react';
import { 
  fetchVendorDisputesApi, resolveDisputeApi, 
  fetchVendorMessageThreadsApi, vendorReplyMessageApi 
} from '../services/api';
import { VendorDisputeItem, VendorMessageThread } from '../types';
import { useLanguage } from '../context/LanguageContext';

export default function VendorInboxView() {
  const { t, lang } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'DISPUTES' | 'CHATS'>('DISPUTES');

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
    setLoadingDisputes(true);
    setLoadingThreads(true);
    try {
      const [dis, th] = await Promise.all([
        fetchVendorDisputesApi(),
        fetchVendorMessageThreadsApi()
      ]);
      setDisputes(dis);
      setThreads(th);
      if (th.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(th[0].customer_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDisputes(false);
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const selectedThread = threads.find(t => t.customer_id === selectedCustomerId);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      
      {/* View Header */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('inboxTitle')}</h2>
            {disputes.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                {disputes.length} {lang === 'hi' ? 'आपत्तियां' : 'Pending'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{t('inboxSub')}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('DISPUTES')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
              activeSubTab === 'DISPUTES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('disputeQueriesTab')}</span>
            {disputes.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeSubTab === 'DISPUTES' ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
              }`}>
                {disputes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('CHATS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
              activeSubTab === 'CHATS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('chatThreadsTab')}</span>
            {threads.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
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

      {/* SUBTAB 1: DISPUTES & QUERIES (DIS-02) */}
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
                className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-rose-200 transition hover:border-rose-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{d.customer_name}</h4>
                      <p className="text-xs text-slate-500">{d.customer_phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{d.date}</span>
                    </span>
                    <span className="text-xs bg-rose-100 text-rose-800 font-black px-2.5 py-1 rounded-xl">
                      {d.quantity}L recorded
                    </span>
                  </div>
                </div>

                {/* Customer Dispute Reason */}
                <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 mb-3 text-xs">
                  <p className="font-black text-rose-900 mb-0.5">
                    {lang === 'hi' ? 'ग्राहक द्वारा दर्ज आपत्ति / शिकायत:' : 'Customer Issue Note:'}
                  </p>
                  <p className="text-rose-800 font-medium text-sm">
                    "{d.dispute_reason || (lang === 'hi' ? 'मात्रा में गलती है' : 'Quantity discrepancy')}"
                  </p>
                </div>

                {/* Action button / resolve form */}
                {resolvingId === d.log_id ? (
                  <form onSubmit={handleResolveSubmit} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h5 className="text-xs font-black uppercase text-slate-700">{t('resolveDisputeTitle')}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t('resolvedQtyLabel')}</label>
                        <input 
                          type="number"
                          step="0.5"
                          min="0"
                          required
                          value={resolvedQty}
                          onChange={(e) => setResolvedQty(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t('resolutionNoteLabel')}</label>
                        <input 
                          type="text"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="e.g. Phone confirmed 500ml"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setResolvingId(null)}
                        className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                      >
                        {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={submittingResolve}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{submittingResolve ? (lang === 'hi' ? 'सहेज रहे हैं...' : 'Saving...') : t('confirmResolve')}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setResolvingId(d.log_id);
                        setResolvedQty(d.quantity.toString());
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'आपत्ति हल करें (Resolve)' : 'Resolve Query'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 2: CHATS & DIRECT MESSAGING (MSG-02) */}
      {activeSubTab === 'CHATS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 min-h-[500px]">
          {/* Customer Conversations List */}
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-3 space-y-1 max-h-[500px] overflow-y-auto">
            <h4 className="text-xs font-black uppercase text-slate-500 mb-2 px-2">{t('selectCustomer')}</h4>
            {threads.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">{t('noMessages')}</p>
            ) : (
              threads.map((th) => (
                <button
                  key={th.customer_id}
                  onClick={() => setSelectedCustomerId(th.customer_id)}
                  className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-2.5 ${
                    selectedCustomerId === th.customer_id
                      ? 'bg-blue-50/80 border border-blue-200'
                      : 'hover:bg-slate-50 border border-transparent'
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