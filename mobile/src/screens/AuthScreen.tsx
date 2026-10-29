import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthScreen() {
  const { loginVendor, loginCustomer, loading } = useAuth();
  const { t, lang, toggleLang } = useLanguage();
  
  const [role, setRole] = useState<'vendor' | 'customer'>('vendor');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');

  const handleLogin = async () => {
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert(lang === 'hi' ? 'अमान्य मोबाइल' : 'Invalid Mobile', t('enterPhone'));
      return;
    }
    if (!pin.trim() || pin.trim().length < 4) {
      Alert.alert(lang === 'hi' ? 'अमान्य पिन' : 'Invalid PIN', t('enterPin'));
      return;
    }

    try {
      if (role === 'vendor') {
        await loginVendor(phone.trim(), pin.trim());
      } else {
        await loginCustomer(phone.trim(), pin.trim());
      }
    } catch (err: any) {
      Alert.alert(lang === 'hi' ? 'लॉगिन विफल' : 'Login Failed', err.message || 'Check phone or PIN');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Language Switcher Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleLang} style={styles.langPill}>
              <Text style={styles.langPillText}>
                🌐 {lang === 'hi' ? 'English' : 'हिन्दी'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* App Branding */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🥛</Text>
            </View>
            <Text style={styles.appTitle}>{t('appName')}</Text>
            <Text style={styles.appSubtitle}>{t('tagline')}</Text>
          </View>

          {/* Role Switcher Tabs */}
          <View style={styles.card}>
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

            {/* Input Form */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('phone')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterPhone')}
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('pin')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterPin')}
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
                value={pin}
                onChangeText={setPin}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {role === 'vendor' ? t('loginAsVendor') : t('loginAsCustomer')} →
                </Text>
              )}
            </TouchableOpacity>

            {/* Helper Hint */}
            <Text style={styles.hintText}>
              {lang === 'hi' 
                ? 'नया खाता या पिन भूलने पर अपने स्थानीय दूधिया / एडमिन से संपर्क करें।' 
                : 'Contact your local milkman or admin if you forgot your PIN.'}
            </Text>

          </View>

          {/* Trust Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🔒 100% सुरक्षित • क्लाउड सिंक • 24x7 बैकअप
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
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
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  langPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  langPillText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  logoIcon: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 18,
    padding: 4,
    marginBottom: 20,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 14,
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
    fontSize: 16,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 18,
    paddingVertical: 14,
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
  hintText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
});
