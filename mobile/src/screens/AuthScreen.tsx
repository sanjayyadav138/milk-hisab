import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Dimensions 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

interface AuthScreenProps {
  initialRole?: 'vendor' | 'customer';
  initialMode?: 'LOGIN' | 'REGISTER';
  onSuccess?: () => void;
}

export default function AuthScreen({ 
  initialRole = 'vendor', 
  initialMode = 'LOGIN', 
  onSuccess 
}: AuthScreenProps) {
  const { login, sendOtp, verifyOtp, registerVendor, registerCustomer, loading } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [role, setRole] = useState<'vendor' | 'customer'>(initialRole);
  
  // Login State
  const [phone, setPhone] = useState('');
  const [authMethod, setAuthMethod] = useState<'OTP' | 'PIN'>('OTP');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('1234');

  // Registration State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [defaultQty, setDefaultQty] = useState('1.5');
  const [milkType, setMilkType] = useState('Cow');
  const [pricePerLiter, setPricePerLiter] = useState('60');

  // Handle Send OTP
  const handleSendOtp = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 4 && cleanPhone !== '1234') {
      Alert.alert(
        lang === 'hi' ? 'मान्य नंबर दर्ज करें' : 'Invalid Number',
        lang === 'hi' ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    try {
      const res = await sendOtp(cleanPhone, role);
      setOtpSent(true);
      Alert.alert(
        lang === 'hi' ? 'ओटीपी भेजा गया' : 'OTP Dispatched',
        lang === 'hi' ? `ओटीपी कोड: ${res.otp_preview || '1234'}` : `Verification code: ${res.otp_preview || '1234'}`
      );
    } catch (err: any) {
      Alert.alert(
        lang === 'hi' ? 'ओटीपी विफल' : 'OTP Error',
        err.message || (lang === 'hi' ? 'ओटीपी नहीं भेजा जा सका' : 'Failed to send OTP')
      );
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanOtp = otp.trim() || '1234';

    try {
      await verifyOtp(cleanPhone, cleanOtp, role);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      Alert.alert(
        lang === 'hi' ? 'सत्यापन विफल' : 'Verification Failed',
        err.message || (lang === 'hi' ? 'गलत ओटीपी! कृपया 1234 दर्ज करें।' : 'Invalid OTP. Please enter 1234.')
      );
    }
  };

  // Handle PIN Login
  const handlePinLogin = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      Alert.alert(lang === 'hi' ? 'मोबाइल नंबर आवश्यक' : 'Mobile Required', t('enterPhone'));
      return;
    }

    try {
      await login(cleanPhone, role, pin.trim() || '1234');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      Alert.alert(
        lang === 'hi' ? 'लॉगिन विफल' : 'Login Failed',
        err.message || (lang === 'hi' ? 'कृपया सही मोबाइल या पिन दर्ज करें' : 'Invalid credentials. Please verify your phone or PIN.')
      );
    }
  };

  // Handle Registration
  const handleRegister = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!name.trim()) {
      Alert.alert(lang === 'hi' ? 'नाम आवश्यक' : 'Name Required', lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your name.');
      return;
    }
    if (cleanPhone.length < 4 && cleanPhone !== '1234') {
      Alert.alert(lang === 'hi' ? 'मोबाइल आवश्यक' : 'Mobile Required', lang === 'hi' ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid mobile number.');
      return;
    }

    try {
      if (role === 'vendor') {
        await registerVendor({
          name: name.trim(),
          phone: cleanPhone,
          business_name: businessName.trim() || 'श्री कृष्णा डेयरी फार्म',
          pin: pin.trim() || '1234',
        });
      } else {
        await registerCustomer({
          name: name.trim(),
          phone: cleanPhone,
          address: address.trim() || 'मकान नं. 12, मेन रोड',
          default_quantity: parseFloat(defaultQty) || 1.0,
          milk_type: milkType,
          price_per_liter: parseFloat(pricePerLiter) || 60.0,
          pin: pin.trim() || '1234',
        });
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      Alert.alert(lang === 'hi' ? 'रजिस्ट्रेशन विफल' : 'Registration Failed', err.message);
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
        {/* ========================================================
            SUBTLE MILK SPLASH WATERMARK OVERLAYS (BLEEDING EDGES)
            ======================================================== */}
        <Image 
          source={require('../../assets/media/milk-image.png')} 
          style={styles.watermarkTopRight} 
          resizeMode="contain" 
        />
        <Image 
          source={require('../../assets/media/milk-image2.png')} 
          style={styles.watermarkBottomLeft} 
          resizeMode="contain" 
        />

        {/* TOP BAR: Demo Shortcut + 1-Tap Language Toggle */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleFillDemo} style={styles.demoPill} activeOpacity={0.8}>
            <Text style={styles.demoPillText}>⚡ {lang === 'hi' ? 'त्वरित डेमो 1234' : 'Demo 1234'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleLang} style={styles.langPill} activeOpacity={0.8}>
            <Text style={styles.langPillText}>
              🌐 {lang === 'hi' ? 'English' : 'हिन्दी'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* ========================================================
              CENTERED AUTH CARD: Clean White Rounded Card with Shadow
              ======================================================== */}
          <View style={styles.authCard}>
            
            {/* Inside Card Header: Horizontal Milk Hisab Logo with Tagline */}
            <View style={styles.cardHeader}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.brandLogoHorizontal} 
                resizeMode="contain" 
              />
              <Text style={styles.cardTitle}>
                {authMode === 'LOGIN' 
                  ? (lang === 'hi' ? 'खाते में लॉगिन करें' : 'Sign In to Account')
                  : (lang === 'hi' ? 'नया डिजिटल खाता बनाएं' : 'Create Free Account')}
              </Text>
              <Text style={styles.cardSubtitle}>
                {lang === 'hi' 
                  ? 'दैनिक दूध बहीखाता व पारदर्शी बिलिंग' 
                  : 'Daily milk ledger & zero-dispute billing'}
              </Text>
            </View>

            {/* Auth Mode Toggle: Sign In vs Register */}
            <View style={styles.modeTabs}>
              <TouchableOpacity
                onPress={() => {
                  setAuthMode('LOGIN');
                  setOtpSent(false);
                }}
                style={[styles.modeTab, authMode === 'LOGIN' && styles.modeTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, authMode === 'LOGIN' && styles.modeTabTextActive]}>
                  {lang === 'hi' ? 'लॉगिन (Sign In)' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setAuthMode('REGISTER');
                  setOtpSent(false);
                }}
                style={[styles.modeTab, authMode === 'REGISTER' && styles.modeTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, authMode === 'REGISTER' && styles.modeTabTextActive]}>
                  {lang === 'hi' ? 'नया खाता (Register)' : 'New Account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Role Switcher: Milkman/Vendor vs Customer */}
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

            {/* Extra Registration Fields */}
            {authMode === 'REGISTER' && (
              <View style={styles.registerFieldsWrap}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{lang === 'hi' ? 'आपका पूरा नाम' : 'Full Name'}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={lang === 'hi' ? 'उदा. संजय यादव' : 'e.g. Sanjay Yadav'}
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {role === 'vendor' ? (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{lang === 'hi' ? 'डेयरी / फार्म का नाम' : 'Dairy / Farm Name'}</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={lang === 'hi' ? 'उदा. श्री कृष्णा डेयरी फार्म' : 'e.g. Krishna Dairy Farm'}
                      placeholderTextColor="#94A3B8"
                      value={businessName}
                      onChangeText={setBusinessName}
                    />
                  </View>
                ) : (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{lang === 'hi' ? 'घर का पता / मकान नं.' : 'Home Address'}</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={lang === 'hi' ? 'मकान नं., गली, सेक्टर' : 'House No., Sector'}
                        placeholderTextColor="#94A3B8"
                        value={address}
                        onChangeText={setAddress}
                      />
                    </View>
                    <View style={styles.twoColRow}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>{lang === 'hi' ? 'दैनिक दूध (L)' : 'Daily Milk (L)'}</Text>
                        <TextInput
                          style={styles.textInput}
                          keyboardType="decimal-pad"
                          value={defaultQty}
                          onChangeText={setDefaultQty}
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>{lang === 'hi' ? 'रेट (₹/L)' : 'Rate (₹/L)'}</Text>
                        <TextInput
                          style={styles.textInput}
                          keyboardType="decimal-pad"
                          value={pricePerLiter}
                          onChangeText={setPricePerLiter}
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Mobile Number Input with Locked (+91 ) Prefix */}
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

            {/* LOGIN FLOW (OTP vs PIN) */}
            {authMode === 'LOGIN' && (
              <>
                {/* Method Switch: OTP vs PIN */}
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

                {authMethod === 'OTP' ? (
                  !otpSent ? (
                    /* Step 1: Send OTP Button (Strictly Deep Dairy Blue #1E3A8A) */
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

                      {/* Verify Button (Strictly Deep Dairy Blue #1E3A8A) */}
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
                  )
                ) : (
                  /* PIN Flow */
                  <View style={styles.pinWrap}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {lang === 'hi' ? 'पिन / पासवर्ड (PIN Password)' : 'PIN / Password'}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="1234"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry
                        keyboardType="number-pad"
                        value={pin}
                        onChangeText={setPin}
                      />
                    </View>

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
              </>
            )}

            {/* REGISTER SUBMIT BUTTON (Strictly Deep Dairy Blue #1E3A8A) */}
            {authMode === 'REGISTER' && (
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                style={styles.primaryDairyBlueBtn}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryDairyBlueBtnText}>
                    + {lang === 'hi' ? 'नया खाता सुरक्षित बनाएं' : 'Create Free Account'}
                  </Text>
                )}
              </TouchableOpacity>
            )}

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
    position: 'relative',
  },
  container: {
    flex: 1,
  },
  // SUBTLE WATERMARK OVERLAYS BLEEDING OFF EDGES
  watermarkTopRight: {
    position: 'absolute',
    top: -40,
    right: -50,
    width: 220,
    height: 220,
    opacity: 0.18,
    pointerEvents: 'none',
  },
  watermarkBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 240,
    height: 240,
    opacity: 0.18,
    pointerEvents: 'none',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    marginBottom: 10,
    zIndex: 10,
  },
  demoPill: {
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  demoPillText: {
    color: '#1E3A8A', // Deep Dairy Blue
    fontSize: 12,
    fontWeight: '800',
  },
  langPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langPillText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    alignItems: 'center',
  },
  // CENTERED WHITE AUTH CARD
  authCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginTop: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogoHorizontal: {
    width: 180,
    height: 50,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A', // High-contrast Deep Navy Slate
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  // MODE TABS (SIGN IN VS REGISTER)
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#1E3A8A', // Deep Dairy Blue
    fontWeight: '900',
  },
  // ROLE TABS (VENDOR VS CUSTOMER)
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 7,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: '#1E3A8A', // Deep Dairy Blue
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
  // INPUT FIELDS
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 10,
  },
  registerFieldsWrap: {
    marginBottom: 4,
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
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  authMethodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 2,
    marginBottom: 14,
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
    color: '#1E3A8A',
    fontWeight: '800',
  },
  // OTP SECTION
  otpVerifyWrap: {
    gap: 10,
  },
  otpNoticeBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    padding: 9,
    borderRadius: 8,
  },
  otpNoticeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 12,
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
    marginBottom: 4,
  },
  resendLinkText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '700',
  },
  autoFillLinkText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
  pinWrap: {
    gap: 10,
  },
  // PRIMARY CTA BUTTONS (STRICTLY DEEP DAIRY BLUE #1E3A8A)
  primaryDairyBlueBtn: {
    backgroundColor: '#1E3A8A', // Deep Dairy Blue (Strictly NO RED BUTTONS)
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryDairyBlueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
