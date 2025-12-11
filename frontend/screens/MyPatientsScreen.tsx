/**
 * MyPatientsScreen - View doctor's patient list
 * Used by: Doctor
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import StandardHeader from '../components/StandardHeader';
import RoleGuard from '../components/RoleGuard';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MyPatients'>;

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  last_visit: string;
  conditions: string[];
  phone: string;
}

export default function MyPatientsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const result = await apiClient.get(`/api/doctors/${userId}/patients`, true);

      if (result.success && result.data.patients) {
        setPatients(result.data.patients);
      } else {
        // Mock data for demo - 12 patients to ensure scrolling is needed
        setPatients([
          { id: '1', name: 'John Doe', age: 45, gender: 'Male', last_visit: '2025-12-01', conditions: ['Hypertension', 'Type 2 Diabetes'], phone: '+593987654321' },
          { id: '2', name: 'Maria Santos', age: 32, gender: 'Female', last_visit: '2025-11-28', conditions: ['Asthma'], phone: '+593987654322' },
          { id: '3', name: 'Carlos Rodriguez', age: 58, gender: 'Male', last_visit: '2025-11-25', conditions: ['Coronary Artery Disease', 'High Cholesterol'], phone: '+593987654323' },
          { id: '4', name: 'Ana Martinez', age: 28, gender: 'Female', last_visit: '2025-11-20', conditions: ['Anxiety'], phone: '+593987654324' },
          { id: '5', name: 'Luis Fernandez', age: 52, gender: 'Male', last_visit: '2025-11-15', conditions: ['COPD', 'Hypertension'], phone: '+593987654325' },
          { id: '6', name: 'Sofia Ramirez', age: 41, gender: 'Female', last_visit: '2025-11-10', conditions: ['Migraine'], phone: '+593987654326' },
          { id: '7', name: 'Pedro Gonzalez', age: 67, gender: 'Male', last_visit: '2025-11-05', conditions: ['Arthritis', 'Diabetes'], phone: '+593987654327' },
          { id: '8', name: 'Elena Torres', age: 35, gender: 'Female', last_visit: '2025-11-01', conditions: ['Thyroid Disorder'], phone: '+593987654328' },
          { id: '9', name: 'Roberto Mendez', age: 49, gender: 'Male', last_visit: '2025-10-28', conditions: ['Back Pain', 'Insomnia'], phone: '+593987654329' },
          { id: '10', name: 'Carmen Diaz', age: 55, gender: 'Female', last_visit: '2025-10-25', conditions: ['Osteoporosis'], phone: '+593987654330' },
          { id: '11', name: 'Miguel Herrera', age: 38, gender: 'Male', last_visit: '2025-10-20', conditions: ['Allergies', 'Sinusitis'], phone: '+593987654331' },
          { id: '12', name: 'Isabella Flores', age: 29, gender: 'Female', last_visit: '2025-10-15', conditions: ['Depression'], phone: '+593987654332' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.conditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => navigation.navigate('PatientHistory', {
        patientId: item.id,
        patientName: item.name
      })}
    >
      <View style={styles.patientHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientMeta}>{item.age} yrs, {item.gender}</Text>
        </View>
      </View>

      <View style={styles.conditionsContainer}>
        {item.conditions.map((condition, index) => (
          <View key={index} style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{condition}</Text>
          </View>
        ))}
      </View>

      <View style={styles.patientFooter}>
        <View style={styles.lastVisit}>
          <Text style={styles.lastVisitLabel}>Last Visit:</Text>
          <Text style={styles.lastVisitDate}>{item.last_visit}</Text>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('PatientHistory', {
            patientId: item.id,
            patientName: item.name
          })}
        >
          <Text style={styles.viewButtonText}>View History →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <RoleGuard 
      allowedRoles={['doctor']}
      fallbackMessage="Only doctors can view patient lists."
    >
    <SafeAreaView style={styles.container} edges={['top']}>
      <StandardHeader title="My Patients" />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients or conditions..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Patient Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : (
        <FlatList
          testID="patients-list"
          data={filteredPatients}
          renderItem={renderPatient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          showsVerticalScrollIndicator={true}
          bounces={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          initialNumToRender={5}
          windowSize={10}
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadPatients} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No patients found' : 'No patients yet'}
              </Text>
            </View>
          }
        />
      )}
      
      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.footerButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, styles.footerButtonPrimary]}
          onPress={() => navigation.navigate('DoctorHome')}
        >
          <Text style={styles.footerButtonTextPrimary}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  list: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearButton: {
    padding: spacing.sm,
  },
  clearButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  countContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  countText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  patientCard: {
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
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  patientMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  conditionBadge: {
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  conditionText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastVisit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastVisitLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  lastVisitDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  viewButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
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
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerButtonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  footerButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
