import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { colors, spacing, borderRadius } from '../theme/colors';
import LanguageToggle from '../components/LanguageToggle';

import { RootStackParamList } from '../navigation/AppNavigator';

type LandingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Landing'>;

export default function LandingScreen() {
  const navigation = useNavigation<LandingScreenNavigationProp>();
  const { t } = useTranslation();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [showSignOutMenu, setShowSignOutMenu] = useState(false);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await SecureStore.getItemAsync('user_name');
      const email = await SecureStore.getItemAsync('user_email');
      const role = await SecureStore.getItemAsync('user_role');
      
      if (name) setUserName(name);
      if (email) setUserEmail(email);
      if (role) setUserRole(role);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setShowSignOutMenu(false);
      
      // Sign out from Google
      await GoogleSignin.signOut();
      
      // Clear all stored data
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_role');
      await SecureStore.deleteItemAsync('user_id');
      await SecureStore.deleteItemAsync('user_name');
      await SecureStore.deleteItemAsync('user_email');
      
      console.log('User signed out successfully');
      navigation.navigate('Signup');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleEmergency = () => {
    // Navigate to emergency symptom page
    navigation.navigate('Emergency');
  };

  const handleFindDoctor = () => {
    navigation.navigate('FindDoctor');
  };

  const handleRegularFeature = (feature: string, screen: keyof RootStackParamList) => {
    console.log(`Navigating to ${screen} for ${feature}`);
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Bar with Language Toggle and User Profile */}
        <View style={styles.topBar}>
          <LanguageToggle />
          
          {userName && (
            <View>
              <TouchableOpacity 
                style={styles.userProfile} 
                onPress={() => setShowSignOutMenu(!showSignOutMenu)}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{userName}</Text>
                  <Text style={styles.userRole}>{userRole}</Text>
                </View>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
              {showSignOutMenu && (
                <TouchableOpacity 
                  style={styles.signOutMenu}
                  onPress={handleSignOut}
                >
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* App Title */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>{t('medicure')}</Text>
          <Text style={styles.appSubtitle}>{t('healthAssistant')}</Text>
        </View>

        {/* Main Action Buttons */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.emergencyButton]}
          onPress={handleEmergency}
        >
          <Text style={styles.emergencyButtonText}>🚨 {t('emergency')}</Text>
          <Text style={styles.emergencySubtext}>{t('getImmediateHelp')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleFindDoctor}
        >
          <Text style={styles.primaryButtonText}>🔍 {t('findDoctors')}</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.prescriptionButton]}
            onPress={() => handleRegularFeature('prescriptions', 'Signup')}
          >
            <Text style={styles.prescriptionButtonText}>💊 {t('prescriptions')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.healthButton]}
            onPress={() => handleRegularFeature('my health', 'Signup')}
          >
            <Text style={styles.healthButtonText}>❤️ {t('myHealth')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    justifyContent: 'flex-start',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginRight: spacing.sm,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signOutMenu: {
    position: 'absolute',
    top: 55,
    right: 0,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    minWidth: 120,
    zIndex: 1000,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.emergency,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  appSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Emergency Button - Highly visible, large tap target
  emergencyButton: {
    backgroundColor: colors.emergency,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonPressed: {
    backgroundColor: colors.emergencyDark,
    transform: [{ scale: 0.98 }],
  },
  emergencyButtonText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.backgroundSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  emergencySubtext: {
    fontSize: 16,
  },
  // Primary Button - Find a Doctor
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.backgroundSecondary,
    marginBottom: spacing.xs,
  },
  buttonSubtext: {
    fontSize: 15,
    color: colors.backgroundSecondary,
    fontWeight: '400',
    opacity: 0.9,
  },
  actionButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#95E1D3',
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: spacing.xs,
  },
  prescriptionButton: {
    backgroundColor: '#6B8E9F', // Muted blue-gray
    borderWidth: 2,
    borderColor: '#5A7A8A',
    flex: 1,
  },
  prescriptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  healthButton: {
    backgroundColor: '#8FBC8F', // Soft sage green
    borderWidth: 2,
    borderColor: '#7AB87A',
    flex: 1,
  },
  healthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  // Button Row - My Health & Prescription
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  secondaryButtonRow: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 85,
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.accentSoft,
    transform: [{ scale: 0.98 }],
  },
  testButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 50,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
