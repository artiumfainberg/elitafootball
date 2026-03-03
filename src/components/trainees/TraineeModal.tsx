import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Trainee } from '../../types';

interface TraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee?: Trainee;
  onSubmit: (data: Partial<Trainee>) => Promise<void>;
}

export const TraineeModal: React.FC<TraineeModalProps> = ({
  isOpen,
  onClose,
  trainee,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<Trainee>>({
    firstName: '',
    lastName: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (trainee) {
      setFormData(trainee);
    } else {
      setFormData({ firstName: '', lastName: '', phone: '', notes: '' });
    }
  }, [trainee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={trainee ? 'עריכת מתאמן' : 'מתאמן חדש'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">שם פרטי</label>
            <input
              required
              value={formData.firstName}
              onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">שם משפחה</label>
            <input
              required
              value={formData.lastName}
              onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">טלפון</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">הערות</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
            className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all resize-none"
          />
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
            type="submit"
            className="flex-1 py-3 rounded-full bg-luxury-black text-gold-400 hover:bg-gold-900 font-extrabold text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
          >
            שמור
          </button>
        </div>
      </form>
    </Modal>
  );
};
