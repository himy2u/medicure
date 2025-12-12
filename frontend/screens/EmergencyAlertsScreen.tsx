/**
 * EmergencyAlertsScreen - Professional Emergency Management
 * 
 * Inspired by: Wealthsimple, Solv, One Medical
 * 
 * Features:
 * - Clean card-based alerts
 * - Priority-sorted (critical first)
 * - Quick actions: Accept, Call, Chat
 * - Professional, minimal design
 */

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  ActivityIndicator, FlatList, Alert, Linking 
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

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface EmergencyAlert {
  id: string;
  patientName: string;
  patientPhone: string;
  symptom: string;
  severity: 'critical' | 'high' | 'medium';
  status: 'pending' | 'accepted' | 'in_progress';
  location: string;
  timeAgo: string;
  hasAmbulance: boolean;
}

export default function EmergencyAlertsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('pending');

  useAuthCheck();

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const result = await apiClient.get(`/api/doctors/${userId}/emergency-alerts?status=${filter}`, true);

      if (result.success && result.data?.alerts) {
        setAlerts(result.data.alerts);
      } else {
        // Mock data
        setAlerts([
          { 
            id: '1', 
            patientName: 'Maria Garcia', 
            patientPhone: '+593987654321',
            symptom: 'Severe chest pain, difficulty breathing',
            severity: 'critical',
            status: 'pending',
            location: 'Av. 6 de Diciembre, Quito',
            timeAgo: '3m ago',
            hasAmbulance: true
          },
          { 
            id: '2', 
            patientName: 'Carlos Rodriguez', 
            patientPhone: '+593987654322',
            symptom: 'High fever (39.5°C), severe headache',
            severity: 'high',
            status: 'accepted',
            location: 'Av. Eloy Alfaro, Quito',
            timeAgo: '12m ago',
            hasAmbulance: false
          },
          { 
            id: '3', 
            patientName: 'Ana Martinez', 
            patientPhone: '+593987654323',
            symptom: 'Allergic reaction, facial swelling',
            severity: 'medium',
            status: 'pending',
            location: 'Calle Toledo, Quito',
            timeAgo: '25m ago',
            hasAmbulance: false
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: 'accepted' } : a
    ));
    Alert.alert('Accepted', 'You have accepted this emergency case.');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'active') return a.status === 'accepted' || a.status === 'in_progress';
    return true;
  });

  const renderAlert = ({ item }: { item: EmergencyAlert }) => (
    <View style={[styles.alertCard, { borderLeftColor: getSeverityColor(item.severity) }]}>
      {/* Header */}
      <View style={styles.alertHeader}>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
        </View>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
        {item.status !== 'pending' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✓ {item.status}</Text>
          </View>
        )}
      </View>

      {/* Patient */}
      <Text style={styles.patientName}>{item.patientName}</Text>
      <Text style={styles.symptom}>{item.symptom}</Text>

      {/* Location */}
      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
      </View>

      {/* Ambulance */}
      {item.hasAmbulance && (
        <View style={styles.ambulanceRow}>
          <Text style={styles.ambulanceText}>🚑 Ambulance dispatched</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.acceptBtn}
            onPress={() => handleAccept(item.id)}
          >
            <Text style={styles.acceptBtnText}>Accept Case</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.callBtn}
          onPress={() => Linking.openURL(`tel:${item.patientPhone}`)}
        >
          <Text style={styles.callBtnText}>📞 Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.chatBtn}
          onPress={() => navigation.navigate('Chat', { 
            appointmentId: item.id, 
            otherUserName: item.patientName,
            otherUserId: item.id
          })}
        >
          <Text style={styles.chatBtnText}>💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <RoleGuard allowedRoles={['doctor']} fallbackMessage="Access restricted.">
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with back, home, signout */}
        <StandardHeader 
          title={`Emergency (${filteredAlerts.length})`}
          showBackButton={true}
          showHomeButton={true}
          showSignOutButton={true}
        />

        {/* Filter Tabs */}
        <View style={styles.filterBar}>
          {(['pending', 'active', 'all'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'pending' ? 'Pending' : f === 'active' ? 'Active' : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#DC2626" />
          </View>
        ) : (
          <FlatList
            data={filteredAlerts}
            renderItem={renderAlert}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>✓</Text>
                <Text style={styles.emptyText}>No alerts</Text>
                <Text style={styles.emptySubtext}>You're all caught up</Text>
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
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    fontSize: 16,
    color: '#DC2626',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterTabActive: {
    backgroundColor: '#1A1A1A',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    textTransform: 'capitalize',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  symptom: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 10,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  ambulanceRow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  ambulanceText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatBtn: {
    width: 44,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatBtnText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    color: '#10B981',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
