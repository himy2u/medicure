import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

type BookAppointmentNavigationProp = StackNavigationProp<RootStackParamList, 'BookAppointment'>;
type BookAppointmentRouteProp = RouteProp<RootStackParamList, 'BookAppointment'>;

interface Doctor {
  doctor_id: number;
  full_name: string;
  specialty: string;
  sub_specialty?: string;
  phone: string;
  clinic_name: string;
  address: string;
}

export default function BookAppointmentScreen() {
  const navigation = useNavigation<BookAppointmentNavigationProp>();
  const route = useRoute<BookAppointmentRouteProp>();
  const { doctor } = route.params;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const handleBookAppointment = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Time Required', 'Please select an appointment time');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for your visit');
      return;
    }

    setBooking(true);
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      const userId = await SecureStore.getItemAsync('user_id');
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.91:8000';

      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTimeSlot.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch(`${apiBaseUrl}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          doctor_id: doctor.doctor_id,
          patient_id: userId,
          appointment_date: appointmentDateTime.toISOString(),
          reason: reason,
          notes: notes,
          status: 'pending'
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Appointment Booked!',
          `Your appointment with ${doctor.full_name} has been scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTimeSlot}.`,
          [
            {
              text: 'View Appointments',
              onPress: () => navigation.navigate('PatientDashboard')
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Booking Failed', data.detail || 'Unable to book appointment');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert('Error', `Failed to book appointment: ${error?.message || 'Unknown error'}`);
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Doctor Info Card */}
          <View style={styles.doctorCard}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.doctorAvatarText}>{doctor.full_name.charAt(0)}</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.full_name}</Text>
              <Text style={styles.doctorSpecialty}>
                {doctor.specialty}
                {doctor.sub_specialty && ` • ${doctor.sub_specialty}`}
              </Text>
              <Text style={styles.doctorClinic}>{doctor.clinic_name}</Text>
              <Text style={styles.doctorAddress}>{doctor.address}</Text>
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                📅 {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timeSlots}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlot,
                    selectedTimeSlot === slot && styles.timeSlotSelected
                  ]}
                  onPress={() => setSelectedTimeSlot(slot)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTimeSlot === slot && styles.timeSlotTextSelected
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reason for Visit */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Visit *</Text>
            <TextInput
              label="What brings you in today?"
              value={reason}
              onChangeText={setReason}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="e.g., Annual checkup, Follow-up visit, Specific symptom..."
            />
          </View>

          {/* Additional Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
            <TextInput
              label="Any additional information"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Medications, allergies, specific concerns..."
            />
          </View>

          {/* Book Button */}
          <Button
            mode="contained"
            onPress={handleBookAppointment}
            loading={booking}
            disabled={booking}
            style={styles.bookButton}
            contentStyle={styles.bookButtonContent}
          >
            Confirm Appointment
          </Button>

          <Text style={styles.disclaimer}>
            * You will receive a confirmation once the doctor approves your appointment request
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.accent,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  dateButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 70,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: colors.backgroundPrimary,
  },
  bookButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  bookButtonContent: {
    paddingVertical: spacing.md,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
