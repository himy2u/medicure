/**
 * AdminDashboardScreen - Super Admin dashboard with system overview
 * Used by: Super Admin
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import BaseScreen from '../components/BaseScreen';
import ProfileHeader from '../components/ProfileHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AdminDashboard'>;

export default function AdminDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    loadAdminInfo();
  }, []);

  const loadAdminInfo = async () => {
    const name = await SecureStore.getItemAsync('user_name');
    setAdminName(name || 'Admin');
  };

  // Mock statistics
  const stats = {
    totalUsers: 1247,
    activeToday: 342,
    appointmentsToday: 89,
    emergenciesActive: 3,
    newUsersThisWeek: 45,
    systemHealth: 'healthy'
  };

  const roleBreakdown = [
    { role: 'Patients', count: 892, color: colors.accent },
    { role: 'Doctors', count: 156, color: '#4CAF50' },
    { role: 'Medical Staff', count: 87, color: '#2196F3' },
    { role: 'Lab Staff', count: 34, color: '#9C27B0' },
    { role: 'Pharmacy Staff', count: 45, color: '#FF9800' },
    { role: 'Ambulance Staff', count: 28, color: colors.emergency },
    { role: 'Admins', count: 5, color: '#607D8B' },
  ];

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_role');
    await SecureStore.deleteItemAsync('user_id');
    await SecureStore.deleteItemAsync('user_name');
    navigation.navigate('Landing');
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.adminName}>{adminName}</Text>
        </View>
        <ProfileHeader />
      </View>
    }>
      {/* System Status */}
      <View style={styles.systemStatusCard}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statusText}>System Healthy</Text>
        </View>
        <Text style={styles.lastUpdated}>Last updated: Just now</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats.totalUsers}</Text>
          <Text style={styles.metricLabel}>Total Users</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats.activeToday}</Text>
          <Text style={styles.metricLabel}>Active Today</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats.appointmentsToday}</Text>
          <Text style={styles.metricLabel}>Appointments</Text>
        </View>
        <View style={[styles.metricCard, stats.emergenciesActive > 0 && styles.alertCard]}>
          <Text style={[styles.metricValue, stats.emergenciesActive > 0 && styles.alertValue]}>
            {stats.emergenciesActive}
          </Text>
          <Text style={styles.metricLabel}>Active Emergencies</Text>
        </View>
      </View>

      {/* User Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Users by Role</Text>
        <View style={styles.breakdownCard}>
          {roleBreakdown.map((item, index) => (
            <View key={index} style={styles.roleRow}>
              <View style={styles.roleInfo}>
                <View style={[styles.roleIndicator, { backgroundColor: item.color }]} />
                <Text style={styles.roleName}>{item.role}</Text>
              </View>
              <Text style={styles.roleCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>User Management</Text>
            <Text style={styles.actionDescription}>Manage users, roles, and permissions</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Analytics</Text>
            <Text style={styles.actionDescription}>View detailed system analytics</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>🔍</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Audit Logs</Text>
            <Text style={styles.actionDescription}>Review system activity logs</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>System Settings</Text>
            <Text style={styles.actionDescription}>Configure system parameters</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  adminName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  systemStatusCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  alertCard: {
    backgroundColor: '#FFEBEE',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  alertValue: {
    color: colors.emergency,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  breakdownCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  roleName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  roleCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  actionArrow: {
    fontSize: 20,
    color: colors.accent,
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.emergency,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
