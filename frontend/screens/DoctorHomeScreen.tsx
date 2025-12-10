import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, borderRadius } from '../theme/colors';
import ProfileHeader from '../components/ProfileHeader';
import RoleGuard from '../components/RoleGuard';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthCheck } from '../hooks/useAuthCheck';

type DoctorHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DoctorHome'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DoctorHomeScreen() {
  const navigation = useNavigation<DoctorHomeScreenNavigationProp>();
  const { t } = useTranslation();
  const [doctorName, setDoctorName] = React.useState('');

  // Check authentication on mount
  useAuthCheck();

  React.useEffect(() => {
    const loadUserInfo = async () => {
      const name = await SecureStore.getItemAsync('user_name');
      // Only show name if it's not a phone number (doesn't start with +)
      if (name && !name.startsWith('+') && name.length < 30) {
        setDoctorName(name);
      }
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

  const displayName = doctorName ? `Dr. ${doctorName}` : '';

  return (
    <RoleGuard 
      allowedRoles={['doctor']}
      fallbackMessage="This screen is only accessible to doctors."
    >
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>{t('welcome')}</Text>
            {displayName ? <Text style={styles.doctorName}>{displayName}</Text> : null}
          </View>
          <ProfileHeader />
        </View>

        {/* Dashboard Title */}
        <Text style={styles.sectionTitle}>{t('doctorDashboard')}</Text>

        {/* Action Cards - Availability First */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={[styles.actionCard, styles.primaryCard]}
            onPress={() => navigation.navigate('DoctorAvailability')}
          >
            <Text style={styles.actionEmoji}>⚙️</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.actionTitle}>{t('availabilitySettings')}</Text>
              <Text style={styles.actionSubtitle}>{t('updateWorkingHours')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('DoctorSchedule' as any)}
          >
            <Text style={styles.actionEmoji}>📅</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.actionTitle}>{t('mySchedule')}</Text>
              <Text style={styles.actionSubtitle}>View calendar & setup schedule</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('MyPatients')}
          >
            <Text style={styles.actionEmoji}>👥</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.actionTitle}>{t('myPatients')}</Text>
              <Text style={styles.actionSubtitle}>{t('viewPatientHistory')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('EmergencyAlerts' as any)}
          >
            <Text style={styles.actionEmoji}>🚨</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.actionTitle}>{t('emergencyAlerts')}</Text>
              <Text style={styles.actionSubtitle}>{t('respondEmergency')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button - Fixed at bottom */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t('logout')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </RoleGuard>
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
    paddingBottom: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryCard: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  actionEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: colors.emergency,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
