/**
 * BaseScreen Component
 * 
 * Standard screen wrapper that prevents UI cutting.
 * All screens should use this component.
 */

import React from 'react';
import { StyleSheet, View, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { 
  containerPatterns, 
  safeAreaEdges, 
  scrollViewDefaults 
} from '../theme/layout';

interface BaseScreenProps {
  children: React.ReactNode;
  
  // Layout pattern
  pattern?: 'scrollable' | 'headerWithScroll' | 'headerContentFooter';
  
  // Header component (for headerWithScroll and headerContentFooter patterns)
  header?: React.ReactNode;
  
  // Footer component (for headerContentFooter pattern)
  footer?: React.ReactNode;
  
  // Safe area edges
  edges?: 'all' | 'topOnly' | 'bottomOnly' | 'horizontal';
  
  // Enable/disable scroll
  scrollable?: boolean;
  
  // Background color
  backgroundColor?: string;
  
  // Additional styles
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
}

export default function BaseScreen({
  children,
  pattern = 'scrollable',
  header,
  footer,
  edges = 'topOnly',
  scrollable = true,
  backgroundColor = colors.backgroundPrimary,
  containerStyle,
  contentStyle,
}: BaseScreenProps) {
  
  const edgesConfig = safeAreaEdges[edges];
  const patternStyles = containerPatterns[pattern];
  
  // Pattern: Scrollable (default)
  if (pattern === 'scrollable' && scrollable) {
    return (
      <SafeAreaView 
        style={[
          patternStyles.container, 
          { backgroundColor },
          containerStyle
        ]} 
        edges={edgesConfig}
      >
        <ScrollView
          style={patternStyles.scrollView}
          contentContainerStyle={[patternStyles.content, contentStyle]}
          {...scrollViewDefaults}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Pattern: Scrollable but disabled (static content)
  if (pattern === 'scrollable' && !scrollable) {
    return (
      <SafeAreaView 
        style={[
          patternStyles.container, 
          { backgroundColor },
          containerStyle
        ]} 
        edges={edgesConfig}
      >
        <View style={[patternStyles.content, contentStyle]}>
          {children}
        </View>
      </SafeAreaView>
    );
  }
  
  // Pattern: Header with scroll
  if (pattern === 'headerWithScroll') {
    return (
      <SafeAreaView 
        style={[
          patternStyles.container, 
          { backgroundColor },
          containerStyle
        ]} 
        edges={edgesConfig}
      >
        {header && (
          <View style={patternStyles.header}>
            {header}
          </View>
        )}
        <ScrollView
          style={patternStyles.scrollView}
          contentContainerStyle={[patternStyles.content, contentStyle]}
          {...scrollViewDefaults}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // Pattern: Header + Content + Footer
  if (pattern === 'headerContentFooter') {
    return (
      <SafeAreaView 
        style={[
          patternStyles.container, 
          { backgroundColor },
          containerStyle
        ]} 
        edges={edgesConfig}
      >
        {header && (
          <View style={patternStyles.header}>
            {header}
          </View>
        )}
        <ScrollView
          style={patternStyles.scrollView}
          contentContainerStyle={[patternStyles.content, contentStyle]}
          {...scrollViewDefaults}
        >
          {children}
        </ScrollView>
        {footer && (
          <View style={[patternStyles.footer, styles.footer]}>
            {footer}
          </View>
        )}
      </SafeAreaView>
    );
  }
  
  // Fallback
  return (
    <SafeAreaView 
      style={[
        { flex: 1, backgroundColor },
        containerStyle
      ]} 
      edges={edgesConfig}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.backgroundPrimary,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});
