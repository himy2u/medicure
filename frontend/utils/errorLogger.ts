/**
 * Error Logger - Logs errors to help with debugging
 */

class ErrorLogger {
  private logs: string[] = [];

  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}`;
    this.logs.push(logEntry);
    console.log(logEntry);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    
    // Handle different error types properly
    let errorDetails: any;
    if (typeof error === 'string') {
      errorDetails = error; // Don't spread strings!
    } else if (error instanceof Error) {
      errorDetails = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    } else if (error && typeof error === 'object') {
      errorDetails = error; // Already an object
    } else {
      errorDetails = String(error);
    }
    
    const logEntry = `[${timestamp}] ERROR: ${message} | ${JSON.stringify(errorDetails)}`;
    this.logs.push(logEntry);
    console.error(logEntry);
    
    if (this.logs.length > 100) {
      this.logs.shift();
    }
  }

  getLogs() {
    return this.logs.join('\n');
  }

  clear() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();
