/**
 * DoctorResultsScreen - NO-SCROLL Map-First Design
 * 
 * Smart Design Features:
 * - Full-screen map with doctor markers
 * - Swipeable doctor card at bottom (navigate with arrows)
 * - Tap marker to select doctor
 * - Quick actions: Call, Directions, Book/Alert
 * - NO SCROLLING - Everything accessible via map + card navigation
 */

import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Linking, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  
  const { doctors, symptom, userLocation } = route.params || {};
  
  const [requesting, setRequesting] = useState<number | null>(null);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Calculate initial map region based on doctor locations
  const getInitialRegion = (): Region => {
    if (!doctors || doctors.length === 0) {
      return {
        latitude: userLocation?.latitude || 0,
        longitude: userLocation?.longitude || 0,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Calculate bounds for all doctors
    const lats = doctors.map((d: Doctor) => d.latitude);
    const lngs = doctors.map((d: Doctor) => d.longitude);

    const minLat = Math.min(...lats, userLocation?.latitude || lats[0]);
    const maxLat = Math.max(...lats, userLocation?.latitude || lats[0]);
    const minLng = Math.min(...lngs, userLocation?.longitude || lngs[0]);
    const maxLng = Math.max(...lngs, userLocation?.longitude || lngs[0]);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.5; // Add 50% padding
    const deltaLng = (maxLng - minLng) * 1.5;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(deltaLat, 0.05), // Minimum zoom level
      longitudeDelta: Math.max(deltaLng, 0.05),
    };
  };
  
  // Detect if this is emergency context (from EmergencyScreen) or regular booking (from FindDoctorScreen)
  // Emergency mode: has symptom (from EmergencyScreen)
  // Booking mode: no symptom or empty symptom (from FindDoctorScreen)
  const isEmergency = symptom && symptom.trim().length > 0;
  const isBooking = !isEmergency;

  const handleEmergencyRequest = async (doctor: Doctor) => {
    try {
      setRequesting(doctor.doctor_id);
      
      const authToken = await SecureStore.getItemAsync('auth_token');
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';
      
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

  // Navigate between doctors
  const navigateDoctor = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? Math.min(currentDoctorIndex + 1, doctors.length - 1)
      : Math.max(currentDoctorIndex - 1, 0);
    
    Animated.spring(slideAnim, {
      toValue: direction === 'next' ? -30 : 30,
      useNativeDriver: true,
      speed: 20,
    }).start(() => {
      setCurrentDoctorIndex(newIndex);
      slideAnim.setValue(direction === 'next' ? 30 : -30);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
      }).start();
      
      // Center map on selected doctor
      if (mapRef.current && doctors[newIndex]) {
        mapRef.current.animateToRegion({
          latitude: doctors[newIndex].latitude,
          longitude: doctors[newIndex].longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 300);
      }
    });
  };

  // Select doctor from map marker
  const selectDoctorFromMarker = (index: number) => {
    setCurrentDoctorIndex(index);
  };

  const currentDoctor = doctors?.[currentDoctorIndex];

  // Empty state
  if (!doctors || doctors.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>No Doctors Found</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>😔</Text>
          <Text style={styles.emptyText}>No doctors available nearby</Text>
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={() => Linking.openURL('tel:911')}
          >
            <Text style={styles.emergencyButtonText}>🚨 Call 911</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Compact Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {isEmergency ? '🚨 Emergency' : '🏥 Doctors'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {doctors.length} found • {currentDoctorIndex + 1}/{doctors.length}
          </Text>
        </View>
      </View>

      {/* Full-Screen Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={getInitialRegion()}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="You"
              pinColor="blue"
            />
          )}

          {/* Doctor markers */}
          {doctors.map((doctor: Doctor, index: number) => (
            <Marker
              key={`marker-${doctor.doctor_id}-${index}`}
              coordinate={{
                latitude: doctor.latitude,
                longitude: doctor.longitude,
              }}
              title={doctor.full_name}
              pinColor={index === currentDoctorIndex ? (isEmergency ? 'red' : 'green') : 'orange'}
              onPress={() => selectDoctorFromMarker(index)}
            />
          ))}
        </MapView>
      </View>

      {/* Bottom Doctor Card - Swipeable */}
      <View style={styles.bottomCard}>
        {/* Navigation Arrows */}
        <TouchableOpacity 
          style={[styles.cardNavArrow, styles.cardNavLeft, currentDoctorIndex === 0 && styles.cardNavDisabled]}
          onPress={() => navigateDoctor('prev')}
          disabled={currentDoctorIndex === 0}
        >
          <Text style={styles.cardNavText}>◀</Text>
        </TouchableOpacity>

        <Animated.View 
          style={[styles.doctorCardContent, { transform: [{ translateX: slideAnim }] }]}
        >
          {/* Doctor Info */}
          <View style={styles.doctorRow}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>{currentDoctor.full_name.charAt(0)}</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName} numberOfLines={1}>{currentDoctor.full_name}</Text>
              <Text style={styles.doctorSpecialty} numberOfLines={1}>
                {currentDoctor.specialty}
                {currentDoctor.sub_specialty && ` • ${currentDoctor.sub_specialty}`}
              </Text>
              <Text style={styles.doctorMeta}>
                📍 {currentDoctor.distance_km}km
                {currentDoctor.is_24_hours && ' • ⏰ 24/7'}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            {isEmergency ? (
              <>
                <TouchableOpacity
                  style={styles.alertButton}
                  onPress={() => handleEmergencyRequest(currentDoctor)}
                  disabled={requesting === currentDoctor.doctor_id}
                >
                  <Text style={styles.alertButtonText}>
                    {requesting === currentDoctor.doctor_id ? '...' : '🚨 Alert'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(currentDoctor.phone)}
                >
                  <Text style={styles.callButtonText}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => handleDirections(currentDoctor.latitude, currentDoctor.longitude)}
                >
                  <Text style={styles.directionsButtonText}>🗺️</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookAppointment(currentDoctor)}
                >
                  <Text style={styles.bookButtonText}>📅 Book</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(currentDoctor.phone)}
                >
                  <Text style={styles.callButtonText}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => handleDirections(currentDoctor.latitude, currentDoctor.longitude)}
                >
                  <Text style={styles.directionsButtonText}>🗺️</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>

        <TouchableOpacity 
          style={[styles.cardNavArrow, styles.cardNavRight, currentDoctorIndex === doctors.length - 1 && styles.cardNavDisabled]}
          onPress={() => navigateDoctor('next')}
          disabled={currentDoctorIndex === doctors.length - 1}
        >
          <Text style={styles.cardNavText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Pagination Dots */}
      {doctors.length <= 10 && (
        <View style={styles.paginationDots}>
          {doctors.map((_: Doctor, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={[styles.dot, idx === currentDoctorIndex && styles.dotActive]}
              onPress={() => {
                setCurrentDoctorIndex(idx);
                if (mapRef.current && doctors[idx]) {
                  mapRef.current.animateToRegion({
                    latitude: doctors[idx].latitude,
                    longitude: doctors[idx].longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }, 300);
                }
              }}
            />
          ))}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emergency,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardNavArrow: {
    width: 32,
    height: 50,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardNavLeft: {
    marginRight: spacing.xs,
  },
  cardNavRight: {
    marginLeft: spacing.xs,
  },
  cardNavDisabled: {
    opacity: 0.3,
  },
  cardNavText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '700',
  },
  doctorCardContent: {
    flex: 1,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  doctorAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  doctorMeta: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  alertButton: {
    flex: 2,
    backgroundColor: colors.emergency,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bookButton: {
    flex: 2,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    fontSize: 16,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
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
});
