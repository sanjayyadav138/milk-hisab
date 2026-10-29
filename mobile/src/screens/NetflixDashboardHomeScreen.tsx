import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Image, Dimensions, Platform, Modal, Alert, TextInput, SafeAreaView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import VoiceAssistantModal from '../components/VoiceAssistantModal';
import ProfileModal from '../components/ProfileModal';

const { width } = Dimensions.get('window');

interface NetflixDashboardHomeScreenProps {
  onNavigateTab?: (tab: 'DAILY' | 'CUSTOMERS' | 'PORTAL') => void;
}

export default function NetflixDashboardHomeScreen({ onNavigateTab }: NetflixDashboardHomeScreenProps) {
  const { auth, logout } = useAuth();
  const { lang, toggleLang } = useLanguage();

  // Modals State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  // Skip Delivery State
  const [selectedSkipDate, setSelectedSkipDate] = useState('Tomorrow (30 Oct)');
  const [skipReason, setSkipReason] = useState('');

  // Dispute Management State
  const [activeDispute, setActiveDispute] = useState<{
    id: number;
    customerName: string;
    date: string;
    loggedQty: number;
    claimedQty: number;
    reason: string;
    status: 'Pending' | 'Resolved';
  }>({
    id: 101,
    customerName: 'राजेश शर्मा (House 12)',
    date: '28 Oct 2026',
    loggedQty: 2.0,
    claimedQty: 1.5,
    reason: 'गलती से 2L लिखा गया, जबकि कल 1.5L ही लिया था।',
    status: 'Pending',
  });

  // Direct Messaging / Chat State
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    sender: 'vendor' | 'customer';
    senderName: string;
    text: string;
    time: string;
  }>>([
    {
      id: 1,
      sender: 'customer',
      senderName: 'राजेश शर्मा',
      text: 'नमस्ते यादव जी, कल सुबह 1.5L गाय का दूध चाहिए।',
      time: '07:30 AM',
    },
    {
      id: 2,
      sender: 'vendor',
      senderName: 'कृष्णा डेयरी (यादव जी)',
      text: 'नमस्ते शर्मा जी! 1.5L नोट कर लिया है, सुबह 6:30 बजे मिल जाएगा।',
      time: '07:45 AM',
    },
  ]);
  const [newChatText, setNewChatText] = useState('');

  const isVendor = auth.role === 'vendor';
  const userName = isVendor 
    ? (auth.user?.business_name || auth.user?.name || (lang === 'hi' ? 'श्री कृष्णा डेयरी फार्म' : 'Krishna Dairy Farm'))
    : (auth.customer?.name || (lang === 'hi' ? 'राजेश शर्मा' : 'Rajesh Sharma'));

  // Handle Delivery Pause / Skip Selection (Strict Same-Day Block)
  const handleSelectSkipDate = (dateLabel: string) => {
    setSelectedSkipDate(dateLabel);
    if (dateLabel.toLowerCase().includes('today') || dateLabel.includes('आज')) {
      Alert.alert(
        lang === 'hi' ? '🚫 आज की छुट्टी संभव नहीं' : '🚫 Same-Day Cancellation Blocked',
        lang === 'hi'
          ? 'आज की डिलीवरी की सप्लाई व वितरण शुरू हो चुका है। दूध का नुकसान रोकने हेतु आज की छुट्टी ऐप से नहीं हो सकती। कृपया सीधे दूधिया से संपर्क करें।'
          : 'Same-day cancellation is blocked to avoid dairy waste as deliveries are already in route. Please contact your milkman directly.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleConfirmSkip = () => {
    if (selectedSkipDate.toLowerCase().includes('today') || selectedSkipDate.includes('आज')) {
      Alert.alert(
        lang === 'hi' ? 'अमान्य अनुरोध' : 'Invalid Request',
        lang === 'hi' ? 'आज की तारीख के लिए छुट्टी नहीं दी जा सकती।' : 'Cannot skip for today.'
      );
      return;
    }

    setSkipModalVisible(false);
    Alert.alert(
      lang === 'hi' ? '✓ छुट्टी दर्ज हो गई' : '✓ Milk Delivery Paused',
      lang === 'hi'
        ? `${selectedSkipDate} के लिए दूध छुट्टी दर्ज कर दी गई है। बहीखाते में 0L दर्ज रहेगा।`
        : `Milk delivery has been paused for ${selectedSkipDate}. ₹0 recorded in your ledger.`
    );
  };

  // Handle Dispute Resolution
  const handleResolveDispute = () => {
    setActiveDispute(prev => ({ ...prev, status: 'Resolved', loggedQty: prev.claimedQty }));
    setDisputeModalVisible(false);
    Alert.alert(
      lang === 'hi' ? '✓ आपत्ति का समाधान संपन्न' : '✓ Dispute Resolved',
      lang === 'hi'
        ? 'मात्रा को सुधारकर 1.5L कर दिया गया है। ग्राहक का खाता सत्यापित और शून्य विवाद में है।'
        : 'Quantity adjusted to 1.5L. Customer ledger verified with zero disputes.'
    );
  };

  // Handle Send Direct Chat Message
  const handleSendMessage = () => {
    if (!newChatText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: isVendor ? ('vendor' as const) : ('customer' as const),
      senderName: isVendor ? 'कृष्णा डेयरी' : 'राजेश शर्मा',
      text: newChatText.trim(),
      time: 'अभी (Just now)',
    };

    setChatMessages(prev => [...prev, newMessage]);
    setNewChatText('');
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar style="dark" />

      {/* ========================================================
          GLOBAL HEADER: Solid Pure White, Notch-Safe, Standalone Icon
          ======================================================== */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.headerBrandIcon} 
            resizeMode="contain" 
          />
          <View style={styles.brandTitleWrap}>
            <Text style={styles.brandTitle}>Milk Hisab</Text>
            <Text style={styles.brandSub}>{userName}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* 1-Tap Language Toggle */}
          <TouchableOpacity onPress={toggleLang} style={styles.langPill} activeOpacity={0.8}>
            <Text style={styles.langPillText}>
              🌐 {lang === 'hi' ? 'EN' : 'हिन्दी'}
            </Text>
          </TouchableOpacity>

          {/* Profile Avatar Circle with Online Dot */}
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

      {/* MAIN DASHBOARD SCROLL CONTENT */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ========================================================
            HERO FEATURED BANNER (Cow Pasture Landscape + Strong Dark Overlay)
            ======================================================== */}
        <View style={styles.heroCardContainer}>
          <Image 
            source={require('../../assets/media/banner-image1.png')} 
            style={styles.heroCardImage}
            resizeMode="cover"
          />

          {/* Strong Semi-Transparent Dark Overlay (LinearGradient) for Ultra Sharp Contrast */}
          <LinearGradient
            colors={[
              'rgba(15, 23, 42, 0.40)',
              'rgba(15, 23, 42, 0.75)',
              '#1E3A8A'
            ]}
            locations={[0, 0.50, 1.0]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.heroContent}>
            {/* Top Live Badges */}
            <View style={styles.heroTopRow}>
              <View style={styles.liveChip}>
                <View style={styles.livePulseDot} />
                <Text style={styles.liveChipText}>
                  {lang === 'hi' ? 'आज का लाइव हिसाब' : "TODAY'S LIVE SUMMARY"}
                </Text>
              </View>

              <View style={styles.statusBadgeGreen}>
                <Text style={styles.statusBadgeGreenText}>
                  ● {lang === 'hi' ? 'सक्रिय बहीखाता' : 'Active & Verified'}
                </Text>
              </View>
            </View>

            {/* Role-Based Summary Headline */}
            <Text style={styles.heroHeadline}>
              {isVendor
                ? (lang === 'hi' ? 'आज 48.5L दूध वितरण पूरा' : "Today's Delivery: 48.5L Distributed")
                : (lang === 'hi' ? 'आज का दूध: 1.5L प्राप्त | स्थिति: चुकता' : "Today's Delivery: 1.5L Delivered | Status: Settled")}
            </Text>

            <Text style={styles.heroSubHeadline}>
              {isVendor 
                ? (lang === 'hi' ? '24 परिवार सक्रिय • संकलन: ₹3,880 • 1 आपत्ति समीक्षाधीन' : '24 Homes Delivered • Collected: ₹3,880 • 1 Dispute Pending')
                : (lang === 'hi' ? 'शुद्ध गाय का दूध (A2 Gir) • सुबह 6:45 बजे प्राप्त • ₹90.00' : 'Pure Cow Milk (A2 Gir) • Received at 6:45 AM • ₹90.00')}
            </Text>

            {/* Action Buttons (Strictly Deep Dairy Blue #1E3A8A & Crisp Sky Blue, NO RED) */}
            <View style={styles.heroButtonsRow}>
              <TouchableOpacity 
                onPress={() => onNavigateTab ? onNavigateTab('DAILY') : null}
                style={styles.heroPrimaryBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.heroPrimaryBtnText}>
                  ▶ {isVendor ? (lang === 'hi' ? 'तुरंत दूध एंट्री करें' : 'Log Quick Entry') : (lang === 'hi' ? 'मासिक पर्ची देखें' : 'View Monthly Slip')}
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
            PENDING DISPUTE ALERT (Vendor Notice)
            ======================================================== */}
        {activeDispute.status === 'Pending' && (
          <View style={styles.disputeAlertCard}>
            <View style={styles.disputeAlertLeft}>
              <Text style={styles.disputeAlertIcon}>⚠️</Text>
              <View style={styles.disputeAlertTextWrap}>
                <Text style={styles.disputeAlertTitle}>
                  {lang === 'hi' ? 'आपत्ति सूचना: 1 एंट्री पर समीक्षा आवश्यक' : 'Dispute Alert: 1 Entry Under Review'}
                </Text>
                <Text style={styles.disputeAlertDesc}>
                  {activeDispute.customerName} ({activeDispute.date}): {activeDispute.reason}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setDisputeModalVisible(true)}
              style={styles.disputeResolveBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.disputeResolveBtnText}>
                {isVendor ? (lang === 'hi' ? 'सुलझाएं' : 'Resolve') : (lang === 'hi' ? 'स्थिति' : 'Status')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================
            ROW 1: QUICK ACTIONS (Horizontal Category Scroll)
            ======================================================== */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {lang === 'hi' ? '⚡ त्वरित सुविधाएं (Quick Actions)' : '⚡ Quick Actions'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {lang === 'hi' ? '1-क्लिक आसान दैनिक संचालन' : '1-tap essential operations'}
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
          >
            {/* Quick Action 1: Log Daily Entry */}
            <TouchableOpacity 
              onPress={() => onNavigateTab ? onNavigateTab('DAILY') : null}
              style={[styles.quickActionCard, { borderColor: '#1E3A8A' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(30, 58, 138, 0.12)' }]}>
                <Text style={styles.actionIconText}>📝</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'दूध एंट्री भरें' : 'Log Daily Entry'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? '10 सेकंड में हिसाब' : 'Record milk volume'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 2: Voice AI Assistant */}
            <TouchableOpacity 
              onPress={() => setVoiceModalVisible(true)}
              style={[styles.quickActionCard, { borderColor: '#38BDF8' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Text style={styles.actionIconText}>🎙️</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'बोलकर भरें' : 'Voice Assistant'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? 'देसी आवाज़ से एंट्री' : 'Hands-free voice entry'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 3: Skip Delivery (With Same-Day Block) */}
            <TouchableOpacity 
              onPress={() => setSkipModalVisible(true)}
              style={[styles.quickActionCard, { borderColor: '#F59E0B' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={styles.actionIconText}>⏸️</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'छुट्टी दर्ज करें' : 'Skip Delivery'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? 'भविष्य की तारीखें' : 'Pause future dates'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 4: In-App Direct Chat */}
            <TouchableOpacity 
              onPress={() => setChatModalVisible(true)}
              style={[styles.quickActionCard, { borderColor: '#10B981' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={styles.actionIconText}>💬</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'सीधा संदेश / चैट' : 'Direct Chat'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? 'दूधिया-ग्राहक संवाद' : 'In-app milk notes'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 5: Dispute Center */}
            <TouchableOpacity 
              onPress={() => setDisputeModalVisible(true)}
              style={[styles.quickActionCard, { borderColor: '#F43F5E' }]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
                <Text style={styles.actionIconText}>⚖️</Text>
              </View>
              <Text style={styles.actionTitle}>
                {lang === 'hi' ? 'आपत्ति समाधान' : 'Dispute Center'}
              </Text>
              <Text style={styles.actionDesc}>
                {lang === 'hi' ? '0 विवाद गारंटी' : 'Transparent audit'}
              </Text>
            </TouchableOpacity>

            {/* Quick Action 6: Manage Customers (Vendor Only) */}
            {isVendor && (
              <TouchableOpacity 
                onPress={() => onNavigateTab ? onNavigateTab('CUSTOMERS') : null}
                style={[styles.quickActionCard, { borderColor: '#8B5CF6' }]}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIconBadge, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
                  <Text style={styles.actionIconText}>👥</Text>
                </View>
                <Text style={styles.actionTitle}>
                  {lang === 'hi' ? 'ग्राहक सूची' : 'Customer List'}
                </Text>
                <Text style={styles.actionDesc}>
                  {lang === 'hi' ? '24 परिवार सक्रिय' : 'Rates & balances'}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* =================================================================
            ROW 2: RECENT DELIVERIES & LEDGERS (Horizontal Scroll)
            ================================================================= */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {lang === 'hi' ? '🥛 हालिया दूध डिलीवरी व बहीखाता' : '🥛 Recent Deliveries & Ledgers'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {lang === 'hi' ? 'दैनिक दूध मात्रा व निपटान स्थिति' : 'Daily quantities & settlement status'}
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
          >
            {/* Card 1: Today */}
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

              <View style={styles.badgeGreen}>
                <Text style={styles.badgeGreenText}>
                  ✓ {lang === 'hi' ? 'प्राप्त व चुकता' : 'Settled & Verified'}
                </Text>
              </View>

              <View style={styles.cardProgressBarTrack}>
                <View style={[styles.cardProgressBarFill, { width: '100%', backgroundColor: '#10B981' }]} />
              </View>
            </View>

            {/* Card 2: Yesterday */}
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

              <View style={styles.badgeGreen}>
                <Text style={styles.badgeGreenText}>
                  ✓ {lang === 'hi' ? 'प्राप्त व चुकता' : 'Settled & Verified'}
                </Text>
              </View>

              <View style={styles.cardProgressBarTrack}>
                <View style={[styles.cardProgressBarFill, { width: '100%', backgroundColor: '#10B981' }]} />
              </View>
            </View>

            {/* Card 3: 27 Oct (Evening - Amber Pending) */}
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

              <View style={styles.badgeAmber}>
                <Text style={styles.badgeAmberText}>
                  ⏳ {lang === 'hi' ? 'माह अंत में देय' : 'Pending in Monthly Bill'}
                </Text>
              </View>

              <View style={styles.cardProgressBarTrack}>
                <View style={[styles.cardProgressBarFill, { width: '70%', backgroundColor: '#F59E0B' }]} />
              </View>
            </View>

            {/* Card 4: 26 Oct (Skipped) */}
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
                <Text style={[styles.qtyHeroText, { color: '#94A3B8' }]}>0.0</Text>
                <Text style={styles.qtyUnitText}>Litre</Text>
              </View>

              <Text style={styles.rateDetailText}>
                {lang === 'hi' ? 'पूर्व सूचित अवकाश • ₹0.00' : 'Pre-notified leave • ₹0.00'}
              </Text>

              <View style={styles.badgeMuted}>
                <Text style={styles.badgeMutedText}>
                  ⏸️ {lang === 'hi' ? 'कोई शुल्क नहीं' : 'No Charge Recorded'}
                </Text>
              </View>

              <View style={styles.cardProgressBarTrack}>
                <View style={[styles.cardProgressBarFill, { width: '0%', backgroundColor: '#94A3B8' }]} />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* =================================================================
            ROW 3: MONTHLY BILLS & PAYMENTS (Horizontal Scroll)
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
            {/* Bill Card 1: October 2026 Running */}
            <View style={styles.billCard}>
              <View style={styles.billHeader}>
                <Text style={styles.billMonthTitle}>
                  {lang === 'hi' ? 'अक्टूबर 2026 (चालू माह)' : 'October 2026 (Running)'}
                </Text>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>
                    {lang === 'hi' ? 'पूर्ण चुकता' : 'All Clear'}
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
                  📅 {lang === 'hi' ? 'चक्र: 01 - 31 अक्टूबर' : 'Cycle: 01 - 31 Oct'}
                </Text>

                <TouchableOpacity 
                  onPress={() => Alert.alert(
                    lang === 'hi' ? 'WhatsApp बिल पर्ची' : 'WhatsApp Slip',
                    lang === 'hi' ? 'अक्टूबर माह का सत्यापित हिसाब पत्र WhatsApp पर शेयर करने हेतु तैयार है।' : 'October verified monthly slip is ready for WhatsApp sharing.'
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
                  {lang === 'hi' ? 'पिछला बकाया बिल' : 'Pending Ledger Balance'}
                </Text>
                <View style={styles.badgeAmber}>
                  <Text style={styles.badgeAmberText}>
                    {lang === 'hi' ? '3 दिन में देय' : 'Due in 3 Days'}
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
                  ⚡ {lang === 'hi' ? 'शून्य ब्याज तुरंत भुगतान' : 'Zero fee on direct UPI'}
                </Text>

                <TouchableOpacity 
                  onPress={() => Alert.alert(
                    lang === 'hi' ? 'UPI भुगतान' : 'UPI Payment',
                    lang === 'hi' ? '₹850 के लिए UPI QR कोड लोड हो रहा है...' : 'Opening direct UPI payment gateway for ₹850...'
                  )}
                  style={[styles.billActionBtn, { backgroundColor: '#F59E0B' }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.billActionBtnText, { color: '#0F172A' }]}>
                    ⚡ {lang === 'hi' ? 'UPI से भरें' : 'Pay via UPI'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bill Card 3: September Completed */}
            <View style={styles.billCard}>
              <View style={styles.billHeader}>
                <Text style={styles.billMonthTitle}>
                  {lang === 'hi' ? 'सितम्बर 2026 (पूर्ण)' : 'September 2026'}
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
                  <Text style={styles.metricLabel}>{lang === 'hi' ? 'भुगतान किया' : 'Paid'}</Text>
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
                  ✓ {lang === 'hi' ? '02 अक्टूबर को चुकता' : 'Settled on 02 Oct'}
                </Text>

                <TouchableOpacity 
                  onPress={() => Alert.alert(
                    lang === 'hi' ? 'रसीद पर्ची' : 'Receipt Slip',
                    lang === 'hi' ? 'सितम्बर 2026 की डिजिटल रसीद PDF तैयार है।' : 'September 2026 verified receipt slip is ready.'
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

        {/* TRUST FOOTER */}
        <View style={styles.footerBrandBox}>
          <Text style={styles.footerBrandTitle}>
            🥛 Milk Hisab Cloud Engine
          </Text>
          <Text style={styles.footerBrandDesc}>
            {lang === 'hi' 
              ? 'मेहनती दूधियों व परिवारों का विश्वसनीय डिजिटल बहीखाता साथी' 
              : 'Rural and semi-urban dairy distribution and transparent ledger platform'}
          </Text>
        </View>
      </ScrollView>

      {/* ========================================================
          USER PROFILE MODAL (External Modular Component)
          ======================================================== */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onLogout={logout}
        onNavigateTab={(tab) => {
          if (onNavigateTab) onNavigateTab(tab);
        }}
      />

      {/* ========================================================
          DISPUTE & QUERY RESOLUTION MODAL
          ======================================================== */}
      <Modal
        visible={disputeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDisputeModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardWide}>
            <Text style={styles.modalTitle}>
              ⚖️ {lang === 'hi' ? 'दूध एंट्री आपत्ति व समाधान' : 'Ledger Dispute Resolution'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {lang === 'hi' 
                ? 'पारदर्शी डिजिटल बहीखाता: 0 विवाद नीति' 
                : 'Zero-dispute transparent ledger audit'}
            </Text>

            <View style={styles.disputeDetailsBox}>
              <View style={styles.disputeDetailRow}>
                <Text style={styles.disputeLabel}>{lang === 'hi' ? 'ग्राहक' : 'Customer'}:</Text>
                <Text style={styles.disputeValue}>{activeDispute.customerName}</Text>
              </View>
              <View style={styles.disputeDetailRow}>
                <Text style={styles.disputeLabel}>{lang === 'hi' ? 'तारीख' : 'Date'}:</Text>
                <Text style={styles.disputeValue}>{activeDispute.date}</Text>
              </View>
              <View style={styles.disputeDetailRow}>
                <Text style={styles.disputeLabel}>{lang === 'hi' ? 'दर्ज मात्रा' : 'Logged Qty'}:</Text>
                <Text style={[styles.disputeValue, { color: '#F59E0B' }]}>{activeDispute.loggedQty} L</Text>
              </View>
              <View style={styles.disputeDetailRow}>
                <Text style={styles.disputeLabel}>{lang === 'hi' ? 'ग्राहक दावा' : 'Claimed Qty'}:</Text>
                <Text style={[styles.disputeValue, { color: '#10B981' }]}>{activeDispute.claimedQty} L</Text>
              </View>
              <View style={styles.disputeDetailRow}>
                <Text style={styles.disputeLabel}>{lang === 'hi' ? 'कारण' : 'Reason'}:</Text>
                <Text style={styles.disputeValueText}>{activeDispute.reason}</Text>
              </View>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                onPress={() => setDisputeModalVisible(false)} 
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>{lang === 'hi' ? 'रद्द करें' : 'Close'}</Text>
              </TouchableOpacity>

              {isVendor && activeDispute.status === 'Pending' ? (
                <TouchableOpacity 
                  onPress={handleResolveDispute}
                  style={styles.modalConfirmDairyBlueBtn}
                >
                  <Text style={styles.modalConfirmDairyBlueBtnText}>
                    ✓ {lang === 'hi' ? '1.5L सुधारें व समाधान करें' : 'Correct to 1.5L & Resolve'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.resolvedBadgeBox}>
                  <Text style={styles.resolvedBadgeText}>
                    ✓ {lang === 'hi' ? 'समाधान संपन्न' : 'Resolved'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          DIRECT MESSAGING / IN-APP CHAT MODAL
          ======================================================== */}
      <Modal
        visible={chatModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCardWide, { maxHeight: '85%' }]}>
            <View style={styles.chatHeader}>
              <Text style={styles.modalTitle}>
                💬 {lang === 'hi' ? 'दूधिया-ग्राहक संवाद (Direct Chat)' : 'Direct Communication Channel'}
              </Text>
              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <Text style={styles.chatCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              {lang === 'hi' 
                ? 'दूध की मात्रा व समय से जुड़े सीधे नोट्स व निर्देश' 
                : 'Direct messaging channel for milk delivery instructions'}
            </Text>

            <ScrollView style={styles.chatListScroll}>
              {chatMessages.map(msg => (
                <View 
                  key={msg.id} 
                  style={[
                    styles.chatBubble, 
                    msg.sender === (isVendor ? 'vendor' : 'customer') ? styles.chatBubbleMe : styles.chatBubbleOther
                  ]}
                >
                  <Text style={styles.chatSenderName}>{msg.senderName} • {msg.time}</Text>
                  <Text style={styles.chatMessageText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder={lang === 'hi' ? 'संदेश लिखें (उदा. कल 2L दूध चाहिए)...' : 'Type a message...'}
                placeholderTextColor="#94A3B8"
                value={newChatText}
                onChangeText={setNewChatText}
              />
              <TouchableOpacity 
                onPress={handleSendMessage}
                style={styles.chatSendBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.chatSendBtnText}>
                  {lang === 'hi' ? 'भेजें' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          DELIVERY PAUSE / SKIP MODAL (Same-Day Block Enforced)
          ======================================================== */}
      <Modal
        visible={skipModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSkipModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardWide}>
            <Text style={styles.modalTitle}>
              ⏸️ {lang === 'hi' ? 'दूध छुट्टी दर्ज करें (Skip Delivery)' : 'Pause / Skip Delivery'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {lang === 'hi' 
                ? 'दूध का नुकसान रोकने हेतु आज की छुट्टी ऐप से बंद है। भविष्य की तारीख चुनें।' 
                : 'Same-day cancellation is blocked to avoid dairy waste. Please select future dates.'}
            </Text>

            <View style={styles.skipDatesGrid}>
              {[
                { label: 'Today (29 Oct) [Blocked]', isBlocked: true },
                { label: 'Tomorrow (30 Oct)', isBlocked: false },
                { label: 'Day After (31 Oct)', isBlocked: false },
                { label: '01 Nov 2026', isBlocked: false },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleSelectSkipDate(item.label)}
                  style={[
                    styles.skipDatePill,
                    selectedSkipDate === item.label && styles.skipDatePillActive,
                    item.isBlocked && styles.skipDatePillBlocked
                  ]}
                >
                  <Text style={[
                    styles.skipDatePillText,
                    selectedSkipDate === item.label && styles.skipDatePillTextActive,
                    item.isBlocked && styles.skipDatePillTextBlocked
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.skipNoteInput}
              placeholder={lang === 'hi' ? 'कारण (वैकल्पिक, उदा. बाहर जा रहे हैं)...' : 'Reason (optional)...'}
              placeholderTextColor="#94A3B8"
              value={skipReason}
              onChangeText={setSkipReason}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                onPress={() => setSkipModalVisible(false)} 
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>{lang === 'hi' ? 'रद्द करें' : 'Cancel'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleConfirmSkip}
                style={styles.modalConfirmDairyBlueBtn}
              >
                <Text style={styles.modalConfirmDairyBlueBtnText}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Solid Pure White Safe Area to fix iPhone Notch issues
  },
  // GLOBAL HEADER BAR (SOLID PURE WHITE, NOTCH-SAFE)
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF', // Solid Pure White
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBrandIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  brandTitleWrap: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  brandSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langPill: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  langPillText: {
    color: '#0F172A',
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
    backgroundColor: '#1E3A8A', // Deep Dairy Blue
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8', // Sky Blue
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
    borderColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 36,
  },
  // HERO CARD (COW PASTURE LANDSCAPE + STRONG SEMI-TRANSPARENT DARK OVERLAY)
  heroCardContainer: {
    marginHorizontal: 14,
    marginTop: 14,
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E3A8A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusBadgeGreenText: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '800',
  },
  heroHeadline: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubHeadline: {
    fontSize: 12,
    color: '#E0E7FF',
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
    backgroundColor: '#1E3A8A', // Deep Dairy Blue (Strictly NO RED)
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
  // DISPUTE ALERT CARD
  disputeAlertCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disputeAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  disputeAlertIcon: {
    fontSize: 22,
  },
  disputeAlertTextWrap: {
    flex: 1,
  },
  disputeAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  disputeAlertDesc: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 14,
  },
  disputeResolveBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  disputeResolveBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
  },
  // SECTIONS & ROWS
  sectionRow: {
    marginTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  horizontalListPadding: {
    paddingHorizontal: 14,
    gap: 12,
  },
  // QUICK ACTIONS (ROW 1)
  quickActionCard: {
    width: 135,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    color: '#0F172A',
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 13,
  },
  // RECENT DELIVERIES (ROW 2)
  deliveryCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  deliveryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryDate: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
  },
  shiftTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shiftTagText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '700',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  qtyHeroText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 32,
  },
  qtyUnitText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A', // Deep Dairy Blue
  },
  rateDetailText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeGreenText: {
    color: '#065F46',
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
    color: '#B45309',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeMuted: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeMutedText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
  },
  cardProgressBarTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#E2E8F0',
  },
  cardProgressBarFill: {
    height: '100%',
  },
  // MONTHLY BILLS (ROW 3)
  billCard: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    color: '#0F172A',
  },
  billMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
  },
  billFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billDueText: {
    fontSize: 10,
    color: '#64748B',
    maxWidth: 120,
  },
  billActionBtn: {
    backgroundColor: '#1E3A8A', // Deep Dairy Blue
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
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 15,
  },
  // MODALS
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCardWide: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 16,
  },
  disputeDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 6,
  },
  disputeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  disputeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  disputeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  disputeValueText: {
    fontSize: 11,
    color: '#0F172A',
    maxWidth: 220,
    textAlign: 'right',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  modalConfirmDairyBlueBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1E3A8A', // Deep Dairy Blue (Strictly NO RED)
    alignItems: 'center',
  },
  modalConfirmDairyBlueBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  resolvedBadgeBox: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
  },
  resolvedBadgeText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '900',
  },
  // CHAT MODAL
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatCloseText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 'bold',
  },
  chatListScroll: {
    maxHeight: 240,
    marginBottom: 14,
  },
  chatBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '85%',
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#DBEAFE',
    borderBottomRightRadius: 2,
  },
  chatBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 2,
  },
  chatSenderName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  chatMessageText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 17,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  chatSendBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatSendBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  // SKIP MODAL
  skipDatesGrid: {
    gap: 8,
    marginBottom: 12,
  },
  skipDatePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  skipDatePillActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  skipDatePillBlocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    opacity: 0.6,
  },
  skipDatePillText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
  },
  skipDatePillTextActive: {
    color: '#B45309',
    fontWeight: '900',
  },
  skipDatePillTextBlocked: {
    color: '#94A3B8',
  },
  skipNoteInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
});
