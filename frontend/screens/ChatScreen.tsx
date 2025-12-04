/**
 * ChatScreen - Secure messaging between patient and doctor
 * 
 * Features:
 * - Real-time message display
 * - Send text messages
 * - Message history
 * - Typing indicators
 * - Comprehensive logging
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import BaseScreen from '../components/BaseScreen';
import { colors, spacing, borderRadius } from '../theme/colors';
import { buttonSizing, inputSizing } from '../theme/layout';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';
import { useTestLogger } from '../utils/testLogger';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  is_read: boolean;
}

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const logger = useTestLogger('ChatScreen');
  
  const { appointmentId, otherUserName, otherUserId } = route.params || {};
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');
  
  const flatListRef = useRef<FlatList>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Log screen entry
  useFocusEffect(
    React.useCallback(() => {
      logger.logInfo('Screen entered', { appointmentId, otherUserName });
      return () => {
        logger.logInfo('Screen exited');
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }, [appointmentId])
  );

  useEffect(() => {
    loadUserData();
    loadMessages();
    
    // Poll for new messages every 3 seconds
    pollIntervalRef.current = setInterval(() => {
      loadMessages(true); // Silent reload
    }, 3000);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [appointmentId]);

  const loadUserData = async () => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const userName = await SecureStore.getItemAsync('user_name');
      
      if (userId) setCurrentUserId(userId);
      if (userName) setCurrentUserName(userName);
      
      logger.logInfo('User data loaded', { userId, userName });
    } catch (error) {
      logger.logError('Failed to load user data', error);
    }
  };

  const loadMessages = async (silent = false) => {
    if (!silent) {
      logger.logButtonClick('Load Messages', { appointmentId });
      setLoading(true);
    }

    try {
      const result = await apiClient.get(
        `/api/chat/messages/${appointmentId}`,
        true // requires auth
      );

      if (result.success && result.data.messages) {
        const oldCount = messages.length;
        const newCount = result.data.messages.length;
        
        setMessages(result.data.messages);
        logger.logStateChange('messages', oldCount, newCount);
        
        if (newCount > oldCount && !silent) {
          logger.logSuccess('New messages received', { count: newCount - oldCount });
          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        logger.logWarning('No messages found', result.error);
      }
    } catch (error) {
      logger.logError('Failed to load messages', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      logger.logWarning('Attempted to send empty message');
      return;
    }

    logger.logButtonClick('Send Message', { 
      message: newMessage,
      appointmentId 
    });

    setSending(true);
    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const result = await apiClient.post(
        '/api/chat/send',
        {
          appointment_id: appointmentId,
          sender_id: currentUserId,
          sender_name: currentUserName,
          message: messageToSend
        },
        true // requires auth
      );

      if (result.success) {
        logger.logSuccess('Message sent successfully');
        
        // Add message to local state immediately
        const newMsg: Message = {
          id: result.data.message_id || Date.now().toString(),
          sender_id: currentUserId,
          sender_name: currentUserName,
          message: messageToSend,
          timestamp: new Date().toISOString(),
          is_read: false
        };
        
        setMessages(prev => [...prev, newMsg]);
        logger.logStateChange('messages', messages.length, messages.length + 1);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        // Reload to get server version
        setTimeout(() => loadMessages(true), 500);
      } else {
        logger.logError('Failed to send message', result.error);
        // Restore message in input
        setNewMessage(messageToSend);
      }
    } catch (error) {
      logger.logError('Exception sending message', error);
      setNewMessage(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (text: string) => {
    setNewMessage(text);
    logger.logInputChange('message', text.length > 50 ? `${text.substring(0, 50)}...` : text);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{item.sender_name}</Text>
        )}
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {item.message}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => {
          logger.logButtonClick('Back', { from: 'ChatScreen' });
          navigation.goBack();
        }}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{otherUserName || 'Chat'}</Text>
        <Text style={styles.headerSubtitle}>
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <BaseScreen pattern="scrollable" scrollable={false}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen 
      pattern="headerContentFooter"
      header={renderHeader()}
      footer={
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={handleInputChange}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      }
      scrollable={false}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        }
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    ...inputSizing.multiline,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.backgroundSecondary,
    color: colors.textPrimary,
  },
  sendButton: {
    ...buttonSizing.small,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
