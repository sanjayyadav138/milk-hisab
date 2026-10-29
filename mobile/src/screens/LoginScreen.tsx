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
  const { login, loading } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  
  const [role, setRole] = useState<'vendor' | 'customer'>(initialRole);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');

  const handleLogin = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      Alert.alert(lang === 'hi' ? 'मोबाइल नंबर आवश्यक' : 'Mobile Required', t('enterPhone'));
      return;
    }

    try {
      await login(cleanPhone, role, pin.trim() || '1234');
    } catch (err: any) {
      Alert.alert(lang === 'hi' ? 'लॉगिन विफल' : 'Login Failed', err.message || (lang === 'hi' ? 'कृपया सही मोबाइल या पिन दर्ज करें' : 'Invalid credentials. Please verify your phone or PIN.'));
    }
  };

  const handleFillDemo = () => {
    setPhone('1234');
    setPin('1234');
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
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backBtnText}>‹ {lang === 'hi' ? 'वापस' : 'Back'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFillDemo} style={styles.demoFillBtn} activeOpacity={0.8}>
              <Text style={styles.demoFillText}>⚡ {lang === 'hi' ? 'डेमो 1234' : 'Demo 1234'}</Text>
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
              {lang === 'hi' ? 'खाते में लॉगिन करें' : 'Sign In to Milk Hisab'}
            </Text>
            <Text style={styles.subtitle}>
              {lang === 'hi' 
                ? 'दैनिक दूध हिसाब व बहीखाता एक्सेस करें' 
                : 'Access your daily delivery records & payments'}
            </Text>
          </View>

          {/* Modern Card */}
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

            {/* Phone/Username Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {lang === 'hi' ? 'मोबाइल नंबर या आईडी' : 'Mobile Number or User ID'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={lang === 'hi' ? '10-अंकों का मोबाइल या 1234' : '10-digit mobile or 1234'}
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                keyboardType="default"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* PIN Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {lang === 'hi' ? '4-अंकों का गुप्त पिन' : '4-Digit Secret PIN'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={lang === 'hi' ? '4 अंकों का पिन (उदा. 1234)' : '4-digit PIN (e.g. 1234)'}
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                secureTextEntry
                value={pin}
                onChangeText={setPin}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {role === 'vendor'
                    ? (lang === 'hi' ? 'डेयरी लॉगिन करें' : 'Sign In as Vendor')
                    : (lang === 'hi' ? 'ग्राहक लॉगिन करें' : 'Sign In as Customer')
                  } →
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch to Register Link */}
            <View style={styles.registerPromptRow}>
              <Text style={styles.registerPromptText}>
                {lang === 'hi' ? 'खाता नहीं है?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={() => onGoRegister(role)}>
                <Text style={styles.registerLinkText}>
                  {lang === 'hi' ? ' नया खाता बनाएं' : ' Register Now'}
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
    justifyContent: 'center',
    padding: 20,
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
  demoFillBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  demoFillText: {
    color: '#60a5fa',
    fontSize: 12,
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
    marginBottom: 16,
    alignItems: 'center',
  },
  brandLogoImg: {
    width: 165,
    height: 48,
    marginBottom: 12,
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
    padding: 22,
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
    marginBottom: 18,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  roleTabActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
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
  registerPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  registerPromptText: {
    fontSize: 12,
    color: '#64748b',
  },
  registerLinkText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
