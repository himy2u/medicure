import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, borderRadius } from '../theme/colors';
import ProfileHeader from '../components/ProfileHeader';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthCheck } from '../hooks/useAuthCheck';

type PatientDashboardNavigationProp = StackNavigationProp<RootStackParamList, 'PatientDashboard'>;

export default function PatientDashboardScreen() {
  const navigation = useNavigation<PatientDashboardNavigationProp>();
  const [userName, setUserName] = React.useState('');
  const [userRole, setUserRole] = React.useState('');

  // Check authentication on mount
  useAuthCheck();

  React.useEffect(() => {
    const loadUserInfo = async () => {
      const name = await SecureStore.getItemAsync('user_name');
      const role = await SecureStore.getItemAsync('user_role');
      if (name) setUserName(name);
      if (role) setUserRole(role);
    };
    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_role');
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('user_name');
    await SecureStore.deleteItemAsync('user_email');
    navigation.navigate('Landing');
  };

  const handleFindDoctor = () => {
    navigation.navigate('FindDoctor');
  };

  const handleEmergency = () => {
    navigation.navigate('Emergency');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{userName}</Text>
              {userRole === 'caregiver' && (
                <Text style={styles.roleTag}>Caregiver</Text>
              )}
            </View>
            <ProfileHeader hideHomeButton={false} />
          </View>

          {/* Emergency Quick Access - Consistent size */}
          <TouchableOpacity
            style={styles.emergencyCard}
            onPress={handleEmergency}
          >
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyEmoji}>🚨</Text>
              <View style={styles.emergencyTextContainer}>
                <Text style={styles.emergencyTitle}>Emergency</Text>
                <Text style={styles.emergencySubtitle}>Get immediate help</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Main Dashboard Sections */}
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Your Health</Text>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleFindDoctor}
            >
              <Text style={styles.actionEmoji}>🔍</Text>
              <Text style={styles.actionTitle}>Find a Doctor</Text>
              <Text style={styles.actionSubtitle}>Search by specialty or location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyAppointments')}
            >
              <Text style={styles.actionEmoji}>📅</Text>
              <Text style={styles.actionTitle}>My Appointments</Text>
              <Text style={styles.actionSubtitle}>View upcoming and past appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionEmoji}>❤️</Text>
              <Text style={styles.actionTitle}>Health Records</Text>
              <Text style={styles.actionSubtitle}>Access your medical history</Text>
            </TouchableOpacity>

            {userRole === 'caregiver' && (
              <TouchableOpacity style={[styles.actionCard, styles.caregiverCard]}>
                <Text style={styles.actionEmoji}>👨‍👩‍👧</Text>
                <Text style={styles.actionTitle}>Patient Profile</Text>
                <Text style={styles.actionSubtitle}>Manage care recipient information</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionEmoji}>⚙️</Text>
              <Text style={styles.actionTitle}>Account Settings</Text>
              <Text style={styles.actionSubtitle}>Update your profile and preferences</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionEmoji}>🔔</Text>
              <Text style={styles.actionTitle}>Notifications</Text>
              <Text style={styles.actionSubtitle}>Manage notification preferences</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
      
      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.footerButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonPrimary]}
          onPress={() => navigation.navigate('ProfileSettings' as any)}
        >
          <Text style={styles.footerButtonTextPrimary}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleTag: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  emergencyCard: {
    backgroundColor: colors.emergency,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  emergencyEmoji: {
    fontSize: 28,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  dashboardSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caregiverCard: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerButtonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  footerButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
