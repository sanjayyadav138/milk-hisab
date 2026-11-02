import React from 'react';
import { 
  StyleSheet, View, Text, Modal, TouchableOpacity, 
  ScrollView, Linking, Alert, Image 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface MonthlySlipModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenFullLedger?: () => void;
  billData?: {
    month?: string;
    totalLiters?: number;
    ratePerLiter?: number;
    totalAmount?: number;
    deliveredDays?: number;
    skippedDays?: number;
    status?: 'Settled' | 'Pending';
  };
}

export default function MonthlySlipModal({ 
  visible, 
  onClose, 
  onOpenFullLedger,
  billData 
}: MonthlySlipModalProps) {
  const { lang } = useLanguage();
  const { auth } = useAuth();

  const isHi = lang === 'hi';

  const customerName = auth.customer?.name || (isHi ? 'संजय यादव' : 'Sanjay Yadav');
  const vendorName = auth.user?.business_name || (isHi ? 'श्री कृष्णा डेयरी फार्म' : 'Shree Krishna Dairy Farm');
  const monthName = billData?.month || (isHi ? 'अक्टूबर 2026' : 'October 2026');
  const totalLiters = billData?.totalLiters || 45.0;
  const ratePerLiter = billData?.ratePerLiter || 60;
  const totalAmount = billData?.totalAmount || 2700;
  const deliveredDays = billData?.deliveredDays || 30;
  const skippedDays = billData?.skippedDays || 1;
  const status = billData?.status || 'Settled';

  const handleShareWhatsApp = () => {
    const textReceipt = isHi
      ? `🥛 *मिल्क हिसाब (Milk Hisab) - मासिक बिल पर्ची*\n` +
        `--------------------------------\n` +
        `🏪 *डेयरी:* ${vendorName}\n` +
        `👤 *ग्राहक:* ${customerName}\n` +
        `📅 *माह:* ${monthName}\n` +
        `📋 *पर्ची संख्या:* #MH-2026-10-842\n` +
        `--------------------------------\n` +
        `• कुल दूध मात्रा: *${totalLiters.toFixed(1)} L*\n` +
        `• दर / भाव: *₹${ratePerLiter}/लीटर*\n` +
        `• कुल बिल राशि: *₹${totalAmount.toLocaleString('en-IN')}*\n` +
        `• वितरित दिन: ${deliveredDays} दिन (छुट्टी: ${skippedDays} दिन)\n` +
        `• स्थिति: *${status === 'Settled' ? '✅ चुकता (Settled)' : '⚡ देय (Pending)'}*\n` +
        `--------------------------------\n` +
        `डिजिटल दूध बहीखाता • Milk Hisab App`
      : `🥛 *Milk Hisab - Verified Monthly Bill Slip*\n` +
        `--------------------------------\n` +
        `🏪 *Dairy:* ${vendorName}\n` +
        `👤 *Customer:* ${customerName}\n` +
        `📅 *Billing Cycle:* ${monthName}\n` +
        `📋 *Slip ID:* #MH-2026-10-842\n` +
        `--------------------------------\n` +
        `• Total Volume: *${totalLiters.toFixed(1)} Liters*\n` +
        `• Agreed Rate: *₹${ratePerLiter}/Liter*\n` +
        `• Total Monthly Bill: *₹${totalAmount.toLocaleString('en-IN')}*\n` +
        `• Delivered Days: ${deliveredDays} (Skipped: ${skippedDays})\n` +
        `• Ledger Status: *${status}*\n` +
        `--------------------------------\n` +
        `Zero-dispute digital dairy ledger • Milk Hisab`;

    const encoded = encodeURIComponent(textReceipt);
    const waUrl = `whatsapp://send?text=${encoded}`;

    Linking.openURL(waUrl).catch(() => {
      Alert.alert(
        isHi ? 'WhatsApp उपलब्ध नहीं' : 'WhatsApp Not Found',
        isHi 
          ? 'आपके फोन में WhatsApp नहीं खुला। पर्ची तैयार है:\n\n' + textReceipt
          : 'Could not open WhatsApp directly. Your slip summary:\n\n' + textReceipt
      );
    });
  };

  const handlePayUpi = () => {
    const upiId = '918076646872@paytm';
    const payeeName = encodeURIComponent(vendorName);
    const note = encodeURIComponent(`Milk Slip ${monthName} - ${customerName}`);
    const upiUrl = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${totalAmount}&cu=INR&tn=${note}`;

    Linking.openURL(upiUrl).catch(() => {
      Alert.alert(
        isHi ? 'UPI भुगतान' : 'UPI Payment',
        isHi 
          ? `कृपया PhonePe, Google Pay या Paytm पर UPI ID: ${upiId} पर ₹${totalAmount} का भुगतान करें।`
          : `Please open your UPI app and pay ₹${totalAmount} to UPI ID: ${upiId}`
      );
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          
          {/* Top Bar with Milk Hisab Logo and Close */}
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.logoIcon} 
                resizeMode="contain" 
              />
              <View>
                <Text style={styles.slipBrandTitle}>Milk Hisab • {isHi ? 'मासिक पर्ची' : 'Monthly Slip'}</Text>
                <Text style={styles.slipIdText}>#MH-2026-10-842 • {monthName}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Header Voucher Card */}
            <View style={styles.voucherCard}>
              <View style={styles.voucherRow}>
                <View style={styles.voucherCol}>
                  <Text style={styles.voucherLabel}>{isHi ? 'ग्राहक' : 'Customer'}</Text>
                  <Text style={styles.voucherValueBold}>{customerName}</Text>
                  <Text style={styles.voucherSub}>+91 98765 43210</Text>
                </View>

                <View style={[styles.voucherCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.voucherLabel}>{isHi ? 'डेयरी फार्म / दूधिया' : 'Dairy Farm / Milkman'}</Text>
                  <Text style={styles.voucherValueBold}>{vendorName}</Text>
                  <Text style={styles.voucherSub}>{isHi ? 'A2 Gir शुद्ध गाय का दूध' : 'A2 Pure Cow Milk'}</Text>
                </View>
              </View>
            </View>

            {/* Bill Summary Grid */}
            <View style={styles.summaryGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>{isHi ? 'कुल दूध' : 'Total Milk'}</Text>
                <Text style={styles.metricValueLarge}>{totalLiters.toFixed(1)} <Text style={styles.unitText}>L</Text></Text>
                <Text style={styles.metricHint}>{deliveredDays} {isHi ? 'दिन वितरण' : 'days delivered'}</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>{isHi ? 'दर / भाव' : 'Rate'}</Text>
                <Text style={styles.metricValueLarge}>₹{ratePerLiter}</Text>
                <Text style={styles.metricHint}>{isHi ? 'प्रति लीटर' : 'per liter'}</Text>
              </View>

              <View style={[styles.metricBox, styles.metricBoxHighlight]}>
                <Text style={[styles.metricLabel, { color: '#1E3A8A' }]}>{isHi ? 'कुल बिल राशि' : 'Net Bill'}</Text>
                <Text style={[styles.metricValueLarge, { color: '#1E3A8A' }]}>₹{totalAmount}</Text>
                <View style={status === 'Settled' ? styles.settledBadge : styles.pendingBadge}>
                  <Text style={status === 'Settled' ? styles.settledBadgeText : styles.pendingBadgeText}>
                    {status === 'Settled' ? (isHi ? '✓ चुकता' : '✓ Settled') : (isHi ? '⚡ देय' : '⚡ Due')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Itemized Audit Breakdown */}
            <View style={styles.auditCard}>
              <Text style={styles.auditTitle}>
                📋 {isHi ? 'दैनिक संकलन सारांश (Audit Summary)' : 'Daily Audit Summary'}
              </Text>
              <View style={styles.auditRow}>
                <Text style={styles.auditLabel}>{isHi ? '01 - 10 अक्टूबर' : '01 - 10 Oct'}</Text>
                <Text style={styles.auditVal}>15.0 L (10 {isHi ? 'दिन' : 'days'} @ 1.5L)</Text>
              </View>
              <View style={styles.auditRow}>
                <Text style={styles.auditLabel}>{isHi ? '11 - 20 अक्टूबर' : '11 - 20 Oct'}</Text>
                <Text style={styles.auditVal}>13.5 L (9 {isHi ? 'दिन' : 'days'} • 1 {isHi ? 'छुट्टी' : 'skip'})</Text>
              </View>
              <View style={styles.auditRow}>
                <Text style={styles.auditLabel}>{isHi ? '21 - 31 अक्टूबर' : '21 - 31 Oct'}</Text>
                <Text style={styles.auditVal}>16.5 L (11 {isHi ? 'दिन' : 'days'} @ 1.5L)</Text>
              </View>
              <View style={[styles.auditRow, styles.auditRowTotal]}>
                <Text style={styles.auditTotalLabel}>{isHi ? 'कुल देय हिसाब' : 'Total Reconciled'}</Text>
                <Text style={styles.auditTotalVal}>45.0 L = ₹2,700.00</Text>
              </View>
            </View>

            {/* Action Buttons: strictly NO RED BUTTONS */}
            <View style={styles.actionWrap}>
              
              {/* WhatsApp Share Button (Ledger Green #10B981) */}
              <TouchableOpacity 
                onPress={handleShareWhatsApp} 
                style={styles.whatsAppBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.whatsAppBtnText}>
                  📲 {isHi ? 'WhatsApp पर सत्यापित पर्ची भेजें' : 'Share Verified Slip on WhatsApp'}
                </Text>
              </TouchableOpacity>

              {/* Direct UPI Button (Deep Dairy Blue #1E3A8A) */}
              <TouchableOpacity 
                onPress={handlePayUpi} 
                style={styles.upiBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.upiBtnText}>
                  ⚡ {isHi ? `UPI द्वारा भुगतान करें (₹${totalAmount})` : `Instant Pay via UPI (₹${totalAmount})`}
                </Text>
              </TouchableOpacity>

              {/* Full Ledger Navigation Button (Crisp Sky Blue #38BDF8) */}
              {onOpenFullLedger && (
                <TouchableOpacity 
                  onPress={() => {
                    onClose();
                    onOpenFullLedger();
                  }} 
                  style={styles.fullLedgerBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.fullLedgerBtnText}>
                    📊 {isHi ? 'विस्तृत खाता बही (कैलेंडर) देखें' : 'View Full Detailed Calendar Ledger'} →
                  </Text>
                </TouchableOpacity>
              )}

            </View>

          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 36,
    height: 36,
  },
  slipBrandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  slipIdText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748B',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  voucherCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  voucherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voucherCol: {
    flex: 1,
  },
  voucherLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  voucherValueBold: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  voucherSub: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricBoxHighlight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },
  metricValueLarge: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricHint: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 3,
  },
  settledBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  settledBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065F46',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  auditTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  auditLabel: {
    fontSize: 12,
    color: '#475569',
  },
  auditVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  auditRowTotal: {
    borderBottomWidth: 0,
    paddingTop: 10,
    marginTop: 4,
  },
  auditTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  auditTotalVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10B981',
  },
  actionWrap: {
    gap: 10,
  },
  whatsAppBtn: {
    backgroundColor: '#10B981', // Ledger Green
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  upiBtn: {
    backgroundColor: '#1E3A8A', // Deep Dairy Blue
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  upiBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  fullLedgerBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#38BDF8', // Sky Blue
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  fullLedgerBtnText: {
    color: '#0369A1',
    fontSize: 13,
    fontWeight: '800',
  },
});
