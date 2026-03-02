import React from 'react';
import { Modal } from '../common/Modal';
import { Debt, Trainee } from '../../types';
import { formatDisplayDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatUtils';
import { Trash2, Calendar } from 'lucide-react';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee: Trainee | null;
  debts: Debt[];
  onDeleteDebt: (id: number) => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  isOpen,
  onClose,
  trainee,
  debts,
  onDeleteDebt,
}) => {
  if (!trainee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`פירוט חובות: ${trainee.firstName} ${trainee.lastName}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 pr-1">
        {debts.map((debt) => (
          <div
            key={debt.id}
            className="bg-gold-50/30 border border-gold-100 rounded-2xl p-5 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-luxury-white rounded-xl flex items-center justify-center border border-gold-100 text-gold-600">
                <Calendar size={18} />
              </div>
              <div>
                <div className="font-bold text-luxury-black">{formatDisplayDate(debt.date)}</div>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
                  {formatCurrency(debt.amount)}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDeleteDebt(debt.id)}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {debts.length === 0 && (
          <div className="py-12 text-center text-slate-400 italic serif">אין חובות רשומים</div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gold-100 flex items-center justify-between">
        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">סה״כ לתשלום:</div>
        <div className="text-2xl serif font-bold text-rose-600">
          {formatCurrency(debts.reduce((sum, d) => sum + (d.amount || 0), 0))}
        </div>
      </div>
    </Modal>
  );
};
