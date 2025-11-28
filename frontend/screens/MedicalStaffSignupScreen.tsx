import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type MedicalStaffSignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MedicalStaffSignup'>;

export default function MedicalStaffSignupScreen() {
  const navigation = useNavigation<MedicalStaffSignupScreenNavigationProp>();
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'doctor' | 'medical_staff' | 'ambulance'>('doctor');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [subSpecialty, setSubSpecialty] = useState('');

  const roles = [
    { key: 'doctor', label: '👨‍⚕️ Doctor', description: 'Licensed medical practitioner' },
    { key: 'medical_staff', label: '👩‍⚕️ Medical Staff', description: 'Nurse, assistant, or other medical staff' },
    { key: 'ambulance', label: '🚑 Ambulance Service', description: 'Emergency medical services' },
  ];

  const handleSignup = async () => {
    if (!phone || !fullName || !role) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (role === 'doctor' && (!licenseNumber || !specialty)) {
      Alert.alert('Missing Information', 'Doctors must provide license number and specialty');
      return;
    }

    try {
      // TODO: Implement API call
      console.log('Medical staff signup:', { phone, fullName, email, role, licenseNumber, specialty, subSpecialty });
      Alert.alert('Success', 'Account created! Please wait for verification.');
      navigation.navigate('Landing');
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Medical Staff Registration</Text>
          <Text style={styles.subtitle}>Register as a healthcare professional</Text>
        </View>

        <View style={styles.content}>
          {/* Role Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Role</Text>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.roleCard, role === r.key && styles.roleCardSelected]}
                onPress={() => setRole(r.key as any)}
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

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <TextInput
              label="Phone Number *"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              placeholder="+593 99 123 4567"
            />
            <TextInput
              label="Full Name *"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          {/* Doctor-specific fields */}
          {role === 'doctor' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Information</Text>
              <TextInput
                label="Medical License Number *"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Specialty *"
                value={specialty}
                onChangeText={setSpecialty}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Cardiology, Neurology"
              />
              <TextInput
                label="Sub-specialty"
                value={subSpecialty}
                onChangeText={setSubSpecialty}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Interventional Cardiology"
              />
            </View>
          )}

          {/* Medical Staff specific fields */}
          {role === 'medical_staff' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Information</Text>
              <TextInput
                label="License/Certification Number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Position/Role"
                value={specialty}
                onChangeText={setSpecialty}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Registered Nurse, Medical Assistant"
              />
            </View>
          )}

          {/* Ambulance specific fields */}
          {role === 'ambulance' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Information</Text>
              <TextInput
                label="Service License Number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Service Name"
                value={specialty}
                onChangeText={setSpecialty}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Cruz Roja, Emergency Services"
              />
            </View>
          )}

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              ℹ️ Your account will be reviewed and verified by our team before activation.
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleSignup}
            style={styles.signupButton}
            contentStyle={styles.signupButtonContent}
          >
            Create Account
          </Button>
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
    padding: spacing.lg,
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
  section: {
    marginBottom: spacing.xl,
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
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  input: {
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.md,
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
  signupButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
  },
  signupButtonContent: {
    paddingVertical: spacing.md,
  },
});
