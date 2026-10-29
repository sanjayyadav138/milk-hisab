import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, Image 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface RegisterScreenProps {
  initialRole?: 'vendor' | 'customer';
  onBack: () => void;
  onGoLogin: (role: 'vendor' | 'customer') => void;
}

export default function RegisterScreen({ initialRole = 'vendor', onBack, onGoLogin }: RegisterScreenProps) {
  const { registerVendor, registerCustomer, loading } = useAuth();
  const { lang, toggleLang } = useLanguage();
  
  const [role, setRole] = useState<'vendor' | 'customer'>(initialRole);

  // Vendor Fields
  const [vendorName, setVendorName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorUpi, setVendorUpi] = useState('');
  const [vendorPin, setVendorPin] = useState('1234');

  // Customer Fields
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custQty, setCustQty] = useState('1.0');
  const [custMilkType, setCustMilkType] = useState('Cow');
  const [custRate, setCustRate] = useState('60');
  const [custPin, setCustPin] = useState('1234');

  const handleRegister = async () => {
    try {
      if (role === 'vendor') {
        if (!vendorName.trim()) {
          Alert.alert(lang === 'hi' ? 'नाम आवश्यक' : 'Name Required', lang === 'hi' ? 'कृपया अपना पूरा नाम लिखें' : 'Please enter your full name');
          return;
        }
        if (!vendorPhone.trim() || vendorPhone.trim().length < 10) {
          Alert.alert(lang === 'hi' ? 'मोबाइल आवश्यक' : 'Mobile Required', lang === 'hi' ? '10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
          return;
        }

        await registerVendor({
          name: vendorName.trim(),
          business_name: businessName.trim() || `${vendorName.trim()} Dairy`,
          phone: vendorPhone.trim(),
          upi_id: vendorUpi.trim() || undefined,
          pin: vendorPin.trim() || '1234',
        });
      } else {
        if (!custName.trim()) {
          Alert.alert(lang === 'hi' ? 'नाम आवश्यक' : 'Name Required', lang === 'hi' ? 'कृपया अपना नाम लिखें' : 'Please enter your name');
          return;
        }
        if (!custPhone.trim() || custPhone.trim().length < 10) {
          Alert.alert(lang === 'hi' ? 'मोबाइल आवश्यक' : 'Mobile Required', lang === 'hi' ? '10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
          return;
        }

        await registerCustomer({
          name: custName.trim(),
          phone: custPhone.trim(),
          address: custAddress.trim() || 'स्थानीय पता',
          default_quantity: parseFloat(custQty) || 1.0,
          milk_type: custMilkType,
          price_per_liter: parseFloat(custRate) || 60.0,
          pin: custPin.trim() || '1234',
        });
      }

      Alert.alert(lang === 'hi' ? 'सफल!' : 'Success!', lang === 'hi' ? 'खाता सफलतापूर्वक बन गया है! आप स्वतः लॉगिन हो गए हैं।' : 'Account registered successfully! You are now logged in.');
    } catch (err: any) {
      Alert.alert(lang === 'hi' ? 'रजिस्ट्रेशन विफल' : 'Registration Failed', err.message || (lang === 'hi' ? 'कृपया पुनः प्रयास करें' : 'Please try again.'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Top Bar with Back and Language Switcher */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backBtnText}>‹ {lang === 'hi' ? 'वापस' : 'Back'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleLang} style={styles.langPill} activeOpacity={0.8}>
              <Text style={styles.langPillText}>
                🌐 {lang === 'hi' ? 'English' : 'हिन्दी'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Centered Brand Header with Logo */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.brandLogoImg} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>
              {lang === 'hi' ? 'नया खाता बनाएं' : 'Create Free Account'}
            </Text>
            <Text style={styles.subtitle}>
              {lang === 'hi' 
                ? 'डिजिटल बहीखाता शुरू करने हेतु विवरण दर्ज करें' 
                : 'Start your digital milk ledger in seconds'}
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Role Switcher Tabs */}
            <View style={styles.roleTabs}>
              <TouchableOpacity
                onPress={() => setRole('vendor')}
                style={[styles.roleTab, role === 'vendor' && styles.roleTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleTabText, role === 'vendor' && styles.roleTabTextActive]}>
                  🥛 {lang === 'hi' ? 'दूधिया / डेयरी' : 'Dairy Vendor'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole('customer')}
                style={[styles.roleTab, role === 'customer' && styles.roleTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleTabText, role === 'customer' && styles.roleTabTextActive]}>
                  🏠 {lang === 'hi' ? 'ग्राहक' : 'Customer'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Vendor Form */}
            {role === 'vendor' ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? 'आपका पूरा नाम' : 'Full Name'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={lang === 'hi' ? 'उदा. संजय यादव' : 'e.g. Sanjay Yadav'}
                    placeholderTextColor="#94a3b8"
                    value={vendorName}
                    onChangeText={setVendorName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? 'डेयरी / फार्म का नाम' : 'Dairy / Farm Name'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={lang === 'hi' ? 'उदा. श्री कृष्णा डेयरी फार्म' : 'e.g. Krishna Dairy Farm'}
                    placeholderTextColor="#94a3b8"
                    value={businessName}
                    onChangeText={setBusinessName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? 'मोबाइल नंबर (लॉगिन हेतु)' : 'Mobile Number (for login)'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={lang === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={vendorPhone}
                    onChangeText={setVendorPhone}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? 'UPI ID (QR बिलिंग हेतु, वैकल्पिक)' : 'UPI ID (for bill payments, optional)'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={lang === 'hi' ? 'उदा. 9876543210@paytm' : 'e.g. 9876543210@paytm'}
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    value={vendorUpi}
                    onChangeText={setVendorUpi}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? '4-अंकों का गुप्त पिन' : '4-Digit Secret PIN'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={6}
                    value={vendorPin}
                    onChangeText={setVendorPin}
                  />
                </View>
              </>
            ) : (
              /* Customer Form */
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? 'पूरा नाम' : 'Full Name'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={lang === 'hi' ? 'उदा. राजेश कुमार' : 'e.g. Rajesh Kumar'}
                    placeholderTextColor="#94a3b8"
                    value={custName}
                    onChangeText={setCustName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={lang === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={custPhone}
                    onChangeText={setCustPhone}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? 'घर का पता / मकान नं.' : 'Home Address / Flat No.'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={lang === 'hi' ? 'मकान नं., गली, कॉलोनी' : 'House No., Sector, Colony'}
                    placeholderTextColor="#94a3b8"
                    value={custAddress}
                    onChangeText={setCustAddress}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 6 }]}>
                    <Text style={styles.label}>
                      {lang === 'hi' ? 'दैनिक मात्रा (L)' : 'Daily Qty (L)'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1.0"
                      keyboardType="numeric"
                      value={custQty}
                      onChangeText={setCustQty}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1, marginLeft: 6 }]}>
                    <Text style={styles.label}>
                      {lang === 'hi' ? 'दर (₹/L)' : 'Rate (₹/L)'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="60"
                      keyboardType="numeric"
                      value={custRate}
                      onChangeText={setCustRate}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {lang === 'hi' ? '4-अंकों का गुप्त पिन' : '4-Digit Secret PIN'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={6}
                    value={custPin}
                    onChangeText={setCustPin}
                  />
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {lang === 'hi' ? 'खाता बनाएं' : 'Create Account'} →
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch to Login Link */}
            <View style={styles.loginPromptRow}>
              <Text style={styles.loginPromptText}>
                {lang === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}
              </Text>
              <TouchableOpacity onPress={() => onGoLogin(role)}>
                <Text style={styles.loginLinkText}>
                  {lang === 'hi' ? ' लॉगिन करें' : ' Sign In Here'}
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
    backgroundColor: '#070b14',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: 'bold',
  },
  langPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  langPillText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 14,
    alignItems: 'center',
  },
  brandLogoImg: {
    width: 165,
    height: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleTabActive: {
    backgroundColor: '#2563eb',
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  roleTabTextActive: {
    color: '#ffffff',
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  loginPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginPromptText: {
    fontSize: 12,
    color: '#64748b',
  },
  loginLinkText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
