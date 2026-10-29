import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, Image 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface LoginScreenProps {
  initialRole?: 'vendor' | 'customer';
  onBack: () => void;
  onGoRegister: (role: 'vendor' | 'customer') => void;
}

export default function LoginScreen({ initialRole = 'vendor', onBack, onGoRegister }: LoginScreenProps) {
  const { login, sendOtp, verifyOtp, loading } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  
  const [role, setRole] = useState<'vendor' | 'customer'>(initialRole);
  const [phone, setPhone] = useState('');
  const [authMethod, setAuthMethod] = useState<'OTP' | 'PIN'>('OTP');
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('1234');

  // Send OTP
  const handleSendOtp = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 4 && cleanPhone !== '1234') {
      Alert.alert(
        lang === 'hi' ? 'मान्य नंबर दर्ज करें' : 'Invalid Mobile',
        lang === 'hi' ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    try {
      const res = await sendOtp(cleanPhone, role);
      setOtpSent(true);
      Alert.alert(
        lang === 'hi' ? 'ओटीपी भेजा गया' : 'OTP Dispatched',
        lang === 'hi' ? `ओटीपी कोड: ${res.otp_preview || '1234'}` : `Your verification code: ${res.otp_preview || '1234'}`
      );
    } catch (err: any) {
      Alert.alert(
        lang === 'hi' ? 'ओटीपी विफल' : 'OTP Error',
        err.message || (lang === 'hi' ? 'ओटीपी नहीं भेजा जा सका' : 'Failed to send OTP')
      );
    }
  };

  // Verify OTP & Login
  const handleVerifyOtp = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanOtp = otp.trim() || '1234';

    try {
      await verifyOtp(cleanPhone, cleanOtp, role);
    } catch (err: any) {
      Alert.alert(
        lang === 'hi' ? 'सत्यापन विफल' : 'Verification Failed',
        err.message || (lang === 'hi' ? 'गलत ओटीपी! कृपया 1234 दर्ज करें।' : 'Invalid OTP. Please enter 1234.')
      );
    }
  };

  // PIN Login fallback
  const handlePinLogin = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      Alert.alert(lang === 'hi' ? 'मोबाइल नंबर आवश्यक' : 'Mobile Required', t('enterPhone'));
      return;
    }

    try {
      await login(cleanPhone, role, pin.trim() || '1234');
    } catch (err: any) {
      Alert.alert(
        lang === 'hi' ? 'लॉगिन विफल' : 'Login Failed',
        err.message || (lang === 'hi' ? 'कृपया सही मोबाइल या पिन दर्ज करें' : 'Invalid credentials. Please verify your phone or PIN.')
      );
    }
  };

  const handleFillDemo = () => {
    setPhone('9876543210');
    setOtp('1234');
    setPin('1234');
    setOtpSent(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Top Bar with Back, Demo Fill, and Language Toggle */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
              <Text style={styles.backBtnText}>← {lang === 'hi' ? 'वापस' : 'Back'}</Text>
            </TouchableOpacity>

            <View style={styles.topBarRight}>
              <TouchableOpacity onPress={handleFillDemo} style={styles.demoPill} activeOpacity={0.8}>
                <Text style={styles.demoPillText}>⚡ {lang === 'hi' ? 'डेमो' : 'Demo 1234'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleLang} style={styles.langPill} activeOpacity={0.8}>
                <Text style={styles.langPillText}>
                  🌐 {lang === 'hi' ? 'English' : 'हिन्दी'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Centered Brand Header with Logo (No White Box) */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.brandLogoImg} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>
              {lang === 'hi' ? 'खाते में लॉगिन करें' : 'Sign In to Milk Hisab'}
            </Text>
            <Text style={styles.subtitle}>
              {lang === 'hi' 
                ? 'दैनिक दूध हिसाब व बहीखाता एक्सेस करें' 
                : 'Access daily delivery ledgers & transparent billing'}
            </Text>
          </View>

          {/* Clean Milk Banner Card Aesthetic */}
          <View style={styles.card}>
            {/* Role Switcher Tabs */}
            <View style={styles.roleTabs}>
              <TouchableOpacity
                onPress={() => {
                  setRole('vendor');
                  setOtpSent(false);
                }}
                style={[styles.roleTab, role === 'vendor' && styles.roleTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleTabText, role === 'vendor' && styles.roleTabTextActive]}>
                  🥛 {lang === 'hi' ? 'दूधिया / डेयरी' : 'Milkman / Vendor'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setRole('customer');
                  setOtpSent(false);
                }}
                style={[styles.roleTab, role === 'customer' && styles.roleTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleTabText, role === 'customer' && styles.roleTabTextActive]}>
                  🏠 {lang === 'hi' ? 'ग्राहक' : 'Customer'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mobile Number Input with +91 Country Prefix */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {lang === 'hi' ? 'मोबाइल नंबर (Mobile Number)' : 'Mobile Number'}
              </Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryPrefixBox}>
                  <Text style={styles.countryFlag}>🇮🇳</Text>
                  <Text style={styles.countryPrefixText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder={lang === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(val) => {
                    setPhone(val);
                    if (otpSent) setOtpSent(false);
                  }}
                  editable={!loading}
                />
              </View>
            </View>

            {/* AUTH METHOD TOGGLE: OTP vs PIN */}
            <View style={styles.authMethodToggle}>
              <TouchableOpacity 
                onPress={() => setAuthMethod('OTP')}
                style={[styles.authMethodBtn, authMethod === 'OTP' && styles.authMethodBtnActive]}
              >
                <Text style={[styles.authMethodBtnText, authMethod === 'OTP' && styles.authMethodBtnTextActive]}>
                  📲 {lang === 'hi' ? 'ओटीपी सत्यापन (OTP)' : 'OTP Verification'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setAuthMethod('PIN')}
                style={[styles.authMethodBtn, authMethod === 'PIN' && styles.authMethodBtnActive]}
              >
                <Text style={[styles.authMethodBtnText, authMethod === 'PIN' && styles.authMethodBtnTextActive]}>
                  🔑 {lang === 'hi' ? 'पिन पासवर्ड (PIN)' : 'PIN Password'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* OTP FLOW */}
            {authMethod === 'OTP' && (
              <View style={styles.otpSection}>
                {!otpSent ? (
                  /* Step 1: Send OTP Button (Dairy Blue) */
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={loading}
                    style={styles.primaryDairyBlueBtn}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryDairyBlueBtnText}>
                        📲 {lang === 'hi' ? 'ओटीपी प्राप्त करें (Send OTP)' : 'Send OTP'}
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  /* Step 2: 4-digit OTP Input & Verification */
                  <View style={styles.otpVerifyWrap}>
                    <View style={styles.otpNoticeBox}>
                      <Text style={styles.otpNoticeText}>
                        ✓ {lang === 'hi' ? `+91 ${phone} पर ओटीपी भेजा गया (डेमो कोड: 1234)` : `OTP sent to +91 ${phone} (Demo code: 1234)`}
                      </Text>
                    </View>

                    <Text style={styles.inputLabel}>
                      {lang === 'hi' ? '4 अंकों का ओटीपी दर्ज करें' : 'Enter 4-Digit OTP'}
                    </Text>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="1234"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={4}
                      value={otp}
                      onChangeText={setOtp}
                      editable={!loading}
                    />

                    <View style={styles.resendRow}>
                      <TouchableOpacity onPress={handleSendOtp} disabled={loading}>
                        <Text style={styles.resendLinkText}>
                          ↻ {lang === 'hi' ? 'ओटीपी पुनः भेजें' : 'Resend OTP'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => setOtp('1234')}>
                        <Text style={styles.autoFillLinkText}>
                          ⚡ {lang === 'hi' ? '1234 भरें' : 'Fill 1234'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Verify & Sign In Button (Dairy Blue) */}
                    <TouchableOpacity
                      onPress={handleVerifyOtp}
                      disabled={loading}
                      style={styles.primaryDairyBlueBtn}
                      activeOpacity={0.85}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryDairyBlueBtnText}>
                          ✓ {lang === 'hi' ? 'ओटीपी सत्यापित कर लॉगिन करें' : 'Verify OTP & Sign In'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* PIN FLOW */}
            {authMethod === 'PIN' && (
              <View style={styles.pinSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {lang === 'hi' ? 'पिन / पासवर्ड (PIN Password)' : 'PIN / Password'}
                  </Text>
                  <TextInput
                    style={styles.pinInput}
                    placeholder="1234"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    keyboardType="number-pad"
                    value={pin}
                    onChangeText={setPin}
                    editable={!loading}
                  />
                </View>

                {/* Sign In Button (Dairy Blue) */}
                <TouchableOpacity
                  onPress={handlePinLogin}
                  disabled={loading}
                  style={styles.primaryDairyBlueBtn}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryDairyBlueBtnText}>
                      {lang === 'hi' ? 'पिन से लॉगिन करें' : 'Sign In with PIN'} →
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Switch to Registration */}
            <View style={styles.footerWrap}>
              <Text style={styles.footerPrompt}>
                {lang === 'hi' ? 'नया खाता बनाना चाहते हैं?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={() => onGoRegister(role)} activeOpacity={0.8}>
                <Text style={styles.registerLink}>
                  {lang === 'hi' ? 'निशुल्क रजिस्टर करें (Register Free)' : 'Create Free Account'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Soft Milky Cream Background
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoPillText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  langPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langPillText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  brandLogoImg: {
    width: 175,
    height: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A', // High contrast outdoor dark text
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 17,
  },
  card: {
    backgroundColor: '#FFFFFF', // Pure White card
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: '#2563EB', // Dairy Blue
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  countryPrefixBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    gap: 4,
  },
  countryFlag: {
    fontSize: 16,
  },
  countryPrefixText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  authMethodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  authMethodBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: 'center',
  },
  authMethodBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  authMethodBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  authMethodBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  otpSection: {
    marginTop: 4,
  },
  otpVerifyWrap: {
    gap: 12,
  },
  otpNoticeBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    padding: 10,
    borderRadius: 8,
  },
  otpNoticeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -4,
    marginBottom: 8,
  },
  resendLinkText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  autoFillLinkText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
  pinSection: {
    gap: 12,
  },
  pinInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  primaryDairyBlueBtn: {
    backgroundColor: '#2563EB', // Deep Dairy Blue (Strictly NO RED BUTTONS)
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryDairyBlueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerWrap: {
    marginTop: 22,
    alignItems: 'center',
    gap: 4,
  },
  footerPrompt: {
    fontSize: 12,
    color: '#64748B',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
});
