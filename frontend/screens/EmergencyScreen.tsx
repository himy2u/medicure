import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import BaseScreen from '../components/BaseScreen';
import StandardHeader from '../components/StandardHeader';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as Location from 'expo-location';
import Constants from 'expo-constants';

type EmergencyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Emergency'>;



export default function EmergencyScreen() {
  const navigation = useNavigation<EmergencyScreenNavigationProp>();
  const { t } = useTranslation();
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

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
    <BaseScreen
      pattern="headerContentFooter"
      scrollable={true}
      header={<StandardHeader title={t('emergencyTitle')} />}
      footer={
        <TouchableOpacity
          style={styles.findDoctorsButton}
          onPress={handleFindDoctors}
          activeOpacity={0.7}
          disabled={loadingDoctors || loadingLocation}
        >
          {loadingDoctors ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.findDoctorsText}>🔍 Find Doctors Now</Text>
          )}
        </TouchableOpacity>
      }
    >
      {/* Emergency Call Buttons - Compact */}
      <View style={styles.emergencyActions}>
        <TouchableOpacity style={styles.call911Button} onPress={handleCall911}>
          <Text style={styles.emergencyButtonText}>🚨 911</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ambulanceButton} onPress={handleCallAmbulance}>
          <Text style={styles.emergencyButtonText}>🚑 Ambulance</Text>
        </TouchableOpacity>
      </View>

      {/* Symptom Selection */}
      <View style={styles.symptomSection}>
        <Text style={styles.sectionTitle}>{t('mainSymptom')}</Text>
        
        {/* Common Symptoms - 2x3 Grid */}
        <View style={styles.symptomGrid} testID="symptoms-grid">
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

        {/* Custom Symptom Input - Compact */}
        <View style={styles.customSymptomCard}>
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
            numberOfLines={2}
            style={styles.customInput}
          />
        </View>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  emergencyActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  call911Button: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ambulanceButton: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emergencyButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  symptomSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  symptomCard: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 50,
    justifyContent: 'center',
  },
  symptomCardSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  symptomText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  symptomTextSelected: {
    color: '#FFFFFF',
  },
  customSymptomCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  customSymptomTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  customInput: {
    backgroundColor: colors.backgroundPrimary,
  },
  findDoctorsButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findDoctorsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
