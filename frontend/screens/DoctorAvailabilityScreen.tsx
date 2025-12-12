/**
 * DoctorAvailabilityScreen - Redirects to UnifiedCalendar
 * 
 * The availability and schedule are now merged into one unified calendar.
 * This screen redirects to maintain backward compatibility.
 */

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function DoctorAvailabilityScreen() {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Redirect to UnifiedCalendar
    navigation.replace('UnifiedCalendar' as any);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.text}>Loading Calendar...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
  },
  text: {
    marginTop: 16,
    color: colors.textSecondary,
  },
});
