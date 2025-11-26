import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native-paper';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

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
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showResults, setShowResults] = useState(false);

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

  const handleSearch = () => {
    // Mock doctor data - sorted by distance
    const mockDoctors: Doctor[] = [
      { id: '1', name: 'Dr. Sarah Johnson', specialty: 'General Practice', distance: 0.5, available: true, rating: 4.8, nextAvailable: '9:00 AM' },
      { id: '2', name: 'Dr. Michael Chen', specialty: 'Internal Medicine', distance: 1.2, available: true, rating: 4.9, nextAvailable: '10:30 AM' },
      { id: '3', name: 'Dr. Emily Rodriguez', specialty: 'Family Medicine', distance: 2.1, available: true, rating: 4.7, nextAvailable: '2:00 PM' },
      { id: '4', name: 'Dr. James Wilson', specialty: 'General Practice', distance: 3.5, available: false, rating: 4.6, nextAvailable: 'Tomorrow' },
      { id: '5', name: 'Dr. Lisa Anderson', specialty: 'Internal Medicine', distance: 4.2, available: true, rating: 4.8, nextAvailable: '4:30 PM' },
    ];

    setDoctors(mockDoctors);
    setShowResults(true);
  };

  return (
    <SafeAreaView style={styles.container}>
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

          {/* Search Button */}
          <Button
            mode="contained"
            onPress={handleSearch}
            style={styles.searchButton}
            contentStyle={styles.searchButtonContent}
            disabled={!symptom.trim()}
          >
            Find Available Doctors
          </Button>

          {/* Results */}
          {showResults && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>
                Available Doctors ({doctors.filter(d => d.available).length})
              </Text>
              <Text style={styles.resultsSubtitle}>Sorted by distance (nearest first)</Text>

              {doctors.map((doctor) => (
                <View key={doctor.id} style={styles.doctorCard}>
                  <View style={styles.doctorHeader}>
                    <View style={styles.doctorAvatar}>
                      <Text style={styles.doctorAvatarText}>{doctor.name.charAt(3)}</Text>
                    </View>
                    <View style={styles.doctorInfo}>
                      <Text style={styles.doctorName}>{doctor.name}</Text>
                      <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                      <View style={styles.doctorMeta}>
                        <Text style={styles.doctorDistance}>📍 {doctor.distance} mi</Text>
                        <Text style={styles.doctorRating}>⭐ {doctor.rating}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.doctorFooter}>
                    {doctor.available ? (
                      <>
                        <Text style={styles.availableText}>
                          Next available: {doctor.nextAvailable}
                        </Text>
                        <TouchableOpacity style={styles.bookButton}>
                          <Text style={styles.bookButtonText}>Book Appointment</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={styles.unavailableText}>
                        Not available today • Next: {doctor.nextAvailable}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
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
    fontSize: 18,
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
    fontSize: 24,
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
  searchButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
  },
  searchButtonContent: {
    paddingVertical: spacing.sm,
  },
  resultsSection: {
    marginTop: spacing.lg,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  doctorCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  doctorMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  doctorDistance: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  doctorRating: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  availableText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    flex: 1,
  },
  unavailableText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  bookButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
