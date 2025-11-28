import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { getRoleBasedHomeScreen } from '../utils/navigationHelper';

type MedicalStaffLoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MedicalStaffLogin'>;

export default function MedicalStaffLoginScreen() {
  const navigation = useNavigation<MedicalStaffLoginScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Configure Google Sign-In
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const signInResult = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) {
        Alert.alert('Error', 'Failed to get authentication token');
        setLoading(false);
        return;
      }

      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:8000';

      const response = await fetch(`${apiBaseUrl}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('auth_token', data.access_token);
        await SecureStore.setItemAsync('user_role', data.role);
        await SecureStore.setItemAsync('user_id', data.user_id);
        await SecureStore.setItemAsync('user_name', signInResult.data?.user.name || '');

        const homeScreen = getRoleBasedHomeScreen(data.role);
        navigation.navigate(homeScreen as any);
      } else {
        Alert.alert('Login Failed', data.detail || 'Unable to login');
      }
    } catch (error: any) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log('User cancelled sign in');
      } else {
        Alert.alert('Error', 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppLogin = () => {
    Alert.prompt(
      'WhatsApp Login',
      'Enter your phone number (with country code)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send OTP',
          onPress: async (phoneNumber) => {
            if (!phoneNumber) return;

            try {
              setLoading(true);
              const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:8000';

              const response = await fetch(`${apiBaseUrl}/auth/whatsapp-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneNumber }),
              });

              const data = await response.json();

              if (response.ok) {
                Alert.prompt(
                  'Enter OTP',
                  'Enter the code sent to your WhatsApp',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Verify',
                      onPress: async (otp) => {
                        if (!otp) return;

                        const verifyResponse = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone: phoneNumber, otp: otp }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyResponse.ok) {
                          await SecureStore.setItemAsync('auth_token', verifyData.access_token);
                          await SecureStore.setItemAsync('user_role', verifyData.role);
                          await SecureStore.setItemAsync('user_id', verifyData.user_id);
                          await SecureStore.setItemAsync('phone', phoneNumber);

                          const homeScreen = getRoleBasedHomeScreen(verifyData.role);
                          navigation.navigate(homeScreen as any);
                        } else {
                          Alert.alert('Verification Failed', verifyData.detail || 'Invalid OTP');
                        }
                      },
                    },
                  ],
                  'plain-text'
                );
              } else {
                Alert.alert('Login Failed', data.detail || 'Unable to send OTP');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'phone-pad'
    );
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:8000';

      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('auth_token', data.access_token);
        await SecureStore.setItemAsync('user_role', data.role);
        await SecureStore.setItemAsync('user_id', data.user_id);
        await SecureStore.setItemAsync('user_email', email);

        const homeScreen = getRoleBasedHomeScreen(data.role);
        navigation.navigate(homeScreen as any);
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Healthcare Professional Login</Text>
        </View>

        <View style={styles.content}>
          {/* Google Sign-In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* WhatsApp Login */}
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={handleWhatsAppLogin}
            disabled={loading}
          >
            <Text style={styles.whatsappButtonText}>Continue with WhatsApp</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email/Password Login */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email & Password</Text>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              disabled={loading}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              disabled={loading}
            />
            <Button
              mode="contained"
              onPress={handleEmailLogin}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              disabled={loading}
              loading={loading}
            >
              Login
            </Button>
          </View>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MedicalStaffSignup')}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: spacing.lg,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  whatsappButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.sm,
  },
  loginButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  loginButtonContent: {
    paddingVertical: spacing.sm,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
});
