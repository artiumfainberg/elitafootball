import React from 'react';
import { Users, Search, Plus, Phone, Edit2, Trash2 } from 'lucide-react';
import { Trainee } from '../../types';
import { motion } from 'motion/react';

interface TraineesViewProps {
  trainees: Trainee[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddTrainee: () => void;
  onEditTrainee: (t: Trainee) => void;
  onDeleteTrainee: (id: number) => void;
}

export const TraineesView: React.FC<TraineesViewProps> = ({
  trainees,
  searchQuery,
  onSearchChange,
  onAddTrainee,
  onEditTrainee,
  onDeleteTrainee,
}) => {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="serif text-3xl md:text-4xl font-bold text-luxury-black mb-1 md:mb-2">ניהול מתאמנים</h1>
            <p className="text-slate-500 font-medium italic serif text-sm md:text-base">מאגר לקוחות ופרטי קשר</p>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 md:gap-4">
            <div className="relative group flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="חיפוש..."
                className="bg-luxury-white border border-gold-100 rounded-full py-2.5 md:py-3 pr-12 pl-6 w-full md:w-64 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all shadow-sm text-sm md:text-base"
              />
            </div>

            <button
              onClick={onAddTrainee}
              className="bg-luxury-black text-gold-400 px-6 md:px-8 py-2.5 md:py-3 rounded-full font-extrabold text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-gold-900 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span>מתאמן חדש</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {trainees.map((trainee) => (
            <motion.div
              key={trainee.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-luxury-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gold-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-50/30 rounded-full -translate-y-16 translate-x-16" />
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gold-50 rounded-2xl flex items-center justify-center border border-gold-100 serif text-xl font-bold text-gold-600">
                    {trainee.firstName[0]}
                  </div>
                  <div>
                    <h3 className="serif text-xl font-bold text-luxury-black">
                      {trainee.firstName} {trainee.lastName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mt-1">
                      <Phone size={12} />
                      <span>{trainee.phone}</span>
                    </div>
                  </div>
                </div>

                {trainee.notes && (
                  <div className="bg-gold-50/50 rounded-2xl p-4 mb-6 border border-gold-100/50">
                    <p className="text-xs text-slate-600 leading-relaxed italic">{trainee.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEditTrainee(trainee)}
                    className="flex-1 py-2.5 rounded-full border border-gold-100 text-slate-500 font-extrabold text-[10px] uppercase tracking-widest hover:bg-gold-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} />
                    עריכה
                  </button>
                  <button
                    onClick={() => onDeleteTrainee(trainee.id)}
                    className="flex-1 py-2.5 rounded-full border border-rose-100 text-rose-500 font-extrabold text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    מחיקה
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {trainees.length === 0 && (
            <div className="col-span-full bg-luxury-white rounded-[2.5rem] p-16 text-center border border-gold-100 shadow-sm">
              <div className="w-20 h-20 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-100">
                <Users className="text-gold-400" size={32} />
              </div>
              <h3 className="serif text-2xl font-bold text-luxury-black mb-2">לא נמצאו מתאמנים</h3>
              <p className="text-slate-500 font-medium italic serif">נסה לשנות את החיפוש או להוסיף מתאמן חדש</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
