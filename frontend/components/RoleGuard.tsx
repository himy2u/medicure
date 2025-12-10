/**
 * RoleGuard Component
 * Restricts screen access based on user role
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, borderRadius } from '../theme/colors';
import { getRoleBasedHomeScreen } from '../utils/navigationHelper';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallbackMessage?: string;
}

export default function RoleGuard({ 
  allowedRoles, 
  children, 
  fallbackMessage = "You don't have permission to access this screen." 
}: RoleGuardProps) {
  const navigation = useNavigation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const role = await SecureStore.getItemAsync('user_role');
        setUserRole(role);
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, []);

  const handleGoHome = () => {
    const homeScreen = getRoleBasedHomeScreen(userRole || 'patient');
    navigation.navigate(homeScreen as any);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>🚫</Text>
          <Text style={styles.errorTitle}>Access Restricted</Text>
          <Text style={styles.errorMessage}>{fallbackMessage}</Text>
          <Text style={styles.roleInfo}>
            Your role: {userRole || 'Unknown'}
          </Text>
          <Text style={styles.allowedRoles}>
            Allowed roles: {allowedRoles.join(', ')}
          </Text>
          
          <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  roleInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  allowedRoles: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});