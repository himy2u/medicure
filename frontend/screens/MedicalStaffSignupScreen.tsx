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

  // All roles expanded by default since there's space
  const allRoles = [
    { key: 'doctor', label: '👨‍⚕️ Doctor', description: 'Licensed physician providing medical care' },
    { key: 'medical_staff', label: '👩‍⚕️ Medical Staff', description: 'Nurses, medical assistants, and support staff' },
    { key: 'ambulance_staff', label: '🚑 Ambulance Staff', description: 'Emergency medical services and paramedics' },
    { key: 'lab_staff', label: '🧪 Lab Staff', description: 'Laboratory technicians and analysts' },
    { key: 'pharmacy_staff', label: '💊 Pharmacy Staff', description: 'Pharmacists and pharmacy technicians' },
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
        const homeScreen = getRoleBasedHomeScreen(data.role);
        navigation.navigate(homeScreen as any);
      } else {
        Alert.alert('Signup Failed', data.detail || 'Unable to create account');
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

  const handleWhatsAppSignup = () => {
    Alert.prompt(
      'WhatsApp Signup',
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
              const response = await fetch(`${apiBaseUrl}/auth/whatsapp-signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneNumber, role: role }),
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
                Alert.alert('Signup Failed', data.detail || 'Unable to send OTP');
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
        body: JSON.stringify({ name: fullName, email: email, password: password, role: role })
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
      <View style={styles.mainContent}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Healthcare Professional</Text>
          </View>

          <View style={styles.content}>
            {/* Role Selection - Compact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Role</Text>
              {allRoles.map((r) => (
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

            {/* Auth Methods - Compact Row */}
            <View style={styles.authButtonsRow}>
              <TouchableOpacity style={styles.googleButtonCompact} onPress={handleGoogleSignup} disabled={loading}>
                <Text style={styles.compactButtonText}>🔵 Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.whatsappButtonCompact} onPress={handleWhatsAppSignup} disabled={loading}>
                <Text style={styles.compactButtonText}>💚 WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerCompact}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email/Password - Two Columns */}
            <View style={styles.formRow}>
              <TextInput label="Full Name *" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.inputHalf} />
              <TextInput label="Email *" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.inputHalf} />
            </View>
            <View style={styles.formRow}>
              <TextInput label="Password *" value={password} onChangeText={setPassword} mode="outlined" secureTextEntry style={styles.inputHalf} />
              <TextInput label="Confirm *" value={confirmPassword} onChangeText={setConfirmPassword} mode="outlined" secureTextEntry style={styles.inputHalf} />
            </View>

            <View style={styles.noteBoxCompact}>
              <Text style={styles.noteTextCompact}>ℹ️ Account will be verified by our team</Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.backButtonBottom} onPress={() => navigation.goBack()} disabled={loading}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButtonBottom} onPress={handleEmailSignup} disabled={loading}>
            <Text style={styles.createButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundPrimary },
  mainContent: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 80 },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.accent },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: spacing.xs },
  subtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },
  content: { padding: spacing.md },
  section: { marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  roleCard: { 
    backgroundColor: colors.backgroundSecondary, 
    borderRadius: borderRadius.md, 
    padding: spacing.md, 
    marginBottom: spacing.sm, 
    borderWidth: 2, 
    borderColor: 'transparent', 
    flexDirection: 'column',
  },
  roleCardSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  roleLabel: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  roleLabelSelected: { color: colors.accent },
  roleDescription: { fontSize: 15, color: colors.textSecondary, lineHeight: 20 },
  roleDescriptionSelected: { color: colors.accent, opacity: 0.9 },
  authButtonsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  googleButtonCompact: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  whatsappButtonCompact: { flex: 1, backgroundColor: '#25D366', borderRadius: borderRadius.md, paddingVertical: spacing.sm, alignItems: 'center' },
  compactButtonText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  dividerCompact: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: spacing.sm, fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  formRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
  inputHalf: { flex: 1, backgroundColor: colors.backgroundSecondary },
  noteBoxCompact: { backgroundColor: colors.accentSoft, borderRadius: borderRadius.sm, padding: spacing.xs, marginTop: spacing.xs },
  noteTextCompact: { fontSize: 14, color: colors.accent, lineHeight: 18 },
  bottomActions: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: spacing.md, backgroundColor: colors.backgroundPrimary, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  backButtonBottom: { flex: 1, backgroundColor: colors.backgroundSecondary, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  backButtonText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  createButtonBottom: { flex: 2, backgroundColor: colors.accent, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
