import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, Pressable, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { colors, spacing, borderRadius } from '../theme/colors';

import { RootStackParamList } from '../navigation/AppNavigator';
import { getRoleBasedHomeScreen } from '../utils/navigationHelper';

// Move styles to top to fix "styles used before declaration" errors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBackButton: {
    marginRight: spacing.md,
  },
  headerBackText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    flex: 1,
    justifyContent: 'flex-start',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  input: {
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  signupButton: {
    marginBottom: spacing.lg,
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
  },
  loginLink: {
    color: colors.accent,
    fontWeight: '600',
  },
  authMethodContainer: {
    marginBottom: spacing.lg,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  roleValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'capitalize',
  },
  profileIcon: {
    padding: spacing.xs,
    position: 'relative',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatarText: {
    fontSize: 20,
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
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  placeholder: {
    width: 50,
  },
  selectedValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  selectedValueLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  searchButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  doctorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  doctorCedula: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  availabilityToggle: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    minWidth: 50,
    alignItems: 'center',
  },
  availabilityOn: {
    backgroundColor: colors.success,
  },
  availabilityOff: {
    backgroundColor: colors.textLight,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  roleSection: {
    marginBottom: spacing.md,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  roleRowCompact: {
    flexDirection: 'column',
    marginBottom: spacing.md,
  },
  radioItemCompact: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  radioItemSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  radioLabelCompact: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  radioLabelSelected: {
    color: colors.accent,
  },
  roleDescriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleDescriptionSelected: {
    color: colors.accent,
    opacity: 0.8,
  },
  authButtons: {
    marginBottom: spacing.lg,
  },
  authTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  whatsappButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.textSecondary,
  },
  dividerText: {
    paddingHorizontal: spacing.sm,
    color: colors.textSecondary,
    fontSize: 12,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  formHalf: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  inputCompact: {
    marginBottom: spacing.xs,
  },
  errorTextCompact: {
    color: colors.emergency,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  backButtonStyle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  signupButtonExpanded: {
    flex: 1,
    marginLeft: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  backContainer: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  dropdownItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundPrimary,
  },
  dropdownItemSelected: {
    backgroundColor: colors.accent + '20',
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  vehicleContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  addVehicleButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addVehicleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  removeVehicleButton: {
    backgroundColor: colors.emergency,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  removeVehicleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  nationalId?: string;
  insurance?: string[];
  specialty?: string;
  subSpecialty?: string;
  locations?: string[];
  availability?: string;
  department?: string;
  licenseNumber?: string;
  vehicles?: Array<{
    licensePlate: string;
    address: string;
    contact: string;
    availability: string;
    areaCoverage: string;
  }>;
  certificationLevel?: string;
  associatedDoctors?: Array<{
    id: string;
    name: string;
    cedula: string;
    availability: boolean;
  }>;
}

// Role-specific form components
const PatientProfileForm = ({ control, errors }: any) => (
  <View>
    <Controller
      control={control}
      rules={{ required: 'National ID is required' }}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          label="National ID (Cedula) *"
          value={value}
          onBlur={onBlur}
          onChangeText={onChange}
          error={!!errors.nationalId}
          style={styles.inputCompact}
          dense
        />
      )}
      name="nationalId"
    />
    {errors.nationalId && <Text style={styles.errorTextCompact}>{errors.nationalId.message}</Text>}
    
    <Text style={styles.sectionTitle}>Insurance (Optional)</Text>
    <Controller
      control={control}
      render={({ field: { onChange, value } }) => (
        <TextInput
          label="Insurance Providers (comma separated)"
          value={value}
          onBlur={() => {}}
          onChangeText={onChange}
          style={styles.inputCompact}
          dense
          placeholder="e.g., Blue Cross, Aetna"
        />
      )}
      name="insurance"
    />
  </View>
);

const DoctorProfileForm = ({ control, errors, watch }: any) => {
  const specialties = [
    'Neurosurgery',
    'Dental',
    'Physical Therapy',
    'Cardiology',
    'Orthopedics',
    'Pediatrics',
    'General Surgery',
    'Internal Medicine'
  ];

  const subSpecialties: { [key: string]: string[] } = {
    'Neurosurgery': ['Spine', 'Pediatric', 'Vascular', 'Functional'],
    'Dental': ['Orthodontist', 'Endodontist', 'Periodontist', 'Oral Surgeon'],
    'Physical Therapy': ['Sports', 'Pediatric', 'Geriatric', 'Neurological'],
    'Cardiology': ['Interventional', 'Electrophysiology', 'Heart Failure', 'Preventive'],
    'Orthopedics': ['Spine', 'Sports Medicine', 'Joint Replacement', 'Trauma'],
    'Pediatrics': ['Neonatology', 'Developmental', 'Adolescent', 'Critical Care'],
    'General Surgery': ['Laparoscopic', 'Breast', 'Colorectal', 'Vascular'],
    'Internal Medicine': ['Hospitalist', 'Critical Care', 'Infectious Disease', 'Rheumatology']
  };

  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [availableSubSpecialties, setAvailableSubSpecialties] = useState<string[]>([]);
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(true);
  const [showSubSpecialtyDropdown, setShowSubSpecialtyDropdown] = useState(false);

  const currentSpecialty = watch('specialty');
  const currentSubSpecialty = watch('subSpecialty');

  React.useEffect(() => {
    if (currentSpecialty && subSpecialties[currentSpecialty]) {
      setAvailableSubSpecialties(subSpecialties[currentSpecialty]);
      setShowSpecialtyDropdown(false);
      setShowSubSpecialtyDropdown(true);
    } else {
      setAvailableSubSpecialties([]);
      setShowSubSpecialtyDropdown(false);
    }
  }, [currentSpecialty]);

  React.useEffect(() => {
    if (currentSubSpecialty) {
      setShowSubSpecialtyDropdown(false);
    }
  }, [currentSubSpecialty]);

  return (
    <View>
      {/* Specialty Selection */}
      {showSpecialtyDropdown && (
        <Controller
          control={control}
          rules={{ required: 'Specialty is required' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={styles.sectionTitle}>Medical Specialty</Text>
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.dropdownItem,
                    value === specialty ? styles.dropdownItemSelected : {}
                  ]}
                  onPress={() => {
                    onChange(specialty);
                    setSelectedSpecialty(specialty);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{specialty}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          name="specialty"
        />
      )}

      {/* Sub-Specialty Selection */}
      {showSubSpecialtyDropdown && (
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <Text style={styles.sectionTitle}>Sub-Specialty</Text>
              {availableSubSpecialties.map((subSpecialty) => (
                <TouchableOpacity
                  key={subSpecialty}
                  style={[
                    styles.dropdownItem,
                    value === subSpecialty ? styles.dropdownItemSelected : {}
                  ]}
                  onPress={() => onChange(subSpecialty)}
                >
                  <Text style={styles.dropdownItemText}>{subSpecialty}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          name="subSpecialty"
        />
      )}

      {/* Selected Values Display */}
      {currentSpecialty && !showSpecialtyDropdown && (
        <View style={styles.selectedValueContainer}>
          <Text style={styles.selectedValueLabel}>Specialty:</Text>
          <Text style={styles.selectedValue}>{currentSpecialty}</Text>
          <TouchableOpacity onPress={() => setShowSpecialtyDropdown(true)}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentSubSpecialty && !showSubSpecialtyDropdown && (
        <View style={styles.selectedValueContainer}>
          <Text style={styles.selectedValueLabel}>Sub-Specialty:</Text>
          <Text style={styles.selectedValue}>{currentSubSpecialty}</Text>
          <TouchableOpacity onPress={() => setShowSubSpecialtyDropdown(true)}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      <Controller
        control={control}
        rules={{ required: 'Locations are required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Practice Locations"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!errors.locations}
            style={styles.inputCompact}
            dense
          />
        )}
        name="locations"
      />
      <Text style={styles.sectionTitle}>Availability Schedule (Optional)</Text>
      <Text style={styles.helperText}>You can set your detailed availability schedule later from your dashboard</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="General Availability (e.g., Mon-Fri 9AM-5PM)"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={styles.inputCompact}
            dense
            placeholder="e.g., Weekdays 9AM-5PM"
          />
        )}
        name="availability"
      />
      
      <Text style={styles.sectionTitle}>Insurance Accepted (Optional)</Text>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Insurance Providers (comma separated)"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            style={styles.inputCompact}
            dense
            placeholder="e.g., Blue Cross, Aetna, Medicare"
          />
        )}
        name="insurance"
      />
    </View>
  );
};

const MedicalStaffProfileForm = ({ control, errors }: any) => {
  const [doctors, setDoctors] = useState([
    { id: '1', name: 'Dr. John Smith', cedula: 'MED-12345', availability: true },
    { id: '2', name: 'Dr. Maria Garcia', cedula: 'MED-67890', availability: false },
    { id: '3', name: 'Dr. Robert Johnson', cedula: 'MED-24680', availability: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDoctorSearch, setShowDoctorSearch] = useState(false);

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.cedula.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDoctorAvailability = (doctorId: string) => {
    setDoctors(doctors.map(doctor => 
      doctor.id === doctorId 
        ? { ...doctor, availability: !doctor.availability }
        : doctor
    ));
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Medical Staff Profile</Text>
      <Controller
        control={control}
        rules={{ required: 'Department is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Department"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!errors.department}
            style={styles.inputCompact}
            dense
          />
        )}
        name="department"
      />
      
      <Controller
        control={control}
        rules={{ required: 'License Number is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="License Number"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!errors.licenseNumber}
            style={styles.inputCompact}
            dense
          />
        )}
        name="licenseNumber"
      />

      <Text style={styles.sectionTitle}>Associated Doctors (Optional)</Text>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => setShowDoctorSearch(!showDoctorSearch)}
      >
        <Text style={styles.searchButtonText}>🔍 Search and Add Doctors</Text>
      </TouchableOpacity>

      {showDoctorSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            label="Search by Name or Cedula"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.inputCompact}
            dense
            placeholder="Enter doctor name or cedula..."
          />
          
          {filteredDoctors.map((doctor) => (
            <View key={doctor.id} style={styles.doctorItem}>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorCedula}>Cedula: {doctor.cedula}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.availabilityToggle,
                  doctor.availability ? styles.availabilityOn : styles.availabilityOff
                ]}
                onPress={() => toggleDoctorAvailability(doctor.id)}
              >
                <Text style={styles.availabilityText}>
                  {doctor.availability ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const AmbulanceStaffProfileForm = ({ control, errors }: any) => {
  const [vehicles, setVehicles] = useState([
    { licensePlate: '', address: '', contact: '', availability: '', areaCoverage: '' }
  ]);

  const addVehicle = () => {
    setVehicles([...vehicles, { licensePlate: '', address: '', contact: '', availability: '', areaCoverage: '' }]);
  };

  const removeVehicle = (index: number) => {
    const newVehicles = vehicles.filter((_, i) => i !== index);
    setVehicles(newVehicles.length > 0 ? newVehicles : [{ licensePlate: '', address: '', contact: '', availability: '', areaCoverage: '' }]);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Ambulance Staff Profile</Text>
      <Controller
        control={control}
        rules={{ required: 'Certification Level is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Certification Level (EMT/Paramedic)"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={!!errors.certificationLevel}
            style={styles.inputCompact}
            dense
          />
        )}
        name="certificationLevel"
      />

      <Text style={styles.sectionTitle}>Vehicles</Text>
      {vehicles.map((vehicle, index) => (
        <View key={index} style={styles.vehicleContainer}>
          <Text style={styles.vehicleTitle}>Vehicle {index + 1}</Text>
          
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="License Plate"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={styles.inputCompact}
                dense
              />
            )}
            name={`vehicles[${index}].licensePlate`}
          />
          
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Address/Station"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={styles.inputCompact}
                dense
              />
            )}
            name={`vehicles[${index}].address`}
          />
          
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Contact Number"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={styles.inputCompact}
                dense
              />
            )}
            name={`vehicles[${index}].contact`}
          />
          
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Availability"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={styles.inputCompact}
                dense
              />
            )}
            name={`vehicles[${index}].availability`}
          />
          
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Area Coverage"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={styles.inputCompact}
                dense
              />
            )}
            name={`vehicles[${index}].areaCoverage`}
          />

          {vehicles.length > 1 && (
            <TouchableOpacity
              style={styles.removeVehicleButton}
              onPress={() => removeVehicle(index)}
            >
              <Text style={styles.removeVehicleText}>Remove Vehicle</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addVehicleButton} onPress={addVehicle}>
        <Text style={styles.addVehicleText}>+ Add Another Vehicle</Text>
      </TouchableOpacity>
    </View>
  );
};

const BasicProfileForm = ({ control, errors }: any) => (
  <View>
    <Text style={styles.sectionTitle}>Admin Profile</Text>
    <Text style={styles.subtitle}>Basic account created. Additional permissions will be assigned by system administrator.</Text>
  </View>
);

export default function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [showProfileStep, setShowProfileStep] = useState(false);
  const [showSignOutMenu, setShowSignOutMenu] = useState(false);

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<SignupFormData>({
    defaultValues: {
      role: 'patient'
    }
  });

  // Check if user is already authenticated
  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      const userId = await SecureStore.getItemAsync('user_id');
      const userRole = await SecureStore.getItemAsync('user_role');

      if (authToken && userId) {
        console.log('User already authenticated, redirecting to role-based home');
        const homeScreen = getRoleBasedHomeScreen(userRole || 'patient');
        navigation.navigate(homeScreen);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  // Configure Google Sign-In
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Required for iOS
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // Optional, auto-detected from GoogleService-Info.plist
      offlineAccess: false, // We don't need offline access
      forceCodeForRefreshToken: false, // We only need id_token
    });
    console.log('=== GoogleSignin configured ===');
    console.log('Web Client ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
    console.log('iOS Client ID:', process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  }, []);

  const roles = [
    { key: 'patient', label: '🩺 ' + t('patient'), description: 'Seeking medical care for yourself' },
    { key: 'caregiver', label: '👨‍👩‍👧 ' + t('caregiver'), description: 'Managing health for a family member or dependent' }
  ];

  const password = watch('password');
  const currentRole = watch('role');

  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // For basic signup, just show profile step
    setShowProfileStep(true);
  };

  const onFinalSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      // Get stored auth token and user info
      const authToken = await SecureStore.getItemAsync('auth_token');
      const userId = await SecureStore.getItemAsync('user_id');
      
      if (!authToken || !userId) {
        Alert.alert('Error', 'Authentication required. Please sign in again.');
        setShowProfileStep(false);
        return;
      }

      // Update user profile with additional information
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:8000';
      
      const response = await fetch(`${apiBaseUrl}/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...data,
          profile_complete: true
        }),
      });

      if (response.ok) {
        console.log('Profile updated successfully');
        // Navigate to role-based home screen
        const userRole = await SecureStore.getItemAsync('user_role');
        const homeScreen = getRoleBasedHomeScreen(userRole || 'patient');
        navigation.navigate(homeScreen);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Error', errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      console.log('=== GOOGLE SIGN-IN STARTED ===');
      
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Sign in and get user info with id_token
      const signInResult = await GoogleSignin.signIn();
      console.log('=== GOOGLE SIGN-IN SUCCESS ===');
      console.log('User:', signInResult.data?.user.email);
      
      // Get id_token
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;
      
      if (!idToken) {
        console.error('No id_token received');
        Alert.alert('Error', 'Failed to get authentication token');
        setLoading(false);
        return;
      }
      
      // Get the selected role
      const selectedRole = currentRole || 'patient';
      
      // Call backend Google auth endpoint
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      console.log('Calling backend:', `${apiBaseUrl}/auth/google`);
      
      const response = await fetch(`${apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: idToken,
          role: selectedRole,
          name: signInResult.data?.user.name,
          email: signInResult.data?.user.email,
        }),
      });

      const data = await response.json();
      console.log('Backend response:', response.ok ? 'Success' : 'Failed');

      if (response.ok) {
        // Store authentication data
        await SecureStore.setItemAsync('auth_token', data.access_token);
        await SecureStore.setItemAsync('user_role', data.role);
        await SecureStore.setItemAsync('user_id', data.user_id);
        await SecureStore.setItemAsync('user_name', signInResult.data?.user.name || '');
        await SecureStore.setItemAsync('user_email', signInResult.data?.user.email || '');
        
        // Navigate based on profile completion - no popups
        if (data.profile_complete) {
          console.log('Profile complete, navigating to role-based home');
          const homeScreen = getRoleBasedHomeScreen(data.role);
          navigation.navigate(homeScreen);
        } else {
          console.log('Profile incomplete, showing profile form');
          setShowProfileStep(true);
        }
      } else {
        console.error('Backend error:', data.detail);
        Alert.alert('Authentication Failed', data.detail || 'Unable to authenticate with Google');
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      // Only show error if it's not a user cancellation
      if (error.code !== 'SIGN_IN_CANCELLED' && error.code !== '-5') {
        const errorMessage = error.message || 'Authentication failed';
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSignup = () => {
    Alert.prompt(
      'WhatsApp Sign Up',
      'Enter your WhatsApp number (with country code, e.g., +1234567890)',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
              
              // Send OTP
              const response = await fetch(`${apiBaseUrl}/auth/whatsapp/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  phone_number: phoneNumber, 
                  role: currentRole 
                })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                console.log('OTP sent:', data.cost_status);
                
                // Show OTP input dialog
                Alert.prompt(
                  'Enter OTP',
                  `We sent a verification code to ${phoneNumber}`,
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Verify',
                      onPress: async (otp?: string) => {
                        if (!otp || otp.trim() === '') {
                          Alert.alert('Error', 'Please enter the OTP');
                          return;
                        }
                        
                        // Verify OTP
                        const verifyResponse = await fetch(`${apiBaseUrl}/auth/whatsapp/verify-otp`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            phone_number: phoneNumber,
                            otp: otp,
                            role: currentRole,
                            name: watch('name') || phoneNumber
                          })
                        });
                        
                        const verifyData = await verifyResponse.json();
                        
                        if (verifyResponse.ok) {
                          // Store auth data
                          await SecureStore.setItemAsync('auth_token', verifyData.access_token);
                          await SecureStore.setItemAsync('user_role', verifyData.role);
                          await SecureStore.setItemAsync('user_id', verifyData.user_id);
                          await SecureStore.setItemAsync('user_name', watch('name') || phoneNumber);
                          await SecureStore.setItemAsync('user_email', phoneNumber);
                          
                          console.log('WhatsApp auth successful:', verifyData.cost_status);

                          // Navigate based on profile completion
                          if (verifyData.profile_complete) {
                            const homeScreen = getRoleBasedHomeScreen(verifyData.role);
                            navigation.navigate(homeScreen);
                          } else {
                            setShowProfileStep(true);
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
              console.error('WhatsApp OTP error:', error);
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

  const handleSignOut = async () => {
    try {
      setShowSignOutMenu(false);
      
      // Sign out from Google
      await GoogleSignin.signOut();
      
      // Clear all stored data
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_role');
      await SecureStore.deleteItemAsync('user_id');
      await SecureStore.deleteItemAsync('user_name');
      await SecureStore.deleteItemAsync('user_email');
      
      console.log('User signed out successfully');
      setShowProfileStep(false);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  // If showing profile step, render role-specific form
  if (showProfileStep) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.profileHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{t('completeProfile')}</Text>
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Role:</Text>
                <Text style={styles.roleValue}>{roles.find(r => r.key === currentRole)?.label}</Text>
              </View>
            </View>
            <View>
              <TouchableOpacity 
                style={styles.profileIcon} 
                onPress={() => setShowSignOutMenu(!showSignOutMenu)}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {watch('name')?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showSignOutMenu && (
                <TouchableOpacity 
                  style={styles.signOutMenu}
                  onPress={handleSignOut}
                >
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {currentRole === 'patient' || currentRole === 'caregiver' ? (
            <PatientProfileForm control={control} errors={errors} />
          ) : currentRole === 'doctor' ? (
            <DoctorProfileForm control={control} errors={errors} watch={watch} />
          ) : currentRole === 'medical_staff' ? (
            <MedicalStaffProfileForm control={control} errors={errors} />
          ) : currentRole === 'ambulance_staff' ? (
            <AmbulanceStaffProfileForm control={control} errors={errors} />
          ) : (
            <BasicProfileForm control={control} errors={errors} />
          )}

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() => setShowProfileStep(false)}
              style={styles.backButton}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onFinalSubmit)}
              loading={loading}
              disabled={loading}
              style={styles.signupButtonExpanded}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackButton}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Signup</Text>
      </View>

      <View style={styles.content}>

      {/* Role Selection First */}
      <View style={styles.roleSection}>
        <Text style={styles.roleTitle}>Select Your Role</Text>
        <Controller
          control={control}
          render={({ field: { onChange, value } }) => (
            <RadioButton.Group onValueChange={onChange} value={value}>
              <View style={styles.roleRowCompact}>
                {roles.map((role) => (
                  <TouchableOpacity
                    key={role.key}
                    style={[
                      styles.radioItemCompact,
                      value === role.key ? styles.radioItemSelected : {}
                    ]}
                    onPress={() => onChange(role.key)}
                  >
                    <Text style={[
                      styles.radioLabelCompact,
                      value === role.key ? styles.radioLabelSelected : {}
                    ]}>
                      {role.label}
                    </Text>
                    <Text style={[
                      styles.roleDescriptionText,
                      value === role.key ? styles.roleDescriptionSelected : {}
                    ]}>
                      {role.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </RadioButton.Group>
          )}
          name="role"
        />
      </View>

      {/* Auth Method */}
      <View style={styles.authButtons}>
        <Text style={styles.authTitle}>{t('authMethod')}</Text>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignup}>
          <Text style={styles.googleButtonText}>🔵 Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppSignup}>
          <Text style={styles.whatsappButtonText}>💚 WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Basic Form Fields */}
      <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('name')}
                placeholder={t('namePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.inputCompact}
                error={!!errors.name}
              />
            )}
          />
          {errors.name && <Text style={styles.errorTextCompact}>{errors.name.message}</Text>}
        </View>

        <View style={styles.formHalf}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('email')}
                placeholder={t('emailPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.inputCompact}
                error={!!errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && <Text style={styles.errorTextCompact}>{errors.email.message}</Text>}
        </View>
      </View>

        <View style={styles.formRow}>
        <View style={styles.formHalf}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('password')}
                placeholder={t('passwordPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.inputCompact}
                error={!!errors.password}
                secureTextEntry
              />
            )}
          />
          {errors.password && <Text style={styles.errorTextCompact}>{errors.password.message}</Text>}
        </View>

        <View style={styles.formHalf}>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={t('confirmPassword')}
                placeholder={t('confirmPasswordPlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.inputCompact}
                error={!!errors.confirmPassword}
                secureTextEntry
              />
            )}
          />
          {errors.confirmPassword && <Text style={styles.errorTextCompact}>{errors.confirmPassword.message}</Text>}
        </View>
      </View>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.signupButton}
          loading={loading}
          disabled={loading}
        >
          {t('signup')}
        </Button>

        <View style={styles.loginRedirect}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>{t('login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
