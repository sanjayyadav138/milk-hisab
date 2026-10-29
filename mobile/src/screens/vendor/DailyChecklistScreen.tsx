import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  ActivityIndicator, SafeAreaView, Alert, Image 
} from 'react-native';
import { fetchDayChecklistApi, submitBatchLogsApi } from '../../api/client';
import { DailyLogItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export default function DailyChecklistScreen() {
  const { t, lang } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checklist, setChecklist] = useState<DailyLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'DELIVERY' | 'COLLECTION'>('ALL');

  const loadData = useCallback(async (date: string) => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await fetchDayChecklistApi(date);
      setChecklist(res.checklist);
    } catch (err: any) {
      Alert.alert('त्रुटि', err.message || 'डेटा लोड नहीं हो सका');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleQuantityDelta = (customerId: number, delta: number) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.customer_id === customerId) {
          const newQty = Math.max(0, Math.round((item.quantity + delta) * 10) / 10);
          return {
            ...item,
            quantity: newQty,
            status: newQty === 0 ? 'Skipped' : newQty > item.default_quantity ? 'Extra' : 'Delivered',
          };
        }
        return item;
      })
    );
  };

  const handleToggleSkip = (customerId: number) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.customer_id === customerId) {
          if (item.quantity === 0) {
            return { ...item, quantity: item.default_quantity, status: 'Delivered' };
          } else {
            return { ...item, quantity: 0, status: 'Skipped' };
          }
        }
        return item;
      })
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        date: selectedDate,
        entries: checklist.map((item) => ({
          customer_id: item.customer_id,
          quantity_delivered: item.quantity,
          status: item.status,
          notes: item.status === 'Skipped' ? 'छुट्टी' : item.status === 'Extra' ? 'अतिरिक्त' : null,
        })),
      };
      await submitBatchLogsApi(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadData(selectedDate);
    } catch (err: any) {
      Alert.alert('सेव त्रुटि', err.message || 'हिसाब सुरक्षित नहीं हुआ');
    } finally {
      setSaving(false);
    }
  };

  // Bilateral Balances
  const collectionItems = checklist.filter((i) => i.customer_type === 'SUPPLIER');
  const deliveryItems = checklist.filter((i) => i.customer_type !== 'SUPPLIER');
  const totalCollected = collectionItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalDelivered = deliveryItems.reduce((acc, i) => acc + i.quantity, 0);
  const surplusBalance = Math.round((totalCollected - totalDelivered) * 10) / 10;

  const filteredItems = checklist.filter((item) => {
    if (filterMode === 'DELIVERY' && item.customer_type === 'SUPPLIER') return false;
    if (filterMode === 'COLLECTION' && item.customer_type !== 'SUPPLIER') return false;
    return true;
  });

  const renderItem = ({ item }: { item: DailyLogItem }) => {
    const isSupplier = item.customer_type === 'SUPPLIER';
    const isSkipped = item.quantity === 0;

    return (
      <View style={[styles.itemCard, isSkipped && styles.itemCardSkipped]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleWrap}>
            <View style={styles.nameRow}>
              <Text style={styles.customerName}>{item.customer_name}</Text>
              <View style={[styles.typeBadge, isSupplier ? styles.typeBadgeSupplier : styles.typeBadgeBuyer]}>
                <Text style={styles.typeBadgeText}>
                  {isSupplier ? '📥 संकलन' : '📤 वितरण'}
                </Text>
              </View>
            </View>
            <Text style={styles.customerSub}>
              तय: {item.default_quantity}L {item.milk_type} • ₹{item.price_per_liter}/L
              {item.address ? ` • ${item.address}` : ''}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleToggleSkip(item.customer_id)}
            style={[styles.skipBtn, isSkipped && styles.skipBtnActive]}
          >
            <Text style={[styles.skipBtnText, isSkipped && styles.skipBtnTextActive]}>
              {isSkipped ? '✓ छुट्टी' : 'छुट्टी'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dispute Notice if pending */}
        {item.dispute_status === 'Pending' && (
          <View style={styles.disputeNotice}>
            <Text style={styles.disputeText}>
              ⚠️ ग्राहक रिपोर्ट: {item.reported_quantity}L मिला ({item.dispute_reason})
            </Text>
          </View>
        )}

        {/* Quantity Controls */}
        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>{lang === 'hi' ? 'मात्रा:' : 'Qty:'}</Text>
          
          <View style={styles.counterGroup}>
            <TouchableOpacity 
              onPress={() => handleQuantityDelta(item.customer_id, -0.5)}
              style={styles.counterBtn}
            >
              <Text style={styles.counterBtnText}>-0.5</Text>
            </TouchableOpacity>

            <View style={styles.qtyDisplay}>
              <Text style={[styles.qtyNumber, isSkipped && styles.qtyNumberZero]}>
                {item.quantity.toFixed(1)}
              </Text>
              <Text style={styles.qtyUnit}>L</Text>
            </View>

            <TouchableOpacity 
              onPress={() => handleQuantityDelta(item.customer_id, 0.5)}
              style={styles.counterBtn}
            >
              <Text style={styles.counterBtnText}>+0.5</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('../../../assets/media/milk-image2.png')} 
        style={styles.ambientWatermark} 
        resizeMode="contain" 
      />
      {/* Top Date Navigator */}
      <View style={styles.dateBar}>
        <TouchableOpacity onPress={() => changeDateBy(-1)} style={styles.arrowBtn}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.dateInfo}>
          <Text style={styles.dateTitle}>{selectedDate}</Text>
          <Text style={styles.dateSub}>
            {selectedDate === new Date().toISOString().split('T')[0] ? '• आज (Today) •' : 'दैनिक हिसाब'}
          </Text>
        </View>

        <TouchableOpacity onPress={() => changeDateBy(1)} style={styles.arrowBtn}>
          <Text style={styles.arrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Bilateral Balance Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
          <Text style={[styles.statLabel, { color: '#1d4ed8' }]}>📥 संकलन</Text>
          <Text style={[styles.statValue, { color: '#1e3a8a' }]}>{totalCollected.toFixed(1)} L</Text>
          <Text style={styles.statCount}>{collectionItems.length} घर</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
          <Text style={[styles.statLabel, { color: '#047857' }]}>📤 वितरण</Text>
          <Text style={[styles.statValue, { color: '#064e3b' }]}>{totalDelivered.toFixed(1)} L</Text>
          <Text style={styles.statCount}>{deliveryItems.length} ग्राहक</Text>
        </View>

        <View style={[styles.statBox, { 
          backgroundColor: surplusBalance >= 0 ? '#f5f3ff' : '#fff1f2',
          borderColor: surplusBalance >= 0 ? '#ddd6fe' : '#fecdd3' 
        }]}>
          <Text style={[styles.statLabel, { color: surplusBalance >= 0 ? '#6d28d9' : '#be123c' }]}>
            ⚖️ शेष स्टॉक
          </Text>
          <Text style={[styles.statValue, { color: surplusBalance >= 0 ? '#4c1d95' : '#881337' }]}>
            {surplusBalance >= 0 ? `+${surplusBalance.toFixed(1)}` : surplusBalance.toFixed(1)} L
          </Text>
          <Text style={styles.statCount}>{surplusBalance >= 0 ? 'बचत' : 'कमी'}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          onPress={() => setFilterMode('ALL')} 
          style={[styles.tabBtn, filterMode === 'ALL' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, filterMode === 'ALL' && styles.tabTextActive]}>
            सभी ({checklist.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFilterMode('DELIVERY')} 
          style={[styles.tabBtn, filterMode === 'DELIVERY' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, filterMode === 'DELIVERY' && styles.tabTextActive]}>
            वितरण ({deliveryItems.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFilterMode('COLLECTION')} 
          style={[styles.tabBtn, filterMode === 'COLLECTION' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, filterMode === 'COLLECTION' && styles.tabTextActive]}>
            संकलन ({collectionItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Checklist List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>हिसाब लोड हो रहा है...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.customer_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Save Action Button */}
      <View style={styles.floatingActionWrap}>
        <TouchableOpacity 
          onPress={handleSaveAll}
          disabled={saving}
          style={[styles.floatingSaveBtn, saveSuccess && styles.floatingSaveSuccess]}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.floatingSaveText}>
              {saveSuccess ? '✓ आज का हिसाब सुरक्षित हो गया!' : `💾 आज का हिसाब सुरक्षित करें (${checklist.length})`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  ambientWatermark: {
    position: 'absolute',
    right: -30,
    top: 80,
    width: 200,
    height: 200,
    opacity: 0.12,
    pointerEvents: 'none',
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },
  dateSub: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: 'bold',
    marginTop: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  statCount: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#0f172a',
  },
  listContent: {
    padding: 12,
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemCardSkipped: {
    backgroundColor: '#f8fafc',
    opacity: 0.85,
    borderColor: '#cbd5e1',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitleWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeBuyer: {
    backgroundColor: '#ecfdf5',
  },
  typeBadgeSupplier: {
    backgroundColor: '#eff6ff',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  customerSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  skipBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  skipBtnActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  skipBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
  },
  skipBtnTextActive: {
    color: '#b91c1c',
  },
  disputeNotice: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    padding: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  disputeText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  counterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  counterBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1e293b',
  },
  qtyDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    minWidth: 50,
    justifyContent: 'center',
  },
  qtyNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563eb',
  },
  qtyNumberZero: {
    color: '#94a3b8',
  },
  qtyUnit: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    marginLeft: 2,
  },
  floatingActionWrap: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  floatingSaveBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingSaveSuccess: {
    backgroundColor: '#059669',
  },
  floatingSaveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerContainer: {
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
});
