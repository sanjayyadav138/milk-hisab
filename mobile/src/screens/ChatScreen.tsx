import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  TextInput, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, 
  Platform, Linking, Image, ScrollView, Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  fetchVendorMessagesApi, 
  fetchCustomerMessagesApi, 
  vendorReplyMessageApi, 
  customerSendMessageApi,
  searchUserByPhoneApi 
} from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export interface ChatMessage {
  id: number;
  sender_name: string;
  sender_role: 'vendor' | 'customer' | 'system';
  message: string;
  created_at: string;
}

export interface ConversationThread {
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_avatar?: string | null;
  role?: 'customer' | 'vendor';
  address?: string;
  unread_count: number;
  last_message: string;
  last_time: string;
  messages: ChatMessage[];
}

interface ChatScreenProps {
  onGoBack: () => void;
}

export default function ChatScreen({ onGoBack }: ChatScreenProps) {
  const { lang } = useLanguage();
  const { auth } = useAuth();
  const isHi = lang === 'hi';
  const isVendor = auth.role === 'vendor';

  const currentCustomerId = auth.customer?.id || 1;
  const currentVendorId = auth.user?.id || 1;
  const currentUserName = isVendor 
    ? (auth.user?.business_name || auth.user?.name || 'श्री कृष्णा डेयरी') 
    : (auth.customer?.name || 'राजेश शर्मा');

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Active selected thread (null means in Conversation List view)
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  // Phone Search State
  const [searchPhoneQuery, setSearchPhoneQuery] = useState('');
  const [searchingPhone, setSearchingPhone] = useState(false);
  const [foundUser, setFoundUser] = useState<any | null>(null);

  // Baseline threads for instant render & offline
  const baselineThreads: ConversationThread[] = [
    {
      customer_id: 1,
      customer_name: isHi ? 'राजेश शर्मा (House 12)' : 'Rajesh Sharma (House 12)',
      customer_phone: '9811122233',
      customer_avatar: null,
      role: 'customer',
      address: isHi ? 'मकान नंबर 12, गोकुल धाम' : 'House 12, Gokul Dham',
      unread_count: 0,
      last_message: isHi ? 'नमस्ते, कल सुबह 1.5L गाय का दूध चाहिए।' : 'Hello, need 1.5L cow milk tomorrow.',
      last_time: '12:15 PM',
      messages: [
        { id: 1, sender_name: isVendor ? currentUserName : 'दूधिया', sender_role: 'vendor', message: isHi ? 'नमस्ते! आज 2L दूध delivered.' : 'Hello! Today 2L milk delivered.', created_at: '2026-10-28T07:30:00' },
        { id: 2, sender_name: 'राजेश शर्मा', sender_role: 'customer', message: isHi ? 'नमस्ते, कल सुबह 1.5L गाय का दूध चाहिए।' : 'Hello, need 1.5L cow milk tomorrow.', created_at: '2026-10-29T12:15:00' }
      ]
    },
    {
      customer_id: 2,
      customer_name: isHi ? 'डॉ. वर्मा (A-402)' : 'Dr. Verma (A-402)',
      customer_phone: '9822233344',
      customer_avatar: null,
      role: 'customer',
      address: isHi ? 'फ्लैट A-402, शांति हाइट्स' : 'Flat A-402, Shanti Heights',
      unread_count: 0,
      last_message: isHi ? 'कल शाम को 1L गाय का दूध और देना' : 'Please deliver 1L extra cow milk tomorrow evening',
      last_time: 'Yesterday',
      messages: [
        { id: 3, sender_name: 'डॉ. वर्मा', sender_role: 'customer', message: isHi ? 'कल शाम को 1L गाय का दूध और देना' : 'Please deliver 1L extra cow milk tomorrow evening', created_at: '2026-10-27T18:20:00' },
        { id: 4, sender_name: isVendor ? currentUserName : 'दूधिया', sender_role: 'vendor', message: isHi ? 'जी डॉक्टर साहब, नोट कर लिया है।' : 'Noted, doctor sahib.', created_at: '2026-10-27T18:25:00' }
      ]
    },
    {
      customer_id: 3,
      customer_name: isHi ? 'कमलेश यादव (Plot 9)' : 'Kamlesh Yadav (Plot 9)',
      customer_phone: '9844455566',
      customer_avatar: null,
      role: 'customer',
      address: isHi ? 'प्लॉट 9, न्यू कॉलोनी' : 'Plot 9, New Colony',
      unread_count: 0,
      last_message: isHi ? 'पर्ची प्राप्त हो गई है, धन्यवाद' : 'Received the slip, thanks',
      last_time: '24 Oct',
      messages: [
        { id: 5, sender_name: 'कमलेश यादव', sender_role: 'customer', message: isHi ? 'पर्ची प्राप्त हो गई है, धन्यवाद' : 'Received the slip, thanks', created_at: '2026-10-24T10:00:00' }
      ]
    }
  ];

  const [threads, setThreads] = useState<ConversationThread[]>(baselineThreads);

  const loadMessages = async () => {
    try {
      if (isVendor) {
        const data = await fetchVendorMessagesApi(currentVendorId);
        if (data && Array.isArray(data) && data.length > 0) {
          setThreads(data);
          if (activeThread) {
            const updated = data.find((t: ConversationThread) => t.customer_id === activeThread.customer_id);
            if (updated) setActiveThread(updated);
          }
        }
      } else {
        // Customer view: Fetch messages with their vendor
        const msgs = await fetchCustomerMessagesApi(currentCustomerId);
        if (msgs && Array.isArray(msgs)) {
          const primaryVendorThread: ConversationThread = {
            customer_id: currentCustomerId,
            customer_name: auth.user?.business_name || (isHi ? 'श्री कृष्णा डेयरी फार्म' : 'Shree Krishna Dairy Farm'),
            customer_phone: auth.user?.phone || '9811100000',
            role: 'vendor',
            unread_count: 0,
            last_message: msgs.length > 0 ? msgs[msgs.length - 1].message : (isHi ? 'चैट शुरू करें' : 'Start Chat'),
            last_time: msgs.length > 0 ? msgs[msgs.length - 1].created_at : 'Now',
            messages: msgs.map(m => ({
              id: m.id,
              sender_name: m.sender_name,
              sender_role: m.sender_role,
              message: m.message,
              created_at: m.created_at || new Date().toISOString()
            }))
          };

          // Combine primary vendor thread with any extra customer-to-customer threads
          setThreads(prev => {
            const extraThreads = prev.filter(t => t.customer_id !== currentCustomerId);
            return [primaryVendorThread, ...extraThreads];
          });

          if (activeThread && activeThread.customer_id === currentCustomerId) {
            setActiveThread(primaryVendorThread);
          }
        }
      }
    } catch (e) {
      console.log('Error fetching chat messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [auth.role]);

  // Open Chat conversation
  const handleOpenConversation = (thread: ConversationThread) => {
    const updated = { ...thread, unread_count: 0 };
    setActiveThread(updated);
    setThreads(prev => prev.map(t => t.customer_id === thread.customer_id ? updated : t));
  };

  // Search User By Phone
  const handleSearchPhone = async () => {
    const clean = searchPhoneQuery.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) {
      Alert.alert(
        isHi ? 'मान्य नंबर दर्ज करें' : 'Invalid Phone Number',
        isHi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setSearchingPhone(true);
    setFoundUser(null);
    try {
      const res = await searchUserByPhoneApi(clean);
      if (res && res.found) {
        setFoundUser(res);
      } else {
        Alert.alert(
          isHi ? 'उपभोक्ता नहीं मिला' : 'User Not Found',
          isHi 
            ? `मोबाइल नंबर ${clean} मिल्क हिसाब पर पंजीकृत नहीं है।`
            : `Mobile number ${clean} is not registered on Milk Hisab.`
        );
      }
    } catch {
      Alert.alert(isHi ? 'त्रुटि' : 'Error', isHi ? 'उपयोगकर्ता खोजने में त्रुटि आई।' : 'Could not search user.');
    } finally {
      setSearchingPhone(false);
    }
  };

  // Start chat with found user
  const handleStartChatWithFoundUser = (user: any) => {
    const existing = threads.find(t => t.customer_phone === user.phone || t.customer_id === user.id);
    if (existing) {
      setActiveThread(existing);
      setFoundUser(null);
      setSearchPhoneQuery('');
      return;
    }

    const newThread: ConversationThread = {
      customer_id: user.id || Date.now(),
      customer_name: user.name,
      customer_phone: user.phone,
      customer_avatar: user.avatar_url,
      role: user.role,
      address: user.address,
      unread_count: 0,
      last_message: isHi ? 'नया चैट शुरू हुआ' : 'Conversation started',
      last_time: 'Just now',
      messages: [
        {
          id: Date.now(),
          sender_name: 'Milk Hisab',
          sender_role: 'system',
          message: isHi 
            ? `मिल्क हिसाब पर ${user.name} (${user.role === 'vendor' ? 'दूधिया' : 'ग्राहक'}) के साथ आपकी सीधी बातचीत शुरू हुई है।` 
            : `Direct conversation started with ${user.name}.`,
          created_at: new Date().toISOString()
        }
      ]
    };

    setThreads(prev => [newThread, ...prev]);
    setActiveThread(newThread);
    setFoundUser(null);
    setSearchPhoneQuery('');
  };

  // Send Message
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !activeThread) return;

    setInputText('');
    setSending(true);

    const tempMsg: ChatMessage = {
      id: Date.now(),
      sender_name: currentUserName,
      sender_role: isVendor ? 'vendor' : 'customer',
      message: text,
      created_at: new Date().toISOString()
    };

    const updatedMessages = [...activeThread.messages, tempMsg];
    const updatedThread: ConversationThread = {
      ...activeThread,
      last_message: text,
      last_time: 'Just now',
      messages: updatedMessages
    };

    setActiveThread(updatedThread);
    setThreads(prev => prev.map(t => t.customer_id === activeThread.customer_id ? updatedThread : t));

    try {
      if (isVendor) {
        await vendorReplyMessageApi(activeThread.customer_id, text);
      } else {
        await customerSendMessageApi(activeThread.customer_id, text, currentUserName);
      }
    } catch (err) {
      console.log('Chat API send error:', err);
    } finally {
      setSending(false);
    }
  };

  const getAvatarBg = (id: number) => {
    const colors = ['#1E3A8A', '#0D9488', '#0284C7', '#7C3AED', '#D97706'];
    return colors[id % colors.length];
  };

  const filteredThreads = threads.filter(t => {
    const q = search.toLowerCase();
    return t.customer_name.toLowerCase().includes(q) || t.customer_phone.includes(q);
  });

  const totalUnread = threads.reduce((acc, t) => acc + (t.unread_count || 0), 0);

  // ========================================================
  // RENDER 1: ACTIVE CHAT CONVERSATION VIEW (NATIVE MILK HISAB)
  // ========================================================
  if (activeThread) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.chatContainer}
        >
          {/* Chat Header Bar */}
          <View style={styles.chatHeader}>
            <TouchableOpacity 
              onPress={() => setActiveThread(null)} 
              style={styles.chatBackBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.chatBackBtnText}>‹ {isHi ? 'संदेश सूची' : 'All Chats'}</Text>
            </TouchableOpacity>

            <View style={styles.chatHeaderInfo}>
              <View style={[styles.chatHeaderAvatar, { backgroundColor: getAvatarBg(activeThread.customer_id) }]}>
                <Text style={styles.chatHeaderAvatarText}>
                  {activeThread.customer_name.charAt(0).toUpperCase()}
                </Text>
                <View style={styles.onlineDot} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chatHeaderName} numberOfLines={1}>
                  {activeThread.customer_name}
                </Text>
                <Text style={styles.chatHeaderSub}>
                  🟢 {activeThread.role === 'vendor' ? (isHi ? 'दूधिया • ऑनलाइन' : 'Milkman • Online') : (isHi ? 'ग्राहक • ऑनलाइन' : 'Customer • Online')}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => Linking.openURL(`tel:${activeThread.customer_phone}`)}
              style={styles.chatCallBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.chatCallBtnText}>📞</Text>
            </TouchableOpacity>
          </View>

          {/* Messages Scroll View */}
          <ScrollView 
            contentContainerStyle={styles.messagesScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Encryption & Ledger Privacy Notice */}
            <View style={styles.secureNotice}>
              <Text style={styles.secureNoticeText}>
                🔒 {isHi ? 'मिल्क हिसाब सुरक्षित बहीखाता मैसेंजर • End-to-End Verified' : 'Milk Hisab Encrypted Ledger Messenger'}
              </Text>
            </View>

            {activeThread.messages.map((msg, index) => {
              const isSystem = msg.sender_role === 'system';
              if (isSystem) {
                return (
                  <View key={msg.id || index} style={styles.systemNoticeRow}>
                    <Text style={styles.systemNoticeText}>{msg.message}</Text>
                  </View>
                );
              }

              const isMe = isVendor ? msg.sender_role === 'vendor' : msg.sender_role === 'customer';
              const timeFormatted = msg.created_at ? msg.created_at.split('T')[1]?.slice(0, 5) || '12:00' : '12:00';

              return (
                <View 
                  key={msg.id || index} 
                  style={[
                    styles.messageRow, 
                    isMe ? styles.messageRowOutgoing : styles.messageRowIncoming
                  ]}
                >
                  <View 
                    style={[
                      styles.bubble, 
                      isMe ? styles.bubbleOutgoing : styles.bubbleIncoming
                    ]}
                  >
                    {!isMe && (
                      <Text style={styles.bubbleSenderName}>{msg.sender_name}</Text>
                    )}
                    <Text style={[styles.bubbleText, isMe && styles.bubbleTextOutgoing]}>
                      {msg.message}
                    </Text>
                    <View style={styles.bubbleMeta}>
                      <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeOutgoing]}>
                        {timeFormatted}
                      </Text>
                      {isMe && <Text style={styles.bubbleTicks}> ✓✓</Text>}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Reply Chips */}
          <View style={styles.quickChipsBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, gap: 8 }}>
              {isVendor ? (
                <>
                  <TouchableOpacity onPress={() => setInputText(isHi ? 'नमस्ते जी, आपका दूध का हिसाब अपडेट कर दिया है।' : 'Hello, your milk ledger is updated.')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>✓ {isHi ? 'हिसाब अपडेट' : 'Ledger Updated'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText(isHi ? 'दूध समय पर डिलीवर हो गया है जी।' : 'Milk delivered on time.')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🥛 {isHi ? 'दूध डिलीवर' : 'Delivered'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText(isHi ? 'मासिक पर्ची ऐप में उपलब्ध करा दी गई है।' : 'Monthly bill slip generated.')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🧾 {isHi ? 'मासिक पर्ची' : 'Monthly Bill'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => setInputText(isHi ? 'नमस्ते, कल सुबह 1.5L दूध चाहिए।' : 'Hello, need 1.5L milk tomorrow.')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>👋 {isHi ? 'दूध ऑर्डर' : 'Milk Order'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText(isHi ? 'आज 1L दूध अतिरिक्त देना।' : 'Please deliver 1L extra milk today.')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🥛 {isHi ? '+1L अतिरिक्त' : '+1L Extra'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText(isHi ? 'कल हम बाहर हैं, छुट्टी दर्ज कर दें।' : 'We are out tomorrow, please pause milk.')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🏖️ {isHi ? 'कल छुट्टी' : 'Skip Tomorrow'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText(isHi ? 'कृपया मुझे इस माह की दूध की पर्ची भेजें।' : 'Please share monthly milk slip.')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🧾 {isHi ? 'बिल पर्ची' : 'Bill Slip'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText(isHi ? 'नमस्ते! क्या आप मिल्क हिसाब से दूध सप्लाई की समीक्षा दे सकते हैं?' : 'Can you share your review for this milk vendor?')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>⭐ {isHi ? 'समीक्षा पूछें' : 'Ask Review'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>

          {/* Message Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatTextInput}
              placeholder={isHi ? 'संदेश लिखें (Type a message)...' : 'Type a message...'}
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSendMessage} 
              disabled={sending || !inputText.trim()}
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              activeOpacity={0.85}
            >
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ========================================================
  // RENDER 2: CONVERSATION THREADS LIST (ALL USERS VIEW)
  // ========================================================
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
            💬 {isHi ? 'मिल्क हिसाब मैसेंजर' : 'Milk Hisab Messenger'}
          </Text>
          <Text style={styles.pageSubtitle}>
            {isHi ? 'सीधी बातचीत व समीक्षा' : 'Direct Dairy Chat & Reviews'}
          </Text>
        </View>

        {totalUnread > 0 ? (
          <View style={styles.unreadTopBadge}>
            <Text style={styles.unreadTopBadgeText}>{totalUnread} new</Text>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Search By 10-Digit Phone Bar (Issue 3 Feature) */}
      <View style={styles.phoneSearchSection}>
        <Text style={styles.phoneSearchTitle}>
          🔍 {isHi ? 'नया संपर्क / फोन नंबर से उपयोगकर्ता खोजें:' : 'Search Any Milk Hisab User by Phone:'}
        </Text>
        <View style={styles.phoneSearchRow}>
          <TextInput
            style={styles.phoneSearchInput}
            placeholder={isHi ? '10 अंकों का मोबाइल नंबर (जैसे 9822233344)...' : 'Enter 10-digit mobile number...'}
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            maxLength={10}
            value={searchPhoneQuery}
            onChangeText={setSearchPhoneQuery}
          />
          <TouchableOpacity 
            onPress={handleSearchPhone}
            style={styles.phoneSearchBtn}
            disabled={searchingPhone}
            activeOpacity={0.85}
          >
            {searchingPhone ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.phoneSearchBtnText}>{isHi ? 'खोजें' : 'Search'}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Found User Card */}
        {foundUser && (
          <View style={styles.foundUserCard}>
            <View style={styles.foundUserInfoRow}>
              <View style={[styles.threadAvatar, { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0284C7' }]}>
                <Text style={styles.threadAvatarText}>{foundUser.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.foundUserNameRow}>
                  <Text style={styles.foundUserName}>{foundUser.name}</Text>
                  <View style={[styles.roleBadge, foundUser.role === 'vendor' ? styles.roleBadgeVendor : styles.roleBadgeCustomer]}>
                    <Text style={styles.roleBadgeText}>
                      {foundUser.role === 'vendor' ? (isHi ? '🥛 दूधिया' : 'Vendor') : (isHi ? '👤 ग्राहक' : 'Customer')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.foundUserPhone}>📞 {foundUser.phone} • {foundUser.address || ''}</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => handleStartChatWithFoundUser(foundUser)}
              style={styles.startChatBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.startChatBtnText}>💬 {isHi ? 'बातचीत शुरू करें (Start Chat)' : 'Start Chat'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Filter Existing Chats */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={isHi ? 'मौजूदा संदेशों में खोजें...' : 'Search current conversations...'}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Thread List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>{isHi ? 'चैट लोड हो रही है...' : 'Loading chats...'}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredThreads}
          keyExtractor={(item) => `${item.customer_id}-${item.customer_phone}`}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleOpenConversation(item)}
              style={styles.threadItem}
              activeOpacity={0.75}
            >
              <View style={[styles.threadAvatar, { backgroundColor: getAvatarBg(item.customer_id) }]}>
                <Text style={styles.threadAvatarText}>
                  {item.customer_name.charAt(0).toUpperCase()}
                </Text>
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.threadContent}>
                <View style={styles.threadRowTop}>
                  <Text style={styles.threadName} numberOfLines={1}>
                    {item.customer_name}
                  </Text>
                  <Text style={[styles.threadTime, item.unread_count > 0 && styles.threadTimeGreen]}>
                    {item.last_time ? item.last_time.slice(0, 10) : ''}
                  </Text>
                </View>

                <View style={styles.threadRowBottom}>
                  <Text 
                    style={[styles.threadSnippet, item.unread_count > 0 && styles.threadSnippetBold]} 
                    numberOfLines={1}
                  >
                    {item.last_message || (isHi ? 'चैट शुरू करें...' : 'Start conversation...')}
                  </Text>

                  {item.unread_count > 0 && (
                    <View style={styles.unreadCounter}>
                      <Text style={styles.unreadCounterText}>{item.unread_count}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>💬</Text>
              <Text style={styles.emptyTitle}>{isHi ? 'कोई संदेश नहीं मिला' : 'No chats found'}</Text>
              <Text style={styles.emptySubtitle}>{isHi ? 'ऊपर दिए गए सर्च बार से फोन नंबर डालकर किसी भी उपभोक्ता से चैट शुरू करें।' : 'Search by phone number above to message any Milk Hisab user.'}</Text>
            </View>
          }
        />
      )}

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
  unreadTopBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadTopBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  phoneSearchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  phoneSearchTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  phoneSearchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  phoneSearchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  phoneSearchBtn: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  foundUserCard: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  foundUserInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foundUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foundUserName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeVendor: {
    backgroundColor: '#EFF6FF',
  },
  roleBadgeCustomer: {
    backgroundColor: '#ECFDF5',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  foundUserPhone: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  startChatBtn: {
    marginTop: 10,
    backgroundColor: '#10B981', // Ledger Green
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  startChatBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  threadAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  threadAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  threadContent: {
    flex: 1,
  },
  threadRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  threadName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    paddingRight: 8,
  },
  threadTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  threadTimeGreen: {
    color: '#10B981',
    fontWeight: '800',
  },
  threadRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadSnippet: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    paddingRight: 8,
  },
  threadSnippetBold: {
    color: '#0F172A',
    fontWeight: '800',
  },
  unreadCounter: {
    backgroundColor: '#10B981',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCounterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  // Active Chat Screen Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1E3A8A', // Deep Dairy Blue
  },
  chatBackBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 10,
  },
  chatBackBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  chatHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chatHeaderAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  chatHeaderName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  chatHeaderSub: {
    fontSize: 10,
    color: '#93C5FD',
    marginTop: 1,
    fontWeight: '600',
  },
  chatCallBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCallBtnText: {
    fontSize: 15,
  },
  messagesScrollContent: {
    padding: 14,
    paddingBottom: 20,
  },
  secureNotice: {
    alignSelf: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secureNoticeText: {
    fontSize: 11,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  systemNoticeRow: {
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginVertical: 8,
  },
  systemNoticeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  messageRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  messageRowIncoming: {
    justifyContent: 'flex-start',
  },
  messageRowOutgoing: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleIncoming: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleOutgoing: {
    backgroundColor: '#1E3A8A', // Deep Dairy Blue bubble
    borderTopRightRadius: 4,
  },
  bubbleSenderName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
  },
  bubbleTextOutgoing: {
    color: '#FFFFFF',
  },
  bubbleMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  bubbleTime: {
    fontSize: 9,
    color: '#94A3B8',
  },
  bubbleTimeOutgoing: {
    color: '#BFDBFE',
  },
  bubbleTicks: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  quickChipsBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  quickChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: '#1E3A8A',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
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
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});
