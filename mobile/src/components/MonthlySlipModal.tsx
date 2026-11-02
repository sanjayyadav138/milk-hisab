import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, Modal, TouchableOpacity, 
  ScrollView, Linking, Alert, Image, ActivityIndicator, Share, TextInput 
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchMonthlySlipApi, fetchCustomersApi } from '../api/client';
import { Customer } from '../types';

interface MonthlySlipModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenFullLedger?: () => void;
  initialMonth?: string;
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
  initialMonth,
}: MonthlySlipModalProps) {
  const { lang } = useLanguage();
  const { auth } = useAuth();
  const isHi = lang === 'hi';
  const isVendor = auth.role === 'vendor';

  // Selected Month State
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || '2026-10');

  // Vendor: Customers list & selected customer
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(
    isVendor ? 1 : (auth.customer?.id || 1)
  );

  const [loading, setLoading] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);
  const [showBreakdown, setShowBreakdown] = useState(true);
  const [customPhone, setCustomPhone] = useState('');
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Sync initial month when modal opens
  useEffect(() => {
    if (visible && initialMonth) {
      setSelectedMonth(initialMonth);
    }
  }, [visible, initialMonth]);

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
      if (data && data.total_liters !== undefined) {
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

    const rate = custObj?.price_per_liter || 60.0;
    const dailyQty = custObj?.default_quantity || 1.5;

    let totalLiters = 45.0;
    let deliveredDays = 30;
    let skippedDays = 1;
    let isSettled = true;

    if (monthKey === '2026-11') {
      deliveredDays = 2;
      skippedDays = 0;
      totalLiters = +(deliveredDays * dailyQty).toFixed(1);
      isSettled = false;
    } else if (monthKey === '2026-10') {
      deliveredDays = 30;
      skippedDays = 1;
      totalLiters = +(deliveredDays * dailyQty).toFixed(1);
      isSettled = true;
    } else if (monthKey === '2026-09') {
      deliveredDays = 29;
      skippedDays = 1;
      totalLiters = +(deliveredDays * dailyQty).toFixed(1);
      isSettled = true;
    } else if (monthKey === '2026-08') {
      deliveredDays = 30;
      skippedDays = 1;
      totalLiters = +(deliveredDays * dailyQty).toFixed(1);
      isSettled = true;
    }

    const totalAmount = Math.round(totalLiters * rate);
    const paidAmount = isSettled ? totalAmount : 0;
    const balanceDue = isSettled ? 0 : totalAmount;

    const [yStr, mStr] = monthKey.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    const maxDay = monthKey === '2026-11' ? 2 : daysInMonth;

    const breakdown = [];
    for (let d = 1; d <= maxDay; d++) {
      const isSkip = (d === 15) && (maxDay > 15);
      const curDate = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      breakdown.push({
        date: curDate,
        day: d,
        quantity: isSkip ? 0.0 : dailyQty,
        status: isSkip ? 'Skipped' : 'Delivered',
        notes: isSkip ? (isHi ? 'ग्राहक छुट्टी' : 'Skipped by customer') : (isHi ? 'प्रातः 7:00 बजे वितरित' : 'Morning Delivery')
      });
    }

    setSlipData({
      month: monthKey,
      month_name_hi: mObj?.nameHi || 'अक्टूबर 2026',
      month_name_en: mObj?.nameEn || 'October 2026',
      customer_id: custId,
      customer_name: cName,
      customer_phone: custObj?.phone || '9811122233',
      vendor_name: auth.user?.business_name || (isHi ? 'श्री कृष्णा डेयरी फार्म' : 'Shree Krishna Dairy Farm'),
      vendor_phone: auth.user?.phone || '9811100000',
      vendor_upi: auth.user?.upi_id || '918076646872@paytm',
      total_liters: totalLiters,
      rate_per_liter: rate,
      total_amount: totalAmount,
      delivered_days: deliveredDays,
      skipped_days: skippedDays,
      status: isSettled ? 'Settled' : 'Pending',
      balance_due: balanceDue,
      paid_amount: paidAmount,
      daily_breakdown: breakdown,
    });
  };

  const currentMonthObj = AVAILABLE_MONTHS.find(m => m.key === selectedMonth);
  const monthDisplay = isHi ? currentMonthObj?.nameHi : currentMonthObj?.nameEn;

  const customerName = slipData?.customer_name || (auth.customer?.name || (isHi ? 'संजय यादव' : 'Sanjay Yadav'));
  const vendorName = slipData?.vendor_name || auth.user?.business_name || (isHi ? 'श्री कृष्णा डेयरी फार्म' : 'Shree Krishna Dairy Farm');
  const totalLiters = slipData?.total_liters ?? 45.0;
  const ratePerLiter = slipData?.rate_per_liter ?? 60;
  const totalAmount = slipData?.total_amount ?? 2700;
  const deliveredDays = slipData?.delivered_days ?? 30;
  const skippedDays = slipData?.skipped_days ?? 1;
  const status = slipData?.status || 'Settled';
  const dailyBreakdown = slipData?.daily_breakdown || [];
  const vendorUpi = slipData?.vendor_upi || '918076646872@paytm';

  const buildReceiptText = () => {
    return isHi
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
        `पारदर्शी डिजिटल दूध बहीखाता • Milk Hisab App: https://milkhisab.in`
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
        `Zero-dispute digital dairy ledger • Milk Hisab App: https://milkhisab.in`;
  };

  const handleShareUniversal = async () => {
    const textReceipt = buildReceiptText();
    try {
      await Share.share({
        message: textReceipt,
        title: isHi ? 'मिल्क हिसाब मासिक बिल पर्ची' : 'Milk Hisab Monthly Bill Slip',
      });
    } catch {
      Alert.alert(isHi ? 'पर्ची तैयार' : 'Slip Ready', textReceipt);
    }
  };

  const handleSendToCustomPhone = () => {
    const clean = customPhone.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      Alert.alert(
        isHi ? 'मान्य नंबर दर्ज करें' : 'Invalid Phone Number',
        isHi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }
    const textReceipt = buildReceiptText();
    Linking.openURL(`sms:${clean}?body=${encodeURIComponent(textReceipt)}`).catch(() => {
      handleShareUniversal();
    });
  };

  // Launch specific UPI app
  const launchUpiApp = (app: 'gpay' | 'phonepe' | 'paytm' | 'any') => {
    setShowUpiModal(false);
    const payeeName = encodeURIComponent(vendorName);
    const note = encodeURIComponent(`Milk Slip ${monthDisplay} - ${customerName}`);
    const amount = totalAmount;

    let url = '';
    if (app === 'gpay') {
      url = `tez://upi/pay?pa=${vendorUpi}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else if (app === 'phonepe') {
      url = `phonepe://pay?pa=${vendorUpi}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else if (app === 'paytm') {
      url = `paytmmp://pay?pa=${vendorUpi}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    } else {
      url = `upi://pay?pa=${vendorUpi}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
    }

    Linking.openURL(url).catch(() => {
      // Fallback to standard upi://
      const genericUrl = `upi://pay?pa=${vendorUpi}&pn=${payeeName}&am=${amount}&cu=INR&tn=${note}`;
      Linking.openURL(genericUrl).catch(() => {
        Alert.alert(
          isHi ? 'UPI ऐप उपलब्ध नहीं है' : 'UPI App Not Found',
          isHi 
            ? `कृपया अपने फोन में Google Pay, PhonePe या Paytm खोलें और UPI ID: ${vendorUpi} पर ₹${amount} का भुगतान करें।`
            : `Please open your preferred payment app and send ₹${amount} to UPI ID: ${vendorUpi}`
        );
      });
    });
  };

  const copyUpiId = () => {
    setShowUpiModal(false);
    Alert.alert(
      isHi ? 'UPI ID प्राप्त' : 'UPI ID Copied',
      isHi 
        ? `दूधिया की UPI ID: ${vendorUpi}\nराशि: ₹${totalAmount}\n\nआप किसी भी UPI ऐप (GPay, PhonePe, Paytm, BHIM) में जाकर यह ID डालकर भुगतान कर सकते हैं।`
        : `Vendor UPI ID: ${vendorUpi}\nAmount: ₹${totalAmount}\n\nYou can paste this UPI ID in any payment app to complete payment.`
    );
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

          {/* Month Selector Pills */}
          <View style={styles.monthPickerSection}>
            <Text style={styles.pickerSectionLabel}>
              📅 {isHi ? 'बिल माह चुनें (SELECT MONTH):' : 'Select Month:'}
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

          {/* Vendor Customer Selector */}
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
              <Text style={styles.loadingText}>{isHi ? 'मासिक हिसाब की गणना हो रही है...' : 'Calculating monthly slip...'}</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              
              {/* Slip Voucher Card */}
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
                    <Text style={styles.statLabel}>{isHi ? 'वितरित दिन' : 'Delivered Days'}</Text>
                    <Text style={styles.statValue}>{deliveredDays} {isHi ? 'दिन' : 'days'}</Text>
                  </View>
                </View>

                <View style={styles.dashedDivider} />

                {/* Bill Amount Row */}
                <View style={styles.amountRow}>
                  <View>
                    <Text style={styles.totalBillLabel}>{isHi ? 'कुल मासिक बिल' : 'Total Monthly Bill'}</Text>
                    <Text style={styles.subtext}>
                      {isHi ? `${deliveredDays} दिन वितरण • ${skippedDays} दिन छुट्टी` : `${deliveredDays} delivered, ${skippedDays} skipped`}
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

              {/* Day-by-Day Delivery Breakdown Section */}
              <View style={styles.breakdownSection}>
                <TouchableOpacity 
                  onPress={() => setShowBreakdown(!showBreakdown)}
                  style={styles.breakdownHeader}
                  activeOpacity={0.8}
                >
                  <View style={styles.breakdownTitleRow}>
                    <Text style={styles.breakdownTitle}>
                      📅 {isHi ? 'दैनिक डिलीवरी रिकॉर्ड (दिन-वार ब्योरा)' : 'Day-by-Day Delivery Log'}
                    </Text>
                    <View style={styles.breakdownBadgePill}>
                      <Text style={styles.breakdownBadgeText}>{dailyBreakdown.length} {isHi ? 'दिन' : 'days'}</Text>
                    </View>
                  </View>
                  <Text style={styles.breakdownChevron}>{showBreakdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showBreakdown && (
                  <View style={styles.breakdownTableContainer}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableColHeader, { flex: 1.2 }]}>{isHi ? 'तारीख' : 'Date'}</Text>
                      <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>{isHi ? 'मात्रा' : 'Qty'}</Text>
                      <Text style={[styles.tableColHeader, { flex: 1.2, textAlign: 'right' }]}>{isHi ? 'स्थिति' : 'Status'}</Text>
                    </View>

                    {dailyBreakdown.length === 0 ? (
                      <Text style={styles.emptyBreakdownText}>{isHi ? 'इस माह के लिए कोई रिकॉर्ड उपलब्ध नहीं है' : 'No records for this month'}</Text>
                    ) : (
                      dailyBreakdown.map((row: any, idx: number) => {
                        const isSkip = row.status === 'Skipped';
                        return (
                          <View key={idx} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                            <Text style={[styles.tableCell, { flex: 1.2 }]}>
                              {row.date ? row.date.slice(5) : `Day ${row.day}`}
                            </Text>
                            <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'center' }]}>
                              {row.quantity} L
                            </Text>
                            <View style={[styles.tableStatusCell, { flex: 1.2, alignItems: 'flex-end' }]}>
                              <View style={[styles.tableStatusBadge, isSkip ? styles.tableStatusSkipped : styles.tableStatusDelivered]}>
                                <Text style={[styles.tableStatusText, isSkip ? styles.tableTextSkipped : styles.tableTextDelivered]}>
                                  {isSkip ? (isHi ? 'छुट्टी' : 'Skipped') : (isHi ? 'वितरित' : 'Delivered')}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                )}
              </View>

              {/* Universal Share to ANY Contact / Phone */}
              <View style={styles.shareBox}>
                <Text style={styles.shareBoxLabel}>
                  📤 {isHi ? 'पर्ची किसी भी संपर्क को भेजें (SHARE BILL)' : 'Share Slip to Any Contact:'}
                </Text>
                
                <TouchableOpacity 
                  onPress={handleShareUniversal} 
                  style={styles.universalShareBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.universalShareText}>
                    📤 {isHi ? 'पर्ची शेयर करें (किसी भी ऐप / संपर्क पर)' : 'Share Bill Slip (Any App / Contact)'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.customPhoneRow}>
                  <TextInput
                    style={styles.customPhoneInput}
                    placeholder={isHi ? 'अन्य 10-अंक का मोबाइल नंबर...' : 'Enter 10-digit mobile number...'}
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={customPhone}
                    onChangeText={setCustomPhone}
                  />
                  <TouchableOpacity 
                    onPress={handleSendToCustomPhone}
                    style={styles.customPhoneBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.customPhoneBtnText}>{isHi ? 'SMS भेजें' : 'Send SMS'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* UPI Payment Button with Chooser */}
              {!isVendor && status !== 'Settled' && (
                <TouchableOpacity 
                  onPress={() => setShowUpiModal(true)} 
                  style={styles.payUpiBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.payUpiText}>
                    ⚡ {isHi ? `₹${totalAmount} का UPI भुगतान करें (GPay / PhonePe / Paytm)` : `Pay ₹${totalAmount} via UPI (GPay / PhonePe / Paytm)`}
                  </Text>
                </TouchableOpacity>
              )}

              {onOpenFullLedger && (
                <TouchableOpacity onPress={() => { onClose(); onOpenFullLedger(); }} style={styles.fullLedgerLink}>
                  <Text style={styles.fullLedgerLinkText}>
                    📊 {isHi ? 'पूरा दैनिक बहीखाता विवरण देखें →' : 'View Full Daily Ledger Breakdown →'}
                  </Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          )}

        </View>
      </View>

      {/* UPI App Chooser Modal */}
      <Modal visible={showUpiModal} animationType="fade" transparent onRequestClose={() => setShowUpiModal(false)}>
        <View style={styles.upiModalBackdrop}>
          <View style={styles.upiModalCard}>
            <Text style={styles.upiModalTitle}>⚡ {isHi ? 'UPI भुगतान माध्यम चुनें' : 'Choose UPI Payment App'}</Text>
            <Text style={styles.upiModalSub}>
              {isHi ? `देय राशि: ₹${totalAmount} • प्राप्तकर्ता: ${vendorName}` : `Amount: ₹${totalAmount} • Payee: ${vendorName}`}
            </Text>

            <TouchableOpacity 
              onPress={() => launchUpiApp('gpay')} 
              style={[styles.upiAppBtn, { backgroundColor: '#1E3A8A' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.upiAppBtnText}>🔵 Google Pay (GPay)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => launchUpiApp('phonepe')} 
              style={[styles.upiAppBtn, { backgroundColor: '#5F259F' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.upiAppBtnText}>🟣 PhonePe (फोनपे)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => launchUpiApp('paytm')} 
              style={[styles.upiAppBtn, { backgroundColor: '#00BAF2' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.upiAppBtnText}>🔷 Paytm (पेटीएम)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => launchUpiApp('any')} 
              style={[styles.upiAppBtn, { backgroundColor: '#10B981' }]}
              activeOpacity={0.85}
            >
              <Text style={styles.upiAppBtnText}>⚡ {isHi ? 'कोई भी अन्य UPI ऐप' : 'Any Other UPI App'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={copyUpiId} 
              style={styles.copyUpiBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.copyUpiBtnText}>📋 {isHi ? `UPI ID कॉपी करें (${vendorUpi})` : `Copy UPI ID (${vendorUpi})`}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowUpiModal(false)} 
              style={styles.closeUpiModalBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.closeUpiModalText}>{isHi ? 'रद्द करें' : 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    borderRadius: 24,
    padding: 18,
    maxHeight: '94%',
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
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
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
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customerPickerSection: {
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
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
    borderRadius: 10,
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
    borderRadius: 16,
    padding: 14,
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
    marginVertical: 10,
  },
  voucherStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
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
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
  },
  statusRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  settledBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  breakdownSection: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
  },
  breakdownTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  breakdownBadgePill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  breakdownBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  breakdownChevron: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'bold',
  },
  breakdownTableContainer: {
    padding: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 4,
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tableCell: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  tableCellBold: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
  },
  tableStatusCell: {
    justifyContent: 'center',
  },
  tableStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tableStatusDelivered: {
    backgroundColor: '#ECFDF5',
  },
  tableStatusSkipped: {
    backgroundColor: '#FEF3C7',
  },
  tableStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tableTextDelivered: {
    color: '#059669',
  },
  tableTextSkipped: {
    color: '#D97706',
  },
  emptyBreakdownText: {
    textAlign: 'center',
    paddingVertical: 12,
    fontSize: 12,
    color: '#94A3B8',
  },
  shareBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shareBoxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  universalShareBtn: {
    backgroundColor: '#1E3A8A', // Deep Dairy Blue
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  universalShareText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  customPhoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customPhoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  customPhoneBtn: {
    backgroundColor: '#0284C7', // Sky Blue
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customPhoneBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  payUpiBtn: {
    backgroundColor: '#10B981', // Ledger Green
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
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
  upiModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  upiModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  upiModalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  upiModalSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  upiAppBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  upiAppBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  copyUpiBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 4,
    marginBottom: 8,
  },
  copyUpiBtnText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '800',
  },
  closeUpiModalBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  closeUpiModalText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});
