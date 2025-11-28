import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MedicalStaffSignupScreen from '../screens/MedicalStaffSignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import FindDoctorScreen from '../screens/FindDoctorScreen';
import DoctorHomeScreen from '../screens/DoctorHomeScreen';
import MedicalStaffHomeScreen from '../screens/MedicalStaffHomeScreen';
import AmbulanceStaffHomeScreen from '../screens/AmbulanceStaffHomeScreen';
import LabStaffHomeScreen from '../screens/LabStaffHomeScreen';
import PharmacyStaffHomeScreen from '../screens/PharmacyStaffHomeScreen';
import ClinicAdminHomeScreen from '../screens/ClinicAdminHomeScreen';

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  MedicalStaffSignup: undefined;
  ForgotPassword: undefined;
  Emergency: undefined;
  FindDoctor: undefined;
  DoctorHome: undefined;
  MedicalStaffHome: undefined;
  AmbulanceStaffHome: undefined;
  LabStaffHome: undefined;
  PharmacyStaffHome: undefined;
  ClinicAdminHome: undefined;
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
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}
