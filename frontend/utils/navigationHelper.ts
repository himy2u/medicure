import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenName = 'PatientDashboard' | 'DoctorHome' | 'MedicalStaffHome' | 'AmbulanceStaffHome' | 'LabStaffHome' | 'PharmacyStaffHome' | 'ClinicAdminHome' | 'Landing';

/**
 * Get the appropriate home screen based on user role
 * @param role - The user's role (patient, caregiver, doctor, medical_staff, etc.)
 * @returns The screen name to navigate to
 */
export function getRoleBasedHomeScreen(role: string): HomeScreenName {
  switch (role) {
    case 'patient':
    case 'caregiver':
      return 'PatientDashboard'; // Patient/caregiver dashboard with role-specific features
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
      // Default to Landing for unknown roles
      return 'Landing';
  }
}
