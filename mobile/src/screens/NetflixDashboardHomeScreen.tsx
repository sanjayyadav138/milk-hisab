import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Image, Dimensions, Platform, Modal, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import VoiceAssistantModal from '../components/VoiceAssistantModal';

const { width } = Dimensions.get('window');

interface NetflixDashboardHomeScreenProps {
  onNavigateTab?: (tab: 'DAILY' | 'CUSTOMERS' | 'PORTAL') => void;
}

export default function NetflixDashboardHomeScreen({ onNavigateTab }: NetflixDashboardHomeScreenProps) {
  const { auth, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();

  // Profile Dropdown Modal State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  // Voice Assistant Modal State
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  // Quick Skip Modal State
  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [selectedSkipDate, setSelectedSkipDate] = useState('Tomorrow (30 Oct)');

  // Quick Action Notification
  const handleQuickAction = (actionTitle: string, actionDesc: string) => {
    Alert.alert(actionTitle, actionDesc, [{ text: 'OK' }]);
  };

  const isVendor = auth.role === 'vendor';
  const userName = auth.user?.business_name || auth.user?.name || (lang === 'hi' ? 'डेयरी संचालक' : 'Dairy Vendor');
  const userPhone = auth.user?.phone || '9876543210';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* TOP HEADER: Milk Hisab Logo on Left, User Profile Avatar on Right */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.headerLogo} 
            resizeMode="contain" 
          />
        </View>

        <View style={styles.headerRight}>
          {/* 1-Tap Language Toggle */}
          <TouchableOpacity onPress={toggleLang} style={styles.langBadge} activeOpacity={0.8}>
            <Text style={styles.langBadgeText}>
              🌐 {lang === 'hi' ? 'EN' : 'हिन्दी'}
            </Text>
          </TouchableOpacity>

          {/* Profile Avatar Dropdown Trigger */}
          <TouchableOpacity 
            onPress={() => setProfileModalVisible(true)} 
            style={styles.profileAvatarBtn}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN STREAMING DASHBOARD SCROLL VIEW */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ========================================================
            HERO FEATURED BANNER (Cinematic Netflix "Hero Movie" Style)
            ======================================================== */}
        <View style={styles.heroCardContainer}>
          <Image 
            source={require('../../assets/media/banner-image1.png')} 
            style={styles.heroCardImage}
            resizeMode="cover"
          />

          {/* Dark Navy Cinematic Gradient Overlay */}
          <LinearGradient
            colors={[
              'rgba(15, 23, 42, 0.25)',
              'rgba(15, 23, 42, 0.70)',
              '#090D16'
            ]}
            locations={[0, 0.55, 1.0]}
            style={StyleSheet.absoluteFill}
          />

          {/* Hero Content Overlay */}
          <View style={styles.heroContent}>
            {/* Live Status Chip */}
            <View style={styles.heroTopRow}>
              <View style={styles.liveChip}>
                <View style={styles.livePulseDot} />
                <Text style={styles.liveChipText}>
                  {lang === 'hi' ? 'आज का लाइव हिसाब' : "TODAY'S LIVE SUMMARY"}
                </Text>
              </View>

              <View style={styles.statusBadgeGreen}>
                <Text style={styles.statusBadgeGreenText}>
                  ● {lang === 'hi' ? 'सक्रिय व सुरक्षित' : 'Settled & Verified'}
                </Text>
              </View>
            </View>

            {/* Key Delivery Headline */}
            <Text style={styles.heroHeadline}>
              {isVendor
                ? (lang === 'hi' ? 'आज 48.5L दूध वितरण पूरा' : "Today's Delivery: 48.5L Distributed")
                : (lang === 'hi' ? 'आज का दूध: 1.5L प्राप्त' : "Today's Delivery: 1.5L Delivered")}
            </Text>

            <Text style={styles.heroSubHeadline}>
              {isVendor 
                ? (lang === 'hi' ? '24 परिवारों में वितरण संपन्न • कुल संकलन: ₹3,880 • 0 विवाद' : '24 Homes Delivered • Total Billed: ₹3,880 • 0 Disputes')
                : (lang === 'hi' ? 'शुद्ध देसी गाय का दूध (A2 Gir) • सुबह की शिफ्ट • स्थिति: चुकता' : 'Pure Cow Milk (A2 Gir) • Morning Shift • Status: Settled')}
            </Text>

            {/* Hero Interactive Action Buttons (Dairy Blue & Sleek Translucent) */}
            <View style={styles.heroButtonsRow}>
              <TouchableOpacity 
                onPress={() => onNavigateTab ? onNavigateTab('DAILY') : handleQuickAction(
                  lang === 'hi' ? 'दैनिक एंट्री' : 'Daily Entry',
                  lang === 'hi' ? 'दैनिक बहीखाता सूची खुल रही है...' : 'Opening daily delivery checklist...'
                )}
                style={styles.heroPrimaryBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.heroPrimaryBtnText}>
                  ▶ {lang === 'hi' ? 'तुरंत दूध एंट्री करें' : 'Log Delivery Entry'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setVoiceModalVisible(true)}
                style={styles.heroSecondaryBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.heroSecondaryBtnText}>
                  🎙️ {lang === 'hi' ? 'आवाज़ से भरें' : 'Voice AI'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ========================================================
            ROW 1: QUICK ACTIONS (Netflix "Top Picks" Horizontal Row)
            ======================================================== */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {lang === 'hi' ? '⚡ त्वरित सुविधाएं' : '⚡ Quick Actions'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {lang === 'hi' ? '1-क्लिक आसान कार्य' : 'Tap for instant operations'}
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
          >
            {/* Quick Action 1: Log Daily Entry */}
            <TouchableOpacity 
              onPress={() => onNavigateTab ? onNavigateTab('DAILY') : handleQuickAction(
                lang === 'hi' ? 'दैनिक एंट्री' : 'Daily Entry',
                lang === 'hi' ? 'दैनिक दूध एंट्री स्क्रीन पर जा रहे हैं' : 'Navigating to daily checklist'
              )}
              style={[styles.quickActionCard, { borderColor: '#2563EB' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(37, 99, 235, 0.2)' }]}>
                <Text style={styles.actionIconText}>📝</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'दूध एंट्री भरें' : 'Log Daily Entry'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? '10 सेकंड में हिसाब' : 'Record today milk'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 2: Voice AI Assistant */}
            <TouchableOpacity 
              onPress={() => setVoiceModalVisible(true)}
              style={[styles.quickActionCard, { borderColor: '#38BDF8' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                <Text style={styles.actionIconText}>🎙️</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'बोलकर भरें' : 'Voice Assistant'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? 'देसी आवाज़ से एंट्री' : 'Hands-free logging'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 3: Skip Delivery */}
            <TouchableOpacity 
              onPress={() => setSkipModalVisible(true)}
              style={[styles.quickActionCard, { borderColor: '#F59E0B' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Text style={styles.actionIconText}>⏸️</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'छुट्टी दर्ज करें' : 'Skip Delivery'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? 'कल का दूध रोकें' : 'Pause for date'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 4: Direct WhatsApp Chat */}
            <TouchableOpacity 
              onPress={() => handleQuickAction(
                lang === 'hi' ? 'WhatsApp संदेश' : 'Direct WhatsApp',
                lang === 'hi' ? 'दैनिक बहीखाता पर्ची WhatsApp पर भेजी जा रही है...' : 'Dispatching daily milk slip to WhatsApp...'
              )}
              style={[styles.quickActionCard, { borderColor: '#10B981' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Text style={styles.actionIconText}>💬</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'WhatsApp पर्ची' : 'WhatsApp Slip'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? '1-क्लिक शेयर करें' : 'Instant balance bill'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 5: Raise Query */}
            <TouchableOpacity 
              onPress={() => handleQuickAction(
                lang === 'hi' ? 'आपत्ति दर्ज' : 'Raise Query',
                lang === 'hi' ? 'दूध की मात्रा या हिसाब से जुड़ी आपत्ति दर्ज करें। 0 विवाद नीति।' : 'Log a ledger inquiry. 0-dispute transparent audit.'
              )}
              style={[styles.quickActionCard, { borderColor: '#F43F5E' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(244, 63, 94, 0.2)' }]}>
                <Text style={styles.actionIconText}>⚖️</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'आपत्ति दर्ज करें' : 'Raise Query'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? '0 विवाद गारंटी' : 'Dispute resolution'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 6: Manage Customers */}
            {isVendor && (
              <TouchableOpacity 
                onPress={() => onNavigateTab ? onNavigateTab('CUSTOMERS') : null}
                style={[styles.quickActionCard, { borderColor: '#8B5CF6' }]}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                  <Text style={styles.actionIconText}>👥</Text>
                </View>
                <Text style={styles.actionTitle}>
                  {lang === 'hi' ? 'ग्राहक सूची' : 'Customer List'}
                </Text>
                <Text style={styles.actionDesc}>
                  {lang === 'hi' ? 'संपर्क व रेट कार्ड' : 'Rates & balances'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* =================================================================
            ROW 2: RECENT DELIVERIES & LEDGERS (Netflix "Continue Watching" Row)
            ================================================================= */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {lang === 'hi' ? '🥛 हालिया दूध डिलीवरी व बहीखाता' : '🥛 Recent Deliveries & Ledgers'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {lang === 'hi' ? 'दैनिक दूध मात्रा व भुगतान स्थिति' : 'Daily quantities & settlement status'}
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
          >
            {/* Delivery Card 1: Today */}
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryTopRow}>
                <Text style={styles.deliveryDate}>
                  {lang === 'hi' ? 'आज, 29 अक्टूबर' : 'Today, 29 Oct'}
                </Text>
                <View style={styles.shiftTag}>
                  <Text style={styles.shiftTagText}>🌅 {lang === 'hi' ? 'सुबह' : 'Morning'}</Text>
                </View>
              </View>

              <View style={styles.qtyRow}>
                <Text style={styles.qtyHeroText}>1.5</Text>
                <Text style={styles.qtyUnitText}>Litre</Text>
              </View>

              <Text style={styles.rateDetailText}>
                {lang === 'hi' ? 'गाय का दूध @ ₹60/L • ₹90.00' : 'Cow Milk @ ₹60/L • ₹90.00'}
              </Text>

              <View style={styles.deliveryBadgeRow}>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>
                    ✓ {lang === 'hi' ? 'प्राप्त व चुकता' : 'Settled & Verified'}
                  </Text>
                </View>
              </View>

              {/* Netflix-style Progress Bar at bottom (Dairy Blue) */}
              <View style={styles.cardProgressBarTrack}>
                <View style={[styles.cardProgressBarFill, { width: '100%', backgroundColor: '#10B981' }]} />
              </View>
            </View>

            {/* Delivery Card 2: Yesterday */}
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryTopRow}>
                <Text style={styles.deliveryDate}>
                  {lang === 'hi' ? 'कल, 28 अक्टूबर' : 'Yesterday, 28 Oct'}
                </Text>
                <View style={styles.shiftTag}>
                  <Text style={styles.shiftTagText}>🌅 {lang === 'hi' ? 'सुबह' : 'Morning'}</Text>
                </View>
              </View>

              <View style={styles.qtyRow}>
                <Text style={styles.qtyHeroText}>1.5</Text>
                <Text style={styles.qtyUnitText}>Litre</Text>
              </View>

              <Text style={styles.rateDetailText}>
                {lang === 'hi' ? 'गाय का दूध @ ₹60/L • ₹90.00' : 'Cow Milk @ ₹60/L • ₹90.00'}
              </Text>

              <View style={styles.deliveryBadgeRow}>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>
                    ✓ {lang === 'hi' ? 'प्राप्त व चुकता' : 'Settled & Verified'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardProgressBarTrack}>
                <View style={[styles.cardProgressBarFill, { width: '100%', backgroundColor: '#10B981' }]} />
              </View>
            </View>

            {/* Delivery Card 3: 27 Oct (Evening - Amber Pending) */}
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryTopRow}>
                <Text style={styles.deliveryDate}>
                  {lang === 'hi' ? '27 अक्टूबर' : '27 Oct 2026'}
                </Text>
                <View style={styles.shiftTag}>
                  <Text style={styles.shiftTagText}>🌆 {lang === 'hi' ? 'शाम' : 'Evening'}</Text>
                </View>
              </View>

              <View style={styles.qtyRow}>
                <Text style={styles.qtyHeroText}>2.0</Text>
                <Text style={styles.qtyUnitText}>Litre</Text>
              </View>

              <Text style={styles.rateDetailText}>
                {lang === 'hi' ? 'भैंस का दूध @ ₹70/L • ₹140.00' : 'Buffalo Milk @ ₹70/L • ₹140.00'}
              </Text>

              <View style={styles.deliveryBadgeRow}>
                <View style={styles.badgeAmber}>
                  <Text style={styles.badgeAmberText}>
                    ⏳ {lang === 'hi' ? 'माह अंत में देय' : 'Pending in Monthly Bill'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardProgressBarTrack}>
                <View style={[styles.cardProgressBarFill, { width: '65%', backgroundColor: '#F59E0B' }]} />
              </View>
            </View>

            {/* Delivery Card 4: 26 Oct (Skipped) */}
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryTopRow}>
                <Text style={styles.deliveryDate}>
                  {lang === 'hi' ? '26 अक्टूबर' : '26 Oct 2026'}
                </Text>
                <View style={styles.shiftTag}>
                  <Text style={styles.shiftTagText}>⏸️ {lang === 'hi' ? 'छुट्टी' : 'Skipped'}</Text>
                </View>
              </View>

              <View style={styles.qtyRow}>
                <Text style={[styles.qtyHeroText, { color: '#64748B' }]}>0.0</Text>
                <Text style={styles.qtyUnitText}>Litre</Text>
              </View>

              <Text style={styles.rateDetailText}>
                {lang === 'hi' ? 'ग्राहक द्वारा पूर्व सूचित अवकाश • ₹0' : 'Pre-notified leave • ₹0.00'}
              </Text>

              <View style={styles.deliveryBadgeRow}>
                <View style={styles.badgeMuted}>
                  <Text style={styles.badgeMutedText}>
                    ⏸️ {lang === 'hi' ? 'कोई शुल्क नहीं' : 'No Charge Recorded'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardProgressBarTrack}>
                <View style={[styles.cardProgressBarFill, { width: '0%', backgroundColor: '#64748B' }]} />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* =================================================================
            ROW 3: MONTHLY BILLS & PAYMENTS (Netflix "Trending Now" Row)
            ================================================================= */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {lang === 'hi' ? '💳 मासिक बिल व भुगतान' : '💳 Monthly Bills & Payments'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {lang === 'hi' ? 'चलती मासिक शेष राशि व देय तारीखें' : 'Running balances & upcoming due dates'}
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
          >
            {/* Bill Card 1: Current Month Running */}
            <View style={styles.billCard}>
              <View style={styles.billHeader}>
                <Text style={styles.billMonthTitle}>
                  {lang === 'hi' ? 'अक्टूबर 2026 (चालू माह)' : 'October 2026 (Current)'}
                </Text>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>
                    {lang === 'hi' ? 'चुकता' : 'All Clear'}
                  </Text>
                </View>
              </View>

              <View style={styles.billMetricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'कुल दूध' : 'Total Milk'}</Text>
                  <Text style={styles.metricValue}>45.0 L</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'कुल बिल' : 'Total Bill'}</Text>
                  <Text style={styles.metricValue}>₹2,700</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'बाकी राशि' : 'Balance'}</Text>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>₹0</Text>
                </View>
              </View>

              <View style={styles.billFooterRow}>
                <Text style={styles.billDueText}>
                  📅 {lang === 'hi' ? 'बिल चक्र: 01 - 31 अक्टूबर' : 'Cycle: 01 Oct - 31 Oct'}
                </Text>

                <TouchableOpacity 
                  onPress={() => handleQuickAction(
                    lang === 'hi' ? 'मासिक पर्ची' : 'Monthly Slip',
                    lang === 'hi' ? 'अक्टूबर माह का सत्यापित हिसाब पत्र तैयार है।' : 'October verified monthly slip is ready for download.'
                  )}
                  style={styles.billActionBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.billActionBtnText}>
                    📲 {lang === 'hi' ? 'WhatsApp पर्ची' : 'Share Bill'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bill Card 2: Pending Dues Alert */}
            <View style={[styles.billCard, { borderColor: '#F59E0B' }]}>
              <View style={styles.billHeader}>
                <Text style={styles.billMonthTitle}>
                  {lang === 'hi' ? 'पुराना बकाया हिसाब' : 'Pending Ledger Balance'}
                </Text>
                <View style={styles.badgeAmber}>
                  <Text style={styles.badgeAmberText}>
                    {lang === 'hi' ? 'देय 3 दिन में' : 'Due in 3 Days'}
                  </Text>
                </View>
              </View>

              <View style={styles.billMetricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'बकाया दूध' : 'Dues Qty'}</Text>
                  <Text style={styles.metricValue}>14.0 L</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'देय राशि' : 'Due Amount'}</Text>
                  <Text style={[styles.metricValue, { color: '#F59E0B' }]}>₹850</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'अंतिम तिथि' : 'Due Date'}</Text>
                  <Text style={styles.metricValue}>01 Nov</Text>
                </View>
              </View>

              <View style={styles.billFooterRow}>
                <Text style={styles.billDueText}>
                  ⚠️ {lang === 'hi' ? 'कृपया समय पर भुगतान करें' : 'Zero interest on UPI payment'}
                </Text>

                <TouchableOpacity 
                  onPress={() => handleQuickAction(
                    lang === 'hi' ? 'UPI भुगतान' : 'UPI Payment',
                    lang === 'hi' ? '₹850 के लिए UPI QR कोड लोड हो रहा है...' : 'Opening direct UPI app for ₹850 settlement...'
                  )}
                  style={[styles.billActionBtn, { backgroundColor: '#F59E0B' }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.billActionBtnText, { color: '#090D16' }]}>
                    ⚡ {lang === 'hi' ? 'UPI से भरें' : 'Pay via UPI'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bill Card 3: September Completed */}
            <View style={styles.billCard}>
              <View style={styles.billHeader}>
                <Text style={styles.billMonthTitle}>
                  {lang === 'hi' ? 'सितम्बर 2026 (सफल)' : 'September 2026'}
                </Text>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>
                    ✓ {lang === 'hi' ? 'सत्यापित चुकता' : 'Paid in Full'}
                  </Text>
                </View>
              </View>

              <View style={styles.billMetricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'कुल दूध' : 'Total Milk'}</Text>
                  <Text style={styles.metricValue}>46.5 L</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'भुगतान किया' : 'Amount Paid'}</Text>
                  <Text style={[styles.metricValue, { color: '#10B981' }]}>₹2,790</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'माध्यम' : 'Method'}</Text>
                  <Text style={styles.metricValue}>GPay UPI</Text>
                </View>
              </View>

              <View style={styles.billFooterRow}>
                <Text style={styles.billDueText}>
                  ✓ {lang === 'hi' ? '02 अक्टूबर को पूर्ण भुगतान' : 'Settled on 02 Oct 2026'}
                </Text>

                <TouchableOpacity 
                  onPress={() => handleQuickAction(
                    lang === 'hi' ? 'रसीद देखें' : 'Receipt Slip',
                    lang === 'hi' ? 'सितम्बर 2026 की डिजिटल रसीद PDF खुल रही है।' : 'Viewing September 2026 verified receipt slip.'
                  )}
                  style={styles.billActionBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.billActionBtnText}>
                    🧾 {lang === 'hi' ? 'रसीद देखें' : 'View Slip'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* TRUST BADGE FOOTER */}
        <View style={styles.footerBrandBox}>
          <Text style={styles.footerBrandTitle}>
            🥛 Milk Hisab Cloud Engine
          </Text>
          <Text style={styles.footerBrandDesc}>
            {lang === 'hi' 
              ? 'दूध वितरण, दैनिक बहीखाता व पारदर्शी बिलिंग का आधुनिक मंच' 
              : 'Cinematic dairy ledger, automated daily delivery & instant billing platform'}
          </Text>
        </View>
      </ScrollView>

      {/* ========================================================
          USER PROFILE & SETTINGS MODAL (Triggered from Avatar)
          ======================================================== */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setProfileModalVisible(false)}
        >
          <View style={styles.profileModalCard}>
            <View style={styles.modalProfileHeader}>
              <View style={styles.modalAvatarCircle}>
                <Text style={styles.modalAvatarInitials}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.modalProfileInfo}>
                <Text style={styles.modalUserName}>{userName}</Text>
                <Text style={styles.modalUserRole}>
                  {isVendor ? '🥛 ' + (lang === 'hi' ? 'डेयरी विक्रेता (Vendor)' : 'Dairy Vendor') : '🏠 ' + (lang === 'hi' ? 'सत्यापित ग्राहक (Customer)' : 'Verified Customer')}
                </Text>
                <Text style={styles.modalUserPhone}>📞 {userPhone}</Text>
              </View>
            </View>

            <View style={styles.modalDivider} />

            {/* Menu Options */}
            <TouchableOpacity 
              onPress={() => {
                setProfileModalVisible(false);
                toggleLang();
              }}
              style={styles.modalMenuItem}
            >
              <Text style={styles.modalMenuIcon}>🌐</Text>
              <View style={styles.modalMenuTextWrap}>
                <Text style={styles.modalMenuTitle}>
                  {lang === 'hi' ? 'भाषा बदलें (Switch Language)' : 'Switch Language'}
                </Text>
                <Text style={styles.modalMenuSub}>
                  {lang === 'hi' ? 'वर्तमान: हिन्दी → English' : 'Current: English → हिन्दी'}
                </Text>
              </View>
            </TouchableOpacity>

            {isVendor && onNavigateTab && (
              <TouchableOpacity 
                onPress={() => {
                  setProfileModalVisible(false);
                  onNavigateTab('CUSTOMERS');
                }}
                style={styles.modalMenuItem}
              >
                <Text style={styles.modalMenuIcon}>👥</Text>
                <View style={styles.modalMenuTextWrap}>
                  <Text style={styles.modalMenuTitle}>
                    {lang === 'hi' ? 'ग्राहक प्रबंधन' : 'Customer Ledger Management'}
                  </Text>
                  <Text style={styles.modalMenuSub}>
                    {lang === 'hi' ? 'ग्राहकों की सूची व मासिक रेट' : 'View all customers & monthly rates'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              onPress={() => {
                setProfileModalVisible(false);
                logout();
              }}
              style={[styles.modalMenuItem, styles.modalLogoutItem]}
            >
              <Text style={styles.modalMenuIcon}>🚪</Text>
              <View style={styles.modalMenuTextWrap}>
                <Text style={[styles.modalMenuTitle, { color: '#F43F5E' }]}>
                  {lang === 'hi' ? 'लॉगआउट करें (Sign Out)' : 'Sign Out'}
                </Text>
                <Text style={styles.modalMenuSub}>
                  {lang === 'hi' ? 'खाते से सुरक्षित बाहर निकलें' : 'Safely exit current session'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setProfileModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================
          QUICK SKIP MODAL (Triggered from Quick Action)
          ======================================================== */}
      <Modal
        visible={skipModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSkipModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.skipModalCard}>
            <Text style={styles.skipModalTitle}>
              ⏸️ {lang === 'hi' ? 'दूध डिलीवरी छुट्टी दर्ज करें' : 'Pause / Skip Delivery'}
            </Text>
            <Text style={styles.skipModalDesc}>
              {lang === 'hi' 
                ? 'जिस तारीख को दूध नहीं चाहिए, उसे चुनें। बहीखाते में ₹0 और छुट्टी दर्ज होगी।' 
                : 'Select the date to pause milk. Your ledger will automatically record ₹0 and zero dispute.'}
            </Text>

            <View style={styles.skipOptionsRow}>
              {['Tomorrow (30 Oct)', 'Day After (31 Oct)', '1 Nov'].map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setSelectedSkipDate(d)}
                  style={[
                    styles.skipOptionPill,
                    selectedSkipDate === d && styles.skipOptionPillActive
                  ]}
                >
                  <Text style={[
                    styles.skipOptionPillText,
                    selectedSkipDate === d && styles.skipOptionPillTextActive
                  ]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.skipModalActions}>
              <TouchableOpacity 
                onPress={() => setSkipModalVisible(false)} 
                style={styles.skipCancelBtn}
              >
                <Text style={styles.skipCancelBtnText}>
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  setSkipModalVisible(false);
                  Alert.alert(
                    lang === 'hi' ? 'छुट्टी दर्ज हो गई' : 'Delivery Paused',
                    lang === 'hi' 
                      ? `${selectedSkipDate} के लिए दूध छुट्टी दर्ज कर दी गई है।`
                      : `Milk delivery has been paused for ${selectedSkipDate}.`
                  );
                }} 
                style={styles.skipConfirmBtn}
              >
                <Text style={styles.skipConfirmBtnText}>
                  ✓ {lang === 'hi' ? 'छुट्टी पक्की करें' : 'Confirm Skip'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* VOICE ASSISTANT MODAL */}
      <VoiceAssistantModal 
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
        onApplyCommand={(cmd) => {
          Alert.alert(
            lang === 'hi' ? 'आवाज़ से एंट्री दर्ज' : 'Voice Command Applied',
            lang === 'hi' 
              ? `आवाज़ पहचान: "${cmd.raw_text}" -> ${cmd.action}` 
              : `Voice parsed: "${cmd.raw_text}" -> ${cmd.action}`
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16', // Deep Midnight
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 16,
    paddingBottom: 12,
    backgroundColor: '#0F172A', // Dark Navy Header
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 135,
    height: 38,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  langBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  profileAvatarBtn: {
    position: 'relative',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB', // Dairy Blue
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981', // Ledger Green
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  // HERO CARD
  heroCardContainer: {
    marginHorizontal: 14,
    marginTop: 14,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.6)',
  },
  heroCardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.5)',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveChipText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusBadgeGreenText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  heroHeadline: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubHeadline: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  heroPrimaryBtn: {
    flex: 1,
    backgroundColor: '#2563EB', // Dairy Blue
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  heroPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSecondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  // SECTIONS & ROWS
  sectionRow: {
    marginTop: 22,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  horizontalListPadding: {
    paddingHorizontal: 14,
    gap: 12,
  },
  // QUICK ACTIONS CARDS (ROW 1)
  quickActionCard: {
    width: 135,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconText: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 13,
  },
  // RECENT DELIVERIES CARDS (ROW 2)
  deliveryCard: {
    width: 200,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.7)',
    position: 'relative',
    overflow: 'hidden',
  },
  deliveryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  shiftTag: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shiftTagText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  qtyHeroText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  qtyUnitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
  },
  rateDetailText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  deliveryBadgeRow: {
    marginBottom: 6,
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeGreenText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeAmberText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeMuted: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeMutedText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  cardProgressBarTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0F172A',
  },
  cardProgressBarFill: {
    height: '100%',
  },
  // MONTHLY BILL CARDS (ROW 3)
  billCard: {
    width: 250,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.7)',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  billMonthTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  billMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
  },
  billFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billDueText: {
    fontSize: 10,
    color: '#94A3B8',
    maxWidth: 120,
  },
  billActionBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  billActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  // FOOTER
  footerBrandBox: {
    marginTop: 28,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerBrandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  footerBrandDesc: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 15,
  },
  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  modalProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  modalAvatarInitials: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalProfileInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalUserRole: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 2,
  },
  modalUserPhone: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  modalMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  modalLogoutItem: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  modalMenuIcon: {
    fontSize: 20,
  },
  modalMenuTextWrap: {
    flex: 1,
  },
  modalMenuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalMenuSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  modalCloseBtn: {
    marginTop: 14,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalCloseBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  // SKIP MODAL
  skipModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  skipModalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  skipModalDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 16,
  },
  skipOptionsRow: {
    gap: 8,
    marginBottom: 20,
  },
  skipOptionPill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  skipOptionPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
  },
  skipOptionPillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  skipOptionPillTextActive: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  skipModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  skipCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  skipCancelBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  skipConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
  },
  skipConfirmBtnText: {
    color: '#090D16',
    fontSize: 13,
    fontWeight: '900',
  },
});
