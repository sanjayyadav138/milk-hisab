import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image 
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import WelcomeSplashScreen from './src/screens/WelcomeSplashScreen';
import NetflixDashboardHomeScreen from './src/screens/NetflixDashboardHomeScreen';
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
  
  // Navigation State for Vendor Tabs: 'HOME' | 'DAILY' | 'CUSTOMERS'
  const [vendorTab, setVendorTab] = useState<'HOME' | 'DAILY' | 'CUSTOMERS'>('HOME');

  // Navigation State for Customer Tabs: 'HOME' | 'PORTAL'
  const [customerTab, setCustomerTab] = useState<'HOME' | 'PORTAL'>('HOME');

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

  // 2. Customer Role: Netflix Streaming Home Dashboard with Tab to Full Monthly Ledger
  if (auth.role === 'customer') {
    return (
      <View style={styles.appContainer}>
        <View style={styles.screenContent}>
          {customerTab === 'HOME' ? (
            <NetflixDashboardHomeScreen 
              onNavigateTab={(tab) => setCustomerTab(tab === 'PORTAL' ? 'PORTAL' : 'HOME')} 
            />
          ) : (
            <CustomerPortalScreen />
          )}
        </View>

        {/* Customer Bottom Navigation Bar (Dark Navy Theme) */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => setCustomerTab('HOME')}
            style={[styles.navTab, customerTab === 'HOME' && styles.navTabActive]}
            activeOpacity={0.8}
          >
            <Text style={styles.navIcon}>🎬</Text>
            <Text style={[styles.navLabel, customerTab === 'HOME' && styles.navLabelActive]}>
              {lang === 'hi' ? 'होम डैशबोर्ड' : 'Dashboard'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCustomerTab('PORTAL')}
            style={[styles.navTab, customerTab === 'PORTAL' && styles.navTabActive]}
            activeOpacity={0.8}
          >
            <Text style={styles.navIcon}>📊</Text>
            <Text style={[styles.navLabel, customerTab === 'PORTAL' && styles.navLabelActive]}>
              {lang === 'hi' ? 'खाता बही' : 'Full Ledger'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 3. Vendor Role: Streaming Dashboard Home + Daily Checklist + Customers
  return (
    <View style={styles.appContainer}>
      {/* Top Header Bar for secondary tabs (Daily & Customers) */}
      {vendorTab !== 'HOME' && (
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.topHeader}>
            <View style={styles.brandRow}>
              <Image 
                source={require('./assets/logo.png')} 
                style={styles.brandLogoImg} 
                resizeMode="contain" 
              />
              <View>
                <Text style={styles.brandTitle}>Milk Hisab</Text>
                <Text style={styles.brandSub}>
                  {auth.user?.business_name || auth.user?.name || (lang === 'hi' ? 'डेयरी प्रबंधन' : 'Dairy Vendor')}
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity onPress={toggleLang} style={styles.langBtn} activeOpacity={0.8}>
                <Text style={styles.langBtnText}>{lang === 'hi' ? 'EN' : 'हिन्दी'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.8}>
                <Text style={styles.logoutBtnText}>
                  {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      )}

      {/* Main Screen Content */}
      <View style={styles.screenContent}>
        {vendorTab === 'HOME' && (
          <NetflixDashboardHomeScreen 
            onNavigateTab={(tab) => {
              if (tab === 'CUSTOMERS') setVendorTab('CUSTOMERS');
              else setVendorTab('DAILY');
            }} 
          />
        )}
        {vendorTab === 'DAILY' && <DailyChecklistScreen />}
        {vendorTab === 'CUSTOMERS' && <CustomersScreen />}
      </View>

      {/* Netflix-Style Bottom Navigation Tab Bar (Dark Navy #0F172A) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => setVendorTab('HOME')}
          style={[styles.navTab, vendorTab === 'HOME' && styles.navTabActive]}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>🎬</Text>
          <Text style={[styles.navLabel, vendorTab === 'HOME' && styles.navLabelActive]}>
            {lang === 'hi' ? 'होम' : 'Dashboard'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setVendorTab('DAILY')}
          style={[styles.navTab, vendorTab === 'DAILY' && styles.navTabActive]}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={[styles.navLabel, vendorTab === 'DAILY' && styles.navLabelActive]}>
            {lang === 'hi' ? 'दैनिक बहीखाता' : 'Daily Logs'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setVendorTab('CUSTOMERS')}
          style={[styles.navTab, vendorTab === 'CUSTOMERS' && styles.navTabActive]}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>👥</Text>
          <Text style={[styles.navLabel, vendorTab === 'CUSTOMERS' && styles.navLabelActive]}>
            {lang === 'hi' ? 'ग्राहक' : 'Customers'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  appContainer: {
    flex: 1,
    backgroundColor: '#090D16', // Deep Midnight
  },
  headerSafeArea: {
    backgroundColor: '#0F172A',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogoImg: {
    width: 120,
    height: 32,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  brandSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  logoutBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FB7185',
  },
  screenContent: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#0F172A', // Dark Navy Footer
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  navTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  navTabActive: {
    borderTopWidth: 2,
    borderTopColor: '#2563EB', // Dairy Blue Active Indicator
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#38BDF8',
    fontWeight: '900',
  },
});
