import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Image, Dimensions, Animated, Text 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface WelcomeSplashScreenProps {
  onFinish?: () => void;
  onGoLogin?: (role?: 'vendor' | 'customer') => void;
}

export default function WelcomeSplashScreen({ onFinish, onGoLogin }: WelcomeSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const milkWaveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(milkWaveAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle breathing pulse for milk glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 1.8 seconds timer to transition to the Welcome Home Screen
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else if (onGoLogin) {
        onGoLogin('vendor');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const waveTranslateY = milkWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* 1. Full-Screen Soft Milky Gradient Base */}
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC', '#EFF6FF', '#DBEAFE']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* 2. Full-Screen Seamless Milk Texture Layer (resizeMode="cover", zero visible borders) */}
      <Image 
        source={require('../../assets/media/milk-image2.png')} 
        style={styles.fullScreenMilkTexture}
        resizeMode="cover" 
      />

      {/* 3. Subtle ambient milk splash background overlay */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(240, 249, 255, 0.82)', 'rgba(219, 234, 254, 0.9)']}
        style={StyleSheet.absoluteFill}
      />

      {/* 4. Bottom Liquid Milk Lake / Wave Effect */}
      <Animated.View style={[
        styles.bottomMilkLake,
        { transform: [{ translateY: waveTranslateY }] }
      ]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* 5. Central Branding Card with Breathing Pulse Glow */}
      <Animated.View style={[
        styles.centerBrandWrap, 
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        {/* Glowing circular backdrop for the milkman avatar */}
        <Animated.View style={[
          styles.glowCircle,
          { transform: [{ scale: pulseAnim }] }
        ]} />

        <View style={styles.logoBadge}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.centralLogoImg}
            resizeMode="contain" 
          />
        </View>

        <Text style={styles.brandTitleText}>Milk Hisab</Text>
        <Text style={styles.hindiSubtitle}>मिल्क हिसाब</Text>
        <Text style={styles.brandTaglineText}>Digital Hisaab, Gaon Ki Tarakki</Text>
      </Animated.View>

      {/* 6. Bottom Loading Status */}
      <View style={styles.bottomStatusWrap}>
        <View style={styles.pulseDot} />
        <Text style={styles.bottomStatusText}>दूध का डिजिटल बहीखाता लोड हो रहा है...</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  fullScreenMilkTexture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.12, // Subtle, soft milk texture completely filling the screen with no box edges
  },
  bottomMilkLake: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
  },
  centerBrandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  glowCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  logoBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#EFF6FF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16,
  },
  centralLogoImg: {
    width: 115,
    height: 115,
  },
  brandTitleText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1E3A8A', // Deep Dairy Blue
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  hindiSubtitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981', // Ledger Green Accent
    marginTop: 2,
    textAlign: 'center',
  },
  brandTaglineText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  bottomStatusWrap: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  bottomStatusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
});
