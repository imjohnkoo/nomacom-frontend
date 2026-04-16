let counter = 0

/**
 * Generate a unique ID for accessibility attributes.
 * @param prefix Optional prefix for the ID
 */
export function useId(prefix = 'n'): string {
  counter++
  return `${prefix}-${counter}`
}
