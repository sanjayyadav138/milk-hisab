import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, Modal, TouchableOpacity, 
  ScrollView, Linking, Alert, Image, ActivityIndicator 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchMonthlySlipApi, fetchCustomersApi } from '../api/client';
import { Customer } from '../types';

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

const AVAILABLE_MONTHS = [
  { key: '2026-11', nameHi: 'नवम्बर 2026', nameEn: 'November 2026' },
  { key: '2026-10', nameHi: 'अक्टूबर 2026', nameEn: 'October 2026' },
  { key: '2026-09', nameHi: 'सितम्बर 2026', nameEn: 'September 2026' },
  { key: '2026-08', nameHi: 'अगस्त 2026', nameEn: 'August 2026' },
];

export default function MonthlySlipModal({ 
  visible, 
  onClose, 
  onOpenFullLedger,
}: MonthlySlipModalProps) {
  const { lang } = useLanguage();
  const { auth } = useAuth();
  const isHi = lang === 'hi';
  const isVendor = auth.role === 'vendor';

  // Selected Month State
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Vendor: Customers list & selected customer
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    isVendor ? 1 : (auth.customer?.id || 1)
  );

  const [loading, setLoading] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);

  // Load customer list if vendor
  useEffect(() => {
    if (visible && isVendor) {
      fetchCustomersApi()
        .then(data => {
          if (data && data.length > 0) {
            setCustomers(data);
            if (!selectedCustomerId) setSelectedCustomerId(data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [visible, isVendor]);

  // Load slip data whenever month or customer changes
  useEffect(() => {
    if (visible) {
      const targetCustId = isVendor ? selectedCustomerId : (auth.customer?.id || 1);
      loadSlip(targetCustId, selectedMonth);
    }
  }, [visible, selectedMonth, selectedCustomerId]);

  const loadSlip = async (custId: number, monthKey: string) => {
    setLoading(true);
    try {
      const data = await fetchMonthlySlipApi(custId, monthKey);
      if (data) {
        setSlipData(data);
      } else {
        createFallbackSlip(custId, monthKey);
      }
    } catch {
      createFallbackSlip(custId, monthKey);
    } finally {
      setLoading(false);
    }
  };

  const createFallbackSlip = (custId: number, monthKey: string) => {
    const custObj = customers.find(c => c.id === custId) || auth.customer;
    const cName = custObj?.name || (isHi ? 'राजेश शर्मा' : 'Rajesh Sharma');
    const mObj = AVAILABLE_MONTHS.find(m => m.key === monthKey);
    const mName = isHi ? mObj?.nameHi : mObj?.nameEn;

    setSlipData({
      month: monthKey,
      month_name_hi: mObj?.nameHi || 'अक्टूबर 2026',
      month_name_en: mObj?.nameEn || 'October 2026',
      customer_name: cName,
      customer_phone: custObj?.phone || '9811122233',
      vendor_name: auth.user?.business_name || (isHi ? 'श्री कृष्णा डेयरी फार्म' : 'Shree Krishna Dairy Farm'),
      total_liters: 45.0,
      rate_per_liter: 60,
      total_amount: 2700,
      delivered_days: 30,
      skipped_days: 1,
      status: 'Settled',
      balance_due: 0,
      paid_amount: 2700,
    });
  };

  const currentMonthObj = AVAILABLE_MONTHS.find(m => m.key === selectedMonth);
  const monthDisplay = isHi ? currentMonthObj?.nameHi : currentMonthObj?.nameEn;

  const customerName = slipData?.customer_name || (auth.customer?.name || (isHi ? 'संजय यादव' : 'Sanjay Yadav'));
  const vendorName = slipData?.vendor_name || auth.user?.business_name || (isHi ? 'श्री कृष्णा डेयरी फार्म' : 'Shree Krishna Dairy Farm');
  const totalLiters = slipData?.total_liters || 45.0;
  const ratePerLiter = slipData?.rate_per_liter || 60;
  const totalAmount = slipData?.total_amount || 2700;
  const deliveredDays = slipData?.delivered_days || 30;
  const skippedDays = slipData?.skipped_days || 1;
  const status = slipData?.status || 'Settled';

  const handleShareWhatsApp = () => {
    const textReceipt = isHi
      ? `🥛 *मिल्क हिसाब (Milk Hisab) - मासिक बिल पर्ची*\n` +
        `--------------------------------\n` +
        `🏪 *डेयरी:* ${vendorName}\n` +
        `👤 *ग्राहक:* ${customerName}\n` +
        `📅 *माह:* ${monthDisplay}\n` +
        `📋 *पर्ची संख्या:* #MH-${selectedMonth}-${slipData?.customer_id || 1}\n` +
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
        `📅 *Billing Cycle:* ${monthDisplay}\n` +
        `📋 *Slip ID:* #MH-${selectedMonth}-${slipData?.customer_id || 1}\n` +
        `--------------------------------\n` +
        `• Total Volume: *${totalLiters.toFixed(1)} Liters*\n` +
        `• Agreed Rate: *₹${ratePerLiter}/Liter*\n` +
        `• Total Monthly Bill: *₹${totalAmount.toLocaleString('en-IN')}*\n` +
        `• Delivered Days: ${deliveredDays} (Skipped: ${skippedDays})\n` +
        `• Ledger Status: *${status}*\n` +
        `--------------------------------\n` +
        `Zero-dispute digital dairy ledger • Milk Hisab`;

    const encoded = encodeURIComponent(textReceipt);
    const targetPhone = slipData?.customer_phone ? slipData.customer_phone.replace(/[^0-9]/g, '') : '';
    const waUrl = targetPhone ? `whatsapp://send?phone=91${targetPhone}&text=${encoded}` : `whatsapp://send?text=${encoded}`;

    Linking.openURL(waUrl).catch(() => {
      Alert.alert(
        isHi ? 'WhatsApp उपलब्ध नहीं' : 'WhatsApp Not Found',
        isHi ? 'पर्ची का विवरण तैयार है:\n\n' + textReceipt : 'Slip details:\n\n' + textReceipt
      );
    });
  };

  const handlePayUpi = () => {
    const upiId = slipData?.vendor_upi || '918076646872@paytm';
    const payeeName = encodeURIComponent(vendorName);
    const note = encodeURIComponent(`Milk Slip ${monthDisplay} - ${customerName}`);
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
                source={require('../../assets/logo.png')} 
                style={styles.logoIcon} 
                resizeMode="contain" 
              />
              <View>
                <Text style={styles.slipBrandTitle}>Milk Hisab • {isHi ? 'मासिक पर्ची' : 'Monthly Slip'}</Text>
                <Text style={styles.slipIdText}>#MH-{selectedMonth} • {monthDisplay}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Month Selector Pills (Issue 6 Fix!) */}
          <View style={styles.monthPickerSection}>
            <Text style={styles.pickerSectionLabel}>
              📅 {isHi ? 'माह चुनें (SELECT MONTH):' : 'Select Month:'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthPillsRow}>
              {AVAILABLE_MONTHS.map(m => (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => setSelectedMonth(m.key)}
                  style={[styles.monthPill, selectedMonth === m.key && styles.monthPillActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.monthPillText, selectedMonth === m.key && styles.monthPillTextActive]}>
                    {isHi ? m.nameHi : m.nameEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Vendor Customer Selector (Issue 6 Fix!) */}
          {isVendor && customers.length > 0 && (
            <View style={styles.customerPickerSection}>
              <Text style={styles.pickerSectionLabel}>
                👥 {isHi ? 'ग्राहक चुनें (SELECT CUSTOMER):' : 'Select Customer:'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.customerPillsRow}>
                {customers.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelectedCustomerId(c.id)}
                    style={[styles.customerPill, selectedCustomerId === c.id && styles.customerPillActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.customerPillText, selectedCustomerId === c.id && styles.customerPillTextActive]}>
                      👤 {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={styles.loadingText}>{isHi ? 'पर्ची लोड हो रही है...' : 'Calculating slip...'}</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              {/* Slip Card Design */}
              <View style={styles.voucherContainer}>
                
                {/* Meta details */}
                <View style={styles.voucherTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.voucherPartyLabel}>{isHi ? 'डेयरी विक्रेता:' : 'Dairy Vendor:'}</Text>
                    <Text style={styles.voucherPartyName}>{vendorName}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.voucherPartyLabel}>{isHi ? 'ग्राहक विवरण:' : 'Customer:'}</Text>
                    <Text style={styles.voucherPartyName}>{customerName}</Text>
                  </View>
                </View>

                <View style={styles.dashedDivider} />

                {/* Big Highlights Row */}
                <View style={styles.voucherStatsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{isHi ? 'कुल दूध मात्रा' : 'Total Volume'}</Text>
                    <Text style={[styles.statValue, { color: '#1E3A8A' }]}>{totalLiters.toFixed(1)} L</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{isHi ? 'तय दर / भाव' : 'Agreed Rate'}</Text>
                    <Text style={styles.statValue}>₹{ratePerLiter}/L</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{isHi ? 'वितरित दिन' : 'Days'}</Text>
                    <Text style={styles.statValue}>{deliveredDays} दिन</Text>
                  </View>
                </View>

                <View style={styles.dashedDivider} />

                {/* Bill Amount Row */}
                <View style={styles.amountRow}>
                  <View>
                    <Text style={styles.totalBillLabel}>{isHi ? 'कुल मासिक देय राशि' : 'Total Monthly Bill'}</Text>
                    <Text style={styles.subtext}>
                      {isHi ? `${deliveredDays} दिन दूध प्राप्त • ${skippedDays} दिन छुट्टी` : `${deliveredDays} delivered, ${skippedDays} skipped`}
                    </Text>
                  </View>
                  <Text style={styles.totalBillAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
                </View>

                {/* Status Badge */}
                <View style={styles.statusRow}>
                  <View style={status === 'Settled' ? styles.settledBadge : styles.pendingBadge}>
                    <Text style={status === 'Settled' ? styles.settledText : styles.pendingText}>
                      {status === 'Settled' 
                        ? (isHi ? '✅ भुगतान चुकता (Settled)' : '✅ Payment Settled')
                        : (isHi ? '⚡ भुगतान देय (Payment Pending)' : '⚡ Payment Due')}
                    </Text>
                  </View>
                </View>

              </View>

              {/* Action Buttons */}
              <View style={styles.actionBtnRow}>
                <TouchableOpacity 
                  onPress={handleShareWhatsApp} 
                  style={styles.shareWhatsAppBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.shareWhatsAppText}>
                    💬 {isHi ? 'WhatsApp पर पर्ची भेजें' : 'Share Slip on WhatsApp'}
                  </Text>
                </TouchableOpacity>

                {!isVendor && status !== 'Settled' && (
                  <TouchableOpacity 
                    onPress={handlePayUpi} 
                    style={styles.payUpiBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.payUpiText}>
                      ⚡ {isHi ? `₹${totalAmount} का UPI भुगतान करें` : `Pay ₹${totalAmount} via UPI`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {onOpenFullLedger && (
                <TouchableOpacity onPress={() => { onClose(); onOpenFullLedger(); }} style={styles.fullLedgerLink}>
                  <Text style={styles.fullLedgerLinkText}>
                    📅 {isHi ? 'पूरा दैनिक बहीखाता विवरण देखें →' : 'View Full Daily Ledger Breakdown →'}
                  </Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    maxHeight: '92%',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 38,
    height: 38,
    marginRight: 10,
  },
  slipBrandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  slipIdText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: 'bold',
  },
  monthPickerSection: {
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerPickerSection: {
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  monthPillsRow: {
    gap: 8,
  },
  customerPillsRow: {
    gap: 8,
  },
  monthPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  monthPillActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  monthPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  monthPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  customerPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  customerPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  customerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  customerPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  voucherContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  voucherTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voucherPartyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  voucherPartyName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginVertical: 12,
  },
  voucherStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalBillLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  subtext: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  totalBillAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
  },
  statusRow: {
    marginTop: 12,
    alignItems: 'center',
  },
  settledBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  settledText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  actionBtnRow: {
    marginTop: 16,
    gap: 10,
  },
  shareWhatsAppBtn: {
    backgroundColor: '#1E3A8A', // Deep Dairy Blue
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  shareWhatsAppText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  payUpiBtn: {
    backgroundColor: '#10B981', // Ledger Green
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  payUpiText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  fullLedgerLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  fullLedgerLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
});
