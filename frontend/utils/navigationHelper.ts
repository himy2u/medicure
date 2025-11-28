import { RootStackParamList } from '../navigation/AppNavigator';

/**
 * Get the appropriate home screen based on user role
 * @param role - The user's role (patient, caregiver, doctor, medical_staff, etc.)
 * @returns The screen name to navigate to
 */
export function getRoleBasedHomeScreen(role: string): keyof RootStackParamList {
  switch (role) {
    case 'patient':
    case 'caregiver':
      return 'PatientHome'; // Changed from 'Landing' to 'PatientHome' for dashboard access
    case 'doctor':
      return 'DoctorHome';
    case 'medical_staff':
      return 'MedicalStaffHome';
    case 'ambulance_staff':
      return 'AmbulanceStaffHome';
    case 'lab_staff':
      return 'LabStaffHome';
    case 'pharmacy_staff':
      return 'PharmacyStaffHome';
    case 'clinic_admin':
      return 'ClinicAdminHome';
    default:
      // Default to PatientHome for unknown roles
      return 'PatientHome';
  }
}
