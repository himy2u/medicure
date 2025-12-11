/**
 * Layout Design System
 * 
 * Consistent layout patterns to prevent UI cutting across all screens.
 * Based on FAANG best practices and Material Design principles.
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Screen Breakpoints
 * Based on common device sizes
 */
export const breakpoints = {
  small: 375,   // iPhone SE, iPhone 12 mini
  medium: 390,  // iPhone 12, 13, 14
  large: 428,   // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
  tablet: 768,  // iPad mini
  desktop: 1024 // iPad Pro
};

/**
 * Safe Margins
 * Ensures content never touches screen edges
 */
export const safeMargins = {
  horizontal: 16,  // Minimum horizontal padding
  vertical: 16,    // Minimum vertical padding
  top: Platform.OS === 'ios' ? 44 : 56,  // Status bar + header
  bottom: Platform.OS === 'ios' ? 34 : 0  // Home indicator
};

/**
 * Container Styles
 * Standard container patterns for all screens
 */
export const containerPatterns = {
  // Full screen with scroll
  scrollable: {
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flexGrow: 1,  // NOT flex: 1 - allows content smaller than screen
      paddingHorizontal: safeMargins.horizontal,
      paddingTop: safeMargins.vertical,
      paddingBottom: safeMargins.vertical * 2, // Extra bottom padding
    }
  },
  
  // Fixed header + scrollable content
  headerWithScroll: {
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: safeMargins.horizontal,
      paddingVertical: safeMargins.vertical,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: safeMargins.horizontal,
      paddingBottom: safeMargins.vertical * 2,
    }
  },
  
  // Fixed header + scrollable content + fixed footer
  headerContentFooter: {
    container: {
      flex: 1,
    },
    header: {
      paddingHorizontal: safeMargins.horizontal,
      paddingVertical: safeMargins.vertical,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: safeMargins.horizontal,
      paddingBottom: 80, // Space for fixed footer
    },
    footer: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: safeMargins.horizontal,
      paddingVertical: safeMargins.vertical,
      paddingBottom: safeMargins.bottom + safeMargins.vertical,
    }
  }
};

/**
 * Text Truncation Rules
 * Prevents text overflow
 */
export const textTruncation = {
  singleLine: {
    numberOfLines: 1,
    ellipsizeMode: 'tail' as const,
  },
  twoLines: {
    numberOfLines: 2,
    ellipsizeMode: 'tail' as const,
  },
  threeLines: {
    numberOfLines: 3,
    ellipsizeMode: 'tail' as const,
  },
};

/**
 * Flex Constraints
 * Prevents overflow in flex containers
 */
export const flexConstraints = {
  // For text that should shrink
  shrinkableText: {
    flexShrink: 1,
    flexWrap: 'wrap' as const,
  },
  
  // For containers that should adapt
  adaptiveContainer: {
    flex: 1,
    maxWidth: '100%',
  },
  
  // For items in a row
  rowItem: {
    flex: 1,
    minWidth: 0, // Allows flex shrinking
  },
  
  // For fixed-width items
  fixedItem: {
    flexShrink: 0,
  }
};

/**
 * Button Sizing
 * Responsive button dimensions
 */
export const buttonSizing = {
  // Full width button
  fullWidth: {
    width: '100%',
    minHeight: 48, // Minimum touch target (Apple HIG)
  },
  
  // Half width button (in row)
  halfWidth: {
    flex: 1,
    minWidth: 140,
    minHeight: 48,
  },
  
  // Icon button
  icon: {
    width: 44,
    height: 44,
    minWidth: 44, // Minimum touch target
    minHeight: 44,
  },
  
  // Small button
  small: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  // Large button
  large: {
    minHeight: 56,
    paddingHorizontal: 24,
    paddingVertical: 16,
  }
};

/**
 * Card Sizing
 * Standard card dimensions
 */
export const cardSizing = {
  standard: {
    marginHorizontal: safeMargins.horizontal,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  
  compact: {
    marginHorizontal: safeMargins.horizontal,
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
  },
  
  large: {
    marginHorizontal: safeMargins.horizontal,
    marginVertical: 12,
    padding: 20,
    borderRadius: 16,
  }
};

/**
 * List Item Sizing
 * For FlatList/ScrollView items
 */
export const listItemSizing = {
  standard: {
    minHeight: 60,
    paddingHorizontal: safeMargins.horizontal,
    paddingVertical: 12,
  },
  
  compact: {
    minHeight: 44,
    paddingHorizontal: safeMargins.horizontal,
    paddingVertical: 8,
  },
  
  large: {
    minHeight: 80,
    paddingHorizontal: safeMargins.horizontal,
    paddingVertical: 16,
  }
};

/**
 * Input Field Sizing
 * For TextInput components
 */
export const inputSizing = {
  standard: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  multiline: {
    minHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    textAlignVertical: 'top' as const,
  }
};

/**
 * Spacing Scale
 * Consistent spacing throughout app
 */
export const spacingScale = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Helper: Get responsive value based on screen width
 */
export const getResponsiveValue = <T,>(values: {
  small: T;
  medium?: T;
  large?: T;
  tablet?: T;
}): T => {
  if (SCREEN_WIDTH >= breakpoints.tablet && values.tablet) {
    return values.tablet;
  }
  if (SCREEN_WIDTH >= breakpoints.large && values.large) {
    return values.large;
  }
  if (SCREEN_WIDTH >= breakpoints.medium && values.medium) {
    return values.medium;
  }
  return values.small;
};

/**
 * Helper: Calculate max width for content
 * Prevents content from being too wide on tablets
 */
export const getMaxContentWidth = (): number => {
  if (SCREEN_WIDTH >= breakpoints.tablet) {
    return 600; // Max width on tablets
  }
  return SCREEN_WIDTH - (safeMargins.horizontal * 2);
};

/**
 * Helper: Get number of columns for grid
 */
export const getGridColumns = (): number => {
  if (SCREEN_WIDTH >= breakpoints.tablet) {
    return 3;
  }
  if (SCREEN_WIDTH >= breakpoints.large) {
    return 2;
  }
  return 1;
};

/**
 * SafeAreaView edges configuration
 * Use this for all screens
 */
export const safeAreaEdges = {
  all: ['top', 'bottom', 'left', 'right'] as const,
  topOnly: ['top', 'left', 'right'] as const,
  bottomOnly: ['bottom', 'left', 'right'] as const,
  horizontal: ['left', 'right'] as const,
};

/**
 * ScrollView default props
 * Use these for all ScrollViews
 */
export const scrollViewDefaults = {
  showsVerticalScrollIndicator: true,
  showsHorizontalScrollIndicator: false,
  bounces: true,
  scrollEnabled: true,
  nestedScrollEnabled: true,
  keyboardShouldPersistTaps: 'handled' as const,
  contentInsetAdjustmentBehavior: 'automatic' as const,
  decelerationRate: 'normal' as const,
  scrollEventThrottle: 16,
};

export default {
  breakpoints,
  safeMargins,
  containerPatterns,
  textTruncation,
  flexConstraints,
  buttonSizing,
  cardSizing,
  listItemSizing,
  inputSizing,
  spacingScale,
  getResponsiveValue,
  getMaxContentWidth,
  getGridColumns,
  safeAreaEdges,
  scrollViewDefaults,
};
