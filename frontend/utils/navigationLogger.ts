/**
 * Navigation Logger
 * Tracks all navigation events for testing
 */

import { NavigationContainerRef } from '@react-navigation/native';
import testLogger from './testLogger';

let navigationRef: NavigationContainerRef<any> | null = null;

export const setNavigationRef = (ref: NavigationContainerRef<any>) => {
  navigationRef = ref;
  testLogger.info('NAVIGATION', 'Navigation ref set');
};

export const logNavigation = (action: string, routeName: string, params?: any) => {
  const currentRoute = navigationRef?.getCurrentRoute();
  const from = currentRoute?.name || 'Unknown';
  
  testLogger.navigationAction(action, from, routeName, params);
};

export const setupNavigationLogging = (ref: NavigationContainerRef<any>) => {
  setNavigationRef(ref);

  // Log state changes
  ref.addListener('state', () => {
    const currentRoute = ref.getCurrentRoute();
    if (currentRoute) {
      testLogger.screenEnter(currentRoute.name, currentRoute.params);
    }
  });

  testLogger.success('NAVIGATION', 'Navigation logging enabled');
};

export default {
  setNavigationRef,
  logNavigation,
  setupNavigationLogging
};
