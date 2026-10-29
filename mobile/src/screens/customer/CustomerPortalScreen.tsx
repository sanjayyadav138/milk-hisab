import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, Modal, TextInput, Linking, Alert, Image 
} from 'react-native';
import { fetchCustomerDashboardApi, raiseDisputeApi, skipMilkDateApi } from '../../api/client';
import { CustomerDashboardData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CustomerPortalScreen() {
  const { auth, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Dispute modal state
  const [disputingLog, setDisputingLog] = useState<any | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeQty, setDisputeQty] = useState('1.0');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Skip modal state
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [skipDate, setSkipDate] = useState(tomorrowStr);
  const [skipReason, setSkipReason] = useState('');
  const [submittingSkip, setSubmittingSkip] = useState(false);

  useEffect(() => {
    if (auth.customer?.id) {
      loadDashboard(auth.customer.id);
    }
  }, [auth.customer?.id]);

  const loadDashboard = async (customerId: number) => {
    setLoading(true);
    try {
      const res = await fetchCustomerDashboardApi(customerId);
      setData(res);
    } catch (err: any) {
      Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', err.message || (lang === 'hi' ? 'खाता लोड नहीं हुआ' : 'Could not load account details'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayUpi = () => {
    if (!data) return;
    const { vendor, month_summary } = data;
    const upiId = vendor.upi_id || '918076646872@paytm';
    const amount = month_summary.total_amount;
    const payeeName = encodeURIComponent(vendor.business_name || vendor.name);
    const note = encodeURIComponent(`Milk Payment - ${data.customer.name}`);

    const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    Linking.openURL(upiUrl).catch(() => {
      Alert.alert(
        lang === 'hi' ? 'UPI ऐप नहीं मिला' : 'UPI App Not Found',
        lang === 'hi' 
          ? `कृपया अपने फोन में Google Pay, PhonePe या Paytm खोलें और ${upiId} पर ₹${amount} भेजें।`
          : `Please open Google Pay, PhonePe or Paytm and send ₹${amount} to ${upiId}.`
      );
    });
  };

  const handleDisputeSubmit = async () => {
    if (!disputingLog || !auth.customer) return;
    if (!disputeReason.trim()) {
      Alert.alert(lang === 'hi' ? 'कारण आवश्यक' : 'Reason Required', lang === 'hi' ? 'कृपया आपत्ति का कारण लिखें' : 'Please provide a reason');
      return;
    }

    setSubmittingDispute(true);
    try {
      await raiseDisputeApi(
        auth.customer.id,
        disputingLog.id,
        disputeReason.trim(),
        parseFloat(disputeQty) || 1.0
      );
      setDisputingLog(null);
      setDisputeReason('');
      Alert.alert(lang === 'hi' ? 'सफल' : 'Success', lang === 'hi' ? 'आपकी आपत्ति दूधिया को भेज दी गई है!' : 'Delivery dispute submitted to vendor!');
      loadDashboard(auth.customer.id);
    } catch (err: any) {
      Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', err.message || 'Error sending dispute');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleSkipSubmit = async () => {
    if (!auth.customer) return;
    setSubmittingSkip(true);
    try {
      await skipMilkDateApi(auth.customer.id, skipDate, skipReason.trim() || undefined);
      setIsSkipModalOpen(false);
      setSkipReason('');
      Alert.alert(lang === 'hi' ? 'सफल' : 'Success', lang === 'hi' ? `तारीख ${skipDate} के लिए छुट्टी दर्ज हो गई है!` : `Delivery skip scheduled for ${skipDate}!`);
      loadDashboard(auth.customer.id);
    } catch (err: any) {
      Alert.alert(lang === 'hi' ? 'त्रुटि' : 'Error', err.message || 'Error scheduling skip');
    } finally {
      setSubmittingSkip(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>
          {lang === 'hi' ? 'आपका दूध खाता लोड हो रहा है...' : 'Loading your milk account details...'}
        </Text>
      </View>
    );
  }

  const { customer, vendor, month_summary, today_status, recent_logs } = data;

  const renderLogItem = ({ item }: { item: any }) => {
    const isSkipped = item.status === 'Skipped';
    const isExtra = item.status === 'Extra';
    const statusLabel = isSkipped 
      ? (lang === 'hi' ? 'छुट्टी' : 'Skipped') 
      : isExtra 
      ? (lang === 'hi' ? 'अतिरिक्त' : 'Extra') 
      : (lang === 'hi' ? 'वितरित' : 'Delivered');

    return (
      <View style={styles.logCard}>
        <View style={styles.logLeft}>
          <Text style={styles.logDate}>📅 {item.date}</Text>
          <Text style={styles.logAmount}>₹{item.amount}</Text>
        </View>

        <View style={styles.logCenter}>
          <Text style={styles.logQty}>{item.quantity.toFixed(1)} L</Text>
          <Text style={[styles.logStatus, isSkipped && styles.logStatusSkipped]}>
            {statusLabel}
          </Text>
        </View>

        <View style={styles.logRight}>
          {item.dispute_status === 'Pending' ? (
            <View style={styles.disputePendingBadge}>
              <Text style={styles.disputePendingText}>
                {lang === 'hi' ? 'आपत्ति दर्ज' : 'Dispute Open'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => {
                setDisputingLog(item);
                setDisputeQty(String(item.quantity));
              }}
              style={styles.queryBtn}
            >
              <Text style={styles.queryBtnText}>
                {lang === 'hi' ? 'आपत्ति?' : 'Query?'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner Card with Official Logo & Language Toggle */}
      <View style={styles.headerCard}>
        <Image 
          source={require('../../../assets/media/milk-image2.png')} 
          style={styles.cardMilkWatermark} 
          resizeMode="contain" 
        />
        <View style={styles.headerTop}>
          <View style={styles.headerTitleWrap}>
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.headerCardLogo} 
              resizeMode="contain" 
            />
            <View>
              <Text style={styles.welcomeBadge}>
                {lang === 'hi' ? 'ग्राहक पोर्टल' : 'Customer Portal'}
              </Text>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.vendorInfo}>
                {lang === 'hi' ? 'दूधिया: ' : 'Milkman: '}
                <Text style={styles.vendorBold}>{vendor.name}</Text> ({vendor.business_name})
              </Text>
            </View>
          </View>

          {/* Right Header Buttons: Language Toggle & Logout */}
          <View style={styles.headerRightBtns}>
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

        {/* 3 Monthly Stats */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>
              {lang === 'hi' ? 'कुल दूध' : 'Total Milk'}
            </Text>
            <Text style={styles.metricValue}>
              {month_summary.total_liters.toFixed(1)} <Text style={styles.metricUnit}>L</Text>
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>
              {lang === 'hi' ? 'कुल देय राशि' : 'Total Amount'}
            </Text>
            <Text style={styles.metricValue}>₹{month_summary.total_amount}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>
              {lang === 'hi' ? 'वितरित दिन' : 'Days Delivered'}
            </Text>
            <Text style={styles.metricValue}>
              {month_summary.days_delivered} <Text style={styles.metricUnit}>{lang === 'hi' ? 'दिन' : 'days'}</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons: Pay UPI & Skip Milk */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handlePayUpi} style={styles.payUpiBtn} activeOpacity={0.85}>
          <Text style={styles.payUpiText}>
            ⚡ {lang === 'hi' ? `UPI भुगतान (₹${month_summary.total_amount})` : `Pay via UPI (₹${month_summary.total_amount})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSkipModalOpen(true)} style={styles.skipScheduleBtn} activeOpacity={0.85}>
          <Text style={styles.skipScheduleText}>
            📅 {lang === 'hi' ? 'छुट्टी मार्क करें' : 'Schedule Skip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Today Status Card */}
      <View style={styles.todayCard}>
        <Text style={styles.todayTitle}>
          {lang === 'hi' ? 'आज की स्थिति:' : "Today's Status:"}
        </Text>
        <Text style={styles.todayStatusText}>
          {today_status.delivered 
            ? (lang === 'hi' ? `✓ आज ${today_status.quantity}L दूध प्राप्त हुआ` : `✓ Received ${today_status.quantity}L milk today`)
            : (lang === 'hi' ? '⏳ आज की डिलीवरी अभी दर्ज होना बाकी है' : '⏳ Today delivery pending')}
        </Text>
      </View>

      {/* Delivery Log History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>
          {lang === 'hi' ? `हाल का डिलीवरी रिकॉर्ड (${recent_logs.length})` : `Delivery History & Logs (${recent_logs.length})`}
        </Text>
        <FlatList
          data={recent_logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderLogItem}
          contentContainerStyle={styles.logList}
        />
      </View>

      {/* Dispute Modal */}
      <Modal visible={!!disputingLog} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              ⚠️ {lang === 'hi' ? 'दूध मात्रा में आपत्ति' : 'Report Delivery Discrepancy'}
            </Text>
            <Text style={styles.modalSub}>
              {lang === 'hi' ? `तारीख: ${disputingLog?.date} (दर्ज मात्रा: ${disputingLog?.quantity}L)` : `Date: ${disputingLog?.date} (Logged: ${disputingLog?.quantity}L)`}
            </Text>

            <Text style={styles.inputLabel}>
              {lang === 'hi' ? 'वास्तव में कितना दूध मिला? (Liters)' : 'Actual milk quantity received (Liters):'}
            </Text>
            <TextInput 
              style={styles.modalInput} 
              keyboardType="numeric" 
              value={disputeQty} 
              onChangeText={setDisputeQty} 
            />

            <Text style={styles.inputLabel}>
              {lang === 'hi' ? 'आपत्ति का कारण लिखें:' : 'Reason for concern:'}
            </Text>
            <TextInput 
              style={[styles.modalInput, { height: 70 }]} 
              multiline 
              placeholder={lang === 'hi' ? 'उदा. आज 1 लीटर ही आया था...' : 'e.g. Received 1 liter instead of 2L...'} 
              value={disputeReason} 
              onChangeText={setDisputeReason} 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setDisputingLog(null)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDisputeSubmit} disabled={submittingDispute} style={styles.modalSaveBtn}>
                {submittingDispute ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>{lang === 'hi' ? 'आपत्ति भेजें' : 'Submit Query'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Skip Milk Modal */}
      <Modal visible={isSkipModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              📅 {lang === 'hi' ? 'भविष्य की छुट्टी दर्ज करें' : 'Schedule Future Milk Skip'}
            </Text>
            <Text style={styles.modalSub}>
              {lang === 'hi' ? 'जिस दिन दूध नहीं चाहिए, वह तारीख लिखें (YYYY-MM-DD):' : 'Enter date to pause delivery (YYYY-MM-DD):'}
            </Text>

            <TextInput 
              style={styles.modalInput} 
              placeholder="YYYY-MM-DD" 
              value={skipDate} 
              onChangeText={setSkipDate} 
            />

            <TextInput 
              style={styles.modalInput} 
              placeholder={lang === 'hi' ? 'कारण (वैकल्पिक: बाहर जा रहे हैं...)' : 'Reason (optional: out of town...)'} 
              value={skipReason} 
              onChangeText={setSkipReason} 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsSkipModalOpen(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkipSubmit} disabled={submittingSkip} style={styles.modalSaveBtn}>
                {submittingSkip ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>{lang === 'hi' ? 'छुट्टी दर्ज करें' : 'Confirm Skip'}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerCard: {
    backgroundColor: '#1e3a8a',
    margin: 12,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  cardMilkWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 150,
    height: 150,
    opacity: 0.18,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerCardLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 2,
  },
  welcomeBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#93c5fd',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  customerName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  vendorInfo: {
    fontSize: 11,
    color: '#bfdbfe',
    marginTop: 2,
  },
  vendorBold: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  langBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  metricItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#bfdbfe',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: 'normal',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
  },
  payUpiBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  payUpiText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  skipScheduleBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  skipScheduleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  todayCard: {
    backgroundColor: '#ffffff',
    margin: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  todayStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    flex: 1,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 8,
  },
  logList: {
    paddingBottom: 40,
  },
  logCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logLeft: {
    flex: 1,
  },
  logDate: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  logAmount: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  logCenter: {
    flex: 1,
    alignItems: 'center',
  },
  logQty: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2563eb',
  },
  logStatus: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  logStatusSkipped: {
    color: '#b91c1c',
  },
  logRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  queryBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  queryBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  disputePendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  disputePendingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#b45309',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: 'bold',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
