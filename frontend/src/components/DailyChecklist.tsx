import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, XCircle, Plus, Minus, RotateCcw, 
  Sparkles, Save, MapPin, Milk 
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
  const [filterType, setFilterType] = useState<'ALL' | 'SKIPPED' | 'EXTRA'>('ALL');

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

  const totalLiters = checklist.reduce((sum, item) => sum + item.quantity, 0);
  const deliveredCount = checklist.filter(item => item.quantity > 0).length;
  const skippedCount = checklist.filter(item => item.quantity === 0).length;

  const filteredChecklist = checklist.filter(item => {
    if (filterType === 'SKIPPED') return item.quantity === 0;
    if (filterType === 'EXTRA') return item.quantity > item.default_quantity;
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

        {/* Live Delivery Stats Dashboard */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50 rounded-2xl p-2.5 text-center border border-emerald-100">
            <p className="text-[11px] text-emerald-700 font-bold uppercase">{t('totalMilk')}</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">
              {totalLiters.toFixed(1)} <span className="text-xs font-semibold">L</span>
            </p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-2.5 text-center border border-blue-100">
            <p className="text-[11px] text-blue-700 font-bold uppercase">{t('suppliedHomes')}</p>
            <p className="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">
              {deliveredCount}
            </p>
          </div>
          <div className="bg-rose-50 rounded-2xl p-2.5 text-center border border-rose-100">
            <p className="text-[11px] text-rose-700 font-bold uppercase">{t('offHomes')}</p>
            <p className="text-xl sm:text-2xl font-black text-rose-900 mt-0.5">
              {skippedCount}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterType === 'ALL' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('filterAll')} ({checklist.length})
          </button>
          <button
            onClick={() => setFilterType('SKIPPED')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterType === 'SKIPPED' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            {t('filterSkipped')} ({skippedCount})
          </button>
          <button
            onClick={() => setFilterType('EXTRA')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filterType === 'EXTRA' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {t('filterExtra')}
          </button>
        </div>
      </div>

      {/* Customer Delivery Checklist Items */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-500">{lang === 'hi' ? 'लिस्ट लोड हो रही है...' : 'Loading delivery checklist...'}</p>
        </div>
      ) : checklist.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <Milk className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700">{lang === 'hi' ? 'कोई ग्राहक नहीं मिला' : 'No customers found'}</h3>
          <p className="text-xs text-slate-500 mt-1">{lang === 'hi' ? "शुरू करने के लिए 'ग्राहक' टैब में जाकर नए घर जोड़ें।" : "Go to 'Customers' tab to add your first delivery house."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChecklist.map((item) => {
            const isSkipped = item.quantity === 0;
            const isExtra = item.quantity > item.default_quantity;
            const isDefault = item.quantity === item.default_quantity;

            return (
              <div 
                key={item.customer_id}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                  isSkipped 
                    ? 'border-rose-200 bg-rose-50/40 opacity-90' 
                    : isExtra
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-slate-900 tracking-tight">
                        {item.name}
                      </h4>
                      {isSkipped && (
                        <span className="text-[11px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                          {lang === 'hi' ? 'छुट्टी (OFF)' : 'Skipped (OFF)'}
                        </span>
                      )}
                      {isExtra && (
                        <span className="text-[11px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          +{(item.quantity - item.default_quantity).toFixed(1)}L Extra
                        </span>
                      )}
                    </div>
                    {item.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.address}</span>
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      {lang === 'hi' ? 'रोज़ाना:' : 'Daily:'} <span className="font-bold">{item.default_quantity}L</span> ({item.milk_type}) • ₹{item.price_per_liter}/L
                    </p>
                  </div>

                  <div className="text-right">
                    <div className={`px-3 py-1.5 rounded-2xl font-black text-lg sm:text-xl inline-block ${
                      isSkipped 
                        ? 'bg-rose-100 text-rose-700' 
                        : isExtra 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.quantity.toFixed(1)} <span className="text-xs font-semibold">L</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSkipToggle(item.customer_id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 ${
                      isSkipped
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    {isSkipped ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('unskipBtn')}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>{t('skipBtn')}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => handleQuantityChange(item.customer_id, -0.5)}
                      disabled={item.quantity <= 0}
                      className="w-9 h-9 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center shadow-xs active:scale-95 disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleResetToDefault(item.customer_id)}
                      title={lang === 'hi' ? "सामान्य मात्रा पर रीसेट करें" : "Reset to regular quantity"}
                      className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                        isDefault 
                          ? 'text-slate-400 bg-transparent' 
                          : 'bg-amber-200 text-amber-900 active:scale-95'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleQuantityChange(item.customer_id, 0.5)}
                      className="h-9 px-3 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-xs">0.5L</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Save Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 max-w-2xl mx-auto shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">{t('totalMilk')}</p>
            <p className="text-xl font-black text-slate-900">
              {totalLiters.toFixed(1)} <span className="text-sm font-bold text-emerald-600">L</span>
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 transition active:scale-98 ${
              saveSuccess 
                ? 'bg-blue-600 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>{t('savedSuccess')}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{t('saveToday')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <VoiceAssistantModal 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)}
        onApplyVoiceCommand={handleVoiceCommand}
      />
    </div>
  );
}
