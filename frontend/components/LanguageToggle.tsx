import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius } from '../theme/colors';

export default function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity 
        style={[
          styles.flagButton,
          currentLanguage === 'es' && styles.flagButtonActive
        ]}
        onPress={() => i18n.changeLanguage('es')}
        activeOpacity={0.8}
      >
        <View style={styles.flagContainer}>
          {/* Ecuador Flag */}
          <View style={styles.ecuadorFlag}>
            <View style={[styles.flagStripe, { backgroundColor: '#FFDD00' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#0038A8' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#CE1126' }]} />
          </View>
        </View>
        <Text style={[
          styles.languageText,
          currentLanguage === 'es' && styles.languageTextActive
        ]}>
          ES
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.flagButton,
          currentLanguage === 'en' && styles.flagButtonActive
        ]}
        onPress={() => i18n.changeLanguage('en')}
        activeOpacity={0.8}
      >
        <View style={styles.flagContainer}>
          {/* US Flag */}
          <View style={styles.usFlag}>
            <View style={[styles.flagStripe, { backgroundColor: '#B22234' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.flagStripe, { backgroundColor: '#3C3B6E' }]} />
          </View>
        </View>
        <Text style={[
          styles.languageText,
          currentLanguage === 'en' && styles.languageTextActive
        ]}>
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginHorizontal: 2,
  },
  flagButtonActive: {
    backgroundColor: colors.accent,
  },
  flagContainer: {
    width: 20,
    height: 14,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: spacing.xs,
  },
  usFlag: {
    flex: 1,
  },
  ecuadorFlag: {
    flex: 1,
  },
  flagStripe: {
    flex: 1,
    width: '100%',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  languageTextActive: {
    color: '#FFFFFF',
  },
});
