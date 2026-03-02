import React from 'react';
import { Modal } from './Modal';
import { InputModalState } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { toast } from 'sonner';

interface InputModalProps {
  state: InputModalState;
  onClose: () => void;
  setState: React.Dispatch<React.SetStateAction<InputModalState>>;
}

export const InputModal: React.FC<InputModalProps> = ({ state, onClose, setState }) => {
  return (
    <Modal
      isOpen={state.open}
      onClose={onClose}
      title={state.title}
    >
      {state.description && (
        <div className="mb-6 text-slate-600 font-medium leading-relaxed">
          {state.description}
        </div>
      )}

      <div className="space-y-4">
        {state.showDate && (
          <div>
            <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">
              תאריך
            </label>
            <input
              type="date"
              value={state.date || formatDate(new Date())}
              onChange={(e) => setState((p) => ({ ...p, date: e.target.value }))}
              className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all tracking-widest"
            />
          </div>
        )}

        {state.showAmount && (
          <div>
            <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">
              סכום (₪)
            </label>
            <input
              inputMode="decimal"
              value={state.amount || ''}
              onChange={(e) => setState((p) => ({ ...p, amount: e.target.value }))}
              placeholder="לדוגמה: 120"
              className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all tracking-widest"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-full border border-gold-100 text-slate-500 font-extrabold text-[11px] uppercase tracking-widest hover:bg-gold-50 transition-all"
        >
          ביטול
        </button>

        <button
          type="button"
          onClick={async () => {
            const date = state.showDate ? String(state.date || '').trim() : undefined;
            const amountStr = state.showAmount ? String(state.amount || '').trim() : undefined;

            if (state.showDate && !date) {
              toast.error('נא לבחור תאריך');
              return;
            }
            if (state.showAmount) {
              if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) < 0) {
                toast.error('נא להזין סכום תקין');
                return;
              }
            }

            try {
              await state.onSubmit?.({
                date,
                amount: amountStr !== undefined ? Number(amountStr) : undefined,
              });
              onClose();
            } catch (e: any) {
              // Error handled by useApi/toast
            }
          }}
          className="flex-1 py-3 rounded-full bg-luxury-black text-gold-400 hover:bg-gold-900 font-extrabold text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
        >
          {state.submitText || 'שמור'}
        </button>
      </div>
    </Modal>
  );
};
