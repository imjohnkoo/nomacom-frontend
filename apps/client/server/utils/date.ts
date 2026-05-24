import { addHours } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Create UTC datetime from date string, hour, and timezone
 * @param dateString - Date in YYYY-MM-DD format
 * @param hour - Hour (0-23)
 * @param timeZone - Timezone string (e.g., "Asia/Seoul")
 */
export function createUTCDateTime(dateString: string, hour: number, timeZone: string): Date {
  // Create midnight in the specified timezone
  const date = fromZonedTime(`${dateString}T00:00:00`, timeZone);
  // Add the specified hours
  return addHours(date, hour);
}

/**
 * Create local datetime from date string, hour, and timezone
 * @param dateString - Date in YYYY-MM-DD format
 * @param hour - Hour (0-23)
 * @param timeZone - Timezone string (e.g., "Asia/Seoul")
 */
export function createLocalDateTime(dateString: string, hour: number, timeZone: string): Date {
  // Create midnight in UTC and convert to specified timezone
  const utcMidnight = fromZonedTime(`${dateString}T00:00:00`, timeZone);
  const utcDateTime = addHours(utcMidnight, hour);
  return toZonedTime(utcDateTime, timeZone);
}
