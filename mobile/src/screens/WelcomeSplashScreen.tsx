import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, 
  Image, Dimensions, Platform 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

interface WelcomeSplashScreenProps {
  onGoLogin: (role?: 'vendor' | 'customer') => void;
  onGoRegister: (role?: 'vendor' | 'customer') => void;
}

export default function WelcomeSplashScreen({ onGoLogin, onGoRegister }: WelcomeSplashScreenProps) {
  const { lang, toggleLang } = useLanguage();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Netflix-Style Full-Bleed Background Image */}
      <Image 
        source={require('../../assets/media/banner-image-2.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Cinematic Dark Vignette & Gradient Overlays */}
      <View style={styles.topVignette} />
      <View style={styles.bottomGradient} />

      <SafeAreaView style={styles.contentSafeArea}>
        {/* Top Navigation Bar: Official Logo on Left, Language Pill on Right */}
        <View style={styles.topNavBar}>
          <View style={styles.logoBadge}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logoImg} 
              resizeMode="contain" 
            />
          </View>

          <TouchableOpacity onPress={toggleLang} style={styles.langSwitchPill} activeOpacity={0.8}>
            <Text style={styles.langSwitchText}>
              🌐 {lang === 'hi' ? 'English' : 'हिन्दी'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Cinematic Hero Typography */}
        <View style={styles.centerHero}>
          <View style={styles.taglineBadge}>
            <Text style={styles.taglineBadgeText}>
              {lang === 'hi' ? '🥛 भारत का डिजिटल दुग्ध बहीखाता' : "🥛 India's Modern Dairy Cloud"}
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            {lang === 'hi' 
              ? 'स्मार्ट दुग्ध बहीखाता,\nहर बूँद का हिसाब।' 
              : 'Smart Dairy Ledger,\nEvery Drop Accounted.'}
          </Text>

          <Text style={styles.heroSubtitle}>
            {lang === 'hi' 
              ? 'कागज़ की डायरी छोड़ें। देसी आवाज़ से 10 सेकंड में डिलीवरी एंट्री, 1-क्लिक WhatsApp बिल और तुरंत UPI भुगतान।' 
              : 'Say goodbye to paper diaries. Speak naturally to log daily milk, dispatch 1-click WhatsApp bills & collect payments via UPI.'}
          </Text>

          {/* 3 Netflix-Style Feature Badges */}
          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>🎙️ {lang === 'hi' ? 'आवाज़ से एंट्री' : 'Voice AI'}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>📲 {lang === 'hi' ? 'WhatsApp बिल' : 'WhatsApp QR'}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>⚖️ {lang === 'hi' ? '0 विवाद' : 'Zero Disputes'}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Action Dock (Netflix-style Big Get Started / Sign In Buttons) */}
        <View style={styles.bottomDock}>
          
          {/* Quick Demo Hint */}
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>
              💡 {lang === 'hi' ? 'त्वरित डेमो: मोबाइल ' : 'Quick Demo: Phone '}
              <Text style={styles.demoHighlight}>1234</Text>
              {lang === 'hi' ? ' • पिन ' : ' • PIN '}
              <Text style={styles.demoHighlight}>1234</Text>
            </Text>
          </View>

          {/* Primary Action Button (Sign In) */}
          <TouchableOpacity 
            onPress={() => onGoLogin('vendor')} 
            style={styles.primaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {lang === 'hi' ? 'लॉगिन करें (Sign In)' : 'Sign In'} →
            </Text>
          </TouchableOpacity>

          {/* Secondary Action Button (Register / Get Started) */}
          <TouchableOpacity 
            onPress={() => onGoRegister('vendor')} 
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>
              + {lang === 'hi' ? 'नया खाता बनाएं (Get Started)' : 'Create Free Account'}
            </Text>
          </TouchableOpacity>

          {/* Trust Footer */}
          <Text style={styles.footerNote}>
            {lang === 'hi' 
              ? 'मेहनती दूधियों व लाखों परिवारों का विश्वसनीय डिजिटल साथी' 
              : 'Trusted by dairy farmers, vendors & households across India'}
          </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b14',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    opacity: 0.45,
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(7, 11, 20, 0.75)',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.75,
    backgroundColor: 'rgba(7, 11, 20, 0.94)',
  },
  contentSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 24,
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 6,
    shadowColor: '#2563eb',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  langSwitchPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  langSwitchText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerHero: {
    marginVertical: 'auto',
    paddingTop: 20,
  },
  taglineBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  taglineBadgeText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 12,
    lineHeight: 19,
    maxWidth: 320,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    flexWrap: 'wrap',
  },
  featurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  featurePillText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomDock: {
    gap: 12,
    paddingBottom: 8,
  },
  demoPill: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoPillText: {
    fontSize: 11,
    color: '#93c5fd',
  },
  demoHighlight: {
    fontWeight: '900',
    color: '#ffffff',
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footerNote: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
  },
});
