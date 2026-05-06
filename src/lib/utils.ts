import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTimestampNumber(date: any): number {
  if (!date) return 0;
  if (typeof date === 'number') return date;
  if (date.seconds) return date.seconds * 1000;
  if (date instanceof Date) return date.getTime();
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export function formatDate(date: any, formatStr: string = 'MMM dd, yyyy'): string {
  const ts = toTimestampNumber(date);
  if (!ts) return 'N/A';
  return format(new Date(ts), formatStr);
}
