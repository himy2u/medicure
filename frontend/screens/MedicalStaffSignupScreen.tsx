import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
// GoogleSignin: Conditionally import for Expo Go compatibility
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.log('GoogleSignin not available (Expo Go) - using WhatsApp only');
}
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { getRoleBasedHomeScreen } from '../utils/navigationHelper';
import { errorLogger } from '../utils/errorLogger';
import ProfileHeader from '../components/ProfileHeader';

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

  // WhatsApp flow state
  const [showWhatsAppFlow, setShowWhatsAppFlow] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Only show Doctor and Medical Staff roles for registration
  // Other roles (ambulance, lab, pharmacy) are assigned by clinic admin
  const allRoles = [
    { key: 'doctor', label: '👨‍⚕️ Doctor', description: 'Licensed physician' },
    { key: 'medical_staff', label: '👩‍⚕️ Medical Staff', description: 'Nurses & assistants' },
  ];

  // Configure Google Sign-In (disabled in Expo Go)
  React.useEffect(() => {
    if (GoogleSignin) {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        offlineAccess: false,
        forceCodeForRefreshToken: false,
      });
    }
  }, []);

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      console.log('=== GOOGLE SIGN-IN STARTED (Medical Staff) ===');
      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      
      // Check if user actually signed in (didn't cancel)
      if (!signInResult || !signInResult.data?.user) {
        console.log('⚠️ User cancelled Google sign-in');
        setLoading(false);
        return;
      }
      
      console.log('=== GOOGLE SIGN-IN POPUP COMPLETED ===');
      console.log('User selected:', signInResult.data.user.email);
      
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;

      if (!idToken) {
        console.error('❌ No id_token received');
        Alert.alert('Error', 'Failed to get authentication token');
        setLoading(false);
        return;
      }

      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';
      console.log('Sending to backend:', `${apiBaseUrl}/auth/google`);
      
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
      console.log('Backend response status:', response.status);
      console.log('Backend response data:', data);

      if (response.ok) {
        console.log('✅ GOOGLE AUTHENTICATION SUCCESS - Backend accepted');
        
        await SecureStore.setItemAsync('auth_token', data.access_token);
        await SecureStore.setItemAsync('user_role', data.role);
        await SecureStore.setItemAsync('user_id', data.user_id);
        await SecureStore.setItemAsync('user_name', signInResult.data?.user.name || '');
        await SecureStore.setItemAsync('user_email', signInResult.data?.user.email || '');
        
        console.log('Navigating to home screen for role:', data.role);
        const homeScreen = getRoleBasedHomeScreen(data.role);
        navigation.navigate(homeScreen as any);
      } else {
        console.error('Backend error:', data.detail);
        Alert.alert('Authentication Failed', data.detail || 'Unable to authenticate with Google');
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      if (error.code !== 'SIGN_IN_CANCELLED' && error.code !== '-5') {
        const errorMessage = error.message || 'Authentication failed';
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSignup = () => {
    console.log('📱 WhatsApp signup clicked');
    setShowWhatsAppFlow(true);
  };

  const sendWhatsAppOTP = async () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      errorLogger.error('Empty phone number');
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    errorLogger.log('Sending OTP to:', phoneNumber);
    setLoading(true);

    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';
      const url = `${apiBaseUrl}/auth/whatsapp/send-otp`;
      
      errorLogger.log('API URL:', url);
      errorLogger.log('Request body:', { phone_number: phoneNumber, role: role });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone_number: phoneNumber,
          role: role
        }),
      });

      errorLogger.log('Response status:', response.status);
      const data = await response.json();
      errorLogger.log('Response data:', data);

      if (response.ok) {
        errorLogger.log('✅ OTP sent successfully');
        setOtpSent(true);
      } else {
        const errorMsg = (data && data.detail) ? data.detail : 'Failed to send OTP';
        errorLogger.error('API Error', errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } catch (error: any) {
      errorLogger.error('EXCEPTION in sendWhatsAppOTP', error);
      Alert.alert('Error', `Network error: ${error?.message || 'Unknown'}`);
    } finally {
      errorLogger.log('Setting loading to false');
      setLoading(false);
    }
  };

  const verifyWhatsAppOTP = async () => {
    if (!otp || otp.trim() === '') {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    console.log('🔐 Verifying OTP...');
    setLoading(true);

    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';
      const url = `${apiBaseUrl}/auth/whatsapp/verify-otp`;
      
      console.log('Verify URL:', url);
      console.log('🔍 DEBUG: Selected role before sending:', role);
      console.log('🔍 DEBUG: Request body:', { phone_number: phoneNumber, otp: otp, role: role });

      const verifyResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone_number: phoneNumber, 
          otp: otp,
          role: role  // ✅ CRITICAL FIX: Send selected role
        }),
      });

      console.log('Verify response status:', verifyResponse.status);
      const verifyData = await verifyResponse.json();
      console.log('Verification response:', verifyData);

      if (verifyResponse.ok) {
        console.log('✅ WhatsApp auth successful');
        console.log('🔍 DEBUG: Full backend response:', JSON.stringify(verifyData, null, 2));
        console.log('🔍 DEBUG: Role from backend:', verifyData.role);
        console.log('🔍 DEBUG: Selected role was:', role);
        
        await SecureStore.setItemAsync('auth_token', verifyData.access_token);
        await SecureStore.setItemAsync('user_role', verifyData.role);
        await SecureStore.setItemAsync('user_id', verifyData.user_id);
        await SecureStore.setItemAsync('user_name', phoneNumber); // ✅ Store phone as name for now
        await SecureStore.setItemAsync('phone', phoneNumber);
        
        // Verify what was actually stored
        const storedRole = await SecureStore.getItemAsync('user_role');
        console.log('🔍 DEBUG: Stored role in SecureStore:', storedRole);
        
        const homeScreen = getRoleBasedHomeScreen(verifyData.role);
        console.log('🔍 DEBUG: Navigating to screen:', homeScreen);
        console.log('🔍 DEBUG: For role:', verifyData.role);
        
        navigation.navigate(homeScreen as any);
      } else {
        const errorMsg = (verifyData && verifyData.detail) ? verifyData.detail : 'Invalid OTP';
        console.error('❌ Verification failed:', errorMsg);
        Alert.alert('Verification Failed', errorMsg);
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';
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

  // If showing WhatsApp flow
  if (showWhatsAppFlow) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowWhatsAppFlow(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>WhatsApp Signup</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.whatsappTitle}>📱 WhatsApp Verification</Text>
          <Text style={styles.whatsappSubtitle}>
            {otpSent ? 'Enter the code we sent to your WhatsApp' : 'Enter your WhatsApp number'}
          </Text>

          {!otpSent ? (
            <>
              <TextInput
                label="WhatsApp Number"
                placeholder="+593987654321"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
                autoFocus
              />
              <Button
                mode="contained"
                onPress={sendWhatsAppOTP}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <TextInput
                label="Verification Code"
                placeholder="123456"
                value={otp}
                onChangeText={setOtp}
                mode="outlined"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              <Button
                mode="contained"
                onPress={verifyWhatsAppOTP}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Verify Code
              </Button>
              <Button
                mode="text"
                onPress={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                disabled={loading}
              >
                Change Number
              </Button>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.title}>Register</Text>
                <Text style={styles.subtitle}>Healthcare Professional</Text>
              </View>
              <ProfileHeader hideHomeButton={true} />
            </View>
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
            <Text style={styles.backButtonBottomText}>Back</Text>
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
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: spacing.xs },
  subtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },
  content: { padding: spacing.md },
  backButton: { marginBottom: spacing.sm },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  whatsappTitle: { fontSize: 24, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  whatsappSubtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: spacing.lg },
  input: { marginBottom: spacing.md, backgroundColor: colors.backgroundSecondary },
  button: { marginBottom: spacing.md },
  section: { marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  roleCard: { 
    backgroundColor: colors.backgroundSecondary, 
    borderRadius: borderRadius.md, 
    padding: spacing.sm, 
    marginBottom: spacing.xs, 
    borderWidth: 2, 
    borderColor: 'transparent', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleCardSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  roleLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  roleLabelSelected: { color: colors.accent },
  roleDescription: { fontSize: 13, color: colors.textSecondary, flex: 1, textAlign: 'right' },
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
  backButtonBottomText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  createButtonBottom: { flex: 2, backgroundColor: colors.accent, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
