/**
 * VideoCallScreen - Video consultation placeholder
 * Used by: Patient, Caregiver, Doctor
 * Note: Full WebView video integration requires development build (not Expo Go)
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import BaseScreen from '../components/BaseScreen';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'VideoCall'>;
type RouteProps = RouteProp<RootStackParamList, 'VideoCall'>;

export default function VideoCallScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { appointmentId, otherUserName, roomId } = route.params;

  const [userName, setUserName] = useState('');
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStarted && !callEnded) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStarted, callEnded]);

  const loadUserInfo = async () => {
    const name = await SecureStore.getItemAsync('user_name');
    setUserName(name || 'User');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setCallStarted(true);
  };

  const openExternalCall = () => {
    // Open Jitsi Meet in browser as fallback
    const jitsiUrl = `https://meet.jit.si/${roomId}`;
    Linking.openURL(jitsiUrl);
  };

  const endCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            setCallEnded(true);
            setCallStarted(false);
          }
        }
      ]
    );
  };

  const returnToAppointment = () => {
    navigation.goBack();
  };

  if (callEnded) {
    return (
      <BaseScreen scrollable={false}>
        <View style={styles.endedContainer}>
          <Text style={styles.endedIcon}>📞</Text>
          <Text style={styles.endedTitle}>Call Ended</Text>
          <Text style={styles.endedSubtitle}>
            Your call with {otherUserName} has ended
          </Text>
          <Text style={styles.durationText}>
            Duration: {formatDuration(callDuration)}
          </Text>

          <View style={styles.endedActions}>
            <TouchableOpacity
              style={styles.returnButton}
              onPress={returnToAppointment}
            >
              <Text style={styles.returnButtonText}>Return to Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat', {
                appointmentId,
                otherUserName,
                otherUserId: 'other-user-id'
              })}
            >
              <Text style={styles.chatButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BaseScreen>
    );
  }

  if (!callStarted) {
    return (
      <BaseScreen scrollable={false}>
        <View style={styles.preCallContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <View style={styles.preCallContent}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {otherUserName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text style={styles.callingText}>Ready to call</Text>
            <Text style={styles.callerName}>{otherUserName}</Text>

            <Text style={styles.appointmentInfo}>
              Appointment #{appointmentId.substring(0, 8)}
            </Text>

            <TouchableOpacity
              style={styles.startCallButton}
              onPress={startCall}
            >
              <Text style={styles.startCallButtonText}>Start Video Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.externalButton}
              onPress={openExternalCall}
            >
              <Text style={styles.externalButtonText}>Open in Browser</Text>
            </TouchableOpacity>

            <Text style={styles.privacyNote}>
              Your call will be encrypted and secure
            </Text>
          </View>
        </View>
      </BaseScreen>
    );
  }

  // Active call UI (simulated for Expo Go)
  return (
    <View style={styles.container}>
      {/* Video Call Header */}
      <View style={styles.callHeader}>
        <Text style={styles.callHeaderText}>In Call with {otherUserName}</Text>
        <Text style={styles.timerText}>{formatDuration(callDuration)}</Text>
      </View>

      {/* Simulated Video Area */}
      <View style={styles.videoArea}>
        <View style={styles.remoteVideo}>
          <View style={styles.remoteAvatarLarge}>
            <Text style={styles.remoteAvatarText}>
              {otherUserName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.remoteNameText}>{otherUserName}</Text>
        </View>

        {/* Self view */}
        <View style={styles.selfVideo}>
          <View style={styles.selfAvatar}>
            <Text style={styles.selfAvatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Call Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlIcon}>🎤</Text>
          <Text style={styles.controlLabel}>Mute</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlIcon}>📹</Text>
          <Text style={styles.controlLabel}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlIcon}>🔊</Text>
          <Text style={styles.controlLabel}>Speaker</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={openExternalCall}>
          <Text style={styles.controlIcon}>🌐</Text>
          <Text style={styles.controlLabel}>Browser</Text>
        </TouchableOpacity>
      </View>

      {/* End Call Button */}
      <TouchableOpacity style={styles.floatingEndCall} onPress={endCall}>
        <Text style={styles.floatingEndCallText}>End Call</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  preCallContainer: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 28,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  preCallContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  callingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  callerName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  appointmentInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl * 2,
  },
  startCallButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  startCallButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  externalButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  externalButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  callHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xl + 20,
  },
  callHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
  },
  videoArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideo: {
    alignItems: 'center',
  },
  remoteAvatarLarge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  remoteAvatarText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  remoteNameText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  selfVideo: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 80,
    height: 100,
    backgroundColor: '#2d2d44',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  selfAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  controlIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  controlLabel: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  floatingEndCall: {
    alignSelf: 'center',
    backgroundColor: colors.emergency,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl * 2,
  },
  floatingEndCallText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  endedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  endedIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  endedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  endedSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  durationText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: spacing.xl * 2,
  },
  endedActions: {
    width: '100%',
    gap: spacing.md,
  },
  returnButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  chatButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
