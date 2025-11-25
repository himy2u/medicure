import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, borderRadius } from '../theme/colors';

import { RootStackParamList } from '../navigation/AppNavigator';

type LandingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Landing'>;

export default function LandingScreen() {
  const navigation = useNavigation<LandingScreenNavigationProp>();
  const [isSpanish, setIsSpanish] = useState(false);

  const handleEmergency = () => {
    // Navigate to emergency symptom page
    navigation.navigate('Emergency');
  };

  const handleRegularFeature = (feature: string, screen: keyof RootStackParamList) => {
    // Navigate to signup first for non-emergency features
    console.log(`Navigating to ${screen} for ${feature}`);
    Alert.alert(
      "Navigation Test",
      `Trying to navigate to ${screen} for ${feature}`,
      [
        { text: "OK", onPress: () => navigation.navigate(screen) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Language Toggle */}
        <View style={styles.languageToggle}>
          <TouchableOpacity 
            style={[styles.languageButton, !isSpanish && styles.languageButtonActive]}
            onPress={() => setIsSpanish(false)}
          >
            <Text style={[styles.languageButtonText, !isSpanish && styles.languageButtonTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.languageButton, isSpanish && styles.languageButtonActive]}
            onPress={() => setIsSpanish(true)}
          >
            <Text style={[styles.languageButtonText, isSpanish && styles.languageButtonTextActive]}>Español</Text>
          </TouchableOpacity>
        </View>

        {/* App Title */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Medicure</Text>
          <Text style={styles.appSubtitle}>Your Health Assistant</Text>
        </View>

        {/* Test Button for Verification */}
        <Pressable
          style={[styles.testButton, { backgroundColor: '#FF6B6B' }]}
          onPress={() => {
            console.log('TEST: Before navigation');
            Alert.alert("Test", "This is a test alert");
          }}
        >
          <Text style={styles.testButtonText}>TEST ALERT</Text>
        </Pressable>

        {/* Emergency Button - Top Priority */}
        <Pressable
          style={({ pressed }) => [
            styles.emergencyButton,
            pressed && styles.emergencyButtonPressed
          ]}
          onPress={handleEmergency}
        >
          <Text style={styles.emergencyButtonText}>Emergency</Text>
          <Text style={styles.emergencySubtext}>Get help now!</Text>
        </Pressable>

        {/* Find a Doctor Button */}
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed
          ]}
          onPress={() => handleRegularFeature("Find a Doctor", "Signup")}
        >
          <Text style={styles.primaryButtonText}>Find a Doctor</Text>
          <Text style={styles.buttonSubtext}>Book appointment</Text>
        </Pressable>

        {/* My Health & Prescription Row */}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed
            ]}
            onPress={() => handleRegularFeature("My Health", "Signup")}
          >
            <Text style={styles.secondaryButtonText}>My Health</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed
            ]}
            onPress={() => handleRegularFeature("Prescription", "Signup")}
          >
            <Text style={styles.secondaryButtonText}>Prescription</Text>
          </Pressable>
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
  languageToggle: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.md,
    alignSelf: 'flex-end',
  },
  languageButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: colors.accent,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  languageButtonTextActive: {
    color: '#FFFFFF',
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
    color: colors.backgroundSecondary,
    fontWeight: '500',
  },
  // Primary Button - Find a Doctor
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  primaryButtonPressed: {
    backgroundColor: colors.accentDark,
    transform: [{ scale: 0.98 }],
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
  // Button Row - My Health & Prescription
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  secondaryButton: {
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
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
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
