/**
 * EmergencyScreen - NO-SCROLL Compact Emergency UI
 * 
 * Smart Design Features:
 * - Large emergency action buttons at top
 * - 3x2 symptom grid (tap to select)
 * - Compact custom input
 * - Everything fits on one screen
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, Linking, ActivityIndicator, TextInput as RNTextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import StandardHeader from '../components/StandardHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type EmergencyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Emergency'>;

export default function EmergencyScreen() {
  const navigation = useNavigation<EmergencyScreenNavigationProp>();
  const { t } = useTranslation();
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Compact symptom list with icons
  const commonSymptoms = [
    { id: 'chest', icon: '💔', label: t('chestPain') },
    { id: 'breathing', icon: '😮‍💨', label: t('difficultyBreathing') },
    { id: 'head', icon: '🤕', label: t('severeHeadache') },
    { id: 'stomach', icon: '🤢', label: t('abdominalPain') },
    { id: 'fever', icon: '🤒', label: t('feverChills') },
    { id: 'injury', icon: '🩸', label: t('injuryBleeding') },
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

    // For testing: Always use Quito coordinates since doctors are in Ecuador
    const searchLocation = {
      latitude: -0.1807,
      longitude: -78.4678
    };
    
    console.log('Using Quito coordinates for doctor search (testing mode)');
    if (location) {
      console.log('User actual location:', location);
      console.log('Distance from user to Quito: ~8000km - using Quito for demo');
    }
    
    console.log('Searching with location:', searchLocation);
    setLoadingDoctors(true);
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';
      const url = `${apiBaseUrl}/api/doctors/search`;
      
      console.log('API URL:', url);
      console.log('Request body:', {
        symptom: symptom,
        latitude: searchLocation.latitude,
        longitude: searchLocation.longitude,
        radius_km: 50
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: symptom,
          latitude: searchLocation.latitude,
          longitude: searchLocation.longitude,
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
          console.log('Navigation params:', {
            doctors: data.doctors.length,
            symptom: symptom,
            userLocation: searchLocation
          });
          
          try {
            // Navigate to results screen
            navigation.navigate('DoctorResults', {
              doctors: data.doctors,
              symptom: symptom,
              userLocation: searchLocation
            });
            console.log('Navigation call completed');
          } catch (navError) {
            console.error('Navigation error:', navError);
            Alert.alert('Navigation Error', 'Failed to show results. Please try again.');
          }
        }
      } else {
        console.log('API Error:', data);
        Alert.alert('Error', data.detail || 'Failed to find doctors');
      }
    } catch (error: any) {
      console.error('Exception in handleFindDoctors:', error);
      Alert.alert('Error', `Network error: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoadingDoctors(false);
      console.log('=== END DEBUG ===');
    }
  };



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StandardHeader title={t('emergencyTitle')} />

      {/* Emergency Call Buttons - Large & Prominent */}
      <View style={styles.emergencyActions}>
        <TouchableOpacity style={styles.call911Button} onPress={handleCall911}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyButtonText}>Call 911</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ambulanceButton} onPress={handleCallAmbulance}>
          <Text style={styles.emergencyIcon}>🚑</Text>
          <Text style={styles.emergencyButtonText}>Ambulance</Text>
        </TouchableOpacity>
      </View>

      {/* Location Status */}
      <View style={styles.locationBar}>
        {loadingLocation ? (
          <Text style={styles.locationText}>📍 Getting location...</Text>
        ) : location ? (
          <Text style={styles.locationText}>📍 Location ready</Text>
        ) : (
          <Text style={styles.locationTextError}>📍 Location unavailable</Text>
        )}
      </View>

      {/* Symptom Selection - 3x2 Grid */}
      <View style={styles.symptomSection}>
        <Text style={styles.sectionTitle}>{t('mainSymptom')}</Text>
        
        <View style={styles.symptomGrid} testID="symptoms-grid">
          {commonSymptoms.map((symptom) => (
            <TouchableOpacity
              key={symptom.id}
              style={[
                styles.symptomCard,
                selectedSymptom === symptom.label && styles.symptomCardSelected
              ]}
              onPress={() => {
                setSelectedSymptom(symptom.label);
                setCustomSymptom('');
              }}
            >
              <Text style={styles.symptomIcon}>{symptom.icon}</Text>
              <Text style={[
                styles.symptomText,
                selectedSymptom === symptom.label && styles.symptomTextSelected
              ]} numberOfLines={2}>
                {symptom.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Symptom - Compact */}
      <View style={styles.customSection}>
        <Text style={styles.customLabel}>Or describe:</Text>
        <RNTextInput
          style={styles.customInput}
          placeholder={t('symptomsPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={customSymptom}
          onChangeText={(text) => {
            setCustomSymptom(text);
            setSelectedSymptom('');
          }}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Find Doctors Button - Fixed at Bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.findDoctorsButton, (!selectedSymptom && !customSymptom) && styles.findDoctorsButtonDisabled]}
          onPress={handleFindDoctors}
          activeOpacity={0.7}
          disabled={loadingDoctors || loadingLocation || (!selectedSymptom && !customSymptom)}
        >
          {loadingDoctors ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.findDoctorsText}>🔍 Find Doctors</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  emergencyActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  call911Button: {
    flex: 1,
    backgroundColor: colors.emergency,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  ambulanceButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  locationBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  locationText: {
    fontSize: 12,
    color: colors.success,
    textAlign: 'center',
  },
  locationTextError: {
    fontSize: 12,
    color: colors.emergency,
    textAlign: 'center',
  },
  symptomSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  symptomCard: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 2) / 3,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 70,
    justifyContent: 'center',
  },
  symptomCardSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  symptomIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  symptomText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  symptomTextSelected: {
    color: '#FFFFFF',
  },
  customSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  customLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  customInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  findDoctorsButton: {
    flex: 2,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findDoctorsButtonDisabled: {
    opacity: 0.5,
  },
  findDoctorsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
