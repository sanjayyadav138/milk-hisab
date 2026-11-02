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
  role?: 'vendor' | 'customer';
  onApplyCommand: (parsed: {
    matched_customer_id: number | null;
    matched_customer_name: string | null;
    extracted_quantity: number | null;
    action: string;
    raw_text: string;
  }) => void;
}

export default function VoiceAssistantModal({ visible, onClose, role = 'vendor', onApplyCommand }: VoiceAssistantModalProps) {
  const { lang } = useLanguage();
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  const isCustomer = role === 'customer';

  // Vendor Presets
  const vendorPresets = [
    { text: lang === 'hi' ? 'राकेश को 2 लीटर दूध दर्ज करो' : 'Add 2 liters for Rakesh' },
    { text: lang === 'hi' ? 'शर्मा जी की आज छुट्टी दर्ज करो' : 'Mark skip for Sharma Ji' },
    { text: lang === 'hi' ? 'वर्मा जी को 3 लीटर दूध दिया' : 'Add 3 liters for Verma' },
    { text: lang === 'hi' ? 'गुप्ता जी को 1.5 लीटर दूध' : 'Add 1.5L for Gupta' },
  ];

  // Customer-Only Presets
  const customerPresets = [
    { text: lang === 'hi' ? 'कल 1 लीटर अतिरिक्त दूध चाहिए' : 'Need 1L extra milk tomorrow' },
    { text: lang === 'hi' ? 'कल की छुट्टी दर्ज करो, दूध मत लाना' : 'Skip delivery tomorrow' },
    { text: lang === 'hi' ? 'मेरा इस महीने का कुल बिल बताओ' : 'Show my monthly bill & slip' },
    { text: lang === 'hi' ? 'दूधिए को संदेश: आज सुबह 7 बजे आना' : 'Message milkman: Come at 7 AM' },
  ];

  const presets = isCustomer ? customerPresets : vendorPresets;

  const handleProcess = async (textToProcess?: string) => {
    const text = textToProcess || transcript;
    if (!text.trim()) {
      Alert.alert(
        lang === 'hi' ? 'कमांड आवश्यक' : 'Command Required', 
        lang === 'hi' ? 'कृपया कुछ बोलें या नीचे दिए उदाहरण पर टैप करें।' : 'Please speak or tap an example below.'
      );
      return;
    }

    setLoading(true);
    try {
      if (isCustomer) {
        // Customer Natural Language Parsing
        const textLower = text.toLowerCase();
        let action = 'message';
        let actionLabel = lang === 'hi' ? 'दूधिए को संदेश (Send Message)' : 'Message Milkman';
        let quantity: number | null = null;
        let detailText = '';

        if (
          textLower.includes('chhutti') || 
          textLower.includes('छुट्टी') || 
          textLower.includes('skip') || 
          textLower.includes('off') || 
          textLower.includes('मत लाना') || 
          textLower.includes('band')
        ) {
          action = 'skip';
          actionLabel = lang === 'hi' ? 'छुट्टी दर्ज करें (Skip Delivery)' : 'Skip Delivery';
          detailText = lang === 'hi' ? 'कल की डिलीवरी रोकी जाएगी (Same-day सुरक्षित)' : 'Tomorrow delivery pause request';
        } else if (
          textLower.includes('bill') || 
          textLower.includes('बिल') || 
          textLower.includes('hisaab') || 
          textLower.includes('हिसाब') || 
          textLower.includes('slip') || 
          textLower.includes('पर्ची')
        ) {
          action = 'view_bill';
          actionLabel = lang === 'hi' ? 'मासिक पर्ची व बिल (View Monthly Slip)' : 'View Monthly Slip';
          detailText = lang === 'hi' ? 'अक्टूबर माह का सत्यापित बिल और पर्ची खोली जाएगी' : 'October verified monthly slip preview';
        } else if (
          textLower.includes('extra') || 
          textLower.includes('अतिरिक्त') || 
          textLower.includes('एक्स्ट्रा') || 
          textLower.includes('jyada') || 
          textLower.includes('add') || 
          textLower.includes('चाहिए')
        ) {
          action = 'extra_milk';
          actionLabel = lang === 'hi' ? 'अतिरिक्त दूध अनुरोध (Extra Milk Request)' : 'Extra Milk Request';
          const match = textLower.match(/(\d+(?:\.\d+)?)/);
          quantity = match ? parseFloat(match[1]) : 1.0;
          detailText = lang === 'hi' 
            ? `कल ${quantity}L अतिरिक्त दूध का अनुरोध दूधिए को भेजा जाएगा` 
            : `Request ${quantity}L extra milk for tomorrow`;
        } else if (
          textLower.includes('dispute') || 
          textLower.includes('शिकायत') || 
          textLower.includes('आपत्ति') || 
          textLower.includes('galat') || 
          textLower.includes('गलती')
        ) {
          action = 'dispute';
          actionLabel = lang === 'hi' ? 'आपत्ति दर्ज (Dispute Entry)' : 'Raise Dispute';
          detailText = lang === 'hi' ? 'गलत दूध मात्रा सुधार हेतु शिकायत केंद्र' : 'Report delivery discrepancy';
        } else {
          action = 'message';
          actionLabel = lang === 'hi' ? 'सीधा संदेश (Direct Chat)' : 'Send Message';
          detailText = `"${text}"`;
        }

        setParsedResult({
          matched_customer_id: null,
          matched_customer_name: null,
          extracted_quantity: quantity,
          action,
          actionLabel,
          detailText,
          raw_text: text,
        });
      } else {
        // Vendor Voice Command API
        const res = await parseVoiceCommandApi(text);
        setParsedResult(res);
      }
    } catch (err: any) {
      Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', err.message || (lang === 'hi' ? 'कमांड समझ नहीं आई' : 'Could not understand command'));
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
            <View style={[styles.micCircle, isCustomer && { backgroundColor: '#eff6ff', borderColor: '#2563eb' }]}>
              <Text style={styles.micEmoji}>🎙️</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {isCustomer 
                  ? (lang === 'hi' ? 'ग्राहक वॉइस असिस्टेंट' : 'Customer Voice Assistant')
                  : (lang === 'hi' ? 'देसी वॉइस असिस्टेंट (दूधिया)' : 'Vendor Voice Assistant')}
              </Text>
              <Text style={styles.subtitle}>
                {isCustomer
                  ? (lang === 'hi' 
                      ? 'बोलिए और ऐप आपके दूधिए को छुट्टी, अतिरिक्त दूध या पर्ची तुरंत दिखा देगा' 
                      : 'Speak naturally to request extra milk, pause delivery, or view bill')
                  : (lang === 'hi' 
                      ? 'बोलिए और ऐप ग्राहक का नाम व मात्रा समझकर तुरंत एंट्री कर देगा' 
                      : 'Speak naturally to record customer delivery or skip')}
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
                style={[styles.presetChip, isCustomer && styles.customerPresetChip]}
                activeOpacity={0.8}
              >
                <Text style={[styles.presetText, isCustomer && styles.customerPresetText]}>"{p.text}"</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={isCustomer 
                ? (lang === 'hi' ? 'उदा. कल 1L एक्स्ट्रा दूध चाहिए या कल की छुट्टी...' : 'e.g. Need 1L extra milk tomorrow or skip...')
                : (lang === 'hi' ? 'उदा. राकेश को 2.5 लीटर दूध...' : 'e.g. Add 2.5L for Rakesh...')}
              placeholderTextColor="#94a3b8"
              value={transcript}
              onChangeText={setTranscript}
            />
            <TouchableOpacity 
              onPress={() => handleProcess()}
              disabled={loading}
              style={[styles.processBtn, isCustomer && { backgroundColor: '#1E3A8A' }]}
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
            <View style={[styles.resultCard, isCustomer && styles.customerResultCard]}>
              <Text style={[styles.resultTitle, isCustomer && styles.customerResultTitle]}>
                ✓ {lang === 'hi' ? 'पहचाना गया अनुरोध:' : 'Parsed Request:'}
              </Text>

              {isCustomer ? (
                <View>
                  <Text style={styles.resultDetail}>
                    • {lang === 'hi' ? 'कार्रवाई:' : 'Action:'} <Text style={styles.bold}>{parsedResult.actionLabel || parsedResult.action}</Text>
                  </Text>
                  {parsedResult.extracted_quantity !== null && parsedResult.extracted_quantity !== undefined && (
                    <Text style={styles.resultDetail}>
                      • {lang === 'hi' ? 'मात्रा:' : 'Quantity:'} <Text style={styles.bold}>{parsedResult.extracted_quantity} Liters</Text>
                    </Text>
                  )}
                  {parsedResult.detailText ? (
                    <Text style={styles.resultDetail}>
                      • {lang === 'hi' ? 'विवरण:' : 'Details:'} <Text style={styles.bold}>{parsedResult.detailText}</Text>
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View>
                  <Text style={styles.resultDetail}>
                    • {lang === 'hi' ? 'ग्राहक:' : 'Customer:'} <Text style={styles.bold}>{parsedResult.matched_customer_name || 'पहचाना नहीं गया'}</Text>
                  </Text>
                  <Text style={styles.resultDetail}>
                    • {lang === 'hi' ? 'मात्रा:' : 'Quantity:'} <Text style={styles.bold}>{parsedResult.extracted_quantity !== null ? `${parsedResult.extracted_quantity} Liters` : '0L (छुट्टी)'}</Text>
                  </Text>
                  <Text style={styles.resultDetail}>
                    • {lang === 'hi' ? 'कार्रवाई:' : 'Action:'} <Text style={styles.bold}>{parsedResult.action === 'skip' ? 'छुट्टी (Skip)' : 'वितरण (Deliver)'}</Text>
                  </Text>
                </View>
              )}

              <TouchableOpacity 
                onPress={handleApply} 
                style={[styles.applyBtn, isCustomer && { backgroundColor: '#1E3A8A' }]}
                activeOpacity={0.85}
              >
                <Text style={styles.applyBtnText}>
                  {lang === 'hi' ? 'यह अनुरोध लागू करें' : 'Apply This Request'} →
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
  customerPresetChip: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  customerPresetText: {
    color: '#1e3a8a',
  },
  customerResultCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  customerResultTitle: {
    color: '#1e3a8a',
  },
});
