import React, { useMemo, useState } from 'react';
import { Modal } from '../common/Modal';
import { Trainee } from '../../types';
import { Search, UserPlus } from 'lucide-react';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainees: Trainee[];
  onAssign: (traineeId: number) => Promise<void>;

  // ✅ NEW
  onAddNewTrainee: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  trainees,
  onAssign,
  onAddNewTrainee,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trainees.filter(t =>
      `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) ||
      (t.phone || '').includes(search)
    );
  }, [trainees, search]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="שיבוץ מתאמן"
    >
      {/* Search + quick add button */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש מתאמן..."
            autoFocus
            className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 pr-12 pl-6 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
          />
        </div>

        <button
          type="button"
          onClick={onAddNewTrainee}
          className="shrink-0 w-12 h-12 rounded-2xl bg-luxury-black text-gold-400 hover:bg-gold-900 transition-all shadow-lg flex items-center justify-center active:scale-95"
          title="הוסף מתאמן חדש"
        >
          <UserPlus size={18} />
        </button>
      </div>

      <div className="space-y-2 pr-1">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => onAssign(t.id)}
            className="w-full flex items-center justify-between p-4 bg-luxury-white border border-gold-100 rounded-2xl hover:bg-gold-50 hover:border-gold-300 transition-all group"
          >
            <div className="text-right">
              <div className="font-bold text-luxury-black">{t.firstName} {t.lastName}</div>
              <div className="text-[10px] text-slate-400 font-medium">{t.phone}</div>
            </div>
            <UserPlus size={18} className="text-gold-400 group-hover:text-gold-600 transition-colors" />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-slate-400 italic serif">לא נמצאו מתאמנים</div>
        )}
      </div>
    </Modal>
  );
};