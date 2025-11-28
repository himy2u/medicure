import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

type DoctorResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DoctorResults'>;
type DoctorResultsScreenRouteProp = RouteProp<RootStackParamList, 'DoctorResults'>;

interface Doctor {
  doctor_id: number;
  full_name: string;
  specialty: string;
  sub_specialty?: string;
  phone: string;
  clinic_name: string;
  address: string;
  distance_km: number;
  is_24_hours: boolean;
  latitude: number;
  longitude: number;
}

export default function DoctorResultsScreen() {
  const navigation = useNavigation<DoctorResultsScreenNavigationProp>();
  const route = useRoute<DoctorResultsScreenRouteProp>();
  
  console.log('=== DOCTOR RESULTS SCREEN LOADED ===');
  console.log('Route params:', JSON.stringify(route.params, null, 2));
  
  const { doctors, symptom, userLocation } = route.params || {};
  
  console.log('Doctors received:', doctors?.length || 0);
  console.log('Doctors array:', doctors);
  console.log('Symptom:', symptom);
  console.log('User location:', userLocation);
  
  if (!doctors || doctors.length === 0) {
    console.log('❌ EMPTY DOCTORS ARRAY - This will show "No doctors available"');
  } else {
    console.log('✅ DOCTORS FOUND - Will show doctor list');
  }
  
  const [requesting, setRequesting] = useState<number | null>(null);

  const handleEmergencyRequest = async (doctor: Doctor) => {
    try {
      setRequesting(doctor.doctor_id);
      
      const authToken = await SecureStore.getItemAsync('auth_token');
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:8000';
      
      const response = await fetch(`${apiBaseUrl}/api/emergency/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          doctor_id: doctor.doctor_id,
          symptom: symptom,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Request Sent!',
          `Emergency request sent to ${doctor.full_name}. They will be notified immediately.`,
          [
            {
              text: 'Call Doctor',
              onPress: () => Linking.openURL(`tel:${doctor.phone}`)
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', data.detail || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending emergency request:', error);
      Alert.alert('Error', 'Failed to send emergency request');
    } finally {
      setRequesting(null);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Available Doctors</Text>
          <Text style={styles.headerSubtitle}>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found for: {symptom}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {doctors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>😔 No doctors available</Text>
            <Text style={styles.emptySubtext}>
              Try expanding your search radius or contact emergency services
            </Text>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={() => Linking.openURL('tel:911')}
            >
              <Text style={styles.emergencyButtonText}>🚨 Call 911</Text>
            </TouchableOpacity>
          </View>
        ) : (
          doctors.map((doctor: Doctor, index: number) => (
            <View key={doctor.doctor_id} style={styles.doctorCard}>
              <View style={styles.doctorHeader}>
                <View style={styles.doctorAvatar}>
                  <Text style={styles.doctorAvatarText}>
                    {doctor.full_name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{doctor.full_name}</Text>
                  <Text style={styles.doctorSpecialty}>
                    {doctor.specialty}
                    {doctor.sub_specialty && ` • ${doctor.sub_specialty}`}
                  </Text>
                  <Text style={styles.doctorClinic}>{doctor.clinic_name}</Text>
                  <Text style={styles.doctorAddress}>{doctor.address}</Text>
                  <View style={styles.doctorMeta}>
                    <Text style={styles.doctorDistance}>
                      📍 {doctor.distance_km} km away
                    </Text>
                    {doctor.is_24_hours && (
                      <Text style={styles.available24}>⏰ 24/7</Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.doctorActions}>
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={() => handleEmergencyRequest(doctor)}
                  disabled={requesting === doctor.doctor_id}
                >
                  <Text style={styles.alertButtonText}>
                    {requesting === doctor.doctor_id ? 'Sending...' : '🚨 Request Emergency'}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCall(doctor.phone)}
                  >
                    <Text style={styles.callButtonText}>📞 Call</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.directionsButton}
                    onPress={() => handleDirections(doctor.latitude, doctor.longitude)}
                  >
                    <Text style={styles.directionsButtonText}>🗺️ Directions</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    backgroundColor: colors.emergency,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerInfo: {
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emergencyButton: {
    backgroundColor: colors.emergency,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doctorCard: {
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  doctorAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  doctorClinic: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  doctorAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  doctorMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  doctorDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  available24: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  doctorActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  alertButton: {
    backgroundColor: colors.emergency,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  directionsButton: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  directionsButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});
