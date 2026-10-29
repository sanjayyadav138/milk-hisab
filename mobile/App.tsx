import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView 
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import WelcomeSplashScreen from './src/screens/WelcomeSplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DailyChecklistScreen from './src/screens/vendor/DailyChecklistScreen';
import CustomersScreen from './src/screens/vendor/CustomersScreen';
import CustomerPortalScreen from './src/screens/customer/CustomerPortalScreen';

function MainNavigator() {
  const { auth, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();
  
  // Navigation State for Unauthenticated flow: 'SPLASH' | 'LOGIN' | 'REGISTER'
  const [unauthScreen, setUnauthScreen] = useState<'SPLASH' | 'LOGIN' | 'REGISTER'>('SPLASH');
  const [selectedRole, setSelectedRole] = useState<'vendor' | 'customer'>('vendor');
  
  // Navigation State for Vendor Tabs
  const [vendorTab, setVendorTab] = useState<'DAILY' | 'CUSTOMERS'>('DAILY');

  // 1. Not Authenticated: Flow between Splash, Login, and Register
  if (!auth.token || !auth.role) {
    if (unauthScreen === 'LOGIN') {
      return (
        <LoginScreen 
          initialRole={selectedRole}
          onBack={() => setUnauthScreen('SPLASH')}
          onGoRegister={(role) => {
            setSelectedRole(role);
            setUnauthScreen('REGISTER');
          }}
        />
      );
    }

    if (unauthScreen === 'REGISTER') {
      return (
        <RegisterScreen 
          initialRole={selectedRole}
          onBack={() => setUnauthScreen('SPLASH')}
          onGoLogin={(role) => {
            setSelectedRole(role);
            setUnauthScreen('LOGIN');
          }}
        />
      );
    }

    // Default: Splash / Welcome Screen
    return (
      <WelcomeSplashScreen 
        onGoLogin={(role) => {
          if (role) setSelectedRole(role);
          setUnauthScreen('LOGIN');
        }}
        onGoRegister={(role) => {
          if (role) setSelectedRole(role);
          setUnauthScreen('REGISTER');
        }}
      />
    );
  }

  // 2. Customer Role: Show CustomerPortalScreen
  if (auth.role === 'customer') {
    return <CustomerPortalScreen />;
  }

  // 3. Vendor Role: Show Vendor Panel with Bottom Navigation
  return (
    <SafeAreaView style={styles.vendorContainer}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <Text style={styles.brandIcon}>🥛</Text>
          <View>
            <Text style={styles.brandTitle}>Milk Hisab</Text>
            <Text style={styles.brandSub}>
              {auth.user?.business_name || auth.user?.name || 'डेयरी प्रबंधन'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleLang} style={styles.langBtn}>
            <Text style={styles.langBtnText}>{lang === 'hi' ? 'EN' : 'हिन्दी'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>लॉगआउट</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab Screen */}
      <View style={styles.screenContent}>
        {vendorTab === 'DAILY' ? <DailyChecklistScreen /> : <CustomersScreen />}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => setVendorTab('DAILY')}
          style={[styles.navTab, vendorTab === 'DAILY' && styles.navTabActive]}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={[styles.navLabel, vendorTab === 'DAILY' && styles.navLabelActive]}>
            दैनिक बहीखाता
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setVendorTab('CUSTOMERS')}
          style={[styles.navTab, vendorTab === 'CUSTOMERS' && styles.navTabActive]}
        >
          <Text style={styles.navIcon}>👥</Text>
          <Text style={[styles.navLabel, vendorTab === 'CUSTOMERS' && styles.navLabelActive]}>
            ग्राहक व संकलन
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <MainNavigator />
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  vendorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  brandSub: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  screenContent: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  navTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTabActive: {
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#2563eb',
    fontWeight: '900',
  },
});
