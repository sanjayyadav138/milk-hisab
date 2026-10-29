import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, Modal, 
  TextInput, ActivityIndicator, Alert 
} from 'react-native';
import { parseVoiceCommandApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

interface VoiceAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyCommand: (parsed: {
    matched_customer_id: number | null;
    matched_customer_name: string | null;
    extracted_quantity: number | null;
    action: string;
    raw_text: string;
  }) => void;
}

export default function VoiceAssistantModal({ visible, onClose, onApplyCommand }: VoiceAssistantModalProps) {
  const { lang } = useLanguage();
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  const presets = [
    { text: lang === 'hi' ? 'राकेश को 2 लीटर दूध दर्ज करो' : 'Add 2 liters for Rakesh' },
    { text: lang === 'hi' ? 'शर्मा जी की आज छुट्टी दर्ज करो' : 'Mark skip for Sharma Ji' },
    { text: lang === 'hi' ? 'वर्मा जी को 3 लीटर दूध दिया' : 'Add 3 liters for Verma' },
    { text: lang === 'hi' ? 'गुप्ता जी को 1.5 लीटर दूध' : 'Add 1.5L for Gupta' },
  ];

  const handleProcess = async (textToProcess?: string) => {
    const text = textToProcess || transcript;
    if (!text.trim()) {
      Alert.alert(lang === 'hi' ? 'कमांड आवश्यक' : 'Command Required', lang === 'hi' ? 'कृपया कुछ बोलें या नीचे दिए उदाहरण पर टैप करें।' : 'Please speak or tap an example below.');
      return;
    }

    setLoading(true);
    try {
      const res = await parseVoiceCommandApi(text);
      setParsedResult(res);
    } catch (err: any) {
      Alert.alert('त्रुटि', err.message || 'कमांड समझ नहीं आई');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (parsedResult) {
      onApplyCommand(parsedResult);
      handleClose();
    }
  };

  const handleClose = () => {
    setTranscript('');
    setParsedResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.micCircle}>
              <Text style={styles.micEmoji}>🎙️</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {lang === 'hi' ? 'देसी वॉइस असिस्टेंट' : 'Voice Assistant'}
              </Text>
              <Text style={styles.subtitle}>
                {lang === 'hi' 
                  ? 'बोलिए और ऐप नाम व मात्रा समझकर तुरंत एंट्री कर देगा' 
                  : 'Speak naturally to record delivery or skip'}
              </Text>
            </View>
          </View>

          {/* Quick Presets */}
          <Text style={styles.presetLabel}>
            {lang === 'hi' ? '💡 तुरंत टैप करें (Quick Commands):' : '💡 Quick Commands (Tap to test):'}
          </Text>
          <View style={styles.presetsWrap}>
            {presets.map((p, idx) => (
              <TouchableOpacity 
                key={idx} 
                onPress={() => {
                  setTranscript(p.text);
                  handleProcess(p.text);
                }}
                style={styles.presetChip}
              >
                <Text style={styles.presetText}>"{p.text}"</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={lang === 'hi' ? 'उदा. राकेश को 2.5 लीटर दूध...' : 'e.g. Add 2.5L for Rakesh...'}
              placeholderTextColor="#94a3b8"
              value={transcript}
              onChangeText={setTranscript}
            />
            <TouchableOpacity 
              onPress={() => handleProcess()}
              disabled={loading}
              style={styles.processBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.processBtnText}>✓</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Parsed Result Card */}
          {parsedResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>
                ✓ {lang === 'hi' ? 'पहचाना गया हिसाब:' : 'Parsed Result:'}
              </Text>
              <Text style={styles.resultDetail}>
                • {lang === 'hi' ? 'ग्राहक:' : 'Customer:'} <Text style={styles.bold}>{parsedResult.matched_customer_name || 'पहचाना नहीं गया'}</Text>
              </Text>
              <Text style={styles.resultDetail}>
                • {lang === 'hi' ? 'मात्रा:' : 'Quantity:'} <Text style={styles.bold}>{parsedResult.extracted_quantity !== null ? `${parsedResult.extracted_quantity} Liters` : '0L (छुट्टी)'}</Text>
              </Text>
              <Text style={styles.resultDetail}>
                • {lang === 'hi' ? 'कार्रवाई:' : 'Action:'} <Text style={styles.bold}>{parsedResult.action === 'skip' ? 'छुट्टी (Skip)' : 'वितरण (Deliver)'}</Text>
              </Text>

              <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
                <Text style={styles.applyBtnText}>
                  {lang === 'hi' ? 'यह एंट्री लागू करें' : 'Apply This Entry'} →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel */}
          <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>
              {lang === 'hi' ? 'बंद करें (Close)' : 'Close'}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  micCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  micEmoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
  },
  presetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  presetChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  presetText: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  processBtn: {
    backgroundColor: '#10b981',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 4,
  },
  resultDetail: {
    fontSize: 12,
    color: '#064e3b',
    marginTop: 2,
  },
  bold: {
    fontWeight: '900',
    color: '#022c22',
  },
  applyBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
