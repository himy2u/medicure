/**
 * MyPatientsScreen - Professional Patient Management
 * 
 * Inspired by: Wealthsimple, Solv, One Medical
 * 
 * Features:
 * - Clean list with smart search
 * - Sorted by recent activity
 * - Quick actions inline
 * - Professional, minimal design
 */

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, TextInput, 
  ActivityIndicator, FlatList, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import RoleGuard from '../components/RoleGuard';
import StandardHeader from '../components/StandardHeader';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';
import { useAuthCheck } from '../hooks/useAuthCheck';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MyPatients'>;

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  condition: string;
  phone: string;
  status: 'active' | 'follow-up' | 'new';
}

export default function MyPatientsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useAuthCheck();

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
        // Mock data sorted by recent activity
        setPatients([
          { id: '1', name: 'Ana Martinez', age: 28, gender: 'F', lastVisit: '2025-12-10', condition: 'Anxiety', phone: '+593987654324', status: 'follow-up' },
          { id: '2', name: 'Carlos Rodriguez', age: 58, gender: 'M', lastVisit: '2025-12-08', condition: 'Cardiac', phone: '+593987654323', status: 'active' },
          { id: '3', name: 'Elena Torres', age: 35, gender: 'F', lastVisit: '2025-12-05', condition: 'Thyroid', phone: '+593987654328', status: 'active' },
          { id: '4', name: 'Isabella Flores', age: 29, gender: 'F', lastVisit: '2025-12-01', condition: 'Depression', phone: '+593987654332', status: 'new' },
          { id: '5', name: 'John Doe', age: 45, gender: 'M', lastVisit: '2025-11-28', condition: 'Hypertension', phone: '+593987654321', status: 'active' },
          { id: '6', name: 'Luis Fernandez', age: 52, gender: 'M', lastVisit: '2025-11-25', condition: 'COPD', phone: '+593987654325', status: 'follow-up' },
          { id: '7', name: 'Maria Santos', age: 32, gender: 'F', lastVisit: '2025-11-20', condition: 'Asthma', phone: '+593987654322', status: 'active' },
          { id: '8', name: 'Pedro Gonzalez', age: 67, gender: 'M', lastVisit: '2025-11-15', condition: 'Arthritis', phone: '+593987654327', status: 'active' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    searchQuery === '' || 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysAgo = (dateStr: string) => {
    const days = Math.ceil((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days/7)}w ago`;
    return `${Math.floor(days/30)}mo ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'follow-up': return '#F59E0B';
      case 'new': return '#3B82F6';
      default: return '#10B981';
    }
  };

  const renderPatient = ({ item, index }: { item: Patient; index: number }) => (
    <TouchableOpacity 
      style={[styles.patientRow, index === 0 && styles.patientRowFirst]}
      onPress={() => navigation.navigate('PatientHistory', { patientId: item.id, patientName: item.name })}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={[styles.avatarText, { color: getStatusColor(item.status) }]}>
          {item.name.charAt(0)}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.patientInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.patientName}>{item.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        </View>
        <Text style={styles.patientMeta}>
          {item.age}{item.gender} · {item.condition} · {getDaysAgo(item.lastVisit)}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => Linking.openURL(`tel:${item.phone}`)}
        >
          <Text style={styles.actionIcon}>📞</Text>
        </TouchableOpacity>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <RoleGuard allowedRoles={['doctor']} fallbackMessage="Access restricted.">
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with back, home, signout */}
        <StandardHeader 
          title={`Patients (${filteredPatients.length})`}
          showBackButton={true}
          showHomeButton={true}
          showSignOutButton={true}
        />

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or condition..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1A1A1A" />
          </View>
        ) : (
          <FlatList
            data={filteredPatients}
            renderItem={renderPatient}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No patients found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </RoleGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  clearBtn: {
    fontSize: 14,
    color: '#999',
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  patientRowFirst: {
    borderTopWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  patientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  patientMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 20,
    color: '#CCC',
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
});
