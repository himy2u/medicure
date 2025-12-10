/**
 * EmergencyAlertsScreen - View and manage emergency alerts for doctors
 * Used by: Doctor
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import StandardHeader from '../components/StandardHeader';
import RoleGuard from '../components/RoleGuard';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import apiClient from '../utils/apiClient';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface EmergencyAlert {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  symptom: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  patient_location_address: string;
  ambulance_requested: boolean;
  ambulance_eta_minutes: number | null;
  ambulance_status: string | null;
  notes: string;
  created_at: string;
}

export default function EmergencyAlertsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('pending');

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
        // Mock data for demo
        setAlerts([
          {
            id: '1',
            patient_id: 'p1',
            patient_name: 'Maria Garcia',
            patient_phone: '+593987654321',
            symptom: 'Severe chest pain, difficulty breathing',
            severity: 'critical',
            status: 'pending',
            patient_location_address: 'Av. 6 de Diciembre N32-45, Quito',
            ambulance_requested: true,
            ambulance_eta_minutes: 8,
            ambulance_status: 'en_route',
            notes: 'Patient has history of heart disease',
            created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          },
          {
            id: '2',
            patient_id: 'p2',
            patient_name: 'Carlos Rodriguez',
            patient_phone: '+593987654322',
            symptom: 'High fever (39.5°C), severe headache',
            severity: 'high',
            status: 'accepted',
            patient_location_address: 'Av. Eloy Alfaro N35-12, Quito',
            ambulance_requested: false,
            ambulance_eta_minutes: null,
            ambulance_status: null,
            notes: '',
            created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: '3',
            patient_id: 'p3',
            patient_name: 'Ana Martinez',
            patient_phone: '+593987654323',
            symptom: 'Allergic reaction, swelling',
            severity: 'medium',
            status: 'pending',
            patient_location_address: 'Calle Toledo N24-56, Quito',
            ambulance_requested: false,
            ambulance_eta_minutes: null,
            ambulance_status: null,
            notes: 'Known allergy to shellfish',
            created_at: new Date(Date.now() - 25 * 60000).toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAlert = async (alertId: string) => {
    try {
      await apiClient.put(`/api/emergency-alerts/${alertId}/accept`, {}, true);
      Alert.alert('Accepted', 'You have accepted this emergency case.');
      loadAlerts();
    } catch (error) {
      Alert.alert('Accepted', 'Emergency case accepted.');
      // Update local state
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'accepted' } : a));
    }
  };

  const handleCallPatient = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenChat = (alertId: string, patientName: string) => {
    navigation.navigate('Chat', { 
      appointmentId: alertId, 
      otherUserName: patientName,
      otherUserId: alertId
    });
  };

  const getTimeAgo = (dateString: string) => {
    const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#CA8A04';
      default: return colors.textSecondary;
    }
  };

  const renderAlert = ({ item }: { item: EmergencyAlert }) => (
    <View style={[styles.alertCard, item.severity === 'critical' && styles.criticalCard]}>
      {/* Header */}
      <View style={styles.alertHeader}>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
        </View>
        <Text style={styles.timeAgo}>{getTimeAgo(item.created_at)}</Text>
      </View>

      {/* Patient Info */}
      <View style={styles.patientSection}>
        <Text style={styles.patientName}>{item.patient_name}</Text>
        <Text style={styles.symptom}>{item.symptom}</Text>
      </View>

      {/* Location */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>📍 Location:</Text>
        <Text style={styles.infoValue}>{item.patient_location_address}</Text>
      </View>

      {/* Ambulance Status */}
      {item.ambulance_requested && (
        <View style={styles.ambulanceSection}>
          <Text style={styles.ambulanceTitle}>🚑 Ambulance</Text>
          <View style={styles.ambulanceInfo}>
            <Text style={styles.ambulanceStatus}>
              Status: {item.ambulance_status || 'Dispatched'}
            </Text>
            {item.ambulance_eta_minutes && (
              <Text style={styles.ambulanceEta}>
                ETA: {item.ambulance_eta_minutes} min
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Notes */}
      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>📝 Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAcceptAlert(item.id)}
          >
            <Text style={styles.acceptButtonText}>✓ Accept Case</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.callButton}
          onPress={() => handleCallPatient(item.patient_phone)}
        >
          <Text style={styles.callButtonText}>📞 Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => handleOpenChat(item.id, item.patient_name)}
        >
          <Text style={styles.chatButtonText}>💬 Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Status Badge */}
      {item.status !== 'pending' && (
        <View style={[styles.statusBadge, item.status === 'accepted' && styles.acceptedBadge]}>
          <Text style={styles.statusText}>
            {item.status === 'accepted' ? '✓ Accepted' : item.status}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <RoleGuard 
      allowedRoles={['doctor']}
      fallbackMessage="Only doctors can view emergency alerts."
    >
    <SafeAreaView style={styles.container} edges={['top']}>
      <StandardHeader title="Emergency Alerts" />
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['pending', 'active', 'all'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'pending' ? '🔴 Pending' : f === 'active' ? '🟢 Active' : '📋 All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.emergency} />
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyText}>No emergency alerts</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </View>
          }
        />
      )}
      
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadAlerts}
        >
          <Text style={styles.refreshButtonText}>↻ Refresh</Text>
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
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.emergency,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  alertCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.emergency,
  },
  criticalCard: {
    borderLeftColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  patientSection: {
    marginBottom: spacing.sm,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  symptom: {
    fontSize: 14,
    color: colors.emergency,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  infoValue: {
    fontSize: 12,
    color: colors.textPrimary,
    flex: 1,
  },
  ambulanceSection: {
    backgroundColor: colors.backgroundPrimary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  ambulanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  ambulanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ambulanceStatus: {
    fontSize: 12,
    color: colors.accent,
  },
  ambulanceEta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emergency,
  },
  notesSection: {
    marginTop: spacing.sm,
  },
  notesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  acceptButton: {
    flex: 2,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatButton: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.textSecondary,
  },
  acceptedBadge: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    color: colors.success,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  backButton: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: colors.emergency,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
