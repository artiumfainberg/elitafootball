import { useState, useMemo } from 'react';
import { getWeekRange, getWeekDays } from '../utils/dateUtils';

export const useWeek = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekRange(new Date()).start);

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekRange(new Date()).start);
  };

  return {
    currentWeekStart,
    setCurrentWeekStart,
    weekDays,
    nextWeek,
    prevWeek,
    goToToday,
  };
};
