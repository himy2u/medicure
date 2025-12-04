import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
// GoogleSignin disabled for Expo Go compatibility
const GoogleSignin: any = null;
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getRoleBasedHomeScreen } from '../utils/navigationHelper';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ProfileHeaderProps {
  hideHomeButton?: boolean;
}

export default function ProfileHeader({ hideHomeButton = false }: ProfileHeaderProps) {
  const navigation = useNavigation<NavigationProp>();
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [showSignOutMenu, setShowSignOutMenu] = useState(false);
  
  // Determine if we should show home button
  const currentRoute = navigation.getState()?.routes[navigation.getState()?.index || 0]?.name;
  const isOnHomePage = currentRoute === 'Landing' || 
                       currentRoute === 'DoctorHome' || 
                       currentRoute === 'PatientDashboard' ||
                       currentRoute === 'MedicalStaffHome' ||
                       currentRoute === 'AmbulanceStaffHome' ||
                       currentRoute === 'LabStaffHome' ||
                       currentRoute === 'PharmacyStaffHome' ||
                       currentRoute === 'ClinicAdminHome';
  
  const shouldShowHomeButton = !hideHomeButton && !isOnHomePage;

  useEffect(() => {
    loadUserData();
    
    // Add focus listener to refresh user data when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      const name = await SecureStore.getItemAsync('user_name');
      const role = await SecureStore.getItemAsync('user_role');
      
      console.log('🔍 ProfileHeader DEBUG: Auth token exists?', !!authToken);
      console.log('🔍 ProfileHeader DEBUG: Name:', name);
      console.log('🔍 ProfileHeader DEBUG: Role:', role);
      
      // Only show user data if actually authenticated
      if (authToken) {
        // Has auth token - show user data
        setUserName(name || 'User');
        setUserRole(role || '');
      } else {
        // No auth token - clear display
        setUserName('');
        setUserRole('');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      setShowSignOutMenu(false);
      
      // If guest, navigate to signup
      if (!userName) {
        navigation.navigate('Signup');
        return;
      }
      
      console.log('🔓 Starting sign out process...');
      
      // Sign out from Google (if available)
      if (GoogleSignin) {
        try {
          await GoogleSignin.signOut();
          console.log('✅ Google sign out successful');
        } catch (e) {
          console.log('⚠️ Google sign out skipped:', e);
        }
      }
      
      // Clear all stored data
      try {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_role');
        await SecureStore.deleteItemAsync('user_id');
        await SecureStore.deleteItemAsync('user_name');
        await SecureStore.deleteItemAsync('user_email');
        console.log('✅ All auth data cleared from SecureStore');
      } catch (e) {
        console.error('❌ Error clearing SecureStore:', e);
      }
      
      // Clear local state immediately
      setUserName('');
      setUserRole('');
      
      console.log('✅ User signed out successfully');
      
      // Reset navigation stack to Landing screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      });
    } catch (error) {
      console.error('❌ Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  // Show "Guest" if not logged in
  const displayName = userName || 'Guest';
  const displayRole = userRole || 'Not signed in';

  const handleGoHome = () => {
    // Navigate to role-based home screen
    const homeScreen = getRoleBasedHomeScreen(userRole || 'patient');
    navigation.navigate(homeScreen as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {shouldShowHomeButton && (
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
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
              {displayName}
            </Text>
            <Text style={styles.userRole} numberOfLines={1} ellipsizeMode="tail">
              {displayRole}
            </Text>
          </View>
          <View style={[styles.userAvatar, !userName && styles.guestAvatar]}>
            <Text style={styles.userAvatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {showSignOutMenu && (
        <TouchableOpacity 
          style={styles.signOutMenu}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>{userName ? 'Sign Out' : 'Sign In'}</Text>
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
    flexShrink: 1,
  },
  userInfo: {
    marginRight: spacing.sm,
    alignItems: 'flex-end',
    flexShrink: 1,
    maxWidth: 150,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  userRole: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestAvatar: {
    backgroundColor: colors.textSecondary,
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
