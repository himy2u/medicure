/**
 * ResultsEntryScreen - Enter lab test results
 * Used by: Lab Staff
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList, 'ResultsEntry'>;
type RouteProps = RouteProp<RootStackParamList, 'ResultsEntry'>;

interface TestResult {
  name: string;
  value: string;
  unit: string;
  reference_range: string;
  is_abnormal: boolean;
}

export default function ResultsEntryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { orderId } = route.params;

  const [results, setResults] = useState<TestResult[]>([
    { name: 'Hemoglobin', value: '', unit: 'g/dL', reference_range: '12.0-17.5', is_abnormal: false },
    { name: 'White Blood Cells', value: '', unit: 'K/uL', reference_range: '4.5-11.0', is_abnormal: false },
    { name: 'Platelets', value: '', unit: 'K/uL', reference_range: '150-400', is_abnormal: false },
    { name: 'Glucose', value: '', unit: 'mg/dL', reference_range: '70-100', is_abnormal: false },
    { name: 'Total Cholesterol', value: '', unit: 'mg/dL', reference_range: '<200', is_abnormal: false },
    { name: 'LDL Cholesterol', value: '', unit: 'mg/dL', reference_range: '<100', is_abnormal: false },
  ]);

  const [technicianNotes, setTechnicianNotes] = useState('');

  const updateResult = (index: number, value: string) => {
    const newResults = [...results];
    newResults[index].value = value;

    // Check if value is abnormal based on reference range
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const range = newResults[index].reference_range;
      if (range.startsWith('<')) {
        const max = parseFloat(range.substring(1));
        newResults[index].is_abnormal = numValue >= max;
      } else if (range.includes('-')) {
        const [min, max] = range.split('-').map(parseFloat);
        newResults[index].is_abnormal = numValue < min || numValue > max;
      }
    }

    setResults(newResults);
  };

  const toggleAbnormal = (index: number) => {
    const newResults = [...results];
    newResults[index].is_abnormal = !newResults[index].is_abnormal;
    setResults(newResults);
  };

  const handleSubmit = () => {
    const emptyResults = results.filter(r => !r.value);
    if (emptyResults.length > 0) {
      Alert.alert('Incomplete Results', 'Please enter all test values before submitting.');
      return;
    }

    const abnormalResults = results.filter(r => r.is_abnormal);

    if (abnormalResults.length > 0) {
      Alert.alert(
        'Abnormal Values Detected',
        `${abnormalResults.length} abnormal value(s) found. Submit results?`,
        [
          { text: 'Review', style: 'cancel' },
          {
            text: 'Submit',
            onPress: submitResults
          }
        ]
      );
    } else {
      submitResults();
    }
  };

  const submitResults = () => {
    Alert.alert(
      'Results Submitted',
      'Lab results have been submitted and the doctor and patient will be notified.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('LabStaffHome')
        }
      ]
    );
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Enter Results</Text>
      </View>
    }>
      <View style={styles.orderInfo}>
        <Text style={styles.orderLabel}>Order #{orderId}</Text>
        <Text style={styles.patientName}>Patient: John Doe</Text>
      </View>

      {/* Results Entry */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results</Text>

        {results.map((result, index) => (
          <View key={index} style={[styles.resultRow, result.is_abnormal && styles.abnormalRow]}>
            <View style={styles.resultInfo}>
              <Text style={styles.testName}>{result.name}</Text>
              <Text style={styles.referenceRange}>Ref: {result.reference_range} {result.unit}</Text>
            </View>
            <View style={styles.resultInputContainer}>
              <TextInput
                style={[styles.resultInput, result.is_abnormal && styles.abnormalInput]}
                placeholder="Value"
                placeholderTextColor={colors.textSecondary}
                value={result.value}
                onChangeText={(text) => updateResult(index, text)}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>{result.unit}</Text>
            </View>
            <TouchableOpacity
              style={[styles.abnormalButton, result.is_abnormal && styles.abnormalButtonActive]}
              onPress={() => toggleAbnormal(index)}
            >
              <Text style={[styles.abnormalButtonText, result.is_abnormal && styles.abnormalButtonTextActive]}>
                ⚠️
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Technician Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technician Notes</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any notes or observations..."
          placeholderTextColor={colors.textSecondary}
          value={technicianNotes}
          onChangeText={setTechnicianNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Tests:</Text>
          <Text style={styles.summaryValue}>{results.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Completed:</Text>
          <Text style={styles.summaryValue}>{results.filter(r => r.value).length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.emergency }]}>Abnormal:</Text>
          <Text style={[styles.summaryValue, { color: colors.emergency }]}>
            {results.filter(r => r.is_abnormal).length}
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Results</Text>
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
  orderInfo: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  orderLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  abnormalRow: {
    borderLeftWidth: 4,
    borderLeftColor: colors.emergency,
    backgroundColor: '#FFEBEE',
  },
  resultInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  referenceRange: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  resultInput: {
    width: 70,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  abnormalInput: {
    backgroundColor: '#FFCDD2',
    color: colors.emergency,
  },
  unitText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    width: 40,
  },
  abnormalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  abnormalButtonActive: {
    backgroundColor: colors.emergency,
  },
  abnormalButtonText: {
    fontSize: 14,
    opacity: 0.3,
  },
  abnormalButtonTextActive: {
    opacity: 1,
  },
  notesInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summarySection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
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
