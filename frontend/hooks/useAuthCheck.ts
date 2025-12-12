import { useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

/**
 * Hook to check if user is authenticated
 * Redirects to Landing if not authenticated
 * Re-checks on screen focus to catch token expiration
 */
export function useAuthCheck() {
  const navigation = useNavigation();

  const checkAuth = useCallback(async () => {
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      
      if (!authToken) {
        console.log('❌ No auth token found - redirecting to Landing');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Landing' as never }],
        });
      } else {
        console.log('✅ User is authenticated');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' as never }],
      });
    }
  }, [navigation]);

  // Check on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Re-check when screen comes into focus (catches token expiration)
  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [checkAuth])
  );
}
