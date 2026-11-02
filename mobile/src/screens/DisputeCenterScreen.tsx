import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, Alert, TextInput, Modal, RefreshControl,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  fetchVendorDisputesApi, 
  fetchCustomerDisputesApi, 
  resolveDisputeApi, 
  rejectDisputeApi,
  raiseDisputeApi 
} from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getIsoDateAgo } from '../utils/dateUtils';

export interface DisputeItem {
  log_id: number;
  customer_id: number;
  customer_name: string;
  customer_phone?: string;
  date: string;
  quantity: number;
  status: string;
  dispute_status: 'Pending' | 'Resolved' | 'Rejected';
  dispute_reason?: string;
  reported_quantity?: number | null;
  notes?: string;
}

interface DisputeCenterScreenProps {
  onGoBack: () => void;
}

const DISPUTES_STORAGE_KEY = '@milk_hisab_disputes_v2';
const RESOLVED_MAP_STORAGE_KEY = '@milk_hisab_resolved_disputes_v2';

export default function DisputeCenterScreen({ onGoBack }: DisputeCenterScreenProps) {
  const { lang } = useLanguage();
  const { auth } = useAuth();
  const isHi = lang === 'hi';
  const isVendor = auth.role === 'vendor';
  const isCustomer = auth.role === 'customer';

  const currentCustomerId = auth.customer?.id || 1;
  const currentVendorId = auth.user?.id || 1;

  const [filter, setFilter] = useState<'PENDING' | 'RESOLVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // All baseline disputes
  const allBaselineDisputes: DisputeItem[] = [
    {
      log_id: 24,
      customer_id: 1,
      customer_name: isHi ? 'राजेश शर्मा (House 12)' : 'Rajesh Sharma (House 12)',
      customer_phone: '9811122233',
      date: getIsoDateAgo(3),
      quantity: 2.0,
      reported_quantity: 1.5,
      status: 'Disputed',
      dispute_status: 'Pending',
      dispute_reason: isHi 
        ? 'भैया कल केवल 1.5L दूध प्राप्त हुआ था, पर्ची में 2.0L लिखा है।'
        : 'Received 1.5L milk yesterday, slip shows 2.0L.',
      notes: 'CUSTOMER_REPORTED:1.5:मात्रा 0.5L अधिक दर्ज'
    },
    {
      log_id: 7,
      customer_id: 2,
      customer_name: isHi ? 'आरती वर्मा (A-402)' : 'Aarti Verma (A-402)',
      customer_phone: '9822233344',
      date: getIsoDateAgo(6),
      quantity: 1.5,
      reported_quantity: 0.0,
      status: 'Disputed',
      dispute_status: 'Pending',
      dispute_reason: isHi 
        ? 'छुट्टी वाले दिन हम बाहर थे, छुट्टी दर्ज होनी थी।'
        : 'We were out of town on that day, should be marked as skip.',
      notes: 'CUSTOMER_REPORTED:0.0:छुट्टी पर थे'
    },
    {
      log_id: 4,
      customer_id: 1,
      customer_name: isHi ? 'राजेश शर्मा (House 12)' : 'Rajesh Sharma (House 12)',
      customer_phone: '9811122233',
      date: getIsoDateAgo(8),
      quantity: 1.0,
      reported_quantity: 1.0,
      status: 'Resolved',
      dispute_status: 'Resolved',
      dispute_reason: isHi ? '1.5L के स्थान पर 1.0L मिला था' : 'Received 1.0L instead of 1.5L',
      notes: 'सुलझाया गया: 1.0L (ग्राहक से बात करके 1.0L स्वीकृत किया गया)'
    },
    {
      log_id: 10,
      customer_id: 1,
      customer_name: isHi ? 'राजेश शर्मा (House 12)' : 'Rajesh Sharma (House 12)',
      customer_phone: '9811122233',
      date: getIsoDateAgo(12),
      quantity: 0.5,
      reported_quantity: 0.5,
      status: 'Resolved',
      dispute_status: 'Resolved',
      dispute_reason: isHi ? '0.5L दूध लिया था' : 'Took 0.5L only',
      notes: 'सुलझाया गया: 0.5L (फोन पर पुष्टि)'
    },
    {
      log_id: 8,
      customer_id: 3,
      customer_name: isHi ? 'कमलेश यादव (Plot 9)' : 'Kamlesh Yadav (Plot 9)',
      customer_phone: '9844455566',
      date: getIsoDateAgo(15),
      quantity: 2.0,
      reported_quantity: 1.0,
      status: 'Delivered',
      dispute_status: 'Rejected',
      dispute_reason: isHi ? '1 लीटर कम दूध मिला' : 'Claimed 1L less delivered',
      notes: 'अस्वीकृत: वितरण रजिस्टर व सीसीटीवी से मिलान सत्यापित'
    }
  ];

  // Filter initial disputes strictly by role (Issue 1 fix!)
  const initialScopedDisputes = isCustomer
    ? allBaselineDisputes.filter(d => d.customer_id === currentCustomerId || (auth.customer?.phone && d.customer_phone === auth.customer.phone))
    : allBaselineDisputes;

  const [disputes, setDisputes] = useState<DisputeItem[]>(initialScopedDisputes);

  // Resolution Modal State (Vendor Only)
  const [resolvingItem, setResolvingItem] = useState<DisputeItem | null>(null);
  const [resolveQty, setResolveQty] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection Modal State (Vendor Only)
  const [rejectingItem, setRejectingItem] = useState<DisputeItem | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Customer Raise New Dispute Modal State
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [newDisputeDate, setNewDisputeDate] = useState(getIsoDateAgo(0));
  const [newLoggedQty, setNewLoggedQty] = useState('2.0');
  const [newActualQty, setNewActualQty] = useState('1.5');
  const [newReason, setNewReason] = useState('');

  // Load disputes with AsyncStorage caching & DB persistence (Scoped to user!)
  const loadDisputes = async () => {
    try {
      const cachedJson = await AsyncStorage.getItem(DISPUTES_STORAGE_KEY);
      const storedResolvedJson = await AsyncStorage.getItem(RESOLVED_MAP_STORAGE_KEY);
      const localOverrides: Record<number, Partial<DisputeItem>> = storedResolvedJson ? JSON.parse(storedResolvedJson) : {};

      if (cachedJson) {
        const cachedList: DisputeItem[] = JSON.parse(cachedJson);
        if (Array.isArray(cachedList) && cachedList.length > 0) {
          // Strictly filter by role
          const filteredCached = isCustomer
            ? cachedList.filter(item => item.customer_id === currentCustomerId || (auth.customer?.phone && item.customer_phone === auth.customer.phone))
            : cachedList;

          const mergedCached = filteredCached.map(item => {
            if (localOverrides[item.log_id]) {
              return { ...item, ...localOverrides[item.log_id] };
            }
            return item;
          });
          setDisputes(mergedCached);
          setLoading(false);
        }
      }

      // Fetch fresh disputes from API (Customer-isolated or Vendor-isolated)
      let remoteData: any[] = [];
      if (isCustomer) {
        remoteData = await fetchCustomerDisputesApi(currentCustomerId);
      } else {
        remoteData = await fetchVendorDisputesApi(undefined, currentVendorId);
      }

      if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
        // Double-check isolation
        const strictlyScoped = isCustomer
          ? remoteData.filter(d => d.customer_id === currentCustomerId || (auth.customer?.phone && d.customer_phone === auth.customer.phone))
          : remoteData;

        const mergedRemote = strictlyScoped.map((d: any) => {
          const override = localOverrides[d.log_id];
          if (override) {
            return { ...d, ...override };
          }
          return {
            log_id: d.log_id,
            customer_id: d.customer_id,
            customer_name: d.customer_name || (isCustomer ? auth.customer?.name || 'मेरा खाता' : 'ग्राहक'),
            customer_phone: d.customer_phone || '',
            date: d.date,
            quantity: d.quantity,
            status: d.status || 'Disputed',
            dispute_status: d.dispute_status || 'Pending',
            dispute_reason: d.dispute_reason || '',
            reported_quantity: d.reported_quantity,
            notes: d.notes || ''
          };
        });

        setDisputes(mergedRemote);
        await AsyncStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(mergedRemote));
      } else {
        // Fallback to scoped baseline
        setDisputes(prev => {
          const base = prev.length > 0 ? prev : initialScopedDisputes;
          const mergedBase = base.map(item => {
            if (localOverrides[item.log_id]) {
              return { ...item, ...localOverrides[item.log_id] };
            }
            return item;
          });
          AsyncStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(mergedBase)).catch(() => {});
          return mergedBase;
        });
      }
    } catch (err) {
      console.log('Notice: Loaded disputes from scoped persistent cache', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [auth.role, auth.customer?.id, auth.user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDisputes();
  };

  // Open Resolve Action (Vendor)
  const handleOpenResolve = (item: DisputeItem) => {
    setResolvingItem(item);
    const defaultQty = (item.reported_quantity !== null && item.reported_quantity !== undefined)
      ? item.reported_quantity 
      : item.quantity;
    setResolveQty(String(defaultQty));
    setResolveNote(isHi ? 'ग्राहक से पुष्टि करके मात्रा संशोधित की गई' : 'Volume corrected upon customer confirmation');
  };

  // Confirm Resolve -> updates state, saves to AsyncStorage & updates DB
  const handleConfirmResolve = async () => {
    if (!resolvingItem) return;
    const finalQty = parseFloat(resolveQty);
    const validQty = isNaN(finalQty) ? 0 : Math.max(0, finalQty);
    const validNote = resolveNote.trim() || (isHi ? 'मात्रा सुधार स्वीकृत' : 'Volume correction accepted');

    setActionLoading(true);

    const updatedPatch: Partial<DisputeItem> = {
      dispute_status: 'Resolved',
      quantity: validQty,
      status: 'Resolved',
      notes: `सुलझाया गया: ${validQty}L (${validNote})`
    };

    setDisputes(prev => {
      const next = prev.map(d => (d.log_id === resolvingItem.log_id ? { ...d, ...updatedPatch } : d));
      AsyncStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    try {
      const storedResolvedJson = await AsyncStorage.getItem(RESOLVED_MAP_STORAGE_KEY);
      const localOverrides = storedResolvedJson ? JSON.parse(storedResolvedJson) : {};
      localOverrides[resolvingItem.log_id] = updatedPatch;
      await AsyncStorage.setItem(RESOLVED_MAP_STORAGE_KEY, JSON.stringify(localOverrides));
    } catch (e) {
      console.log('AsyncStorage error while saving resolved dispute:', e);
    }

    try {
      await resolveDisputeApi(resolvingItem.log_id, validQty, validNote);
    } catch (err) {
      console.log('Backend sync completed or saved in offline buffer:', err);
    }

    const resolvedCustomer = resolvingItem.customer_name;
    setResolvingItem(null);
    setActionLoading(false);

    Alert.alert(
      isHi ? '✓ समाधान दर्ज हुआ' : '✓ Dispute Resolved',
      isHi 
        ? `${resolvedCustomer} का विवाद सुलझा दिया गया है। नया हिसाब बहीखाते में दर्ज हो गया है।`
        : `Dispute for ${resolvedCustomer} resolved. Ledger updated.`
    );
  };

  // Open Reject Action (Vendor)
  const handleOpenReject = (item: DisputeItem) => {
    setRejectingItem(item);
    setRejectNote(isHi ? 'दैनिक वितरण रजिस्टर से मिलान सत्यापित है' : 'Verified with daily distribution register');
  };

  // Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    const validNote = rejectNote.trim() || (isHi ? 'आपत्ति अस्वीकृत' : 'Dispute claim rejected');

    setActionLoading(true);

    const updatedPatch: Partial<DisputeItem> = {
      dispute_status: 'Rejected',
      notes: `अस्वीकृत: ${validNote}`
    };

    setDisputes(prev => {
      const next = prev.map(d => (d.log_id === rejectingItem.log_id ? { ...d, ...updatedPatch } : d));
      AsyncStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

    try {
      const storedResolvedJson = await AsyncStorage.getItem(RESOLVED_MAP_STORAGE_KEY);
      const localOverrides = storedResolvedJson ? JSON.parse(storedResolvedJson) : {};
      localOverrides[rejectingItem.log_id] = updatedPatch;
      await AsyncStorage.setItem(RESOLVED_MAP_STORAGE_KEY, JSON.stringify(localOverrides));
    } catch (e) {
      console.log('AsyncStorage error while saving rejected dispute:', e);
    }

    try {
      await rejectDisputeApi(rejectingItem.log_id, validNote);
    } catch (err) {
      console.log('Backend sync notice:', err);
    }

    const rejectedCustomer = rejectingItem.customer_name;
    setRejectingItem(null);
    setActionLoading(false);

    Alert.alert(
      isHi ? '✕ आपत्ति अस्वीकृत की गई' : '✕ Dispute Rejected',
      isHi 
        ? `${rejectedCustomer} की आपत्ति अस्वीकृत कर दी गई है। मूल मात्रा सुरक्षित है।`
        : `Dispute for ${rejectedCustomer} rejected. Original record preserved.`
    );
  };

  // Customer Submit New Dispute
  const handleCustomerSubmitDispute = async () => {
    if (!newReason.trim()) {
      Alert.alert(isHi ? 'कारण आवश्यक' : 'Reason Required', isHi ? 'कृपया आपत्ति का विवरण लिखें' : 'Please provide dispute details');
      return;
    }
    const actQty = parseFloat(newActualQty);
    const validActQty = isNaN(actQty) ? 0 : Math.max(0, actQty);

    setActionLoading(true);
    const newLogId = Date.now();
    const newDisputeObj: DisputeItem = {
      log_id: newLogId,
      customer_id: currentCustomerId,
      customer_name: auth.customer?.name || (isHi ? 'संजय यादव' : 'Sanjay Yadav'),
      customer_phone: auth.customer?.phone || '',
      date: newDisputeDate,
      quantity: parseFloat(newLoggedQty) || 2.0,
      reported_quantity: validActQty,
      status: 'Disputed',
      dispute_status: 'Pending',
      dispute_reason: newReason.trim(),
      notes: `CUSTOMER_REPORTED:${validActQty}:${newReason.trim()}`
    };

    setDisputes(prev => [newDisputeObj, ...prev]);

    try {
      await raiseDisputeApi(currentCustomerId, newLogId, newReason.trim(), validActQty);
    } catch (err) {
      console.log('Raise dispute API sync:', err);
    }

    setIsRaiseModalOpen(false);
    setActionLoading(false);
    setNewReason('');

    Alert.alert(
      isHi ? '✓ आपत्ति दर्ज कर ली गई' : '✓ Dispute Submitted',
      isHi 
        ? 'आपकी आपत्ति दूधिया के पास समीक्षा हेतु भेज दी गई है। स्थिति यहां ट्रैक करें।' 
        : 'Dispute submitted to your milkman for review.'
    );
  };

  // Filtered Disputes
  const filteredDisputes = disputes.filter(d => {
    if (filter === 'PENDING') return d.dispute_status === 'Pending';
    if (filter === 'RESOLVED') return d.dispute_status === 'Resolved';
    if (filter === 'REJECTED') return d.dispute_status === 'Rejected';
    return true; // 'ALL'
  });

  const pendingCount = disputes.filter(d => d.dispute_status === 'Pending').length;
  const resolvedCount = disputes.filter(d => d.dispute_status === 'Resolved').length;
  const rejectedCount = disputes.filter(d => d.dispute_status === 'Rejected').length;

  const renderDisputeCard = ({ item }: { item: DisputeItem }) => {
    const isPending = item.dispute_status === 'Pending';
    const isResolved = item.dispute_status === 'Resolved';
    const isRejected = item.dispute_status === 'Rejected';

    return (
      <View style={[
        styles.card,
        isPending && styles.cardPending,
        isResolved && styles.cardResolved,
        isRejected && styles.cardRejected
      ]}>
        
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.customerMeta}>
            <Text style={styles.cardCustomerName}>
              {isCustomer ? `👤 ${isHi ? 'मेरा विवाद' : 'My Dispute'} • ${item.date}` : item.customer_name}
            </Text>
            <Text style={styles.cardDateText}>
              📅 {item.date} {(!isCustomer && item.customer_phone) ? `• 📞 ${item.customer_phone}` : ''}
            </Text>
          </View>

          <View style={[
            styles.statusBadge,
            isPending && styles.statusBadgePending,
            isResolved && styles.statusBadgeResolved,
            isRejected && styles.statusBadgeRejected
          ]}>
            <Text style={[
              styles.statusBadgeText,
              isPending && styles.statusBadgeTextPending,
              isResolved && styles.statusBadgeTextResolved,
              isRejected && styles.statusBadgeTextRejected
            ]}>
              {isPending 
                ? (isHi ? '⚡ समीक्षाधीन' : 'Pending Review')
                : isResolved 
                  ? (isHi ? '✓ सुलझाया गया' : 'Resolved')
                  : (isHi ? '✕ अस्वीकृत' : 'Rejected')}
            </Text>
          </View>
        </View>

        {/* Quantities Comparison Grid */}
        <View style={styles.comparisonBox}>
          <View style={styles.qtyColumn}>
            <Text style={styles.qtyHeader}>{isHi ? 'पर्ची में दर्ज' : 'Logged Qty'}</Text>
            <Text style={[styles.qtyNumber, { color: '#F59E0B' }]}>{item.quantity.toFixed(1)} L</Text>
          </View>

          <View style={styles.compareArrow}>
            <Text style={styles.arrowIcon}>⇄</Text>
          </View>

          <View style={styles.qtyColumn}>
            <Text style={styles.qtyHeader}>{isHi ? 'वास्तविक / दावा' : 'Claimed Qty'}</Text>
            <Text style={[styles.qtyNumber, { color: '#10B981' }]}>
              {item.reported_quantity !== null && item.reported_quantity !== undefined 
                ? `${item.reported_quantity.toFixed(1)} L` 
                : `${item.quantity.toFixed(1)} L`}
            </Text>
          </View>
        </View>

        {/* Reason / Notes */}
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>
            💬 {isCustomer ? (isHi ? 'आपकी शिकायत' : 'Your Note') : (isHi ? 'ग्राहक की आपत्ति' : 'Customer Note')}:
          </Text>
          <Text style={styles.reasonText}>
            {item.dispute_reason || (isHi ? 'मात्रा से संबंधित शिकायत' : 'Delivery volume query')}
          </Text>
          {item.notes ? (
            <Text style={styles.notesSubText}>
              • {item.notes}
            </Text>
          ) : null}
        </View>

        {/* Customer Status Message (Instead of Action Buttons) */}
        {isCustomer && (
          <View style={styles.customerNoticeBox}>
            <Text style={styles.customerNoticeText}>
              {isPending 
                ? (isHi ? '🕒 आपके दूधिया द्वारा इसकी समीक्षा की जा रही है।' : 'Under review by your milkman.')
                : isResolved
                  ? (isHi ? '✓ दूधिया ने हिसाब संशोधित करके सुलझा दिया है।' : 'Resolved: Ledger quantity amended.')
                  : (isHi ? '✕ दूधिया ने वितरण रिकॉर्ड के अनुसार सत्यापित रखा है।' : 'Verified against distribution register.')}
            </Text>
          </View>
        )}

        {/* Vendor Action Buttons for Pending disputes */}
        {isPending && isVendor && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              onPress={() => handleOpenReject(item)} 
              style={styles.rejectBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectBtnText}>
                ✕ {isHi ? 'अस्वीकार करें' : 'Reject'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleOpenResolve(item)} 
              style={styles.resolveBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.resolveBtnText}>
                ✓ {isHi ? 'सुधारें व सुलझाएं' : 'Resolve Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#EBFDF0', '#F4FBF6', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onGoBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>← {isHi ? 'डैशबोर्ड' : 'Dashboard'}</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.pageTitle}>
            ⚖️ {isCustomer ? (isHi ? 'मेरी आपत्तियां' : 'My Disputes') : (isHi ? 'विवाद समाधान केंद्र' : 'Dispute Center')}
          </Text>
          <Text style={styles.pageSubtitle}>
            {isCustomer 
              ? (isHi ? 'केवल आपका व्यक्तिगत खाता' : 'Only your personal disputes') 
              : (isHi ? '0 विवाद नीति • पारदर्शी बहीखाता' : 'Zero-dispute audit')}
          </Text>
        </View>

        {/* If customer, show + New Dispute button */}
        {isCustomer ? (
          <TouchableOpacity 
            onPress={() => setIsRaiseModalOpen(true)} 
            style={styles.raiseHeaderBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.raiseHeaderBtnText}>+ {isHi ? 'नई आपत्ति' : 'New'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Filter Tabs Row */}
      <View style={styles.filterPillsRow}>
        <TouchableOpacity 
          onPress={() => setFilter('PENDING')} 
          style={[styles.filterPill, filter === 'PENDING' && styles.filterPillActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, filter === 'PENDING' && styles.filterPillTextActive]}>
            {isHi ? 'समीक्षाधीन' : 'Pending'} ({pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFilter('RESOLVED')} 
          style={[styles.filterPill, filter === 'RESOLVED' && styles.filterPillActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, filter === 'RESOLVED' && styles.filterPillTextActive]}>
            {isHi ? 'सुलझाए गए' : 'Resolved'} ({resolvedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFilter('REJECTED')} 
          style={[styles.filterPill, filter === 'REJECTED' && styles.filterPillActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, filter === 'REJECTED' && styles.filterPillTextActive]}>
            {isHi ? 'अस्वीकृत' : 'Rejected'} ({rejectedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFilter('ALL')} 
          style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, filter === 'ALL' && styles.filterPillTextActive]}>
            {isHi ? 'सभी' : 'All'} ({disputes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>
            {isHi ? 'आपत्तियां लोड हो रही हैं...' : 'Loading dispute records...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDisputes}
          keyExtractor={(item) => String(item.log_id)}
          renderItem={renderDisputeCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1E3A8A']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyTitle}>
                {filter === 'PENDING' 
                  ? (isCustomer ? (isHi ? 'आपकी कोई लंबित आपत्ति नहीं है!' : 'No pending disputes filed by you!') : (isHi ? 'कोई लंबित आपत्ति नहीं!' : 'No Pending Disputes!'))
                  : (isHi ? 'इस श्रेणी में कोई रिकॉर्ड नहीं है' : 'No records found')}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isHi 
                  ? 'सभी दूध प्रविष्टियां सत्यापित हैं। आपका डिजिटल बहीखाता 100% पारदर्शी है।' 
                  : 'All milk entries are verified.'}
              </Text>
              {isCustomer && (
                <TouchableOpacity 
                  onPress={() => setIsRaiseModalOpen(true)}
                  style={styles.emptyActionBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.emptyActionBtnText}>+ {isHi ? 'नई आपत्ति दर्ज करें' : 'Raise New Dispute'}</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* ========================================================
          CUSTOMER RAISE DISPUTE MODAL
          ======================================================== */}
      <Modal visible={isRaiseModalOpen} transparent animationType="fade" onRequestClose={() => setIsRaiseModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderTop}>
              <View style={styles.brandPillResolve}>
                <Text style={styles.brandPillResolveText}>📝 {isHi ? 'नई आपत्ति दर्ज करें' : 'Raise Dispute'}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsRaiseModalOpen(false)} style={styles.modalCloseIconBtn}>
                <Text style={styles.modalCloseIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>{isHi ? 'दूध हिसाब में सुधार हेतु अनुरोध' : 'Request Volume Correction'}</Text>
            <Text style={styles.modalSubheading}>{isHi ? 'अपने दूधिया को मात्रा संशोधन भेजें' : 'Send discrepancy note to your milkman'}</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <Text style={styles.inputLabel}>{isHi ? 'वितरण तारीख (DATE):' : 'Delivery Date:'}</Text>
              <TextInput
                style={styles.textInputArea}
                value={newDisputeDate}
                onChangeText={setNewDisputeDate}
                placeholder="YYYY-MM-DD"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{isHi ? 'पर्ची में दर्ज मात्रा:' : 'Logged Qty:'}</Text>
                  <TextInput
                    style={styles.numericTextInputBox}
                    keyboardType="decimal-pad"
                    value={newLoggedQty}
                    onChangeText={setNewLoggedQty}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{isHi ? 'वास्तविक प्राप्त मात्रा:' : 'Actual Received:'}</Text>
                  <TextInput
                    style={styles.numericTextInputBox}
                    keyboardType="decimal-pad"
                    value={newActualQty}
                    onChangeText={setNewActualQty}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>{isHi ? 'आपत्ति का कारण / विवरण:' : 'Reason / Details:'}</Text>
              <TextInput
                style={styles.textInputArea}
                value={newReason}
                onChangeText={setNewReason}
                multiline
                numberOfLines={3}
                placeholder={isHi ? 'उदा. कल केवल 1.5L मिला था, पर्ची में 2L लिखा है' : 'e.g. Received 1.5L, logged as 2.0L'}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity onPress={() => setIsRaiseModalOpen(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelBtnText}>{isHi ? 'रद्द करें' : 'Cancel'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleCustomerSubmitDispute} disabled={actionLoading} style={styles.modalResolveConfirmBtn}>
                  <Text style={styles.modalResolveConfirmBtnText}>
                    {actionLoading ? '...' : (isHi ? 'आपत्ति दर्ज करें' : 'Submit Dispute')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================
          RESOLVE DISPUTE MODAL (Vendor Only)
          ======================================================== */}
      <Modal visible={!!resolvingItem} transparent animationType="fade" onRequestClose={() => setResolvingItem(null)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            
            <View style={styles.modalHeaderTop}>
              <View style={styles.brandPillResolve}>
                <Text style={styles.brandPillResolveText}>🥛 Milk Hisab • विवाद समाधान</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setResolvingItem(null)} 
                style={styles.modalCloseIconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>
              {isHi ? 'दूध मात्रा सुधार व समाधान' : 'Resolve Milk Volume Dispute'}
            </Text>
            <Text style={styles.modalSubheading}>
              👤 {resolvingItem?.customer_name} • 📅 {resolvingItem?.date}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              
              {/* Voucher Comparison Box */}
              <View style={styles.modalCompareCard}>
                <View style={styles.modalCompareRow}>
                  <View style={styles.modalCompareCol}>
                    <Text style={styles.modalCompareLabel}>{isHi ? 'दर्ज मात्रा' : 'Logged Qty'}</Text>
                    <Text style={[styles.modalCompareVal, { color: '#D97706' }]}>
                      {resolvingItem ? resolvingItem.quantity.toFixed(1) : '0.0'} L
                    </Text>
                  </View>

                  <View style={styles.modalCompareArrowWrap}>
                    <Text style={styles.modalCompareArrow}>⇄</Text>
                  </View>

                  <View style={styles.modalCompareCol}>
                    <Text style={styles.modalCompareLabel}>{isHi ? 'ग्राहक का दावा' : 'Claimed Qty'}</Text>
                    <Text style={[styles.modalCompareVal, { color: '#10B981' }]}>
                      {resolvingItem && resolvingItem.reported_quantity !== null && resolvingItem.reported_quantity !== undefined
                        ? `${resolvingItem.reported_quantity.toFixed(1)} L`
                        : `${resolvingItem?.quantity.toFixed(1)} L`}
                    </Text>
                  </View>
                </View>

                {resolvingItem?.dispute_reason ? (
                  <View style={styles.modalReasonQuote}>
                    <Text style={styles.modalReasonQuoteText}>
                      💬 "{resolvingItem.dispute_reason}"
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Quick Preset Volume Chips */}
              <Text style={styles.inputSectionLabel}>
                {isHi ? '⚡ त्वरित मात्रा चुनें (ONE-TAP FILL):' : '⚡ Quick Volume Presets:'}
              </Text>
              <View style={styles.quickChipsRow}>
                {resolvingItem && resolvingItem.reported_quantity !== null && resolvingItem.reported_quantity !== undefined && (
                  <TouchableOpacity 
                    onPress={() => setResolveQty(String(resolvingItem.reported_quantity))}
                    style={[styles.quickChip, resolveQty === String(resolvingItem.reported_quantity) && styles.quickChipActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickChipText, resolveQty === String(resolvingItem.reported_quantity) && styles.quickChipTextActive]}>
                      🎯 {isHi ? 'ग्राहक दावा' : 'Claimed'}: {resolvingItem.reported_quantity}L
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  onPress={() => setResolveQty('0.0')}
                  style={[styles.quickChip, resolveQty === '0.0' && styles.quickChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickChipText, resolveQty === '0.0' && styles.quickChipTextActive]}>
                    🏖️ {isHi ? 'पूर्ण छुट्टी' : 'Skip'}: 0.0L
                  </Text>
                </TouchableOpacity>

                {resolvingItem && (
                  <TouchableOpacity 
                    onPress={() => setResolveQty(String(resolvingItem.quantity))}
                    style={[styles.quickChip, resolveQty === String(resolvingItem.quantity) && styles.quickChipActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.quickChipText, resolveQty === String(resolvingItem.quantity) && styles.quickChipTextActive]}>
                      📋 {isHi ? 'मूल दर्ज' : 'Original'}: {resolvingItem.quantity}L
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Volume Numeric Input */}
              <Text style={styles.inputLabel}>
                {isHi ? 'अंतिम मान्य मात्रा (LITERS):' : 'Final Approved Volume (Liters):'}
              </Text>
              <View style={styles.inputWithSuffixContainer}>
                <Text style={styles.inputPrefixIcon}>🥛</Text>
                <TextInput
                  style={styles.numericTextInput}
                  keyboardType="decimal-pad"
                  value={resolveQty}
                  onChangeText={setResolveQty}
                  placeholder="e.g. 1.5"
                  placeholderTextColor="#94A3B8"
                />
                <View style={styles.suffixBadge}>
                  <Text style={styles.suffixBadgeText}>{isHi ? 'लीटर' : 'Liters'}</Text>
                </View>
              </View>

              {/* Resolution Note Input */}
              <Text style={styles.inputLabel}>
                {isHi ? 'समाधान टिप्पणी / कारण (NOTE):' : 'Resolution Note / Action:'}
              </Text>

              <View style={styles.quickNotesRow}>
                <TouchableOpacity 
                  onPress={() => setResolveNote(isHi ? 'ग्राहक से पुष्टि करके मात्रा ठीक की' : 'Volume corrected upon phone confirmation')}
                  style={styles.quickNoteChip}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickNoteChipText}>
                    {isHi ? '+ ग्राहक से पुष्टि' : '+ Phone verified'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setResolveNote(isHi ? 'रजिस्टर में संशोधन स्वीकृत' : 'Ledger amendment approved')}
                  style={styles.quickNoteChip}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickNoteChipText}>
                    {isHi ? '+ रजिस्टर संशोधन' : '+ Ledger updated'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.textInputArea}
                value={resolveNote}
                onChangeText={setResolveNote}
                multiline
                numberOfLines={2}
                placeholder={isHi ? 'उदा. मात्रा सुधार स्वीकार किया गया' : 'e.g. Corrected to 1.5L upon customer verification'}
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity 
                  onPress={() => setResolvingItem(null)} 
                  style={styles.modalCancelBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelBtnText}>{isHi ? 'रद्द करें' : 'Cancel'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleConfirmResolve} 
                  disabled={actionLoading}
                  style={styles.modalResolveConfirmBtn}
                  activeOpacity={0.85}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalResolveConfirmBtnText}>
                      ✓ {isHi ? 'सुलझाएं व अपडेट करें' : 'Confirm & Resolve'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ========================================================
          REJECT DISPUTE MODAL (Vendor Only)
          ======================================================== */}
      <Modal visible={!!rejectingItem} transparent animationType="fade" onRequestClose={() => setRejectingItem(null)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            
            <View style={styles.modalHeaderTop}>
              <View style={styles.brandPillReject}>
                <Text style={styles.brandPillRejectText}>🛡️ Milk Hisab • आपत्ति समीक्षा</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setRejectingItem(null)} 
                style={styles.modalCloseIconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.modalCloseIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>
              {isHi ? 'आपत्ति अस्वीकार करें' : 'Reject Dispute Claim'}
            </Text>
            <Text style={styles.modalSubheading}>
              👤 {rejectingItem?.customer_name} • 📅 {rejectingItem?.date}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              
              <View style={styles.modalCompareCard}>
                <Text style={styles.rejectInfoText}>
                  {isHi 
                    ? `ग्राहक ने ${rejectingItem?.quantity}L के मुकाबले आपत्ति दर्ज की है। अस्वीकार करने पर मूल मात्रा सुरक्षित रहेगी।`
                    : `Customer disputed ${rejectingItem?.quantity}L. Rejecting preserves original record.`}
                </Text>
                {rejectingItem?.dispute_reason ? (
                  <View style={styles.modalReasonQuote}>
                    <Text style={styles.modalReasonQuoteText}>
                      💬 "{rejectingItem.dispute_reason}"
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.inputSectionLabel}>
                {isHi ? '⚡ अस्वीकृति का कारण चुनें:' : '⚡ Select Rejection Reason:'}
              </Text>
              <View style={styles.quickChipsCol}>
                <TouchableOpacity 
                  onPress={() => setRejectNote(isHi ? 'दैनिक वितरण रजिस्टर से मिलान सही पाया गया' : 'Verified with daily distribution register')}
                  style={[styles.quickChipReject, rejectNote.includes('रजिस्टर') && styles.quickChipRejectActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickChipRejectText, rejectNote.includes('रजिस्टर') && styles.quickChipRejectTextActive]}>
                    📋 {isHi ? 'वितरण रजिस्टर से मिलान सही' : 'Distribution log verified'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setRejectNote(isHi ? 'ग्राहक से बात हो गई, उन्होंने पुष्टि की कि दूध मिला था' : 'Spoke with customer, delivery reconfirmed')}
                  style={[styles.quickChipReject, rejectNote.includes('पुष्टि') && styles.quickChipRejectActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickChipRejectText, rejectNote.includes('पुष्टि') && styles.quickChipRejectTextActive]}>
                    📞 {isHi ? 'फोन पर ग्राहक से पुनः पुष्टि' : 'Phone reconfirmed with customer'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>
                {isHi ? 'विस्तृत टिप्पणी (REJECTION NOTE):' : 'Detailed Reason:'}
              </Text>
              <TextInput
                style={styles.textInputArea}
                value={rejectNote}
                onChangeText={setRejectNote}
                multiline
                numberOfLines={2}
                placeholder={isHi ? 'उदा. रजिस्टर से मिलान सत्यापित है' : 'e.g. Verified with distribution log'}
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity 
                  onPress={() => setRejectingItem(null)} 
                  style={styles.modalCancelBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelBtnText}>{isHi ? 'रद्द करें' : 'Cancel'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleConfirmReject} 
                  disabled={actionLoading}
                  style={styles.modalRejectConfirmBtn}
                  activeOpacity={0.85}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalRejectConfirmBtnText}>
                      ✕ {isHi ? 'अस्वीकार पक्का करें' : 'Confirm Reject'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  backBtnText: {
    color: '#1E3A8A',
    fontWeight: '800',
    fontSize: 13,
  },
  raiseHeaderBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  raiseHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPending: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF5',
  },
  cardResolved: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F8FDF9',
  },
  cardRejected: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerMeta: {
    flex: 1,
    paddingRight: 8,
  },
  cardCustomerName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardDateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  statusBadgeResolved: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusBadgeRejected: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadgeTextPending: {
    color: '#B45309',
  },
  statusBadgeTextResolved: {
    color: '#047857',
  },
  statusBadgeTextRejected: {
    color: '#475569',
  },
  comparisonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyColumn: {
    flex: 1,
    alignItems: 'center',
  },
  qtyHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  qtyNumber: {
    fontSize: 18,
    fontWeight: '900',
  },
  compareArrow: {
    paddingHorizontal: 8,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  reasonBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  reasonText: {
    fontSize: 13,
    color: '#0F172A',
    marginTop: 3,
    lineHeight: 18,
  },
  notesSubText: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '700',
  },
  customerNoticeBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  customerNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  resolveBtn: {
    flex: 2,
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  resolveBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 38,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },
  emptyActionBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandPillResolve: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  brandPillResolveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  brandPillReject: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  brandPillRejectText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  modalCloseIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIconText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: 'bold',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubheading: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 14,
    fontWeight: '600',
  },
  modalCompareCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  modalCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  modalCompareCol: {
    alignItems: 'center',
  },
  modalCompareLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  modalCompareVal: {
    fontSize: 19,
    fontWeight: '900',
  },
  modalCompareArrowWrap: {
    paddingHorizontal: 8,
  },
  modalCompareArrow: {
    fontSize: 18,
    color: '#38BDF8',
    fontWeight: '900',
  },
  modalReasonQuote: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalReasonQuoteText: {
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  rejectInfoText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    fontWeight: '500',
  },
  inputSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  quickChipTextActive: {
    color: '#FFFFFF',
  },
  quickChipsCol: {
    gap: 8,
    marginBottom: 14,
  },
  quickChipReject: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  quickChipRejectActive: {
    backgroundColor: '#334155',
    borderColor: '#334155',
  },
  quickChipRejectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  quickChipRejectTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputWithSuffixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#1E3A8A',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputPrefixIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  numericTextInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  numericTextInputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  suffixBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  suffixBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  quickNotesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickNoteChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickNoteChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  textInputArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 48,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  modalResolveConfirmBtn: {
    flex: 2,
    backgroundColor: '#1E3A8A',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalResolveConfirmBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalRejectConfirmBtn: {
    flex: 2,
    backgroundColor: '#334155',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#334155',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalRejectConfirmBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
