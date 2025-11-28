import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, borderRadius } from '../theme/colors';
import LanguageToggle from '../components/LanguageToggle';
import ProfileHeader from '../components/ProfileHeader';

import { RootStackParamList } from '../navigation/AppNavigator';

type LandingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Landing'>;

export default function LandingScreen() {
  const navigation = useNavigation<LandingScreenNavigationProp>();
  const { t } = useTranslation();

  const handleEmergency = () => {
    // Navigate to emergency symptom page
    navigation.navigate('Emergency');
  };

  const checkAuthAndNavigate = async (screen: keyof RootStackParamList) => {
    const authToken = await SecureStore.getItemAsync('auth_token');
    if (!authToken) {
      console.log('Not authenticated, redirecting to Signup');
      navigation.navigate('Signup');
    } else {
      navigation.navigate(screen);
    }
  };

  const handleFindDoctor = () => {
    checkAuthAndNavigate('FindDoctor');
  };

  const handleRegularFeature = (feature: string, screen: keyof RootStackParamList) => {
    console.log(`Navigating to ${screen} for ${feature}`);
    checkAuthAndNavigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Bar with Language Toggle and User Profile */}
        <View style={styles.topBar}>
          <LanguageToggle />
          <ProfileHeader />
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

        <TouchableOpacity 
          style={[styles.actionButton, styles.labTestButton]}
          onPress={() => handleRegularFeature('lab tests', 'Signup')}
        >
          <Text style={styles.labTestButtonText}>🧪 Lab Tests</Text>
        </TouchableOpacity>

        {/* Healthcare Professional Section */}
        <View style={styles.medicalStaffSection}>
          <Text style={styles.medicalStaffLabel}>Healthcare Professional?</Text>
          <View style={styles.medicalStaffButtons}>
            <TouchableOpacity 
              style={styles.medicalStaffRegisterButton}
              onPress={() => navigation.navigate('MedicalStaffSignup')}
            >
              <Text style={styles.medicalStaffRegisterText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.medicalStaffLoginButton}
              onPress={() => navigation.navigate('MedicalStaffLogin')}
            >
              <Text style={styles.medicalStaffLoginText}>Login</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 100, // Reserve space for fixed bottom button
    justifyContent: 'flex-start',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
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
    fontSize: 24,
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
    fontSize: 20,
    fontWeight: '600',
    color: colors.backgroundSecondary,
  },
  buttonSubtext: {
    fontSize: 15,
    color: colors.backgroundSecondary,
    fontWeight: '400',
    opacity: 0.9,
  },
  actionButton: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
    minWidth: 150,
    minHeight: 85,
  },
  prescriptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    flexShrink: 1,
  },
  healthButton: {
    backgroundColor: '#8FBC8F', // Soft sage green
    borderWidth: 2,
    borderColor: '#7AB87A',
    flex: 1,
    minWidth: 150,
    minHeight: 85,
  },
  healthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    flexShrink: 1,
  },
  labTestButton: {
    backgroundColor: '#9B59B6', // Purple
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
  labTestButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Button Row - My Health & Prescription
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  medicalStaffSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    alignItems: 'center',
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  medicalStaffLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  medicalStaffButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  medicalStaffRegisterButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalStaffRegisterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  medicalStaffLoginButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  medicalStaffLoginText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
});
