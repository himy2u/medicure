/**
 * StandardHeader Component
 * Provides consistent back button and home icon placement across all screens
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { colors, spacing, borderRadius } from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getRoleBasedHomeScreen } from '../utils/navigationHelper';

interface StandardHeaderProps {
  title: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

export default function StandardHeader({
  title,
  showBackButton = true,
  showHomeButton = true,
  onBackPress,
  rightComponent
}: StandardHeaderProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [userRole, setUserRole] = React.useState<string>('');

  React.useEffect(() => {
    const loadUserRole = async () => {
      const role = await SecureStore.getItemAsync('user_role');
      setUserRole(role || 'patient');
    };
    loadUserRole();
  }, []);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleHomePress = () => {
    const homeScreen = getRoleBasedHomeScreen(userRole);
    navigation.navigate(homeScreen as any);
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>←</Text>
          </TouchableOpacity>
        )}
        {showHomeButton && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleHomePress}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>🏠</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 60,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 80,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  rightSection: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  iconButton: {
    backgroundColor: colors.backgroundSecondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconText: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});