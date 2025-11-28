import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');

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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Detect if this is emergency context (from EmergencyScreen) or regular booking (from FindDoctorScreen)
  // Emergency mode: has symptom (from EmergencyScreen)
  // Booking mode: no symptom or empty symptom (from FindDoctorScreen)
  const isEmergency = symptom && symptom.trim().length > 0;
  const isBooking = !isEmergency;

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

  const handleBookAppointment = (doctor: Doctor) => {
    // TODO: Navigate to appointment booking screen
    Alert.alert(
      'Book Appointment',
      `Book an appointment with ${doctor.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // TODO: Implement booking flow
            Alert.alert('Coming Soon', 'Appointment booking will be available soon!');
          }
        }
      ]
    );
  };

  const handleSaveDoctor = (doctor: Doctor) => {
    // TODO: Save doctor to favorites
    Alert.alert('Saved', `${doctor.full_name} has been saved to your favorites!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {isEmergency ? 'Emergency Doctors' : 'Available Doctors'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
            {symptom && ` for: ${symptom}`}
          </Text>
        </View>
        
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              📋 List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              🗺️ Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'map' ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLocation?.latitude || -0.1807,
            longitude: userLocation?.longitude || -78.4678,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />
          )}
          
          {/* Doctor markers */}
          {doctors.map((doctor: Doctor) => (
            <Marker
              key={doctor.doctor_id}
              coordinate={{
                latitude: doctor.latitude,
                longitude: doctor.longitude,
              }}
              title={doctor.full_name}
              description={`${doctor.specialty} • ${doctor.distance_km} km away`}
              pinColor="red"
            />
          ))}
        </MapView>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
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
                {isEmergency ? (
                  <>
                    {/* Emergency Mode: Alert + Call + Directions */}
                    <TouchableOpacity
                      style={styles.alertButton}
                      onPress={() => handleEmergencyRequest(doctor)}
                      disabled={requesting === doctor.doctor_id}
                    >
                      <Text style={styles.alertButtonText}>
                        {requesting === doctor.doctor_id ? 'Sending...' : '🚨 Alert Doctor'}
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
                  </>
                ) : (
                  <>
                    {/* Booking Mode: Book Appointment + Save + Directions */}
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => handleBookAppointment(doctor)}
                    >
                      <Text style={styles.bookButtonText}>📅 Book Appointment</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.secondaryActions}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleSaveDoctor(doctor)}
                      >
                        <Text style={styles.saveButtonText}>💾 Save</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.directionsButton}
                        onPress={() => handleDirections(doctor.latitude, doctor.longitude)}
                      >
                        <Text style={styles.directionsButtonText}>🗺️ Directions</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          ))
        )}
        </ScrollView>
      )}
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
    paddingBottom: spacing.lg,
  },
  viewToggle: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleTextActive: {
    color: colors.emergency,
  },
  map: {
    flex: 1,
    width: width,
    height: height - 200,
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
  scrollViewContent: {
    paddingBottom: spacing.xl,
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
  bookButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
