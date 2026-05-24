import type { Order } from '../db/schema';

/**
 * Generate unique eSIM tag from order data
 * Format: {customerId}{last4PhoneDigits}_{orderId}_{optionManageCode}_{index}
 */
export function generateEsimTag(
  order: {
    customerId: string | null;
    receiverPhoneNumber: string | null;
    orderId: number | null;
    optionManageCode: string | null;
  },
  index: number
): string {
  const idx = index + 1;
  const customerId = (order.customerId || '').replace(/\*/g, '');
  const phoneNumber = (order.receiverPhoneNumber || '').replace(/-/g, '').slice(-4);
  const orderId = order.orderId || '';
  const optionManageCode = order.optionManageCode || '';

  return `${customerId}${phoneNumber}_${orderId}_${optionManageCode}_${idx}`;
}

/**
 * Remove hyphens from phone number
 */
export function extractHyphenFromPhoneNumber(value: string): string {
  return value.replace(/-/g, '');
}
