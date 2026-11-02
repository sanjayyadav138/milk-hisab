import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, Modal, 
  TextInput, ScrollView, Alert, ActivityIndicator, Image 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { updateVendorProfileApi, updateCustomerProfileApi } from '../api/client';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigateTab?: (tab: any) => void;
}

const AVATAR_PRESETS = [
  { id: 'milkman', emoji: '🥛', label: 'दूधिया' },
  { id: 'farmer', emoji: '👨‍🌾', label: 'किसान' },
  { id: 'cow', emoji: '🐄', label: 'गाय' },
  { id: 'customer', emoji: '🏠', label: 'ग्राहक' },
  { id: 'family', emoji: '👨‍👩‍👧', label: 'परिवार' },
  { id: 'can', emoji: '🥫', label: 'कैन' },
];

export default function ProfileModal({
  visible,
  onClose,
  onLogout,
}: ProfileModalProps) {
  const { auth } = useAuth();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const isVendor = auth.role === 'vendor';

  // Mode: 'VIEW' | 'EDIT'
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState(
    isVendor ? (auth.user?.name || '') : (auth.customer?.name || '')
  );
  const [businessName, setBusinessName] = useState(
    isVendor ? (auth.user?.business_name || '') : ''
  );
  const [phone, setPhone] = useState(
    isVendor ? (auth.user?.phone || '') : (auth.customer?.phone || '')
  );
  const [address, setAddress] = useState(
    !isVendor ? (auth.customer?.address || '') : ''
  );
  const [upiId, setUpiId] = useState(
    isVendor ? (auth.user?.upi_id || '918076646872@paytm') : ''
  );
  const [city, setCity] = useState(
    isVendor ? (auth.user?.city || 'गोकुल') : ''
  );
  const [priceCow, setPriceCow] = useState(
    isVendor ? String(auth.user?.price_cow || 60) : '60'
  );
  const [priceBuffalo, setPriceBuffalo] = useState(
    isVendor ? String(auth.user?.price_buffalo || 70) : '70'
  );
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    (isVendor ? auth.user?.avatar_url : auth.customer?.avatar_url) || '🥛'
  );

  // Synchronize on modal open
  React.useEffect(() => {
    if (visible) {
      setIsEditing(false);
      setName(isVendor ? (auth.user?.name || '') : (auth.customer?.name || ''));
      setBusinessName(isVendor ? (auth.user?.business_name || '') : '');
      setPhone(isVendor ? (auth.user?.phone || '') : (auth.customer?.phone || ''));
      setAddress(!isVendor ? (auth.customer?.address || '') : '');
      setUpiId(isVendor ? (auth.user?.upi_id || '918076646872@paytm') : '');
      setCity(isVendor ? (auth.user?.city || 'गोकुल') : '');
      setPriceCow(isVendor ? String(auth.user?.price_cow || 60) : '60');
      setPriceBuffalo(isVendor ? String(auth.user?.price_buffalo || 70) : '70');
      setSelectedAvatar((isVendor ? auth.user?.avatar_url : auth.customer?.avatar_url) || '🥛');
    }
  }, [visible, auth]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(isHi ? 'नाम आवश्यक' : 'Name Required', isHi ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      if (isVendor) {
        await updateVendorProfileApi({
          id: auth.user?.id || 1,
          name: name.trim(),
          phone: phone.trim(),
          business_name: businessName.trim() || `${name.trim()} Dairy`,
          upi_id: upiId.trim(),
          avatar_url: selectedAvatar,
          city: city.trim(),
          price_cow: parseFloat(priceCow) || 60,
          price_buffalo: parseFloat(priceBuffalo) || 70,
        });
        if (auth.user) {
          auth.user.name = name.trim();
          auth.user.business_name = businessName.trim() || `${name.trim()} Dairy`;
          auth.user.phone = phone.trim();
          auth.user.upi_id = upiId.trim();
          auth.user.avatar_url = selectedAvatar;
          auth.user.city = city.trim();
          auth.user.price_cow = parseFloat(priceCow) || 60;
          auth.user.price_buffalo = parseFloat(priceBuffalo) || 70;
        }
      } else {
        await updateCustomerProfileApi({
          id: auth.customer?.id || 1,
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          avatar_url: selectedAvatar,
        });
        if (auth.customer) {
          auth.customer.name = name.trim();
          auth.customer.phone = phone.trim();
          auth.customer.address = address.trim();
          auth.customer.avatar_url = selectedAvatar;
        }
      }

      // Persist to session
      await AsyncStorage.setItem('@milk_hisab_auth_session', JSON.stringify(auth));

      setIsEditing(false);
      Alert.alert(
        isHi ? '✓ प्रोफ़ाइल अपडेट सफल' : '✓ Profile Updated',
        isHi ? 'आपकी प्रोफ़ाइल जानकारी सफलतापूर्वक सुरक्षित कर ली गई है।' : 'Your profile details have been saved.'
      );
    } catch (err: any) {
      Alert.alert(isHi ? 'त्रुटि' : 'Error', err.message || (isHi ? 'प्रोफ़ाइल अपडेट करने में विफल' : 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const displayName = isVendor
    ? (businessName || name || (isHi ? 'श्री कृष्णा डेयरी' : 'Krishna Dairy'))
    : (name || (isHi ? 'राजेश शर्मा' : 'Rajesh Sharma'));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.profileModalCard}>
          
          {/* Header Bar */}
          <View style={styles.modalTopBar}>
            <View style={styles.modalBrandBadge}>
              <Text style={styles.modalBrandBadgeText}>
                {isVendor ? '🥛 Milk Hisab • डेयरी प्रोफ़ाइल' : '🏠 Milk Hisab • ग्राहक प्रोफ़ाइल'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 15 }}>
            
            {/* Avatar & Basic Identity */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>{selectedAvatar}</Text>
              </View>
              <Text style={styles.modalUserName}>{displayName}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {isVendor ? (isHi ? '🥛 अधिकृत विक्रेता (Vendor)' : '🥛 Verified Vendor') : (isHi ? '🏠 सत्यापित ग्राहक (Customer)' : '🏠 Verified Customer')}
                </Text>
              </View>
              <Text style={styles.modalUserPhone}>📞 +91 {phone || '9876543210'}</Text>
            </View>

            {/* Avatar Selector in Edit Mode */}
            {isEditing && (
              <View style={styles.avatarPickerBox}>
                <Text style={styles.fieldLabel}>
                  {isHi ? 'अवतार / प्रोफ़ाइल फ़ोटो चुनें:' : 'Choose Avatar / Photo:'}
                </Text>
                <View style={styles.avatarPresetsRow}>
                  {AVATAR_PRESETS.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSelectedAvatar(p.emoji)}
                      style={[
                        styles.avatarPresetChip,
                        selectedAvatar === p.emoji && styles.avatarPresetChipActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.presetEmoji}>{p.emoji}</Text>
                      <Text style={[
                        styles.presetLabel,
                        selectedAvatar === p.emoji && styles.presetLabelActive,
                      ]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.modalDivider} />

            {/* Profile Fields: VIEW MODE */}
            {!isEditing ? (
              <View style={styles.detailsContainer}>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoKey}>{isHi ? 'पूरा नाम' : 'Full Name'}:</Text>
                  <Text style={styles.infoVal}>{name || 'संजय यादव'}</Text>
                </View>

                {isVendor && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>{isHi ? 'डेयरी नाम' : 'Business Name'}:</Text>
                    <Text style={styles.infoVal}>{businessName || 'श्री कृष्णा डेयरी'}</Text>
                  </View>
                )}

                {!isVendor && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>{isHi ? 'वितरण पता' : 'Address'}:</Text>
                    <Text style={styles.infoVal}>{address || (isHi ? 'मकान नंबर 12, मुख्य मार्ग' : 'House 12, Main St')}</Text>
                  </View>
                )}

                {isVendor && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>UPI ID:</Text>
                      <Text style={[styles.infoVal, { color: '#0284C7' }]}>{upiId || 'krishnadairy@upi'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>{isHi ? 'दूध दर (गाय / भैंस)' : 'Rates (Cow/Buffalo)'}:</Text>
                      <Text style={[styles.infoVal, { color: '#10B981', fontWeight: '900' }]}>
                        ₹{priceCow}/L • ₹{priceBuffalo}/L
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={styles.infoKey}>{isHi ? 'सेवा क्षेत्र / शहर' : 'Service City'}:</Text>
                      <Text style={styles.infoVal}>{city || 'गोकुल'}</Text>
                    </View>
                  </>
                )}

                {/* Edit Profile Button */}
                <TouchableOpacity 
                  onPress={() => setIsEditing(true)}
                  style={styles.editProfileBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.editProfileBtnText}>
                    ✏️ {isHi ? 'प्रोफ़ाइल संपादित करें (Edit Profile)' : 'Edit Profile Details'}
                  </Text>
                </TouchableOpacity>

              </View>
            ) : (
              /* Profile Fields: EDIT MODE */
              <View style={styles.editFormContainer}>
                <Text style={styles.fieldLabel}>{isHi ? 'आपका पूरा नाम:' : 'Full Name:'}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={name}
                  onChangeText={setName}
                  placeholder={isHi ? 'उदा. संजय यादव' : 'e.g. Sanjay Yadav'}
                  placeholderTextColor="#94A3B8"
                />

                {isVendor ? (
                  <>
                    <Text style={styles.fieldLabel}>{isHi ? 'डेयरी / व्यवसाय का नाम:' : 'Dairy / Business Name:'}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={businessName}
                      onChangeText={setBusinessName}
                      placeholder={isHi ? 'उदा. श्री कृष्णा डेयरी' : 'e.g. Krishna Dairy Farm'}
                      placeholderTextColor="#94A3B8"
                    />

                    <Text style={styles.fieldLabel}>UPI ID ({isHi ? 'भुगतान प्राप्ति हेतु' : 'For Receiving Payments'}):</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={upiId}
                      onChangeText={setUpiId}
                      placeholder="e.g. 918076646872@paytm"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                    />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>{isHi ? 'गाय दूध दर (₹/L):' : 'Cow Rate (₹/L):'}</Text>
                        <TextInput
                          style={styles.fieldInput}
                          value={priceCow}
                          onChangeText={setPriceCow}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.fieldLabel}>{isHi ? 'भैंस दर (₹/L):' : 'Buffalo Rate (₹/L):'}</Text>
                        <TextInput
                          style={styles.fieldInput}
                          value={priceBuffalo}
                          onChangeText={setPriceBuffalo}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <Text style={styles.fieldLabel}>{isHi ? 'शहर / इलाका:' : 'City / Area:'}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={city}
                      onChangeText={setCity}
                      placeholder="e.g. Gokul"
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.fieldLabel}>{isHi ? 'वितरण पता / मकान नंबर:' : 'Delivery Address / Flat:'}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={address}
                      onChangeText={setAddress}
                      placeholder={isHi ? 'उदा. मकान 12, गोकुल धाम' : 'e.g. Flat 402, Gokul Dham'}
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}

                <View style={styles.formBtnRow}>
                  <TouchableOpacity 
                    onPress={() => setIsEditing(false)}
                    style={styles.cancelFormBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelFormBtnText}>{isHi ? 'रद्द करें' : 'Cancel'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleSaveProfile}
                    disabled={saving}
                    style={styles.saveFormBtn}
                    activeOpacity={0.85}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveFormBtnText}>
                        ✓ {isHi ? 'सुरक्षित करें' : 'Save Changes'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

              </View>
            )}

            <View style={styles.modalDivider} />

            {/* Menu Option: Secure Sign Out (NO RED BUTTONS) */}
            <TouchableOpacity 
              onPress={() => {
                onClose();
                onLogout();
              }}
              style={styles.signOutBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutIcon}>🚪</Text>
              <View style={styles.signOutTextWrap}>
                <Text style={styles.signOutTitle}>
                  {isHi ? 'खाते से लॉगआउट करें (Sign Out)' : 'Sign Out of Account'}
                </Text>
                <Text style={styles.signOutSub}>
                  {isHi ? 'सत्र समाप्त करें व सुरक्षित बाहर निकलें' : 'Safely exit current session'}
                </Text>
              </View>
            </TouchableOpacity>

          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    padding: 16,
  },
  profileModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBrandBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modalBrandBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E3A8A',
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarEmoji: {
    fontSize: 34,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  roleBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 4,
    marginBottom: 3,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  modalUserPhone: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  avatarPickerBox: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  avatarPresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    minWidth: 46,
  },
  avatarPresetChipActive: {
    borderColor: '#1E3A8A',
    backgroundColor: '#EFF6FF',
  },
  presetEmoji: {
    fontSize: 20,
  },
  presetLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  presetLabelActive: {
    color: '#1E3A8A',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  detailsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  infoVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
    maxWidth: '65%',
    textAlign: 'right',
  },
  editProfileBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 14,
  },
  editProfileBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  editFormContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 4,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 8,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelFormBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelFormBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  saveFormBtn: {
    flex: 2,
    backgroundColor: '#10B981', // Ledger Green
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveFormBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  signOutIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  signOutTextWrap: {
    flex: 1,
  },
  signOutTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  signOutSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});
