/**
 * Logger utility for development and production environments
 * Prevents debug logs from appearing in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Development-only logging
   * Only shows in development environment
   */
  debug: isDevelopment ? console.log : () => {},
  
  /**
   * Development-only info logging
   */
  info: isDevelopment ? console.info : () => {},
  
  /**
   * Always log warnings (shown in all environments)
   */
  warn: console.warn,
  
  /**
   * Always log errors (shown in all environments)
   */
  error: console.error,
  
  /**
   * Development-only group logging
   */
  group: isDevelopment ? console.group : () => {},
  groupEnd: isDevelopment ? console.groupEnd : () => {},
  groupCollapsed: isDevelopment ? console.groupCollapsed : () => {},
  
  /**
   * Development-only table logging
   */
  table: isDevelopment ? console.table : () => {},
  
  /**
   * Development-only time logging
   */
  time: isDevelopment ? console.time : () => {},
  timeEnd: isDevelopment ? console.timeEnd : () => {},
  
  /**
   * Conditional logging based on condition
   * @param {boolean} condition - Whether to log
   * @param {...any} args - Arguments to log
   */
  conditional: (condition, ...args) => {
    if (condition && isDevelopment) {
      console.log(...args)
    }
  },
  
  /**
   * Log with custom prefix for easier filtering
   * @param {string} prefix - Prefix for the log message
   * @param {...any} args - Arguments to log
   */
  prefixed: (prefix, ...args) => {
    if (isDevelopment) {
      console.log(`[${prefix}]`, ...args)
    }
  }
}

// Default export for convenience
export default logger

// Named exports for specific use cases
export const { debug, info, warn, error, group, groupEnd, table, time, timeEnd } = logger