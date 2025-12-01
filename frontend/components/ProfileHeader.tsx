import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
// GoogleSignin disabled for Expo Go compatibility
const GoogleSignin: any = null;
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ProfileHeaderProps {
  hideHomeButton?: boolean;
}

export default function ProfileHeader({ hideHomeButton = false }: ProfileHeaderProps) {
  const navigation = useNavigation<NavigationProp>();
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [showSignOutMenu, setShowSignOutMenu] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await SecureStore.getItemAsync('user_name');
      const role = await SecureStore.getItemAsync('user_role');
      
      if (name) setUserName(name);
      if (role) setUserRole(role);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setShowSignOutMenu(false);
      
      // Sign out from Google (if available)
      if (GoogleSignin) {
        await GoogleSignin.signOut();
      }
      
      // Clear all stored data
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_role');
      await SecureStore.deleteItemAsync('user_id');
      await SecureStore.deleteItemAsync('user_name');
      await SecureStore.deleteItemAsync('user_email');
      
      console.log('User signed out successfully');
      navigation.navigate('Signup');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (!userName) {
    return null; // Don't show anything if not logged in
  }

  const handleGoHome = () => {
    // Navigate to role-based home screen
    const homeScreenMap: { [key: string]: keyof RootStackParamList } = {
      'patient': 'Landing',
      'caregiver': 'Landing',
      'doctor': 'DoctorHome',
      'medical_staff': 'MedicalStaffHome',
      'ambulance_staff': 'AmbulanceStaffHome',
    };
    
    const homeScreen = homeScreenMap[userRole] || 'Landing';
    navigation.navigate(homeScreen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {!hideHomeButton && (
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={handleGoHome}
          >
            <Text style={styles.homeIcon}>🏠</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.userProfile} 
          onPress={() => setShowSignOutMenu(!showSignOutMenu)}
        >
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>{userRole}</Text>
          </View>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {showSignOutMenu && (
        <TouchableOpacity 
          style={styles.signOutMenu}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  homeButton: {
    backgroundColor: colors.backgroundSecondary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeIcon: {
    fontSize: 24,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginRight: spacing.sm,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signOutMenu: {
    position: 'absolute',
    top: 55,
    right: 0,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    minWidth: 120,
    zIndex: 1000,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.emergency,
    textAlign: 'center',
  },
});
