import React from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, Modal 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigateTab?: (tab: 'CUSTOMERS' | 'DAILY') => void;
}

export default function ProfileModal({
  visible,
  onClose,
  onLogout,
  onNavigateTab,
}: ProfileModalProps) {
  const { auth } = useAuth();
  const { lang, toggleLang } = useLanguage();

  const isVendor = auth.role === 'vendor';
  const userName = isVendor 
    ? (auth.user?.business_name || auth.user?.name || (lang === 'hi' ? 'श्री कृष्णा डेयरी फार्म' : 'Krishna Dairy Farm'))
    : (auth.customer?.name || (lang === 'hi' ? 'राजेश शर्मा' : 'Rajesh Sharma'));
  const userPhone = auth.user?.phone || auth.customer?.phone || '9876543210';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalBackdrop} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.profileModalCard}>
          {/* Profile Header */}
          <View style={styles.modalProfileHeader}>
            <View style={styles.modalAvatarCircle}>
              <Text style={styles.modalAvatarInitials}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.modalProfileInfo}>
              <Text style={styles.modalUserName}>{userName}</Text>
              <Text style={styles.modalUserRole}>
                {isVendor 
                  ? '🥛 ' + (lang === 'hi' ? 'डेयरी विक्रेता (Vendor)' : 'Dairy Vendor') 
                  : '🏠 ' + (lang === 'hi' ? 'सत्यापित ग्राहक (Customer)' : 'Verified Customer')}
              </Text>
              <Text style={styles.modalUserPhone}>📞 +91 {userPhone}</Text>
            </View>
          </View>

          <View style={styles.modalDivider} />

          {/* Menu Option 1: Switch Language */}
          <TouchableOpacity 
            onPress={() => {
              onClose();
              toggleLang();
            }}
            style={styles.modalMenuItem}
            activeOpacity={0.75}
          >
            <Text style={styles.modalMenuIcon}>🌐</Text>
            <View style={styles.modalMenuTextWrap}>
              <Text style={styles.modalMenuTitle}>
                {lang === 'hi' ? 'भाषा बदलें (Switch Language)' : 'Switch Language'}
              </Text>
              <Text style={styles.modalMenuSub}>
                {lang === 'hi' ? 'वर्तमान: हिन्दी → English' : 'Current: English → हिन्दी'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Menu Option 2: Manage Customers (Vendor Only) */}
          {isVendor && onNavigateTab && (
            <TouchableOpacity 
              onPress={() => {
                onClose();
                onNavigateTab('CUSTOMERS');
              }}
              style={styles.modalMenuItem}
              activeOpacity={0.75}
            >
              <Text style={styles.modalMenuIcon}>👥</Text>
              <View style={styles.modalMenuTextWrap}>
                <Text style={styles.modalMenuTitle}>
                  {lang === 'hi' ? 'ग्राहक खाता प्रबंधन' : 'Customer Ledger Management'}
                </Text>
                <Text style={styles.modalMenuSub}>
                  {lang === 'hi' ? 'ग्राहकों की सूची व मासिक रेट' : 'View customer list & rates'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Menu Option 3: Secure Sign Out (NO RED BUTTONS) */}
          <TouchableOpacity 
            onPress={() => {
              onClose();
              onLogout();
            }}
            style={[styles.modalMenuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.75}
          >
            <Text style={styles.modalMenuIcon}>🚪</Text>
            <View style={styles.modalMenuTextWrap}>
              <Text style={[styles.modalMenuTitle, { color: '#0F172A' }]}>
                {lang === 'hi' ? 'लॉगआउट करें (Sign Out)' : 'Sign Out'}
              </Text>
              <Text style={styles.modalMenuSub}>
                {lang === 'hi' ? 'खाते से सुरक्षित बाहर निकलें' : 'Safely exit current session'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Close Action Button (Deep Dairy Blue #1E3A8A) */}
          <TouchableOpacity 
            onPress={onClose}
            style={styles.modalCloseBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.modalCloseBtnText}>
              {lang === 'hi' ? 'बंद करें' : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E3A8A', // Deep Dairy Blue
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8', // Sky Blue
  },
  modalAvatarInitials: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalProfileInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalUserRole: {
    fontSize: 12,
    color: '#1E3A8A',
    marginTop: 2,
    fontWeight: '800',
  },
  modalUserPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  modalMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalMenuIcon: {
    fontSize: 20,
  },
  modalMenuTextWrap: {
    flex: 1,
  },
  modalMenuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalMenuSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalCloseBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
});
