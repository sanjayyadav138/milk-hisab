import React, { useState, useEffect } from 'react';
import { Mic, Send, X, Sparkles, Check } from 'lucide-react';
import { parseVoiceText } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoiceCommand: (parsed: {
    matched_customer_id: number | null;
    matched_customer_name: string | null;
    extracted_quantity: number | null;
    action: string;
    raw_text: string;
  }) => void;
}

export default function VoiceAssistantModal({ isOpen, onClose, onApplyVoiceCommand }: VoiceAssistantModalProps) {
  const { t, lang } = useLanguage();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setParsedResult(null);
      setErrorMsg('');
      setIsListening(false);
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("आपके ब्राउज़र में आवाज़ पहचान (Voice) सुविधा सीधे उपलब्ध नहीं है, कृपया नीचे टाइप करें।");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Default to Hindi/Indian context
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        handleProcessVoice(text);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg("माइक की अनुमति नहीं मिली (Microphone permission denied)");
        } else {
          setErrorMsg("आवाज़ नहीं सुनी जा सकी। कृपया पुनः प्रयास करें या टाइप करें।");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setErrorMsg("माइक शुरू करने में समस्या आई");
      setIsListening(false);
    }
  };

  const handleProcessVoice = async (textToProcess?: string) => {
    const query = textToProcess || transcript;
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await parseVoiceText(query);
      setParsedResult(res);
    } catch (err: any) {
      setErrorMsg("आवाज़ समझने में त्रुटि आई: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyChanges = () => {
    if (parsedResult) {
      onApplyVoiceCommand(parsedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </span>
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">
                {lang === 'hi' ? 'बोलकर एंट्री करें (Voice Assistant)' : 'Voice Assistant Logging'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'hi' ? 'हिंदी या हिंगलिश में बोलें' : 'Speak naturally in Hindi or English'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mic Visualizer */}
        <div className="my-6 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={startListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-100' 
                : 'bg-blue-600 text-white hover:bg-blue-700 ring-4 ring-blue-50'
            }`}
          >
            <Mic className="w-9 h-9" />
          </button>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            {isListening 
              ? (lang === 'hi' ? "सुन रहे हैं... बोलिए!" : "Listening... speak now!") 
              : (lang === 'hi' ? "माइक दबाकर बोलें" : "Tap mic and speak")}
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-50"
                  onClick={() => { setTranscript("Rakesh ko 2 liter doodh add kar do"); handleProcessVoice("Rakesh ko 2 liter doodh add kar do"); }}>
              "Rakesh ko 2L add kar do"
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-50"
                  onClick={() => { setTranscript("Sharma ji ka aaj skip kar do"); handleProcessVoice("Sharma ji ka aaj skip kar do"); }}>
              "Sharma ji ka skip kar do"
            </span>
          </div>
        </div>

        {/* Text Input / Transcript Preview */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={lang === 'hi' ? "या यहाँ लिखें, जैसे: 'Dr. Sahib 2 liter'" : "Or type here, e.g. 'Dr. Sahib 2 liter'"}
              className="flex-1 px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-medium"
            />
            <button
              onClick={() => handleProcessVoice()}
              disabled={loading || !transcript.trim()}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {errorMsg && (
            <p className="text-xs text-rose-600 mt-2 font-medium">{errorMsg}</p>
          )}
        </div>

        {/* Parsed Result Box */}
        {parsedResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1">
              <Check className="w-4 h-4 text-blue-600" />
              {lang === 'hi' ? 'पहचाना गया (Detected Action)' : 'Detected Action'}
            </h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">{lang === 'hi' ? 'ग्राहक (Customer):' : 'Customer:'}</span>
                <span className="font-bold text-slate-900">
                  {parsedResult.matched_customer_name || (lang === 'hi' ? "पहचाना नहीं गया" : "Not recognized")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{lang === 'hi' ? 'मात्रा (Quantity):' : 'Quantity:'}</span>
                <span className="font-bold text-blue-700">
                  {parsedResult.extracted_quantity !== null 
                    ? `${parsedResult.extracted_quantity} ${lang === 'hi' ? 'लीटर' : 'L'}` 
                    : (lang === 'hi' ? "अज्ञात" : "Unknown")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{lang === 'hi' ? 'कार्य (Action):' : 'Action:'}</span>
                <span className="font-semibold text-slate-800">
                  {parsedResult.action === "skip" 
                    ? (lang === 'hi' ? "छुट्टी / Skip (0L)" : "Skip (0L)") 
                    : parsedResult.action === "add" 
                    ? (lang === 'hi' ? "अतिरिक्त जोड़ें (+Extra)" : "Add Extra (+Extra)") 
                    : (lang === 'hi' ? "सेट करें (Set)" : "Set Quantity")}
                </span>
              </div>
            </div>

            {parsedResult.matched_customer_id ? (
              <button
                onClick={applyChanges}
                className="w-full mt-3 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {lang === 'hi' ? 'यह एंट्री लागू करें (Apply to Checklist)' : 'Apply to Checklist'}
              </button>
            ) : (
              <p className="text-xs text-amber-700 mt-2">
                {lang === 'hi' ? 'ग्राहक का नाम लिस्ट से मैच नहीं हुआ। कृपया ग्राहक का नाम सही से बोलें।' : 'Customer name did not match. Please speak clearly.'}
              </p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
        >
          {lang === 'hi' ? 'बंद करें (Cancel)' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
