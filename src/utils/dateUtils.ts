import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

export const DAYS_HEBREW = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return { start, end };
};

export const formatDate = (d: Date | string) => {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (d: Date | string) => {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'dd/MM/yyyy');
};

export const formatTime = (time: string) => {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length < 2) return time;
  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getWeekDays = (start: Date) => {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const getDayName = (date: Date) => {
  return format(date, 'EEEE', { locale: he });
};
