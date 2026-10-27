import React, { useState } from 'react';
import { X, KeyRound, Eye, EyeOff, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { changePinApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'vendor' | 'customer';
  userId: number;
  userName?: string;
  onSuccess?: () => void;
}

export default function ChangePinModal({
  isOpen,
  onClose,
  role,
  userId,
  userName,
  onSuccess
}: ChangePinModalProps) {
  const { lang, t } = useLanguage();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleResetForm = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanNewPin = newPin.trim();
    const cleanConfirmPin = confirmPin.trim();

    if (!cleanNewPin || cleanNewPin.length < 4) {
      setErrorMsg(lang === 'hi' ? 'पिन कम से कम 4 अंकों का होना चाहिए' : 'PIN must be at least 4 digits');
      return;
    }

    if (cleanNewPin !== cleanConfirmPin) {
      setErrorMsg(lang === 'hi' ? 'नया पिन और कन्फर्म पिन मेल नहीं खा रहे' : 'New PIN and Confirm PIN do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await changePinApi({
        role,
        id: userId,
        current_pin: currentPin.trim() || undefined,
        new_pin: cleanNewPin
      });

      setSuccessMsg(res.message || (lang === 'hi' ? 'पिन सफलतापूर्वक बदल गया!' : 'PIN changed successfully!'));
      if (onSuccess) onSuccess();

      setTimeout(() => {
        handleResetForm();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || (lang === 'hi' ? 'पिन बदलने में त्रुटि आई' : 'Failed to update PIN'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl">
              <KeyRound className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-base">
                {lang === 'hi' ? 'सुरक्षा पिन बदलें' : 'Change Security PIN'}
              </h3>
              <p className="text-[11px] text-blue-100 font-medium">
                {userName ? `${userName} (${role === 'vendor' ? (lang === 'hi' ? 'दूधिया' : 'Vendor') : (lang === 'hi' ? 'ग्राहक' : 'Customer')})` : (lang === 'hi' ? 'नया 4-अंकीय पिन सेट करें' : 'Set your 4-digit secret PIN')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetForm}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-bold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Current PIN (Optional if resetting/already logged in) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {lang === 'hi' ? 'वर्तमान पिन (Current PIN - यदि याद हो)' : 'Current PIN (Optional)'}
            </label>
            <div className="relative">
              <input
                type={showPins ? "text" : "password"}
                maxLength={6}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                placeholder={lang === 'hi' ? "पुराना पिन दर्ज करें" : "Enter current PIN"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 tracking-wider focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* New PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {lang === 'hi' ? 'नया पिन (New 4-digit PIN) *' : 'New 4-digit PIN *'}
            </label>
            <div className="relative">
              <input
                type={showPins ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder={lang === 'hi' ? "उदा. 4 अंक दर्ज करें" : "Enter 4 digits"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 tracking-wider focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPins ? "Hide PIN" : "Show PIN"}
              >
                {showPins ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {lang === 'hi' ? 'नया पिन दोबारा डालें (Confirm PIN) *' : 'Confirm New PIN *'}
            </label>
            <div className="relative">
              <input
                type={showPins ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder={lang === 'hi' ? "पिन दोबारा दर्ज करें" : "Re-enter 4 digits"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 tracking-wider focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              {lang === 'hi' ? 'पिन केवल आपके मोबाइल नंबर के साथ ही काम करेगा।' : 'Your PIN is securely encrypted for login.'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition"
            >
              {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading || !newPin || !confirmPin}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'पिन सुरक्षित करें' : 'Save PIN'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
