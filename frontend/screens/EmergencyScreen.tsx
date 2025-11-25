import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type EmergencyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Emergency'>;

export default function EmergencyScreen() {
  const navigation = useNavigation<EmergencyScreenNavigationProp>();
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');

  const commonSymptoms = [
    'Chest Pain',
    'Difficulty Breathing',
    'Severe Headache',
    'Abdominal Pain',
    'Fever/Chills',
    'Injury/Bleeding'
  ];

  const handleCall911 = () => {
    Alert.alert(
      'Call 911?',
      'This will connect you to emergency services immediately.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call Now',
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
      'Call Ambulance?',
      'This will dispatch an ambulance to your location.',
      [
        {
          text: 'Cancel',
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

  const handleFindDoctors = () => {
    const symptom = selectedSymptom || customSymptom;
    if (!symptom) {
      Alert.alert('Symptom Required', 'Please select or enter your symptom first.');
      return;
    }
    
    // TODO: Navigate to doctor matching based on symptom
    Alert.alert(
      'Finding Doctors',
      `Searching for doctors for: ${symptom}\n\nThis will show available doctors from nearest to farthest.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // TODO: Navigate to doctor results
            console.log('Navigate to doctor results for:', symptom);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency</Text>
        <Text style={styles.subtitle}>Describe your symptoms to get help</Text>
      </View>

      {/* Emergency Call Buttons */}
      <View style={styles.emergencyActions}>
        <TouchableOpacity style={styles.call911Button} onPress={handleCall911}>
          <Text style={styles.call911Text}>🚨 Call 911</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ambulanceButton} onPress={handleCallAmbulance}>
          <Text style={styles.ambulanceText}>🚑 Ambulance</Text>
        </TouchableOpacity>
      </View>

      {/* Symptom Selection */}
      <ScrollView style={styles.symptomSection} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>What's your main symptom?</Text>
        
        {/* Common Symptoms */}
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
            <Text style={styles.customSymptomTitle}>Or describe your symptoms:</Text>
            <TextInput
              label="Type your symptoms or complaints..."
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

        {/* Find Doctors Button */}
        <TouchableOpacity 
          style={styles.findDoctorsButton}
          onPress={handleFindDoctors}
        >
          <Text style={styles.findDoctorsText}>🔍 Find Available Doctors</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Back Button */}
      <View style={styles.backSection}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Back
        </Button>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.emergency,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  emergencyActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  call911Button: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  call911Text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ambulanceButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ambulanceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  symptomSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  symptomCard: {
    backgroundColor: colors.backgroundSecondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '45%',
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
    fontSize: 16,
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
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  findDoctorsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  backSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    borderColor: colors.textSecondary,
  },
});
