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

type MedicalStaffSignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MedicalStaffSignup'>;

export default function MedicalStaffSignupScreen() {
  const navigation = useNavigation<MedicalStaffSignupScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>('doctor');

  const roles = [
    { key: 'doctor', label: '👨‍⚕️ Doctor', description: 'Licensed physician or surgeon' },
    { key: 'medical_staff', label: '👩‍⚕️ Medical Staff', description: 'Nurse, assistant, technician' },
    { key: 'ambulance_staff', label: '🚑 Ambulance Staff', description: 'Emergency medical services' },
  ];

  // Configure Google Sign-In
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });
  }, []);

  const handleGoogleSignup = async () => {
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

      const response = await fetch(`${apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_token: idToken,
          role: role,
          name: signInResult.data?.user.name,
          email: signInResult.data?.user.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('auth_token', data.access_token);
        await SecureStore.setItemAsync('user_role', data.role);
        await SecureStore.setItemAsync('user_id', data.user_id);
        await SecureStore.setItemAsync('user_name', signInResult.data?.user.name || '');
        await SecureStore.setItemAsync('user_email', signInResult.data?.user.email || '');

        // Navigate to role-specific home screen
        if (data.profile_complete) {
          const homeScreen = getRoleBasedHomeScreen(data.role);
          navigation.navigate(homeScreen);
        } else {
          navigation.navigate('Signup'); // Will show role-specific profile
        }
      } else {
        Alert.alert('Authentication Failed', data.detail || 'Unable to authenticate');
      }
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED' && error.code !== '-5') {
        Alert.alert('Error', error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSignup = () => {
    Alert.prompt(
      'WhatsApp Sign Up',
      'Enter your WhatsApp number (with country code)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send OTP',
          onPress: async (phoneNumber?: string) => {
            if (!phoneNumber || phoneNumber.trim() === '') {
              Alert.alert('Error', 'Please enter a valid phone number');
              return;
            }

            setLoading(true);
            try {
              const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:8000';

              const response = await fetch(`${apiBaseUrl}/auth/whatsapp/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber, role: role })
              });

              const data = await response.json();

              if (response.ok) {
                Alert.prompt(
                  'Enter OTP',
                  `We sent a verification code to ${phoneNumber}`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Verify',
                      onPress: async (otp?: string) => {
                        if (!otp || otp.trim() === '') {
                          Alert.alert('Error', 'Please enter the OTP');
                          return;
                        }

                        const verifyResponse = await fetch(`${apiBaseUrl}/auth/whatsapp/verify-otp`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            phone_number: phoneNumber,
                            otp: otp,
                            role: role,
                            name: fullName || phoneNumber
                          })
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyResponse.ok) {
                          await SecureStore.setItemAsync('auth_token', verifyData.access_token);
                          await SecureStore.setItemAsync('user_role', verifyData.role);
                          await SecureStore.setItemAsync('user_id', verifyData.user_id);
                          await SecureStore.setItemAsync('user_name', fullName || phoneNumber);
                          await SecureStore.setItemAsync('user_email', phoneNumber);

                          if (verifyData.profile_complete) {
                            const homeScreen = getRoleBasedHomeScreen(verifyData.role);
                            navigation.navigate(homeScreen);
                          } else {
                            navigation.navigate('Signup'); // Will show role-specific profile
                          }
                        } else {
                          Alert.alert('Verification Failed', verifyData.detail || 'Invalid OTP');
                        }
                      },
                    },
                  ],
                  'plain-text',
                  '',
                  'number-pad'
                );
              } else {
                Alert.alert('Error', data.detail || 'Failed to send OTP');
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

  const handleEmailSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:8000';

      const response = await fetch(`${apiBaseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          role: role
        })
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync('auth_token', data.access_token);
        await SecureStore.setItemAsync('user_role', data.role);
        await SecureStore.setItemAsync('user_id', data.user_id);
        await SecureStore.setItemAsync('user_name', fullName);
        await SecureStore.setItemAsync('user_email', email);

        // Navigate to role-specific profile page
        navigation.navigate('Signup'); // Will show role-specific profile
      } else {
        Alert.alert('Signup Failed', data.detail || 'Unable to create account');
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
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Healthcare Professional Registration</Text>
        </View>

        <View style={styles.content}>
          {/* Role Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Role</Text>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, role === r.key && styles.roleCardSelected]}
                onPress={() => setRole(r.key)}
              >
                <Text style={[styles.roleLabel, role === r.key && styles.roleLabelSelected]}>
                  {r.label}
                </Text>
                <Text style={[styles.roleDescription, role === r.key && styles.roleDescriptionSelected]}>
                  {r.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Auth Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sign Up / Login Method</Text>
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignup} disabled={loading}>
              <Text style={styles.googleButtonText}>🔵 Continue with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppSignup} disabled={loading}>
              <Text style={styles.whatsappButtonText}>💚 Continue with WhatsApp</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>

          {/* Standard Email/Password Signup */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email & Password</Text>
            <TextInput
              label="Full Name *"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Email *"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              label="Password *"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="Confirm Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              ℹ️ Your account will be reviewed and verified by our team before full activation.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.backButtonStyle}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              mode="contained"
              onPress={handleEmailSignup}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
            >
              Register
            </Button>
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
    paddingBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  roleCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  roleLabelSelected: {
    color: colors.accent,
  },
  roleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  roleDescriptionSelected: {
    color: colors.accent,
    opacity: 0.8,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.sm,
  },
  noteBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  noteText: {
    fontSize: 14,
    color: colors.accent,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backButtonStyle: {
    flex: 1,
  },
  registerButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});
