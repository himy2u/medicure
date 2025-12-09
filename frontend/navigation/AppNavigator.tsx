import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Auth Screens
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MedicalStaffSignupScreen from '../screens/MedicalStaffSignupScreen';
import MedicalStaffLoginScreen from '../screens/MedicalStaffLoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Patient/Caregiver Screens
import EmergencyScreen from '../screens/EmergencyScreen';
import FindDoctorScreen from '../screens/FindDoctorScreen';
import DoctorResultsScreen from '../screens/DoctorResultsScreen';
import PatientDashboardScreen from '../screens/PatientDashboardScreen';
import MyAppointmentsScreen from '../screens/MyAppointmentsScreen';
import AppointmentDetailsScreen from '../screens/AppointmentDetailsScreen';
import MyPrescriptionsScreen from '../screens/MyPrescriptionsScreen';
import LabResultsScreen from '../screens/LabResultsScreen';
import ChatScreen from '../screens/ChatScreen';
import VideoCallScreen from '../screens/VideoCallScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';

// Doctor Screens
import DoctorHomeScreen from '../screens/DoctorHomeScreen';
import DoctorAvailabilityScreen from '../screens/DoctorAvailabilityScreen';
import MyPatientsScreen from '../screens/MyPatientsScreen';
import PatientHistoryScreen from '../screens/PatientHistoryScreen';

// Medical Staff Screens
import MedicalStaffHomeScreen from '../screens/MedicalStaffHomeScreen';
import CheckInPatientScreen from '../screens/CheckInPatientScreen';
import TodayScheduleScreen from '../screens/TodayScheduleScreen';
import PatientQueueScreen from '../screens/PatientQueueScreen';

// Ambulance Staff Screens
import AmbulanceStaffHomeScreen from '../screens/AmbulanceStaffHomeScreen';
import DispatchDetailsScreen from '../screens/DispatchDetailsScreen';
import IncidentReportScreen from '../screens/IncidentReportScreen';

// Lab Staff Screens
import LabStaffHomeScreen from '../screens/LabStaffHomeScreen';
import LabOrderDetailsScreen from '../screens/LabOrderDetailsScreen';
import ResultsEntryScreen from '../screens/ResultsEntryScreen';

// Pharmacy Staff Screens
import PharmacyStaffHomeScreen from '../screens/PharmacyStaffHomeScreen';
import PrescriptionDetailsScreen from '../screens/PrescriptionDetailsScreen';
import FulfillmentScreen from '../screens/FulfillmentScreen';

// Admin Screens
import ClinicAdminHomeScreen from '../screens/ClinicAdminHomeScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

export type RootStackParamList = {
  // Auth
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  MedicalStaffSignup: undefined;
  MedicalStaffLogin: undefined;
  ForgotPassword: undefined;

  // Patient/Caregiver
  Emergency: undefined;
  FindDoctor: undefined;
  DoctorResults: {
    doctors: any[];
    symptom: string;
    userLocation: { latitude: number; longitude: number };
    searchCriteria?: {
      symptom?: string;
      date?: string;
      timeWindow?: string;
    };
  };
  PatientDashboard: undefined;
  MyAppointments: undefined;
  AppointmentDetails: { appointmentId: string };
  MyPrescriptions: undefined;
  LabResults: undefined;
  Chat: { appointmentId: string; otherUserName: string; otherUserId: string };
  VideoCall: { appointmentId: string; otherUserName: string; roomId: string };
  BookAppointment: { doctor: any };

  // Doctor
  DoctorHome: undefined;
  DoctorAvailability: undefined;
  MyPatients: undefined;
  PatientHistory: { patientId: string; patientName: string };

  // Medical Staff
  MedicalStaffHome: undefined;
  CheckInPatient: undefined;
  TodaySchedule: undefined;
  PatientQueue: undefined;

  // Ambulance Staff
  AmbulanceStaffHome: undefined;
  DispatchDetails: { dispatchId: string };
  IncidentReport: { dispatchId: string };

  // Lab Staff
  LabStaffHome: undefined;
  LabOrderDetails: { orderId: string };
  ResultsEntry: { orderId: string };

  // Pharmacy Staff
  PharmacyStaffHome: undefined;
  PrescriptionDetails: { prescriptionId: string };
  Fulfillment: { prescriptionId: string };

  // Admin
  ClinicAdminHome: undefined;
  AdminDashboard: undefined;
  UserManagement: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
        <Stack.Navigator
          initialRouteName="Landing"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.backgroundPrimary,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 18,
            },
          }}
        >
          <Stack.Screen 
            name="Landing" 
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ title: 'Sign In' }}
          />
          <Stack.Screen 
            name="Signup" 
            component={SignupScreen}
            options={{ title: 'Create Account' }}
          />
          <Stack.Screen 
            name="MedicalStaffSignup" 
            component={MedicalStaffSignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MedicalStaffLogin" 
            component={MedicalStaffLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{ title: 'Reset Password' }}
          />
          <Stack.Screen 
            name="Emergency" 
            component={EmergencyScreen}
            options={{ 
              title: 'Emergency',
              headerStyle: {
                backgroundColor: colors.emergency,
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 20,
              },
            }}
          />
          <Stack.Screen
            name="FindDoctor"
            component={FindDoctorScreen}
            options={{
              title: 'Find a Doctor',
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 20,
              },
            }}
          />
          <Stack.Screen
            name="DoctorResults"
            component={DoctorResultsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PatientDashboard"
            component={PatientDashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DoctorHome"
            component={DoctorHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MedicalStaffHome"
            component={MedicalStaffHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AmbulanceStaffHome"
            component={AmbulanceStaffHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LabStaffHome"
            component={LabStaffHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PharmacyStaffHome"
            component={PharmacyStaffHomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ClinicAdminHome"
            component={ClinicAdminHomeScreen}
            options={{ headerShown: false }}
          />

          {/* Patient/Caregiver Workflow Screens */}
          <Stack.Screen
            name="MyAppointments"
            component={MyAppointmentsScreen}
            options={{ title: 'My Appointments' }}
          />
          <Stack.Screen
            name="AppointmentDetails"
            component={AppointmentDetailsScreen}
            options={{ title: 'Appointment Details' }}
          />
          <Stack.Screen
            name="MyPrescriptions"
            component={MyPrescriptionsScreen}
            options={{ title: 'My Prescriptions' }}
          />
          <Stack.Screen
            name="LabResults"
            component={LabResultsScreen}
            options={{ title: 'Lab Results' }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="VideoCall"
            component={VideoCallScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BookAppointment"
            component={BookAppointmentScreen}
            options={{ title: 'Book Appointment' }}
          />

          {/* Doctor Workflow Screens */}
          <Stack.Screen
            name="DoctorAvailability"
            component={DoctorAvailabilityScreen}
            options={{ title: 'Availability Settings' }}
          />
          <Stack.Screen
            name="MyPatients"
            component={MyPatientsScreen}
            options={{ title: 'My Patients' }}
          />
          <Stack.Screen
            name="PatientHistory"
            component={PatientHistoryScreen}
            options={{ title: 'Patient History' }}
          />

          {/* Medical Staff Workflow Screens */}
          <Stack.Screen
            name="CheckInPatient"
            component={CheckInPatientScreen}
            options={{ title: 'Check In Patient' }}
          />
          <Stack.Screen
            name="TodaySchedule"
            component={TodayScheduleScreen}
            options={{ title: "Today's Schedule" }}
          />
          <Stack.Screen
            name="PatientQueue"
            component={PatientQueueScreen}
            options={{ title: 'Patient Queue' }}
          />

          {/* Ambulance Staff Workflow Screens */}
          <Stack.Screen
            name="DispatchDetails"
            component={DispatchDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="IncidentReport"
            component={IncidentReportScreen}
            options={{ title: 'Incident Report' }}
          />

          {/* Lab Staff Workflow Screens */}
          <Stack.Screen
            name="LabOrderDetails"
            component={LabOrderDetailsScreen}
            options={{ title: 'Order Details' }}
          />
          <Stack.Screen
            name="ResultsEntry"
            component={ResultsEntryScreen}
            options={{ title: 'Enter Results' }}
          />

          {/* Pharmacy Staff Workflow Screens */}
          <Stack.Screen
            name="PrescriptionDetails"
            component={PrescriptionDetailsScreen}
            options={{ title: 'Prescription Details' }}
          />
          <Stack.Screen
            name="Fulfillment"
            component={FulfillmentScreen}
            options={{ title: 'Fulfillment' }}
          />

          {/* Admin Workflow Screens */}
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserManagement"
            component={UserManagementScreen}
            options={{ title: 'User Management' }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}
