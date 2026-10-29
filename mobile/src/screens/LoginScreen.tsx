import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert 
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
  const { t, lang } = useLanguage();
  
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
      Alert.alert(lang === 'hi' ? 'लॉगिन विफल' : 'Login Failed', err.message || 'कृपया सही मोबाइल या पिन दर्ज करें');
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
          
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backBtnText}>‹ वापस (Back)</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFillDemo} style={styles.demoFillBtn}>
              <Text style={styles.demoFillText}>⚡ डेमो 1234</Text>
            </TouchableOpacity>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {lang === 'hi' ? 'अपने खाते में लॉगिन करें' : 'Login to Your Account'}
            </Text>
            <Text style={styles.subtitle}>
              {lang === 'hi' 
                ? 'दैनिक दूध बहीखाता व हिसाब देखने हेतु विवरण दर्ज करें' 
                : 'Enter your credentials to access your daily ledger'}
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Role Switcher Tabs */}
            <View style={styles.roleTabs}>
              <TouchableOpacity
                onPress={() => setRole('vendor')}
                style={[styles.roleTab, role === 'vendor' && styles.roleTabActive]}
              >
                <Text style={[styles.roleTabText, role === 'vendor' && styles.roleTabTextActive]}>
                  {t('vendor')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole('customer')}
                style={[styles.roleTab, role === 'customer' && styles.roleTabActive]}
              >
                <Text style={[styles.roleTabText, role === 'customer' && styles.roleTabTextActive]}>
                  {t('customer')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Phone/Username Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {lang === 'hi' ? 'मोबाइल नंबर या आईडी' : 'Mobile Number or ID'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={lang === 'hi' ? '10-अंकों का मोबाइल या 1234' : '10-digit mobile or 1234'}
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* PIN Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('pin')}</Text>
              <TextInput
                style={styles.input}
                placeholder="4 अंकों का पिन (उदा. 1234)"
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
                  {lang === 'hi' ? 'लॉगिन करें' : 'Login Now'} →
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
    backgroundColor: '#0a1020',
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
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backBtnText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: 'bold',
  },
  demoFillBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  demoFillText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18,
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
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
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
    paddingVertical: 14,
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
