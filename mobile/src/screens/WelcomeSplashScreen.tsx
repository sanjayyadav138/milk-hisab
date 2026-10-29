import React from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Dimensions 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface WelcomeSplashScreenProps {
  onGoLogin: (role?: 'vendor' | 'customer') => void;
  onGoRegister: (role?: 'vendor' | 'customer') => void;
}

export default function WelcomeSplashScreen({ onGoLogin, onGoRegister }: WelcomeSplashScreenProps) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top Bar with Language Toggle */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={toggleLang} style={styles.langPill}>
            <Text style={styles.langPillText}>
              🌐 {lang === 'hi' ? 'English' : 'हिन्दी'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Banner Section */}
        <View style={styles.heroSection}>
          <View style={styles.brandIconWrap}>
            <Text style={styles.brandEmoji}>🥛</Text>
          </View>

          <Text style={styles.appTitle}>Milk Hisab</Text>
          <Text style={styles.appSubtitleHindi}>मिल्क हिसाब</Text>
          
          <Text style={styles.tagline}>
            {lang === 'hi' 
              ? 'भारत का सबसे सरल व पारदर्शी डिजिटल दुग्ध बहीखाता' 
              : "India's Modern & Transparent Digital Milk Ledger"}
          </Text>
        </View>

        {/* Value Highlights Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>🎙️</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>
                {lang === 'hi' ? 'देसी आवाज़ से एंट्री' : 'Voice-Powered Entry'}
              </Text>
              <Text style={styles.featureDesc}>
                {lang === 'hi' ? 'बोलिए और 10 सेकंड में पूरे गाँव या शहर का हिसाब दर्ज' : 'Speak naturally to record deliveries in seconds'}
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>📲</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>
                {lang === 'hi' ? '1-क्लिक WhatsApp बिल' : '1-Click WhatsApp Bills'}
              </Text>
              <Text style={styles.featureDesc}>
                {lang === 'hi' ? 'सीधा PhonePe / Google Pay UPI QR कोड के साथ बिल भेजें' : 'Instant itemized statements with UPI payment QR'}
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>⚖️</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>
                {lang === 'hi' ? '100% निष्पक्ष व पारदर्शी' : '100% Ledger Transparency'}
              </Text>
              <Text style={styles.featureDesc}>
                {lang === 'hi' ? 'दूधिया और ग्राहक दोनों को समान रीयल-टाइम रिकॉर्ड' : 'Zero reconciliation disputes between vendor & family'}
              </Text>
            </View>
          </View>
        </View>

        {/* Demo Fast Shortcut Notice */}
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            💡 {lang === 'hi' ? 'टेस्टिंग: मोबाइल में ' : 'Testing: Use '}
            <Text style={styles.demoBold}>1234</Text>
            {lang === 'hi' ? ' और पिन ' : ' and PIN '}
            <Text style={styles.demoBold}>1234</Text>
            {lang === 'hi' ? ' से सीधा लॉगिन करें' : ' for instant login'}
          </Text>
        </View>

        {/* Primary Call-to-Actions */}
        <View style={styles.actionButtonsWrap}>
          {/* Login Button */}
          <TouchableOpacity 
            onPress={() => onGoLogin('vendor')} 
            style={styles.loginBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {lang === 'hi' ? 'लॉगिन करें (Login)' : 'Login to Account'} →
            </Text>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity 
            onPress={() => onGoRegister('vendor')} 
            style={styles.registerBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.registerBtnText}>
              + {lang === 'hi' ? 'नया खाता बनाएं (Register / Sign Up)' : 'Create New Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            cloud sync • 100% verified • www.milkhisab.in
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a1020',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  langPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  langPillText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  brandIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#2563eb',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  brandEmoji: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  appSubtitleHindi: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#60a5fa',
    marginTop: 2,
  },
  tagline: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 18,
  },
  bannerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 14,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  featureDesc: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
    lineHeight: 15,
  },
  demoBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    marginBottom: 16,
  },
  demoText: {
    fontSize: 11,
    color: '#93c5fd',
  },
  demoBold: {
    fontWeight: '900',
    color: '#ffffff',
  },
  actionButtonsWrap: {
    gap: 12,
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  registerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
