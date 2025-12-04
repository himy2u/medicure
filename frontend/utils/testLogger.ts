/**
 * Test Logger
 * Comprehensive logging for testing and debugging
 */

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'action' | 'navigation' | 'api' | 'state';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

class TestLogger {
  private logs: LogEntry[] = [];
  private enabled: boolean = true;

  constructor() {
    // Enable in development
    this.enabled = __DEV__ || process.env.NODE_ENV === 'development';
  }

  private log(level: LogLevel, category: string, message: string, data?: any) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    this.logs.push(entry);

    // Console output with emoji for easy scanning
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      action: '👆',
      navigation: '🧭',
      api: '🌐',
      state: '📊'
    };

    const prefix = `${emoji[level]} [${category}]`;
    
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  // User Actions
  buttonClick(buttonName: string, screenName: string, data?: any) {
    this.log('action', 'BUTTON_CLICK', `Button "${buttonName}" clicked on ${screenName}`, data);
  }

  inputChange(fieldName: string, value: any, screenName: string) {
    this.log('action', 'INPUT_CHANGE', `Field "${fieldName}" changed on ${screenName}`, { value });
  }

  // Navigation
  screenEnter(screenName: string, params?: any) {
    this.log('navigation', 'SCREEN_ENTER', `Entered ${screenName}`, params);
  }

  screenExit(screenName: string) {
    this.log('navigation', 'SCREEN_EXIT', `Exited ${screenName}`);
  }

  navigationAction(action: string, from: string, to: string, params?: any) {
    this.log('navigation', 'NAVIGATE', `${action}: ${from} → ${to}`, params);
  }

  // API Calls
  apiRequest(method: string, endpoint: string, body?: any) {
    this.log('api', 'API_REQUEST', `${method} ${endpoint}`, body);
  }

  apiResponse(method: string, endpoint: string, status: number, data?: any) {
    const level = status >= 200 && status < 300 ? 'success' : 'error';
    this.log(level, 'API_RESPONSE', `${method} ${endpoint} - ${status}`, data);
  }

  apiError(method: string, endpoint: string, error: any) {
    this.log('error', 'API_ERROR', `${method} ${endpoint} failed`, error);
  }

  // State Changes
  stateChange(component: string, stateName: string, oldValue: any, newValue: any) {
    this.log('state', 'STATE_CHANGE', `${component}.${stateName} changed`, {
      from: oldValue,
      to: newValue
    });
  }

  // Errors
  error(category: string, message: string, error: any) {
    this.log('error', category, message, error);
  }

  // Warnings
  warning(category: string, message: string, data?: any) {
    this.log('warning', category, message, data);
  }

  // Info
  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  // Success
  success(category: string, message: string, data?: any) {
    this.log('success', category, message, data);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    console.log('🧹 Logs cleared');
  }

  // Print summary
  printSummary() {
    const summary = {
      total: this.logs.length,
      errors: this.getLogsByLevel('error').length,
      warnings: this.getLogsByLevel('warning').length,
      actions: this.getLogsByLevel('action').length,
      navigation: this.getLogsByLevel('navigation').length,
      apiCalls: this.getLogsByLevel('api').length,
      stateChanges: this.getLogsByLevel('state').length
    };

    console.log('📊 Test Log Summary:', summary);
    return summary;
  }
}

// Singleton instance
const testLogger = new TestLogger();

export default testLogger;

// Helper hooks for React components
export const useTestLogger = (componentName: string) => {
  return {
    logButtonClick: (buttonName: string, data?: any) => 
      testLogger.buttonClick(buttonName, componentName, data),
    
    logInputChange: (fieldName: string, value: any) => 
      testLogger.inputChange(fieldName, value, componentName),
    
    logStateChange: (stateName: string, oldValue: any, newValue: any) => 
      testLogger.stateChange(componentName, stateName, oldValue, newValue),
    
    logError: (message: string, error: any) => 
      testLogger.error(componentName, message, error),
    
    logWarning: (message: string, data?: any) => 
      testLogger.warning(componentName, message, data),
    
    logInfo: (message: string, data?: any) => 
      testLogger.info(componentName, message, data),
    
    logSuccess: (message: string, data?: any) => 
      testLogger.success(componentName, message, data)
  };
};
