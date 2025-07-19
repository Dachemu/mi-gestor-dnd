import { debug, error as logError } from '../utils/logger'

/**
 * Custom hook for centralized logging
 * Provides consistent logging interface across components
 */
export function useLogger() {
  return {
    debug,
    logError
  }
}

export default useLogger