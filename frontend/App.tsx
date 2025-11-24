import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from './theme/colors';

export default function App() {
  const handleEmergency = () => {
    // Auto signup with device and emergency flow
    // Enter symptom, find provider, call ambulance, share live location
    Alert.alert(
      "Emergency Activated",
      "Creating your emergency account...\n\nNext steps:\n• Enter your symptoms\n• Find nearest provider\n• Call ambulance if needed\n• Share live location",
      [
        { text: "Continue", onPress: () => console.log("Navigate to emergency flow") }
      ]
    );
  };

  const handleRegularFeature = (feature: string) => {
    // Redirect to signup/login for non-emergency features
    Alert.alert(
      "Account Required",
      `Please sign up or login to access ${feature}.`,
      [
        { text: "Sign Up", onPress: () => console.log("Navigate to signup") },
        { text: "Login", onPress: () => console.log("Navigate to login") },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App Title */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Medicure</Text>
          <Text style={styles.appSubtitle}>Healthcare for Seniors</Text>
        </View>

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
          onPress={() => handleRegularFeature("Find a Doctor")}
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
            onPress={() => handleRegularFeature("My Health")}
          >
            <Text style={styles.secondaryButtonText}>My Health</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed
            ]}
            onPress={() => handleRegularFeature("Prescription")}
          >
            <Text style={styles.secondaryButtonText}>Prescription</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style="dark" backgroundColor={colors.backgroundPrimary} />
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
    paddingTop: spacing.md,
    justifyContent: 'flex-start',
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
});
