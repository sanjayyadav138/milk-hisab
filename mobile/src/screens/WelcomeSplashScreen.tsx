import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, 
  Image, Dimensions, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

      {/* Netflix-Style Hero Banner with Rich Visual Clarity */}
      <View style={styles.bannerWrapper}>
        <Image 
          source={require('../../assets/media/banner-image1.png')} 
          style={styles.bannerImage}
          resizeMode="cover"
        />
        {/* Cinematic Linear Gradient: Gentle top fade, fully clear middle banner, smooth drop to pure black */}
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.75)',
            'rgba(0, 0, 0, 0.05)',
            'rgba(0, 0, 0, 0.35)',
            'rgba(0, 0, 0, 0.88)',
            '#000000',
            '#000000'
          ]}
          locations={[0, 0.22, 0.52, 0.78, 0.95, 1.0]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={styles.contentSafeArea}>
        {/* Top Navigation Bar: Pure Logo on Left (No White Box), Netflix-Style Language Pill on Right */}
        <View style={styles.topNavBar}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.brandLogo} 
            resizeMode="contain" 
          />

          <TouchableOpacity onPress={toggleLang} style={styles.langPill} activeOpacity={0.8}>
            <Text style={styles.langPillText}>
              🌐 {lang === 'hi' ? 'English' : 'हिन्दी'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Cinematic Hero Content (Unified Netflix Black & White Styling) */}
        <View style={styles.centerHero}>
          <Text style={styles.heroTitle}>
            {lang === 'hi' 
              ? 'दूध का डिजिटल हिसाब,\nअब बिल्कुल आसान।' 
              : 'Smart Milk Diary.\nEvery Drop Accounted.'}
          </Text>

          <Text style={styles.heroSubtitle}>
            {lang === 'hi' 
              ? 'कागज़ की डायरी छोड़ें। बोलकर रोज़ की एंट्री करें, 1-क्लिक में WhatsApp बिल भेजें और तुरंत UPI से भुगतान लें।' 
              : 'Say goodbye to paper diaries. Speak naturally to log milk, send instant WhatsApp bills & collect payments via UPI.'}
          </Text>

          {/* Unified Netflix-Style Feature Badges */}
          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>🎙️ {lang === 'hi' ? 'आवाज़ से एंट्री' : 'Voice AI'}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>📲 {lang === 'hi' ? 'WhatsApp बिल' : 'WhatsApp QR'}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>⚡ {lang === 'hi' ? 'तुरंत UPI' : 'Instant UPI'}</Text>
            </View>
          </View>
        </View>

        {/* Bottom Action Dock (Netflix Signature Bold CTAs) */}
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

          {/* Primary Action Button (Netflix Bold Red) */}
          <TouchableOpacity 
            onPress={() => onGoLogin('vendor')} 
            style={styles.primaryBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>
              {lang === 'hi' ? 'लॉगिन करें (Sign In)' : 'Sign In'} ›
            </Text>
          </TouchableOpacity>

          {/* Secondary Action Button (Netflix Charcoal Button) */}
          <TouchableOpacity 
            onPress={() => onGoRegister('vendor')} 
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>
              + {lang === 'hi' ? 'नया खाता बनाएं (Get Started)' : 'Get Started / Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Trust Footer */}
          <Text style={styles.footerNote}>
            {lang === 'hi' 
              ? 'मेहनती दूधियों व परिवारों का विश्वसनीय डिजिटल साथी' 
              : 'Trusted by dairy vendors & households across India'}
          </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  bannerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.70,
    backgroundColor: '#000000',
  },
  bannerImage: {
    width: width,
    height: '100%',
    opacity: 0.95,
  },
  contentSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
    paddingBottom: 22,
  },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandLogo: {
    width: 145,
    height: 42,
  },
  langPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#404040',
  },
  langPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  centerHero: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#d4d4d4',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 19,
    maxWidth: 340,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  featurePillText: {
    color: '#e5e5e5',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomDock: {
    gap: 10,
    paddingBottom: 4,
  },
  demoPill: {
    backgroundColor: '#171717',
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2e2e2e',
    alignItems: 'center',
    marginBottom: 2,
  },
  demoPillText: {
    fontSize: 11,
    color: '#a3a3a3',
  },
  demoHighlight: {
    fontWeight: '900',
    color: '#ffffff',
  },
  primaryBtn: {
    backgroundColor: '#2563EB', // Deep Dairy Blue (Strictly NO RED BUTTONS)
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  secondaryBtn: {
    backgroundColor: '#262626',
    borderRadius: 4,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#404040',
  },
  secondaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 10,
    color: '#737373',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
});
