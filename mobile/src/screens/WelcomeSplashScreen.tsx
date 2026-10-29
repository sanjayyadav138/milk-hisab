import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Image, Dimensions, Animated, Text 
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeSplashScreenProps {
  onFinish?: () => void;
  onGoLogin?: (role?: 'vendor' | 'customer') => void;
  onGoRegister?: (role?: 'vendor' | 'customer') => void;
}

export default function WelcomeSplashScreen({ onFinish, onGoLogin }: WelcomeSplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.92);

  useEffect(() => {
    // Elegant entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // 1.5 seconds timer to transition to Auth / Home screen
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else if (onGoLogin) {
        onGoLogin('vendor');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Layered White Milk Splash Watermarks (Bleeding Off Screen Edges) */}
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

      {/* Central "Milkman with Can" Brand Logo */}
      <Animated.View style={[
        styles.centerBrandWrap, 
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.centralLogoImg}
          resizeMode="contain" 
        />
        <Text style={styles.brandTitleText}>Milk Hisab</Text>
        <Text style={styles.brandTaglineText}>दूध का डिजिटल बहीखाता</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Soft Milky Cream Background
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkTopRight: {
    position: 'absolute',
    top: -50,
    right: -60,
    width: width * 0.7,
    height: width * 0.7,
    opacity: 0.22,
  },
  watermarkBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: width * 0.75,
    height: width * 0.75,
    opacity: 0.22,
  },
  centerBrandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralLogoImg: {
    width: 130,
    height: 130,
    marginBottom: 16,
  },
  brandTitleText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E3A8A', // Deep Dairy Blue
    letterSpacing: -0.5,
  },
  brandTaglineText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '700',
  },
});
