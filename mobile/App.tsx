import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Image 
} from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import WelcomeSplashScreen from './src/screens/WelcomeSplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import NetflixDashboardHomeScreen from './src/screens/NetflixDashboardHomeScreen';
import DailyChecklistScreen from './src/screens/vendor/DailyChecklistScreen';
import CustomersScreen from './src/screens/vendor/CustomersScreen';
import CustomerPortalScreen from './src/screens/customer/CustomerPortalScreen';

function MainNavigator() {
  const { auth, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();

  // Splash Screen State: Shows central Milkman logo with watermarks for 1.5 seconds
  const [isSplash, setIsSplash] = useState(true);

  // Navigation State for Vendor Tabs: 'HOME' | 'DAILY' | 'CUSTOMERS'
  const [vendorTab, setVendorTab] = useState<'HOME' | 'DAILY' | 'CUSTOMERS'>('HOME');

  // Navigation State for Customer Tabs: 'HOME' | 'PORTAL'
  const [customerTab, setCustomerTab] = useState<'HOME' | 'PORTAL'>('HOME');

  // 1. Initial 1.5-second cinematic Splash Screen
  if (isSplash) {
    return <WelcomeSplashScreen onFinish={() => setIsSplash(false)} />;
  }

  // 2. Not Authenticated: Centered Auth Card with Milk Watermarks
  if (!auth.token || !auth.role) {
    return <AuthScreen />;
  }

  // 3. Customer Role: Dashboard + Full Monthly Ledger
  if (auth.role === 'customer') {
    return (
      <SafeAreaView style={styles.appContainer}>
        <View style={styles.screenContent}>
          {customerTab === 'HOME' ? (
            <NetflixDashboardHomeScreen 
              onNavigateTab={(tab) => setCustomerTab(tab === 'PORTAL' ? 'PORTAL' : 'HOME')} 
            />
          ) : (
            <CustomerPortalScreen />
          )}
        </View>

        {/* Clean White Bottom Navigation Bar with Deep Dairy Blue #1E3A8A Active Tabs */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => setCustomerTab('HOME')}
            style={[styles.navTab, customerTab === 'HOME' && styles.navTabActive]}
            activeOpacity={0.8}
          >
            <Text style={styles.navIcon}>🎬</Text>
            <Text style={[styles.navLabel, customerTab === 'HOME' && styles.navLabelActive]}>
              {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
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
      </SafeAreaView>
    );
  }

  // 4. Vendor Role: Dashboard + Daily Logs + Customers
  return (
    <SafeAreaView style={styles.appContainer}>
      {/* Top Header Bar for secondary tabs (Daily & Customers) */}
      {vendorTab !== 'HOME' && (
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <Image 
              source={require('./assets/icon.png')} 
              style={styles.headerBrandIcon} 
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

      {/* Clean White Bottom Navigation Bar with Deep Dairy Blue (#1E3A8A) Active Tabs */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => setVendorTab('HOME')}
          style={[styles.navTab, vendorTab === 'HOME' && styles.navTabActive]}
          activeOpacity={0.8}
        >
          <Text style={styles.navIcon}>🎬</Text>
          <Text style={[styles.navLabel, vendorTab === 'HOME' && styles.navLabelActive]}>
            {lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
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
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <MainNavigator />
      </AuthProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid Pure White Safe Area to fix iPhone Notch issues
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBrandIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  brandSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  logoutBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  screenContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // CLEAN WHITE BOTTOM NAV WITH DEEP DAIRY BLUE (#1E3A8A) ACTIVE TABS
  bottomNav: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF', // Clean White Background
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  navTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  navTabActive: {
    borderTopWidth: 2.5,
    borderTopColor: '#1E3A8A', // Deep Dairy Blue Indicator
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#1E3A8A', // Deep Dairy Blue Active Label
    fontWeight: '900',
  },
});
