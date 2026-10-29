import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, SafeAreaView, Modal, Linking, Alert 
} from 'react-native';
import { fetchCustomersApi, createCustomerApi } from '../../api/client';
import { Customer } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export default function CustomersScreen() {
  const { lang } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BUYER' | 'SUPPLIER'>('ALL');
  
  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newQty, setNewQty] = useState('1.0');
  const [newMilkType, setNewMilkType] = useState('Cow');
  const [newRate, setNewRate] = useState('60');
  const [newType, setNewType] = useState<'BUYER' | 'SUPPLIER'>('BUYER');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomersApi();
      setCustomers(data);
    } catch (err: any) {
      Alert.alert('त्रुटि', err.message || 'ग्राहक लोड नहीं हो सके');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async () => {
    if (!newName.trim()) {
      Alert.alert('नाम आवश्यक', 'कृपया नाम दर्ज करें');
      return;
    }
    if (!newPhone.trim() || newPhone.trim().length < 10) {
      Alert.alert('मोबाइल नंबर आवश्यक', '10 अंकों का मान्य मोबाइल दर्ज करें');
      return;
    }

    setSubmitting(true);
    try {
      await createCustomerApi({
        name: newName.trim(),
        phone: newPhone.trim(),
        address: newAddress.trim() || undefined,
        default_quantity: parseFloat(newQty) || 1.0,
        milk_type: newMilkType,
        price_per_liter: parseFloat(newRate) || 60.0,
        customer_type: newType,
      });

      setIsAddModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewAddress('');
      loadCustomers();
      Alert.alert('सफल', `${newName} को सफलतापूर्वक जोड़ दिया गया! डिफ़ॉल्ट पिन: 1234`);
    } catch (err: any) {
      Alert.alert('त्रुटि', err.message || 'ग्राहक जोड़ने में समस्या');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(`नमस्ते ${name} जी! Milk Hisab (मिल्क हिसाब) पर आपका दैनिक दूध का रिकॉर्ड दर्ज है। अधिक जानकारी या ऐप लॉगिन हेतु: http://16.176.65.41`);
    Linking.openURL(`whatsapp://send?phone=${fullPhone}&text=${text}`).catch(() => {
      Alert.alert('WhatsApp नहीं मिला', 'फोन में WhatsApp ऐप इनस्टॉल होना चाहिए');
    });
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const buyers = customers.filter((c) => (c.customer_type || 'BUYER') === 'BUYER');
  const suppliers = customers.filter((c) => c.customer_type === 'SUPPLIER');

  const filtered = customers.filter((c) => {
    if (filterType === 'BUYER' && (c.customer_type || 'BUYER') !== 'BUYER') return false;
    if (filterType === 'SUPPLIER' && c.customer_type !== 'SUPPLIER') return false;

    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    const isSupplier = item.customer_type === 'SUPPLIER';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.cardName}>{item.name}</Text>
              <View style={[styles.badge, isSupplier ? styles.badgeSupplier : styles.badgeBuyer]}>
                <Text style={styles.badgeText}>
                  {isSupplier ? '📥 सप्लायर (4 घर)' : '📤 ग्राहक'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardPhone}>📞 {item.phone}</Text>
            {item.address ? <Text style={styles.cardAddress}>📍 {item.address}</Text> : null}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={() => openWhatsApp(item.phone, item.name)} 
              style={styles.actionBtnWhatsApp}
            >
              <Text style={styles.actionBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => makeCall(item.phone)} 
              style={styles.actionBtnCall}
            >
              <Text style={styles.actionBtnText}>कॉल</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.rateInfo}>
            दैनिक: <Text style={styles.rateHighlight}>{item.default_quantity}L</Text> ({item.milk_type})
          </Text>
          <Text style={styles.rateInfo}>
            दर: <Text style={styles.rateHighlight}>₹{item.price_per_liter}</Text>/L
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search & Add Header */}
      <View style={styles.topSection}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder={lang === 'hi' ? 'नाम या मोबाइल से खोजें...' : 'Search by name or mobile...'}
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity 
            onPress={() => setIsAddModalOpen(true)}
            style={styles.addBtn}
          >
            <Text style={styles.addBtnText}>+ नया</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.pillsRow}>
          <TouchableOpacity 
            onPress={() => setFilterType('ALL')}
            style={[styles.pill, filterType === 'ALL' && styles.pillActive]}
          >
            <Text style={[styles.pillText, filterType === 'ALL' && styles.pillTextActive]}>
              सभी ({customers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setFilterType('BUYER')}
            style={[styles.pill, filterType === 'BUYER' && styles.pillActive]}
          >
            <Text style={[styles.pillText, filterType === 'BUYER' && styles.pillTextActive]}>
              ग्राहक ({buyers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setFilterType('SUPPLIER')}
            style={[styles.pill, filterType === 'SUPPLIER' && styles.pillActive]}
          >
            <Text style={[styles.pillText, filterType === 'SUPPLIER' && styles.pillTextActive]}>
              सप्लायर घर ({suppliers.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>ग्राहक लोड हो रहे हैं...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => String(c.id)}
          renderItem={renderCustomerItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>कोई संपर्क नहीं मिला</Text>
            </View>
          }
        />
      )}

      {/* Add Contact Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>+ नया संपर्क जोड़ें</Text>
            
            {/* Type selector */}
            <View style={styles.modalTypeRow}>
              <TouchableOpacity
                onPress={() => setNewType('BUYER')}
                style={[styles.typeOption, newType === 'BUYER' && styles.typeOptionActive]}
              >
                <Text style={[styles.typeOptionText, newType === 'BUYER' && styles.typeOptionTextActive]}>
                  📤 ग्राहक (बिक्री)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setNewType('SUPPLIER')}
                style={[styles.typeOption, newType === 'SUPPLIER' && styles.typeOptionActive]}
              >
                <Text style={[styles.typeOptionText, newType === 'SUPPLIER' && styles.typeOptionTextActive]}>
                  📥 सप्लायर (संकलन)
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput 
              style={styles.modalInput} 
              placeholder="पूरा नाम (उदा. राकेश शर्मा)" 
              value={newName} 
              onChangeText={setNewName} 
            />
            <TextInput 
              style={styles.modalInput} 
              placeholder="10 अंकों का मोबाइल नंबर" 
              keyboardType="phone-pad" 
              maxLength={10}
              value={newPhone} 
              onChangeText={setNewPhone} 
            />
            <TextInput 
              style={styles.modalInput} 
              placeholder="पता / मकान नं. / गली" 
              value={newAddress} 
              onChangeText={setNewAddress} 
            />
            
            <View style={styles.modalRow}>
              <TextInput 
                style={[styles.modalInput, { flex: 1, marginRight: 6 }]} 
                placeholder="दैनिक मात्रा (L)" 
                keyboardType="numeric" 
                value={newQty} 
                onChangeText={setNewQty} 
              />
              <TextInput 
                style={[styles.modalInput, { flex: 1, marginLeft: 6 }]} 
                placeholder="दर प्रति लीटर (₹)" 
                keyboardType="numeric" 
                value={newRate} 
                onChangeText={setNewRate} 
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setIsAddModalOpen(false)} 
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>रद्द करें</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleAddSubmit} 
                disabled={submitting} 
                style={styles.modalSaveBtn}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>सुरक्षित करें</Text>
                )}
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
  topSection: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  pillActive: {
    backgroundColor: '#2563eb',
  },
  pillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  list: {
    padding: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeBuyer: {
    backgroundColor: '#ecfdf5',
  },
  badgeSupplier: {
    backgroundColor: '#eff6ff',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardPhone: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
    fontWeight: '600',
  },
  cardAddress: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 6,
  },
  actionBtnWhatsApp: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnCall: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  rateInfo: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  rateHighlight: {
    color: '#0f172a',
    fontWeight: '800',
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
  empty: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
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
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalTypeRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeOptionActive: {
    backgroundColor: '#2563eb',
  },
  typeOptionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
  },
  typeOptionTextActive: {
    color: '#ffffff',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 10,
  },
  modalRow: {
    flexDirection: 'row',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
