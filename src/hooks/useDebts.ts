import { useMemo } from 'react';
import { Debt, Trainee } from '../types';

export const useDebts = (debts: Debt[], trainees: Trainee[]) => {
  const unpaidDebtsByTrainee = useMemo(() => {
    const grouped: Record<number, { trainee: Trainee; debts: Debt[] }> = {};
    debts
      .filter((d) => d.status === 'unpaid')
      .forEach((d) => {
        if (!grouped[d.traineeId]) {
          const trainee = trainees.find((t) => t.id === d.traineeId);
          if (trainee) grouped[d.traineeId] = { trainee, debts: [] };
        }
        if (grouped[d.traineeId]) grouped[d.traineeId].debts.push(d);
      });
    return Object.values(grouped).sort((a, b) => b.debts.length - a.debts.length);
  }, [debts, trainees]);

  const paidDebtsHistory = useMemo(() => {
    return debts
      .filter((d) => d.status === 'paid')
      .map((d) => ({
        ...d,
        trainee: trainees.find((t) => t.id === d.traineeId),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [debts, trainees]);

  return {
    unpaidDebtsByTrainee,
    paidDebtsHistory,
  };
};
