/**
 * IncidentReportScreen - Complete incident report after transport
 * Used by: Ambulance Staff
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'IncidentReport'>;
type RouteProps = RouteProp<RootStackParamList, 'IncidentReport'>;

export default function IncidentReportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { dispatchId } = route.params;

  const [report, setReport] = useState({
    patientConditionOnArrival: '',
    treatmentProvided: '',
    patientConditionOnDelivery: '',
    handoverNotes: '',
    equipmentUsed: [] as string[],
    additionalNotes: ''
  });

  const equipmentOptions = [
    'Oxygen', 'IV Line', 'Cardiac Monitor', 'Defibrillator',
    'Stretcher', 'Cervical Collar', 'Splint', 'Bandages'
  ];

  const toggleEquipment = (item: string) => {
    if (report.equipmentUsed.includes(item)) {
      setReport({
        ...report,
        equipmentUsed: report.equipmentUsed.filter(e => e !== item)
      });
    } else {
      setReport({
        ...report,
        equipmentUsed: [...report.equipmentUsed, item]
      });
    }
  };

  const handleSubmit = () => {
    if (!report.patientConditionOnArrival || !report.patientConditionOnDelivery) {
      Alert.alert('Required Fields', 'Please fill in patient condition fields.');
      return;
    }

    Alert.alert(
      'Report Submitted',
      'Incident report has been submitted successfully.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('AmbulanceStaffHome')
        }
      ]
    );
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Incident Report</Text>
      </View>
    }>
      <View style={styles.dispatchInfo}>
        <Text style={styles.dispatchId}>Dispatch #{dispatchId}</Text>
        <Text style={styles.timestamp}>
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </Text>
      </View>

      {/* Patient Condition on Arrival */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Condition on Arrival *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe patient's condition when you arrived..."
          placeholderTextColor={colors.textSecondary}
          value={report.patientConditionOnArrival}
          onChangeText={(text) => setReport({...report, patientConditionOnArrival: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Treatment Provided */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Treatment Provided</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe any treatment given during transport..."
          placeholderTextColor={colors.textSecondary}
          value={report.treatmentProvided}
          onChangeText={(text) => setReport({...report, treatmentProvided: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Equipment Used */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment Used</Text>
        <View style={styles.equipmentGrid}>
          {equipmentOptions.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.equipmentChip,
                report.equipmentUsed.includes(item) && styles.equipmentChipSelected
              ]}
              onPress={() => toggleEquipment(item)}
            >
              <Text style={[
                styles.equipmentText,
                report.equipmentUsed.includes(item) && styles.equipmentTextSelected
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Patient Condition on Delivery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Condition on Delivery *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe patient's condition when delivered to hospital..."
          placeholderTextColor={colors.textSecondary}
          value={report.patientConditionOnDelivery}
          onChangeText={(text) => setReport({...report, patientConditionOnDelivery: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Handover Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Handover Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Notes from handover to hospital staff..."
          placeholderTextColor={colors.textSecondary}
          value={report.handoverNotes}
          onChangeText={(text) => setReport({...report, handoverNotes: text})}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Additional Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any other relevant information..."
          placeholderTextColor={colors.textSecondary}
          value={report.additionalNotes}
          onChangeText={(text) => setReport({...report, additionalNotes: text})}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Report</Text>
        </TouchableOpacity>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  dispatchInfo: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dispatchId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  equipmentChip: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  equipmentChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  equipmentText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  equipmentTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
