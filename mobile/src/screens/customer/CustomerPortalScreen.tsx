import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, Modal, TextInput, Linking, Alert, Image 
} from 'react-native';
import { fetchCustomerDashboardApi, raiseDisputeApi, skipMilkDateApi } from '../../api/client';
import { CustomerDashboardData, Customer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CustomerPortalScreen() {
  const { auth, logout } = useAuth();
  const { lang, t } = useLanguage();
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
      Alert.alert('त्रुटि', err.message || 'खाता लोड नहीं हुआ');
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
        'UPI ऐप नहीं मिला',
        `कृपया अपने फोन में Google Pay, PhonePe या Paytm खोलें और ${upiId} पर ₹${amount} भेजें।`
      );
    });
  };

  const handleDisputeSubmit = async () => {
    if (!disputingLog || !auth.customer) return;
    if (!disputeReason.trim()) {
      Alert.alert('कारण आवश्यक', 'कृपया आपत्ति का कारण लिखें');
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
      Alert.alert('सफल', 'आपकी आपत्ति दूधिया को भेज दी गई है!');
      loadDashboard(auth.customer.id);
    } catch (err: any) {
      Alert.alert('त्रुटि', err.message || 'आपत्ति भेजने में समस्या');
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
      Alert.alert('सफल', `तारीख ${skipDate} के लिए छुट्टी दर्ज हो गई है!`);
      loadDashboard(auth.customer.id);
    } catch (err: any) {
      Alert.alert('त्रुटि', err.message || 'छुट्टी दर्ज नहीं हो सकी');
    } finally {
      setSubmittingSkip(false);
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>आपका दूध खाता लोड हो रहा है...</Text>
      </View>
    );
  }

  const { customer, vendor, month_summary, today_status, recent_logs } = data;

  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.logCard}>
      <View style={styles.logLeft}>
        <Text style={styles.logDate}>📅 {item.date}</Text>
        <Text style={styles.logAmount}>₹{item.amount}</Text>
      </View>

      <View style={styles.logCenter}>
        <Text style={styles.logQty}>{item.quantity.toFixed(1)} L</Text>
        <Text style={styles.logStatus}>
          {item.status === 'Skipped' ? 'छुट्टी' : item.status === 'Extra' ? 'अतिरिक्त' : 'वितरित'}
        </Text>
      </View>

      <View style={styles.logRight}>
        {item.dispute_status === 'Pending' ? (
          <View style={styles.disputePendingBadge}>
            <Text style={styles.disputePendingText}>आपत्ति दर्ज</Text>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => {
              setDisputingLog(item);
              setDisputeQty(String(item.quantity));
            }}
            style={styles.queryBtn}
          >
            <Text style={styles.queryBtnText}>आपत्ति?</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Banner Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeBadge}>ग्राहक पोर्टल</Text>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.vendorInfo}>दूधिया: {vendor.name} ({vendor.business_name})</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>लॉगआउट</Text>
          </TouchableOpacity>
        </View>

        {/* 3 Monthly Stats */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>कुल दूध</Text>
            <Text style={styles.metricValue}>{month_summary.total_liters.toFixed(1)} <Text style={styles.metricUnit}>L</Text></Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>कुल देय राशि</Text>
            <Text style={styles.metricValue}>₹{month_summary.total_amount}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>वितरित दिन</Text>
            <Text style={styles.metricValue}>{month_summary.days_delivered} <Text style={styles.metricUnit}>दिन</Text></Text>
          </View>
        </View>
      </View>

      {/* Action Buttons: Pay UPI & Skip Milk */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={handlePayUpi} style={styles.payUpiBtn}>
          <Text style={styles.payUpiText}>⚡ UPI भुगतान (₹{month_summary.total_amount})</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSkipModalOpen(true)} style={styles.skipScheduleBtn}>
          <Text style={styles.skipScheduleText}>📅 छुट्टी मार्क करें</Text>
        </TouchableOpacity>
      </View>

      {/* Today Status Pill */}
      <View style={styles.todayCard}>
        <Text style={styles.todayTitle}>आज की स्थिति:</Text>
        <Text style={styles.todayStatusText}>
          {today_status.delivered 
            ? `✓ आज ${today_status.quantity}L दूध प्राप्त हुआ` 
            : '⏳ आज की डिलीवरी अभी दर्ज होना बाकी है'}
        </Text>
      </View>

      {/* Delivery Log History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>हाल का डिलीवरी रिकॉर्ड ({recent_logs.length})</Text>
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
            <Text style={styles.modalTitle}>⚠️ दूध मात्रा में आपत्ति</Text>
            <Text style={styles.modalSub}>
              तारीख: {disputingLog?.date} (दर्ज मात्रा: {disputingLog?.quantity}L)
            </Text>

            <Text style={styles.inputLabel}>वास्तव में कितना दूध मिला? (Liters)</Text>
            <TextInput 
              style={styles.modalInput} 
              keyboardType="numeric" 
              value={disputeQty} 
              onChangeText={setDisputeQty} 
            />

            <Text style={styles.inputLabel}>आपत्ति का कारण लिखें:</Text>
            <TextInput 
              style={[styles.modalInput, { height: 70 }]} 
              multiline 
              placeholder="उदा. आज 1 लीटर ही आया था..." 
              value={disputeReason} 
              onChangeText={setDisputeReason} 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setDisputingLog(null)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>रद्द करें</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDisputeSubmit} disabled={submittingDispute} style={styles.modalSaveBtn}>
                {submittingDispute ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>आपत्ति भेजें</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Skip Milk Modal */}
      <Modal visible={isSkipModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📅 भविष्य की छुट्टी दर्ज करें</Text>
            <Text style={styles.modalSub}>जिस दिन दूध नहीं चाहिए, वह तारीख लिखें (YYYY-MM-DD):</Text>

            <TextInput 
              style={styles.modalInput} 
              placeholder="YYYY-MM-DD (उदा. 2026-10-30)" 
              value={skipDate} 
              onChangeText={setSkipDate} 
            />

            <TextInput 
              style={styles.modalInput} 
              placeholder="कारण (वैकल्पिक: बाहर जा रहे हैं...)" 
              value={skipReason} 
              onChangeText={setSkipReason} 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setIsSkipModalOpen(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>रद्द करें</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkipSubmit} disabled={submittingSkip} style={styles.modalSaveBtn}>
                {submittingSkip ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>छुट्टी दर्ज करें</Text>}
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
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerCardLogo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#93c5fd',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  vendorInfo: {
    fontSize: 12,
    color: '#bfdbfe',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: 16,
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
    fontSize: 13,
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
    fontSize: 13,
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
    color: '#64748b',
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
    fontSize: 18,
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
