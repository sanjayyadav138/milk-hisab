import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Text, TouchableOpacity, Image, 
  SafeAreaView, Dimensions, ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

interface WelcomeHomeScreenProps {
  onGoLogin: (role: 'vendor' | 'customer') => void;
  onGoRegister: (role: 'vendor' | 'customer') => void;
}

export default function WelcomeHomeScreen({ onGoLogin, onGoRegister }: WelcomeHomeScreenProps) {
  const { lang, toggleLang } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'vendor' | 'customer'>('vendor');

  const isHi = lang === 'hi';

  return (
    <LinearGradient
      colors={['#EBFDF0', '#F4FBF6', '#FFFFFF']}
      style={styles.gradientContainer}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Top Header Row with Language Switcher */}
        <View style={styles.topHeader}>
          <View style={styles.trustTopBadge}>
            <Text style={styles.trustBadgeText}>🇮🇳 {isHi ? 'डिजिटल भारत' : 'Digital India'}</Text>
          </View>

          <TouchableOpacity onPress={toggleLang} style={styles.langBtn} activeOpacity={0.8}>
            <Text style={styles.langBtnText}>{isHi ? 'English' : 'हिन्दी'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

          {/* Top Center: Friendly Indian Milkman Illustration */}
          <View style={styles.illustrationWrap}>
            <View style={styles.avatarGlowCircle}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.milkmanIllustration}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Brand Name & Tagline */}
          <View style={styles.brandTextWrap}>
            <Text style={styles.brandTitle}>Milk Hisab</Text>
            <Text style={styles.brandTagline}>Digital Hisaab, Gaon Ki Tarakki</Text>
            <Text style={styles.welcomeSubtitle}>
              {isHi ? 'मिल्क हिसाब में आपका स्वागत है' : 'Welcome to Milk Hisab'}
            </Text>
          </View>

          {/* Action Buttons: Solid Dark Blue Register & Outlined Dark Blue Login */}
          <View style={styles.buttonStack}>
            
            {/* Top Button: Solid Dark Blue Register Pill */}
            <TouchableOpacity 
              onPress={() => onGoRegister(selectedRole)} 
              style={styles.solidRegisterBtn}
              activeOpacity={0.88}
            >
              <Text style={styles.solidRegisterBtnText}>
                {isHi ? 'Register / पंजीकरण करें' : 'Register / पंजीकरण'}
              </Text>
            </TouchableOpacity>

            {/* Bottom Button: Dark Blue Outline Login Pill */}
            <TouchableOpacity 
              onPress={() => onGoLogin(selectedRole)} 
              style={styles.outlineLoginBtn}
              activeOpacity={0.88}
            >
              <Text style={styles.outlineLoginBtnText}>
                {isHi ? 'Login / लॉगिन करें' : 'Login / लॉगिन करें'}
              </Text>
            </TouchableOpacity>

          </View>

          {/* Role Selection Section: Clean White Rounded Square Cards */}
          <View style={styles.roleSectionWrap}>
            <Text style={styles.roleSectionLabel}>
              {isHi ? 'अपनी भूमिका चुनें (Select Role):' : 'Select Your Account Type:'}
            </Text>

            <View style={styles.roleCardsRow}>
              
              {/* Left Card: Vendor / दूधिया (Milk can & Clipboard) */}
              <TouchableOpacity 
                onPress={() => setSelectedRole('vendor')}
                style={[
                  styles.roleCard,
                  selectedRole === 'vendor' && styles.roleCardActive
                ]}
                activeOpacity={0.85}
              >
                {selectedRole === 'vendor' && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkBadgeText}>✓</Text>
                  </View>
                )}
                <View style={styles.roleIconWrap}>
                  <Text style={styles.roleIconText}>🥛📋</Text>
                </View>
                <Text style={styles.roleCardTitle}>
                  {isHi ? 'दूधिया / Vendor' : 'Vendor / दूधिया'}
                </Text>
                <Text style={styles.roleCardDesc}>
                  {isHi ? 'दूध वितरण व बहीखाता' : 'Dairy & Distribution'}
                </Text>
              </TouchableOpacity>

              {/* Right Card: Customer / ग्राहक (Smiling Family) */}
              <TouchableOpacity 
                onPress={() => setSelectedRole('customer')}
                style={[
                  styles.roleCard,
                  selectedRole === 'customer' && styles.roleCardActive
                ]}
                activeOpacity={0.85}
              >
                {selectedRole === 'customer' && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkBadgeText}>✓</Text>
                  </View>
                )}
                <View style={[styles.roleIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={styles.roleIconText}>👨‍👩‍👧</Text>
                </View>
                <Text style={styles.roleCardTitle}>
                  {isHi ? 'ग्राहक / Customer' : 'Customer / ग्राहक'}
                </Text>
                <Text style={styles.roleCardDesc}>
                  {isHi ? 'दैनिक दूध व बिल पर्ची' : 'Daily Milk & Slips'}
                </Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Bottom Trust Badge */}
          <View style={styles.bottomTrustWrap}>
            <Text style={styles.bottomTrustText}>
              Trusted by local dairies across India
            </Text>
            <Text style={styles.bottomTrustSubText}>
              {isHi ? 'भारत भर की स्थानीय डेयरियों द्वारा विश्वसनीय' : '100% Secure • Safe Digital Records'}
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 6,
  },
  trustTopBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  langBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1E3A8A', // Deep Dairy Blue
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  avatarGlowCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#DCFCE7',
  },
  milkmanIllustration: {
    width: 120,
    height: 120,
  },
  brandTextWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E3A8A', // Bold Dark Blue
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 14,
    color: '#475569', // Dark grey
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 14,
    textAlign: 'center',
  },
  buttonStack: {
    width: '100%',
    gap: 12,
    marginBottom: 26,
  },
  solidRegisterBtn: {
    backgroundColor: '#1E3A8A', // Solid Dark Blue
    borderRadius: 30, // Pill-shaped
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  solidRegisterBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  outlineLoginBtn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1E3A8A', // Dark blue outline
    borderRadius: 30, // Pill-shaped
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineLoginBtnText: {
    color: '#1E3A8A', // Dark blue text
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  roleSectionWrap: {
    width: '100%',
    marginBottom: 20,
  },
  roleSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  roleCardActive: {
    borderColor: '#1E3A8A', // Dark Blue Active Border
    backgroundColor: '#F8FAFC',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1E3A8A',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleIconText: {
    fontSize: 24,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  roleCardDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomTrustWrap: {
    alignItems: 'center',
    marginTop: 6,
  },
  bottomTrustText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomTrustSubText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
});
