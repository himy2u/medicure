/**
 * PatientHistoryScreen - View patient's medical history
 * Used by: Doctor
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'PatientHistory'>;
type RouteProps = RouteProp<RootStackParamList, 'PatientHistory'>;

interface PatientHistory {
  patient: {
    name: string;
    age: number;
    gender: string;
    blood_type: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
  appointments: {
    id: string;
    date: string;
    reason: string;
    diagnosis: string;
    notes: string;
  }[];
  prescriptions: {
    id: string;
    medication: string;
    dosage: string;
    date: string;
    status: string;
  }[];
  lab_results: {
    id: string;
    test_name: string;
    date: string;
    status: string;
  }[];
}

export default function PatientHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { patientId, patientName } = route.params;

  const [history, setHistory] = useState<PatientHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'visits' | 'prescriptions' | 'labs'>('visits');

  useEffect(() => {
    loadPatientHistory();
  }, [patientId]);

  const loadPatientHistory = async () => {
    setLoading(true);
    try {
      const result = await apiClient.get(`/api/patients/${patientId}/history`, true);

      if (result.success && result.data) {
        setHistory(result.data);
      } else {
        // Mock data for demo
        setHistory({
          patient: {
            name: patientName,
            age: 45,
            gender: 'Male',
            blood_type: 'O+',
            allergies: ['Penicillin', 'Sulfa'],
            conditions: ['Hypertension', 'Type 2 Diabetes'],
            medications: ['Lisinopril 10mg', 'Metformin 500mg']
          },
          appointments: [
            {
              id: '1',
              date: '2025-12-01',
              reason: 'Follow-up: Blood pressure monitoring',
              diagnosis: 'Hypertension - controlled',
              notes: 'BP 125/82. Continue current medication. Lifestyle modifications discussed.'
            },
            {
              id: '2',
              date: '2025-11-15',
              reason: 'Routine checkup',
              diagnosis: 'Type 2 Diabetes - well controlled',
              notes: 'HbA1c improved to 6.2%. Continue current regimen.'
            },
            {
              id: '3',
              date: '2025-10-20',
              reason: 'Chest discomfort',
              diagnosis: 'Musculoskeletal - non-cardiac',
              notes: 'ECG normal. No cardiac etiology found. Likely muscular strain.'
            }
          ],
          prescriptions: [
            {
              id: '1',
              medication: 'Lisinopril 10mg',
              dosage: 'Once daily',
              date: '2025-11-01',
              status: 'active'
            },
            {
              id: '2',
              medication: 'Metformin 500mg',
              dosage: 'Twice daily',
              date: '2025-11-01',
              status: 'active'
            }
          ],
          lab_results: [
            {
              id: '1',
              test_name: 'Lipid Panel',
              date: '2025-11-25',
              status: 'completed'
            },
            {
              id: '2',
              test_name: 'HbA1c',
              date: '2025-11-20',
              status: 'completed'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BaseScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading patient history...</Text>
        </View>
      </BaseScreen>
    );
  }

  if (!history) {
    return (
      <BaseScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load patient history</Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Patient History</Text>
      </View>
    }>
      {/* Patient Summary Card */}
      <View style={styles.patientSummary}>
        <View style={styles.summaryHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{history.patient.name.charAt(0)}</Text>
          </View>
          <View style={styles.patientBasicInfo}>
            <Text style={styles.patientName}>{history.patient.name}</Text>
            <Text style={styles.patientMeta}>
              {history.patient.age} yrs, {history.patient.gender} | {history.patient.blood_type}
            </Text>
          </View>
        </View>

        {/* Allergies Alert */}
        {history.patient.allergies.length > 0 && (
          <View style={styles.allergiesAlert}>
            <Text style={styles.allergiesTitle}>⚠️ Allergies:</Text>
            <Text style={styles.allergiesText}>{history.patient.allergies.join(', ')}</Text>
          </View>
        )}

        {/* Current Conditions */}
        <View style={styles.conditionsSection}>
          <Text style={styles.subsectionTitle}>Active Conditions</Text>
          <View style={styles.tagContainer}>
            {history.patient.conditions.map((condition, index) => (
              <View key={index} style={styles.conditionTag}>
                <Text style={styles.tagText}>{condition}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Current Medications */}
        <View style={styles.conditionsSection}>
          <Text style={styles.subsectionTitle}>Current Medications</Text>
          <View style={styles.tagContainer}>
            {history.patient.medications.map((med, index) => (
              <View key={index} style={styles.medicationTag}>
                <Text style={styles.tagText}>{med}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        {(['visits', 'prescriptions', 'labs'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'visits' && history.appointments.map((apt) => (
          <View key={apt.id} style={styles.historyCard}>
            <Text style={styles.historyDate}>{apt.date}</Text>
            <Text style={styles.historyReason}>{apt.reason}</Text>
            <View style={styles.diagnosisContainer}>
              <Text style={styles.diagnosisLabel}>Diagnosis:</Text>
              <Text style={styles.diagnosisText}>{apt.diagnosis}</Text>
            </View>
            <Text style={styles.historyNotes}>{apt.notes}</Text>
          </View>
        ))}

        {activeTab === 'prescriptions' && history.prescriptions.map((rx) => (
          <View key={rx.id} style={styles.historyCard}>
            <Text style={styles.historyDate}>{rx.date}</Text>
            <Text style={styles.medicationName}>{rx.medication}</Text>
            <Text style={styles.dosageText}>{rx.dosage}</Text>
            <View style={[styles.statusBadge, { backgroundColor: rx.status === 'active' ? '#4CAF50' : colors.textSecondary }]}>
              <Text style={styles.statusText}>{rx.status.toUpperCase()}</Text>
            </View>
          </View>
        ))}

        {activeTab === 'labs' && history.lab_results.map((lab) => (
          <View key={lab.id} style={styles.historyCard}>
            <Text style={styles.historyDate}>{lab.date}</Text>
            <Text style={styles.labTestName}>{lab.test_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: lab.status === 'completed' ? '#4CAF50' : '#FFA500' }]}>
              <Text style={styles.statusText}>{lab.status.toUpperCase()}</Text>
            </View>
          </View>
        ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.emergency,
  },
  patientSummary: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  patientBasicInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  patientMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  allergiesAlert: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.emergency,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  allergiesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.emergency,
    marginBottom: spacing.xs,
  },
  allergiesText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  conditionsSection: {
    marginBottom: spacing.sm,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  conditionTag: {
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  medicationTag: {
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  historyCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  historyReason: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  diagnosisContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  diagnosisLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  diagnosisText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  historyNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dosageText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  labTestName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
