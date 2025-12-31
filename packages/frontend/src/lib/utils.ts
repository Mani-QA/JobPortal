import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export formatting functions from shared package
export { formatSalary, formatDate, formatRelativeTime, truncateText } from '@job-portal/shared';

