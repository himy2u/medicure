/**
 * DoctorHomeScreen - Professional Dashboard
 * 
 * Inspired by: Wealthsimple, Solv, One Medical
 * Clean, minimal, efficient for busy doctors
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import RoleGuard from '../components/RoleGuard';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthCheck } from '../hooks/useAuthCheck';

type NavigationProp = StackNavigationProp<RootStackParamList, 'DoctorHome'>;

interface MenuItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  screen: string;
  accent?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'calendar', icon: '📅', title: 'Calendar', subtitle: 'Appointments & availability', screen: 'UnifiedCalendar', accent: true },
  { id: 'patients', icon: '👥', title: 'Patients', subtitle: 'View patient records', screen: 'MyPatients' },
  { id: 'emergency', icon: '🚨', title: 'Emergency', subtitle: 'Respond to alerts', screen: 'EmergencyAlerts' },
];

export default function DoctorHomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [doctorName, setDoctorName] = React.useState('');

  useAuthCheck();

  React.useEffect(() => {
    const loadUserInfo = async () => {
      const name = await SecureStore.getItemAsync('user_name');
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

  return (
    <RoleGuard allowedRoles={['doctor']} fallbackMessage="Access restricted.">
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            {doctorName && <Text style={styles.doctorName}>Dr. {doctorName}</Text>}
          </View>
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => navigation.navigate('ProfileSettings')}
          >
            <Text style={styles.profileBtnText}>
              {doctorName ? doctorName.charAt(0).toUpperCase() : '👤'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats - Clickable */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('UnifiedCalendar')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('MyAppointments')}
            activeOpacity={0.7}
          >
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statCard, styles.statCardAlert]}
            onPress={() => navigation.navigate('EmergencyAlerts')}
            activeOpacity={0.7}
          >
            <Text style={[styles.statNumber, styles.statNumberAlert]}>1</Text>
            <Text style={[styles.statLabel, styles.statLabelAlert]}>Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, item.accent && styles.menuItemAccent]}
              onPress={() => navigation.navigate(item.screen as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </RoleGuard>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statCardAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statNumberAlert: {
    color: '#DC2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statLabelAlert: {
    color: '#DC2626',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuItemAccent: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  menuChevron: {
    fontSize: 22,
    color: '#CCC',
    fontWeight: '300',
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
});
