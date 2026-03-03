import React from 'react';
import { Modal } from './Modal';
import { ConfirmState } from '../../types';

interface ConfirmModalProps {
  state: ConfirmState;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ state, onClose }) => {
  return (
    <Modal
      isOpen={state.open}
      onClose={onClose}
      title={state.title || 'אישור פעולה'}
    >
      <div className="mb-4">
        <div className="mt-2 text-slate-600 font-medium leading-relaxed">
          {state.message}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-full border border-gold-100 text-slate-500 font-extrabold text-[11px] uppercase tracking-widest hover:bg-gold-50 transition-all"
        >
          {state.cancelText || 'ביטול'}
        </button>

        <button
          type="button"
          onClick={async () => {
            try {
              await state.onConfirm?.();
            } catch (e) {
              console.error('[Confirm onConfirm failed]', e);
            }
          }}
          className={`flex-1 py-3 rounded-full font-extrabold text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
            state.destructive
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-luxury-black text-gold-400 hover:bg-gold-900'
          }`}
        >
          {state.confirmText || 'אישור'}
        </button>
      </div>
    </Modal>
  );
};
