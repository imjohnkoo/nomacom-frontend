/**
 * Format phone number to Korean format (010-XXXX-XXXX)
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/[^\d]/g, '');

  // Break the string into parts and insert hyphens
  const charArray = numbers.split('');
  if (charArray.length > 3) {
    charArray.splice(3, 0, '-');
  }
  if (charArray.length > 8) {
    charArray.splice(8, 0, '-');
  }

  return charArray.join('').slice(0, 13); // Limit to 010-0000-0000 (13 chars)
};

/**
 * Remove hyphens from phone number
 */
export const extractHyphenFromPhoneNumber = (value: string): string => {
  return value.replace(/-/g, '');
};

/**
 * Validate Korean phone number format
 */
export const isValidPhoneNumber = (value: string): boolean => {
  return /^010-\d{4}-\d{4}$/.test(value);
};
