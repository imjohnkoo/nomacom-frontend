import { format, addDays } from 'date-fns';

/**
 * Format date to Korean format (2024년 1월 15일)
 */
export function formatDateString(date: Date | string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();

  return `${year}년 ${month}월 ${day}일`;
}

/**
 * Format date string to short Korean format (24년 01월 15일)
 */
export function formatDateStringToKorean(date: string): string {
  const dateObj = new Date(date);
  return format(dateObj, 'yy년 MM월 dd일');
}

/**
 * Format hour to Korean AM/PM format
 */
export function formatHourToKorean(hour: number): string {
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period} ${displayHour}시`;
}

/**
 * Calculate end date based on start date and duration
 */
export function calculateEndDate(startDate: string, durationDays: number): string {
  const start = new Date(startDate);
  const end = addDays(start, durationDays);
  return format(end, 'yyyy-MM-dd');
}

/**
 * Generate array of hours (0-23) for selection
 */
export function getHourOptions(): { value: number; label: string }[] {
  return Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: formatHourToKorean(i),
  }));
}
