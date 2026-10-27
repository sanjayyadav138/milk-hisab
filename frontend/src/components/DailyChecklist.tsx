import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, XCircle, Plus, Minus, RotateCcw, 
  Sparkles, Save, MapPin, Milk, ArrowDownCircle, ArrowUpCircle, Scale 
} from 'lucide-react';
import { fetchDayChecklist, submitBatchLogs } from '../services/api';
import { DailyLogItem } from '../types';
import VoiceAssistantModal from './VoiceAssistantModal';
import { useLanguage } from '../context/LanguageContext';

export default function DailyChecklist() {
  const { t, lang } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [checklist, setChecklist] = useState<DailyLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  
  // Bilateral flow filter: ALL | DELIVERY (बिक्री) | COLLECTION (खरीद/4 घर)
  const [flowFilter, setFlowFilter] = useState<'ALL' | 'DELIVERY' | 'COLLECTION'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SKIPPED' | 'EXTRA'>('ALL');

  useEffect(() => {
    loadChecklist(selectedDate);
  }, [selectedDate]);

  const loadChecklist = async (dateStr: string) => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const data = await fetchDayChecklist(dateStr);
      setChecklist(data.checklist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (customerId: number, delta: number) => {
    setChecklist(prev => prev.map(item => {
      if (item.customer_id === customerId) {
        const newQty = Math.max(0, Math.round((item.quantity + delta) * 10) / 10);
        return {
          ...item,
          quantity: newQty,
          status: newQty === 0 ? "Skipped" : newQty > item.default_quantity ? "Extra" : "Delivered"
        };
      }
      return item;
    }));
  };

  const handleSkipToggle = (customerId: number) => {
    setChecklist(prev => prev.map(item => {
      if (item.customer_id === customerId) {
        if (item.quantity === 0) {
          return {
            ...item,
            quantity: item.default_quantity,
            status: "Delivered"
          };
        } else {
          return {
            ...item,
            quantity: 0,
            status: "Skipped"
          };
        }
      }
      return item;
    }));
  };

  const handleResetToDefault = (customerId: number) => {
    setChecklist(prev => prev.map(item => {
      if (item.customer_id === customerId) {
        return {
          ...item,
          quantity: item.default_quantity,
          status: "Delivered"
        };
      }
      return item;
    }));
  };

  const handleVoiceCommand = (parsed: any) => {
    if (!parsed.matched_customer_id) return;
    setChecklist(prev => prev.map(item => {
      if (item.customer_id === parsed.matched_customer_id) {
        let newQty = item.quantity;
        let newStatus = "Delivered";

        if (parsed.action === "skip") {
          newQty = 0;
          newStatus = "Skipped";
        } else if (parsed.action === "add") {
          newQty = Math.round((item.quantity + (parsed.extracted_quantity || 0.5)) * 10) / 10;
          newStatus = "Extra";
        } else {
          newQty = parsed.extracted_quantity !== null ? parsed.extracted_quantity : item.default_quantity;
          newStatus = newQty === 0 ? "Skipped" : (newQty > item.default_quantity ? "Extra" : "Delivered");
        }

        return {
          ...item,
          quantity: newQty,
          status: newStatus
        };
      }
      return item;
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        entries: checklist.map(item => ({
          customer_id: item.customer_id,
          quantity_delivered: item.quantity,
          status: item.status,
          notes: item.status === "Skipped" ? "छुट्टी" : item.status === "Extra" ? "अतिरिक्त" : null
        }))
      };
      await submitBatchLogs(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadChecklist(selectedDate);
    } catch (err: any) {
      alert("सेव करने में समस्या आई: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Bilateral Balances (Collection vs Distribution)
  const collectionItems = checklist.filter(item => item.customer_type === 'SUPPLIER');
  const deliveryItems = checklist.filter(item => item.customer_type !== 'SUPPLIER');

  const totalCollected = collectionItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalDelivered = deliveryItems.reduce((sum, item) => sum + item.quantity, 0);
  const surplusBalance = Math.round((totalCollected - totalDelivered) * 10) / 10;

  // Filtered List based on Bilateral flow + Status
  const filteredChecklist = checklist.filter(item => {
    // 1. Flow Filter
    if (flowFilter === 'DELIVERY' && item.customer_type === 'SUPPLIER') return false;
    if (flowFilter === 'COLLECTION' && item.customer_type !== 'SUPPLIER') return false;

    // 2. Status Filter
    if (statusFilter === 'SKIPPED') return item.quantity === 0;
    if (statusFilter === 'EXTRA') return item.quantity > item.default_quantity;

    return true;
  });

  return (
    <div className="pb-32 max-w-2xl mx-auto px-3 sm:px-4 pt-4">
      
      {/* Top Date & Action Header */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 mb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('deliveryDate')}</p>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-base sm:text-lg font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => setIsVoiceOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-2.5 rounded-2xl shadow-md font-bold text-xs sm:text-sm active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>{t('voiceFill')}</span>
          </button>
        </div>

        {/* Bilateral Inward vs Outward Stats Dashboard */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
          
          {/* 1. Milk Collected (Inward from 4 homes) */}
          <div className="bg-blue-50 rounded-2xl p-2.5 text-center border border-blue-100">
            <div className="flex items-center justify-center gap-1 text-[11px] text-blue-700 font-bold uppercase">
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>{t('totalCollected')}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">
              {totalCollected.toFixed(1)} <span className="text-xs font-semibold">L</span>
            </p>
            <p className="text-[10px] text-blue-600 font-semibold">{collectionItems.length} {lang === 'hi' ? 'घरों से लिया' : 'Homes'}</p>
          </div>

          {/* 2. Milk Delivered (Outward to customers) */}
          <div className="bg-emerald-50 rounded-2xl p-2.5 text-center border border-emerald-100">
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-bold uppercase">
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>{t('totalDelivered')}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
              {totalDelivered.toFixed(1)} <span className="text-xs font-semibold">L</span>
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">{deliveryItems.length} {lang === 'hi' ? 'ग्राहकों को दिया' : 'Customers'}</p>
          </div>

          {/* 3. Surplus Stock Balance */}
          <div className={`rounded-2xl p-2.5 text-center border ${
            surplusBalance < 0 
              ? 'bg-rose-50 border-rose-200 text-rose-900' 
              : 'bg-indigo-50 border-indigo-100 text-indigo-900'
          }`}>
            <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase">
              <Scale className="w-3.5 h-3.5" />
              <span>{t('surplusStock')}</span>
            </div>
            <p className="text-xl sm:text-2xl font-black mt-0.5">
              {surplusBalance >= 0 ? `+${surplusBalance.toFixed(1)}` : surplusBalance.toFixed(1)} <span className="text-xs font-semibold">L</span>
            </p>
            <p className="text-[10px] opacity-80 font-semibold">
              {surplusBalance >= 0 ? (lang === 'hi' ? 'शेष बचा दूध' : 'In Stock') : (lang === 'hi' ? 'कमी' : 'Shortage')}
            </p>
          </div>
        </div>

        {/* Bilateral Flow Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 p-1 bg-slate-100 rounded-2xl text-xs font-black">
          <button
            onClick={() => setFlowFilter('ALL')}
            className={`py-2 rounded-xl transition ${
              flowFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('allContactsTab')} ({checklist.length})
          </button>
          
          <button
            onClick={() => setFlowFilter('DELIVERY')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              flowFilter === 'DELIVERY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>📤 {t('deliveryTab')}</span>
            <span className="text-[10px] opacity-80">({deliveryItems.length})</span>
          </button>

          <button
            onClick={() => setFlowFilter('COLLECTION')}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1 ${
              flowFilter === 'COLLECTION'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>📥 {t('collectionTab')}</span>
            <span className="text-[10px] opacity-80">({collectionItems.length})</span>
          </button>
        </div>

        {/* Secondary Status Pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-xl transition ${
              statusFilter === 'ALL' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('filterAll')}
          </button>
          <button
            onClick={() => setStatusFilter('SKIPPED')}
            className={`px-3 py-1 rounded-xl transition ${
              statusFilter === 'SKIPPED' 
                ? 'bg-rose-600 text-white shadow-xs' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {t('filterSkipped')}
          </button>
          <button
            onClick={() => setStatusFilter('EXTRA')}
            className={`px-3 py-1 rounded-xl transition ${
              statusFilter === 'EXTRA' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {t('filterExtra')}
          </button>
        </div>
      </div>

      {/* Checklist Entries */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-500">{lang === 'hi' ? 'लिस्ट लोड हो रही है...' : 'Loading checklist...'}</p>
        </div>
      ) : filteredChecklist.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <Milk className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700">{lang === 'hi' ? 'कोई संपर्क नहीं मिला' : 'No entries found'}</h3>
          <p className="text-xs text-slate-500 mt-1">{lang === 'hi' ? "शुरू करने के लिए 'ग्राहक' टैब में जाकर दूध देने वाले घर या ग्राहक जोड़ें।" : "Go to 'Customers' tab to add collection homes or customers."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChecklist.map((item) => {
            const isSupplier = item.customer_type === 'SUPPLIER';
            const isSkipped = item.quantity === 0;
            const isExtra = item.quantity > item.default_quantity;

            return (
              <div 
                key={item.customer_id}
                className={`bg-white rounded-2xl p-4 shadow-xs border transition-all ${
                  isSkipped 
                    ? 'border-rose-200 bg-rose-50/40 opacity-90' 
                    : isExtra
                    ? 'border-amber-300 bg-amber-50/30'
                    : isSupplier
                    ? 'border-blue-200 hover:border-blue-400'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {item.name}
                      </h4>

                      {/* Bilateral Role Badge */}
                      {isSupplier ? (
                        <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          📥 {t('supplierHomeBadge')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                          📤 {t('customerBadge')}
                        </span>
                      )}

                      {isSkipped && (
                        <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                          {isSupplier ? (lang === 'hi' ? 'दूध नहीं लिया (Skip)' : 'Not Collected') : (lang === 'hi' ? 'छुट्टी (OFF)' : 'Skipped')}
                        </span>
                      )}

                      {isExtra && (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          +{(item.quantity - item.default_quantity).toFixed(1)}L {lang === 'hi' ? 'अतिरिक्त' : 'Extra'}
                        </span>
                      )}
                    </div>

                    {item.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.address}</span>
                      </p>
                    )}

                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {isSupplier ? (lang === 'hi' ? 'दैनिक संकलन:' : 'Daily Collection:') : (lang === 'hi' ? 'दैनिक मांग:' : 'Daily Supply:')}{' '}
                      <span className="font-bold">{item.default_quantity}L</span> ({item.milk_type}) • {isSupplier ? t('rateBuy') : t('rateSell')}: ₹{item.price_per_liter}/L
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`px-3 py-1.5 rounded-2xl font-black text-lg sm:text-xl inline-block ${
                      isSkipped 
                        ? 'bg-rose-100 text-rose-700' 
                        : isSupplier
                        ? 'bg-blue-100 text-blue-900'
                        : isExtra 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.quantity.toFixed(1)} <span className="text-xs font-semibold">L</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSkipToggle(item.customer_id)}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 ${
                      isSkipped
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {isSkipped ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isSupplier ? (lang === 'hi' ? 'दूध लिया दर्ज करें' : 'Mark Collected') : t('unskipBtn')}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>{isSupplier ? (lang === 'hi' ? 'आज दूध नहीं लिया' : 'Skip Collection') : t('skipBtn')}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => handleQuantityChange(item.customer_id, -0.5)}
                      className="p-1.5 hover:bg-white rounded-lg transition text-slate-700 active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-slate-800">
                      {item.quantity}L
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.customer_id, 0.5)}
                      className="p-1.5 hover:bg-white rounded-lg transition text-slate-700 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleResetToDefault(item.customer_id)}
                    title={lang === 'hi' ? 'डिफ़ॉल्ट मात्रा पर रीसेट करें' : 'Reset to default'}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Save Button */}
      <div className="fixed bottom-20 left-0 right-0 max-w-2xl mx-auto px-4 pointer-events-none z-30">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className={`pointer-events-auto w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
            saveSuccess 
              ? 'bg-emerald-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
          }`}
        >
          {saving ? (
            <span>{lang === 'hi' ? 'सेव हो रहा है...' : 'Saving...'}</span>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>{lang === 'hi' ? 'पूरा हिसाब सुरक्षित हो गया! ✓' : 'Daily entries saved! ✓'}</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{lang === 'hi' ? 'आज का हिसाब सुरक्षित करें (Save)' : 'Save Daily Ledger'}</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onCommandParsed={handleVoiceCommand}
      />
    </div>
  );
}
