import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  TextInput, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, 
  Platform, Linking, Image, ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  fetchVendorMessagesApi, 
  fetchCustomerMessagesApi, 
  vendorReplyMessageApi, 
  customerSendMessageApi,
  fetchCustomersApi 
} from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export interface ChatMessage {
  id: number;
  sender_name: string;
  sender_role: 'vendor' | 'customer';
  message: string;
  created_at: string;
}

export interface ConversationThread {
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_avatar?: string | null;
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
  const currentUserName = isVendor ? (auth.user?.name || 'दूधिया') : (auth.customer?.name || 'ग्राहक');

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Active selected thread (null means in WhatsApp Conversation List view)
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  // Baseline threads for instant render & offline
  const baselineThreads: ConversationThread[] = [
    {
      customer_id: 1,
      customer_name: isHi ? 'राजेश शर्मा (House 12)' : 'Rajesh Sharma (House 12)',
      customer_phone: '9811122233',
      customer_avatar: null,
      address: isHi ? 'मकान नंबर 12, गोकुल धाम' : 'House 12, Gokul Dham',
      unread_count: 1,
      last_message: 'Hi',
      last_time: '12:15 PM',
      messages: [
        { id: 1, sender_name: 'दूधिया', sender_role: 'vendor', message: 'नमस्ते राजेश जी! आज 2L दूध delivered.', created_at: '2026-10-28T07:30:00' },
        { id: 2, sender_name: 'राजेश शर्मा', sender_role: 'customer', message: 'Hi', created_at: '2026-10-29T12:15:00' }
      ]
    },
    {
      customer_id: 2,
      customer_name: isHi ? 'आरती वर्मा (A-402)' : 'Aarti Verma (A-402)',
      customer_phone: '9822233344',
      customer_avatar: null,
      address: isHi ? 'फ्लैट A-402, शांति हाइट्स' : 'Flat A-402, Shanti Heights',
      unread_count: 0,
      last_message: isHi ? 'कल शाम को 1L गाय का दूध और देना' : 'Please deliver 1L extra cow milk tomorrow evening',
      last_time: 'Yesterday',
      messages: [
        { id: 3, sender_name: 'आरती वर्मा', sender_role: 'customer', message: 'कल शाम को 1L गाय का दूध और देना', created_at: '2026-10-27T18:20:00' },
        { id: 4, sender_name: 'दूधिया', sender_role: 'vendor', message: 'जी आरती जी, नोट कर लिया है।', created_at: '2026-10-27T18:25:00' }
      ]
    },
    {
      customer_id: 3,
      customer_name: isHi ? 'कमलेश यादव (Plot 9)' : 'Kamlesh Yadav (Plot 9)',
      customer_phone: '9844455566',
      customer_avatar: null,
      address: isHi ? 'प्लॉट 9, न्यू कॉलोनी' : 'Plot 9, New Colony',
      unread_count: 0,
      last_message: isHi ? 'पर्ची प्राप्त हो गई है, धन्यवाद' : 'Received the slip, thanks',
      last_time: '24 Oct',
      messages: [
        { id: 5, sender_name: 'कमलेश यादव', sender_role: 'customer', message: 'पर्ची प्राप्त हो गई है, धन्यवाद', created_at: '2026-10-24T10:00:00' }
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
          // If we had an active thread open, keep it updated
          if (activeThread) {
            const updated = data.find((t: ConversationThread) => t.customer_id === activeThread.customer_id);
            if (updated) setActiveThread(updated);
          }
        }
      } else {
        // Customer view: Fetch messages with their vendor
        const msgs = await fetchCustomerMessagesApi(currentCustomerId);
        if (msgs && Array.isArray(msgs)) {
          const singleThread: ConversationThread = {
            customer_id: currentCustomerId,
            customer_name: auth.user?.business_name || (isHi ? 'श्री कृष्णा डेयरी फार्म' : 'Shree Krishna Dairy Farm'),
            customer_phone: auth.user?.phone || '9811100000',
            unread_count: 0,
            last_message: msgs.length > 0 ? msgs[msgs.length - 1].message : 'चैट शुरू करें (Start Chat)',
            last_time: msgs.length > 0 ? msgs[msgs.length - 1].created_at : 'Now',
            messages: msgs.map(m => ({
              id: m.id,
              sender_name: m.sender_name,
              sender_role: m.sender_role,
              message: m.message,
              created_at: m.created_at || new Date().toISOString()
            }))
          };
          setThreads([singleThread]);
          // In customer mode, automatically open the milkman thread
          setActiveThread(singleThread);
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
    // Poll every 8 seconds for new messages
    const interval = setInterval(loadMessages, 8000);
    return () => clearInterval(interval);
  }, [auth.role]);

  // Open Chat with a customer
  const handleOpenConversation = (thread: ConversationThread) => {
    // Reset unread count for this thread
    const updated = { ...thread, unread_count: 0 };
    setActiveThread(updated);
    setThreads(prev => prev.map(t => t.customer_id === thread.customer_id ? updated : t));
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

    // Optimistic UI update
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
        await customerSendMessageApi(currentCustomerId, text, currentUserName);
      }
    } catch (err) {
      console.log('Chat API send error:', err);
    } finally {
      setSending(false);
    }
  };

  // Helper for avatar colors
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
  // RENDER 1: ACTIVE CHAT CONVERSATION VIEW (WHATSAPP STYLE)
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
            {isVendor && (
              <TouchableOpacity 
                onPress={() => setActiveThread(null)} 
                style={styles.chatBackBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.chatBackBtnText}>‹ {isHi ? 'सूची' : 'List'}</Text>
              </TouchableOpacity>
            )}
            {!isVendor && (
              <TouchableOpacity 
                onPress={onGoBack} 
                style={styles.chatBackBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.chatBackBtnText}>‹ {isHi ? 'डैशबोर्ड' : 'Back'}</Text>
              </TouchableOpacity>
            )}

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
                  🟢 {isHi ? 'ऑनलाइन • 10 मिनट में उत्तर' : 'Online • Fast Reply'}
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
                🔒 {isHi ? 'मिल्क हिसाब एन्क्रिप्टेड चैट • पारदर्शी दूध बहीखाता' : 'Milk Hisab Encrypted Ledger Chat'}
              </Text>
            </View>

            {activeThread.messages.map((msg, index) => {
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
                  <TouchableOpacity onPress={() => setInputText('नमस्ते जी, हिसाब अपडेट कर दिया है।')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>✓ हिसाब अपडेट हुआ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText('दूध पहुंच गया है जी')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🥛 दूध डिलीवर हुआ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText('मासिक पर्ची भेज दी गई है')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🧾 मासिक पर्ची</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => setInputText('Hi')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>👋 Hi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText('आज 1L दूध एक्स्ट्रा देना')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🥛 +1L एक्स्ट्रा</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText('कल हम बाहर हैं, छुट्टी दर्ज कर दें')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🏖️ कल छुट्टी</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setInputText('मासिक बिल पर्ची भेजें')} style={styles.quickChip}>
                    <Text style={styles.quickChipText}>🧾 बिल भेजें</Text>
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
  // RENDER 2: WHATSAPP CONVERSATION THREADS LIST (VENDOR VIEW)
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
            💬 {isHi ? 'ग्राहक संदेश व चैट' : 'Customer Chats'}
          </Text>
          <Text style={styles.pageSubtitle}>
            WhatsApp {isHi ? 'स्टाइल सीधी बातचीत' : 'Style Direct Chat'}
          </Text>
        </View>

        {totalUnread > 0 ? (
          <View style={styles.unreadTopBadge}>
            <Text style={styles.unreadTopBadgeText}>{totalUnread} new</Text>
          </View>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={isHi ? 'ग्राहक नाम या मोबाइल से खोजें...' : 'Search customer by name or phone...'}
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
          keyExtractor={(item) => String(item.customer_id)}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => handleOpenConversation(item)}
              style={styles.threadItem}
              activeOpacity={0.75}
            >
              {/* Customer Avatar with Online indicator */}
              <View style={[styles.threadAvatar, { backgroundColor: getAvatarBg(item.customer_id) }]}>
                <Text style={styles.threadAvatarText}>
                  {item.customer_name.charAt(0).toUpperCase()}
                </Text>
                <View style={styles.onlineDot} />
              </View>

              {/* Thread Meta */}
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
              <Text style={styles.emptySubtitle}>{isHi ? 'ग्राहक के साथ सीधे संदेश भेजें' : 'Start messaging with customers'}</Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    position: 'relative',
  },
  threadAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
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
    fontSize: 15,
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
    fontSize: 13,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  // Active Chat Screen Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#E5DDD5', // WhatsApp background vibe with cream overlay
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1E3A8A', // Deep Dairy Blue WhatsApp Header
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chatHeaderAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCallBtnText: {
    fontSize: 16,
  },
  messagesScrollContent: {
    padding: 14,
    paddingBottom: 20,
  },
  secureNotice: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 14,
  },
  secureNoticeText: {
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
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
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
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 19,
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
    backgroundColor: '#F8FAFC',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
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
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 90,
  },
  sendBtn: {
    backgroundColor: '#1E3A8A',
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 0,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});
