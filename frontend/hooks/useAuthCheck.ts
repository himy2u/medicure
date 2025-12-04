import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

/**
 * Hook to check if user is authenticated
 * Redirects to Signup if not authenticated
 */
export function useAuthCheck() {
  const navigation = useNavigation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      
      if (!authToken) {
        console.log('❌ No auth token found - redirecting to Signup');
        navigation.navigate('Signup' as never);
      } else {
        console.log('✅ User is authenticated');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      navigation.navigate('Signup' as never);
    }
  };
}
