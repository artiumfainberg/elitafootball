import React from 'react';
import { Modal } from '../common/Modal';
import { PayModalState } from '../../types';
import { Banknote, Link as LinkIcon } from 'lucide-react';

interface PayModalProps {
  state: PayModalState;
  onClose: () => void;
  setState: React.Dispatch<React.SetStateAction<PayModalState>>;
  onSubmit: () => Promise<void>;
}

export const PayModal: React.FC<PayModalProps> = ({
  state,
  onClose,
  setState,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={state.open}
      onClose={onClose}
      title={state.title}
    >
      <div className="mb-6">
        <div className="mt-2 text-slate-600 font-medium leading-relaxed">
          {state.traineeName ? (
            <>
              {state.traineeName} • {state.debtsCount} אימונים
            </>
          ) : (
            <>{state.debtsCount} אימונים</>
          )}
        </div>
      </div>

      <div className="flex bg-gold-50/60 p-1 rounded-2xl border border-gold-100 mb-6">
        <button
          type="button"
          onClick={() => setState((p) => ({ ...p, mode: 'cash' }))}
          className={`flex-1 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            state.mode === 'cash' ? 'bg-luxury-black text-gold-400 shadow-lg' : 'text-slate-400 hover:text-gold-600'
          }`}
        >
          <Banknote size={14} />
          מזומן
        </button>
        <button
          type="button"
          onClick={() => setState((p) => ({ ...p, mode: 'link' }))}
          className={`flex-1 py-3 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            state.mode === 'link' ? 'bg-luxury-black text-gold-400 shadow-lg' : 'text-slate-400 hover:text-gold-600'
          }`}
        >
          <LinkIcon size={14} />
          לינק
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">סכום לתשלום (₪)</label>
          <input
            inputMode="decimal"
            value={state.amount}
            onChange={(e) => setState((p) => ({ ...p, amount: e.target.value }))}
            className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all tracking-widest"
          />
        </div>

        {state.mode === 'link' && (
          <div>
            <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">לינק לתשלום (אופציונלי)</label>
            <input
              value={state.link}
              onChange={(e) => setState((p) => ({ ...p, link: e.target.value }))}
              placeholder="הדבק לינק כאן..."
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
          onClick={onSubmit}
          className="flex-1 py-3 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
        >
          סגור תשלום
        </button>
      </div>
    </Modal>
  );
};
