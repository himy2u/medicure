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

          {/* Emergency Quick Access */}
          <TouchableOpacity
            style={styles.emergencyCard}
            onPress={handleEmergency}
          >
            <Text style={styles.emergencyEmoji}>🚨</Text>
            <Text style={styles.emergencyTitle}>Emergency</Text>
            <Text style={styles.emergencySubtitle}>Get immediate help</Text>
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

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyPrescriptions')}
            >
              <Text style={styles.actionEmoji}>💊</Text>
              <Text style={styles.actionTitle}>My Prescriptions</Text>
              <Text style={styles.actionSubtitle}>View and refill prescriptions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionEmoji}>❤️</Text>
              <Text style={styles.actionTitle}>Health Records</Text>
              <Text style={styles.actionSubtitle}>Access your medical history</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('LabResults')}
            >
              <Text style={styles.actionEmoji}>🧪</Text>
              <Text style={styles.actionTitle}>Lab Results</Text>
              <Text style={styles.actionSubtitle}>View test results and reports</Text>
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

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  emergencySubtitle: {
    fontSize: 14,
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
  logoutButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.emergency,
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.emergency,
  },
});
