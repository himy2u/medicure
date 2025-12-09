/**
 * LabResultsScreen - View lab test results
 * Used by: Patient, Caregiver
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import BaseScreen from '../components/BaseScreen';
import BackButton from '../components/BackButton';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'LabResults'>;

interface LabResult {
  id: string;
  test_name: string;
  test_type: string;
  ordered_by: string;
  order_date: string;
  result_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  results?: {
    name: string;
    value: string;
    unit: string;
    reference_range: string;
    is_abnormal: boolean;
  }[];
  lab_name: string;
}

export default function LabResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  useEffect(() => {
    loadLabResults();
  }, []);

  const loadLabResults = async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const result = await apiClient.get(`/api/lab-results/user/${userId}`, true);

      if (result.success && result.data.results) {
        setLabResults(result.data.results);
      } else {
        // Mock data for demo
        setLabResults([
          {
            id: '1',
            test_name: 'Complete Blood Count (CBC)',
            test_type: 'Blood Test',
            ordered_by: 'Dr. Maria Garcia',
            order_date: '2025-12-01',
            status: 'pending',
            lab_name: 'LabCorp Quito'
          },
          {
            id: '2',
            test_name: 'Lipid Panel',
            test_type: 'Blood Test',
            ordered_by: 'Dr. Maria Garcia',
            order_date: '2025-11-25',
            result_date: '2025-11-27',
            status: 'completed',
            lab_name: 'LabCorp Quito',
            results: [
              { name: 'Total Cholesterol', value: '195', unit: 'mg/dL', reference_range: '<200', is_abnormal: false },
              { name: 'HDL Cholesterol', value: '55', unit: 'mg/dL', reference_range: '>40', is_abnormal: false },
              { name: 'LDL Cholesterol', value: '120', unit: 'mg/dL', reference_range: '<100', is_abnormal: true },
              { name: 'Triglycerides', value: '150', unit: 'mg/dL', reference_range: '<150', is_abnormal: false }
            ]
          },
          {
            id: '3',
            test_name: 'Hemoglobin A1C',
            test_type: 'Blood Test',
            ordered_by: 'Dr. Juan Rodriguez',
            order_date: '2025-11-20',
            result_date: '2025-11-22',
            status: 'completed',
            lab_name: 'MediLab Central',
            results: [
              { name: 'HbA1c', value: '5.8', unit: '%', reference_range: '<5.7', is_abnormal: true }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = labResults.filter(result => {
    if (activeTab === 'pending') {
      return result.status !== 'completed';
    }
    return result.status === 'completed';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in_progress': return colors.accent;
      case 'completed': return '#4CAF50';
      default: return colors.textSecondary;
    }
  };

  const handleDownloadPDF = (result: LabResult) => {
    Alert.alert('Download', 'PDF report would be downloaded here.');
  };

  const renderLabResult = ({ item }: { item: LabResult }) => {
    const isExpanded = expandedResult === item.id;

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => setExpandedResult(isExpanded ? null : item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.testInfo}>
            <Text style={styles.testName}>{item.test_name}</Text>
            <Text style={styles.testType}>{item.test_type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.testDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👨‍⚕️</Text>
            <Text style={styles.detailText}>Ordered by: {item.ordered_by}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>Order date: {item.order_date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏥</Text>
            <Text style={styles.detailText}>{item.lab_name}</Text>
          </View>
          {item.result_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>✅</Text>
              <Text style={styles.detailText}>Results: {item.result_date}</Text>
            </View>
          )}
        </View>

        {/* Expanded Results */}
        {isExpanded && item.results && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsSectionTitle}>Test Results</Text>
            {item.results.map((result, index) => (
              <View key={index} style={[styles.resultRow, result.is_abnormal && styles.abnormalRow]}>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName}>{result.name}</Text>
                  <Text style={styles.referenceRange}>Ref: {result.reference_range}</Text>
                </View>
                <View style={styles.resultValueContainer}>
                  <Text style={[styles.resultValue, result.is_abnormal && styles.abnormalValue]}>
                    {result.value} {result.unit}
                  </Text>
                  {result.is_abnormal && <Text style={styles.abnormalFlag}>⚠️</Text>}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownloadPDF(item)}
            >
              <Text style={styles.downloadButtonText}>📄 Download PDF Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'completed' && !isExpanded && (
          <Text style={styles.expandHint}>Tap to view results</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <BaseScreen pattern="headerWithScroll" header={
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Lab Results</Text>
      </View>
    }>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading lab results...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderLabResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🧪</Text>
              <Text style={styles.emptyText}>
                No {activeTab} lab results
              </Text>
            </View>
          }
        />
      )}
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
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  resultCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  testType: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  expandHint: {
    fontSize: 12,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  resultsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: borderRadius.sm,
  },
  abnormalRow: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.emergency,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  referenceRange: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  resultValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  abnormalValue: {
    color: colors.emergency,
  },
  abnormalFlag: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  downloadButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
});
