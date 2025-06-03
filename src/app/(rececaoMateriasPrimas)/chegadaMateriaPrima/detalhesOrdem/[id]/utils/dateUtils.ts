import { format } from "date-fns";
import { pt } from "date-fns/locale";

export const formatDate = (date: string | Date, formatStr: string = "P"): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: pt });
};

export const formatForSAP = (date: Date): string => {
  return format(date, "yyyyMMdd");
};

export const getCurrentTimestamp = (): string => {
  return format(new Date(), "PPpp", { locale: pt });
};