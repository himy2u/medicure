import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import ProfileHeader from '../components/ProfileHeader';

type FindDoctorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FindDoctor'>;

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  distance: number;
  available: boolean;
  rating: number;
  nextAvailable: string;
}

export default function FindDoctorScreen() {
  const navigation = useNavigation<FindDoctorScreenNavigationProp>();
  const [symptom, setSymptom] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('morning');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [searching, setSearching] = useState(false);

  // Check authentication and get location on mount
  useEffect(() => {
    checkAuth();
    getLocation();
  }, []);

  const checkAuth = async () => {
    const authToken = await SecureStore.getItemAsync('auth_token');
    if (!authToken) {
      console.log('Not authenticated, redirecting to Signup');
      navigation.navigate('Signup');
    }
  };

  const getLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find nearby doctors');
        setLoadingLocation(false);
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const timeWindows = [
    { key: 'morning', label: 'Morning (8AM - 12PM)' },
    { key: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
    { key: 'evening', label: 'Evening (5PM - 9PM)' },
  ];

  // Generate next 7 days
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const handleSearch = async () => {
    if (!symptom.trim()) {
      Alert.alert('Symptom Required', 'Please describe your symptoms');
      return;
    }

    // For testing: Always use Quito coordinates since doctors are in Ecuador
    const searchLocation = {
      latitude: -0.1807,
      longitude: -78.4678
    };
    
    if (location) {
      console.log('User actual location:', location);
      console.log('Using Quito coordinates for demo');
    }

    setSearching(true);
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';
      const url = `${apiBaseUrl}/api/doctors/search`;
      
      console.log('FindDoctor: Searching for doctors...');
      console.log('Symptom:', symptom);
      console.log('Date:', selectedDate.toDateString());
      console.log('Time window:', selectedTimeWindow);
      console.log('Location:', searchLocation);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: symptom,
          latitude: searchLocation.latitude,
          longitude: searchLocation.longitude,
          radius_km: 50,
          // TODO: Add date and time filtering on backend
          date: selectedDate.toISOString(),
          time_window: selectedTimeWindow
        })
      });

      const data = await response.json();
      console.log('FindDoctor: API response:', data);

      if (response.ok && data.success) {
        if (data.count === 0) {
          Alert.alert(
            'No Doctors Available',
            'No doctors found matching your criteria. Try adjusting your search.',
            [{ text: 'OK' }]
          );
        } else {
          // Navigate to DoctorResults with booking context (no symptom = booking mode)
          navigation.navigate('DoctorResults', {
            doctors: data.doctors,
            symptom: '', // Empty symptom = booking mode
            userLocation: searchLocation,
            searchCriteria: {
              symptom: symptom,
              date: selectedDate.toISOString(),
              timeWindow: selectedTimeWindow
            }
          });
        }
      } else {
        Alert.alert('Error', data.detail || 'Failed to find doctors');
      }
    } catch (error: any) {
      console.error('FindDoctor: Search error:', error);
      Alert.alert('Error', `Network error: ${error?.message || 'Unknown error'}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ProfileHeader />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Symptom Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What are your symptoms?</Text>
            <TextInput
              mode="outlined"
              placeholder="e.g., headache, fever, cough..."
              value={symptom}
              onChangeText={setSymptom}
              style={styles.input}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {getNextDays().map((date, index) => {
                const formatted = formatDate(date);
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                      {formatted.day}
                    </Text>
                    <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                      {formatted.date}
                    </Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                      {formatted.month}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Window Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferred time</Text>
            {timeWindows.map((window) => (
              <TouchableOpacity
                key={window.key}
                style={[
                  styles.timeWindowCard,
                  selectedTimeWindow === window.key && styles.timeWindowSelected
                ]}
                onPress={() => setSelectedTimeWindow(window.key)}
              >
                <Text style={[
                  styles.timeWindowText,
                  selectedTimeWindow === window.key && styles.timeWindowTextSelected
                ]}>
                  {window.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom padding for button space */}
          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.backButtonBottom}
          onPress={() => {
            console.log('Back button pressed on FindDoctor');
            navigation.goBack();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.searchButtonBottom, (!symptom.trim() || searching || loadingLocation) && styles.buttonDisabled]}
          onPress={handleSearch}
          activeOpacity={(!symptom.trim() || searching || loadingLocation) ? 1 : 0.7}
          disabled={!symptom.trim() || searching || loadingLocation}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.searchButtonText}>🔍 Find Doctors</Text>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
  },
  dateScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  dateCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dateDay: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  timeWindowCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeWindowSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  timeWindowText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  timeWindowTextSelected: {
    color: colors.accent,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.lg,
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
  searchButtonBottom: {
    flex: 2,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
