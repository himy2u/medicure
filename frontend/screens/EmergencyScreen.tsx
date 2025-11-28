import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

type EmergencyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Emergency'>;

interface EmergencyDoctor {
  id: number;
  full_name: string;
  specialty: string;
  sub_specialty: string;
  phone: string;
  clinic_name: string;
  address: string;
  city: string;
  distance_km: number;
  distance_mi: number;
  is_24_hours: boolean;
}

export default function EmergencyScreen() {
  const navigation = useNavigation<EmergencyScreenNavigationProp>();
  const { t } = useTranslation();
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [emergencyDoctors, setEmergencyDoctors] = useState<EmergencyDoctor[]>([]);
  const [showDoctorsList, setShowDoctorsList] = useState(false);

  const commonSymptoms = [
    t('chestPain'),
    t('difficultyBreathing'),
    t('severeHeadache'),
    t('abdominalPain'),
    t('feverChills'),
    t('injuryBleeding')
  ];

  const handleCall911 = () => {
    Alert.alert(
      t('call911') + '?',
      'This will connect you to emergency services immediately.',
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('call911') + ' Now',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:911');
          },
        },
      ]
    );
  };

  const handleCallAmbulance = () => {
    Alert.alert(
      t('ambulance') + '?',
      'This will dispatch an ambulance to your location.',
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: 'Dispatch Now',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement ambulance dispatch
            Alert.alert('Ambulance Dispatched', 'An ambulance is on the way to your location.');
          },
        },
      ]
    );
  };

  // Get user location on mount
  useEffect(() => {
    (async () => {
      setLoadingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required for emergency services');
          setLoadingLocation(false);
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude
        });
        console.log('User location:', userLocation.coords);
      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert('Location Error', 'Unable to get your location. Please enable location services.');
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  const handleFindDoctors = async () => {
    const symptom = selectedSymptom || customSymptom;
    console.log('=== FIND DOCTORS DEBUG ===');
    console.log('Symptom:', symptom);
    console.log('Location:', location);

    if (!symptom) {
      console.log('ERROR: No symptom selected');
      Alert.alert(t('symptomRequired'), t('selectSymptomFirst'));
      return;
    }

    if (!location) {
      console.log('ERROR: No location available');
      Alert.alert('Location Required', 'Getting your location...');
      return;
    }

    setLoadingDoctors(true);
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.6:8000';
      const url = `${apiBaseUrl}/api/doctors/search`;
      
      console.log('API URL:', url);
      console.log('Request body:', {
        symptom: symptom,
        latitude: location.latitude,
        longitude: location.longitude,
        radius_km: 50
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: symptom,
          latitude: location.latitude,
          longitude: location.longitude,
          radius_km: 50
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        console.log('Success! Doctor count:', data.count);
        if (data.count === 0) {
          console.log('No doctors found');
          Alert.alert(
            'No Doctors Available',
            'No doctors are available nearby for emergency. Please call 911 or go to the nearest hospital.',
            [
              { text: 'Call 911', onPress: () => Linking.openURL('tel:911') },
              { text: 'OK' }
            ]
          );
        } else {
          console.log('Navigating to results with', data.count, 'doctors');
          // Navigate to results screen
          navigation.navigate('DoctorResults' as any, {
            doctors: data.doctors,
            symptom: symptom,
            userLocation: location
          });
        }
      } else {
        console.log('API Error:', data);
        Alert.alert('Error', data.detail || 'Failed to find doctors');
      }
    } catch (error) {
      console.error('Exception in handleFindDoctors:', error);
      Alert.alert('Error', `Network error: ${error.message}`);
    } finally {
      setLoadingDoctors(false);
      console.log('=== END DEBUG ===');
    }
  };

  const handleAlertDoctor = (doctor: EmergencyDoctor) => {
    Alert.alert(
      'Alert Doctor',
      `Send emergency alert to ${doctor.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Alert Now',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement Uber-style dispatch
            Alert.alert('Alert Sent', `${doctor.full_name} has been alerted and will respond shortly.`);
          }
        }
      ]
    );
  };

  const handleCallDoctor = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  // If showing doctors list, render that view
  if (showDoctorsList) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowDoctorsList(false)} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Emergency Doctors</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.doctorsListContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>
            {emergencyDoctors.length} Doctors Available Near You
          </Text>
          <Text style={styles.subtitle}>Sorted by distance - Nearest first</Text>

          {emergencyDoctors.map((doctor) => (
            <Card key={doctor.id} style={styles.doctorCard}>
              <Card.Content>
                <View style={styles.doctorHeader}>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doctor.full_name}</Text>
                    <Text style={styles.doctorSpecialty}>
                      {doctor.specialty} {doctor.sub_specialty && `· ${doctor.sub_specialty}`}
                    </Text>
                    <Text style={styles.doctorClinic}>📍 {doctor.clinic_name}</Text>
                    <Text style={styles.doctorAddress}>{doctor.address}, {doctor.city}</Text>
                    <Text style={styles.doctorDistance}>
                      🚗 {doctor.distance_mi} mi ({doctor.distance_km} km) away
                      {doctor.is_24_hours && ' · 24/7'}
                    </Text>
                  </View>
                </View>

                <View style={styles.doctorActions}>
                  <TouchableOpacity
                    style={styles.alertButton}
                    onPress={() => handleAlertDoctor(doctor)}
                  >
                    <Text style={styles.alertButtonText}>🚨 Alert Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallDoctor(doctor.phone)}
                  >
                    <Text style={styles.callButtonText}>📞 Call</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('emergencyTitle')}</Text>
        {loadingLocation && <ActivityIndicator size="small" color={colors.accent} />}
      </View>

      {/* Emergency Call Buttons */}
      <View style={styles.emergencyActions}>
        <TouchableOpacity style={styles.call911Button} onPress={handleCall911}>
          <Text style={styles.call911Text}>🚨 {t('call911')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ambulanceButton} onPress={handleCallAmbulance}>
          <Text style={styles.ambulanceText}>🚑 {t('ambulance')}</Text>
        </TouchableOpacity>
      </View>

      {/* Symptom Selection */}
      <ScrollView style={styles.symptomSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('mainSymptom')}</Text>
        
        {/* Common Symptoms - 2x3 Grid */}
        <View style={styles.symptomGrid}>
          {commonSymptoms.map((symptom) => (
            <TouchableOpacity
              key={symptom}
              style={[
                styles.symptomCard,
                selectedSymptom === symptom && styles.symptomCardSelected
              ]}
              onPress={() => {
                setSelectedSymptom(symptom);
                setCustomSymptom('');
              }}
            >
              <Text style={[
                styles.symptomText,
                selectedSymptom === symptom && styles.symptomTextSelected
              ]}>
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Symptom Input */}
        <Card style={styles.customSymptomCard}>
          <Card.Content>
            <Text style={styles.customSymptomTitle}>{t('describeSymptoms')}</Text>
            <TextInput
              label={t('symptomsPlaceholder')}
              value={customSymptom}
              onChangeText={(text) => {
                setCustomSymptom(text);
                setSelectedSymptom('');
              }}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.customInput}
            />
          </Card.Content>
        </Card>

        {/* Add padding at bottom to ensure button doesn't cover content */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.backButtonBottom}
          onPress={() => {
            console.log('Back button pressed');
            navigation.goBack();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.findDoctorsButtonBottom}
          onPress={() => {
            console.log('Find Doctors button pressed');
            handleFindDoctors();
          }}
          activeOpacity={0.7}
          disabled={loadingDoctors || loadingLocation}
        >
          {loadingDoctors ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.findDoctorsText}>🔍 Find Doctors Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  placeholder: {
    width: 60, // Same width as back button for centering
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emergencyActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  call911Button: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  call911Text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  ambulanceButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  ambulanceText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  symptomSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  symptomCard: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symptomCardSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  symptomText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  symptomTextSelected: {
    color: '#FFFFFF',
  },
  customSymptomCard: {
    marginBottom: spacing.lg,
  },
  customSymptomTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  customInput: {
    backgroundColor: colors.backgroundSecondary,
  },
  bottomPadding: {
    height: 100, // Ensure space for the fixed button
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  backButtonBottom: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  findDoctorsButtonBottom: {
    flex: 2,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findDoctorsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  doctorsListContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  doctorCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 3,
    backgroundColor: colors.backgroundSecondary,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
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
  doctorDistance: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
    marginTop: spacing.xs,
  },
  doctorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  alertButton: {
    flex: 2,
    backgroundColor: colors.emergency,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
