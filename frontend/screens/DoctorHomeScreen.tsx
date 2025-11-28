import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, borderRadius } from '../theme/colors';
import ProfileHeader from '../components/ProfileHeader';
import { RootStackParamList } from '../navigation/AppNavigator';

type DoctorHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DoctorHome'>;

export default function DoctorHomeScreen() {
  const navigation = useNavigation<DoctorHomeScreenNavigationProp>();
  const [doctorName, setDoctorName] = React.useState('');

  React.useEffect(() => {
    const loadUserInfo = async () => {
      const name = await SecureStore.getItemAsync('user_name');
      if (name) setDoctorName(name);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Text style={styles.welcomeText}>Welcome, Dr. {doctorName}</Text>
          <ProfileHeader />
        </View>

        {/* Main Dashboard */}
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>Doctor Dashboard</Text>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionEmoji}>📅</Text>
            <Text style={styles.actionTitle}>My Schedule</Text>
            <Text style={styles.actionSubtitle}>View and manage appointments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionEmoji}>🚨</Text>
            <Text style={styles.actionTitle}>Emergency Alerts</Text>
            <Text style={styles.actionSubtitle}>Respond to emergency requests</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionEmoji}>👥</Text>
            <Text style={styles.actionTitle}>My Patients</Text>
            <Text style={styles.actionSubtitle}>View patient history and records</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionEmoji}>⚙️</Text>
            <Text style={styles.actionTitle}>Availability Settings</Text>
            <Text style={styles.actionSubtitle}>Update your working hours</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dashboardSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  actionCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
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
    backgroundColor: colors.emergency,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
