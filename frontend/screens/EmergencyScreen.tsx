import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Button, Card, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type EmergencyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Emergency'>;

export default function EmergencyScreen() {
  const navigation = useNavigation<EmergencyScreenNavigationProp>();
  const { t } = useTranslation();
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');

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

  const handleFindDoctors = () => {
    const symptom = selectedSymptom || customSymptom;
    
    if (!symptom) {
      Alert.alert(t('symptomRequired'), t('selectSymptomFirst'));
      return;
    }
    
    // Navigate to doctor search/results with symptom
    Alert.alert(
      'Finding Doctors',
      `Searching for doctors for: ${symptom}\n\nShowing available doctors from nearest to farthest.`,
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('Navigate to doctor results for:', symptom);
            // TODO: Navigate to doctor results screen
            // navigation.navigate('DoctorResults', { symptom });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('emergencyTitle')}</Text>
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
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.backButtonBottom}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleFindDoctors}
          style={styles.findDoctorsButtonBottom}
          contentStyle={styles.buttonContent}
        >
          🔍 Find Doctors
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
  backButtonText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  placeholder: {
    width: 60, // Same width as back button for centering
  },
  title: {
    fontSize: 24,
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
    fontSize: 20,
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
    fontSize: 16,
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundPrimary,
  },
  findDoctorsButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  findDoctorsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
