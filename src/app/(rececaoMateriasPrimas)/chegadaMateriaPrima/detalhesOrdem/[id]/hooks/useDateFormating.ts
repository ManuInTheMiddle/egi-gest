import { useCallback } from 'react';
import { formatDate, formatForSAP, getCurrentTimestamp } from '../utils/dateUtils';

interface UseDateFormattingReturn {
  formatDate: (date: string | Date, formatStr?: string) => string;
  formatForSAP: (date: Date) => string;
  getCurrentTimestamp: () => string;
}

export const useDateFormatting = (): UseDateFormattingReturn => {
  const memoizedFormatDate = useCallback((date: string | Date, formatStr?: string) => {
    return formatDate(date, formatStr);
  }, []);

  const memoizedFormatForSAP = useCallback((date: Date) => {
    return formatForSAP(date);
  }, []);

  const memoizedGetCurrentTimestamp = useCallback(() => {
    return getCurrentTimestamp();
  }, []);

  return { 
    formatDate: memoizedFormatDate, 
    formatForSAP: memoizedFormatForSAP, 
    getCurrentTimestamp: memoizedGetCurrentTimestamp 
  };
};