/**
 * Standardized response type for all Server Actions.
 * This ensures consistent error handling across the application.
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: number };

/**
 * Helper function to create a success result
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper function to create an error result
 */
export function error<T>(error: string, code: number = 500): Result<T> {
  return { success: false, error, code };
}
