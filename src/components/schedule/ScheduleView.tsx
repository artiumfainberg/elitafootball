import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { Slot, WeeklyAssignment } from '../../types';
import { SlotCard } from './SlotCard';
import { formatDate, getDayName, DAYS_HEBREW } from '../../utils/dateUtils';
import { cn } from '../../utils/formatUtils';
import { motion } from 'motion/react';

interface ScheduleViewProps {
  weekDays: Date[];
  slots: Slot[];
  assignments: WeeklyAssignment[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onAssign: (slotId: number, date: string) => void;
  onUnassign: (slotId: number, traineeId: number, date: string) => void;
  onCancel: (slotId: number, date: string) => void;
  onDeleteSlot: (slotId: number) => void;
  onAddSlot: () => void;
  onManualReset: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  weekDays,
  slots,
  assignments,
  onPrevWeek,
  onNextWeek,
  onToday,
  onAssign,
  onUnassign,
  onCancel,
  onDeleteSlot,
  onAddSlot,
  onManualReset,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = React.useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const idx = weekDays.findIndex(d => {
      const dd = new Date(d);
      dd.setHours(0, 0, 0, 0);
      return dd.getTime() === today.getTime();
    });
    return idx === -1 ? 0 : idx;
  });

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="serif text-3xl md:text-4xl font-bold text-luxury-black mb-1 md:mb-2">לוח אימונים</h1>
            <p className="text-slate-500 font-medium italic serif text-sm md:text-base">ניהול שיבוצים שבועי</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="flex bg-luxury-white rounded-full p-1 shadow-sm border border-gold-100">
              <button onClick={onPrevWeek} className="p-2 hover:bg-gold-50 rounded-full transition-colors text-gold-600">
                <ChevronRight size={18} />
              </button>
              <button
                onClick={onToday}
                className="px-4 md:px-6 py-2 text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest text-luxury-black hover:text-gold-600 transition-colors"
              >
                השבוע
              </button>
              <button onClick={onNextWeek} className="p-2 hover:bg-gold-50 rounded-full transition-colors text-gold-600">
                <ChevronLeft size={18} />
              </button>
            </div>

            <button
              onClick={onAddSlot}
              className="bg-luxury-black text-gold-400 px-4 md:px-6 py-2.5 md:py-3 rounded-full font-extrabold text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-gold-900 transition-all shadow-lg flex items-center gap-2"
            >
              <CalendarIcon size={14} />
              <span className="hidden xs:inline">הוסף משבצת</span>
              <span className="xs:hidden">הוסף</span>
            </button>

            <button
              onClick={onManualReset}
              className="bg-rose-50 text-rose-600 border border-rose-100 px-4 md:px-6 py-2.5 md:py-3 rounded-full font-extrabold text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <RefreshCw size={14} />
              <span className="hidden xs:inline">איפוס שבועי</span>
              <span className="xs:hidden">איפוס</span>
            </button>
          </div>
        </div>

        {/* Mobile Day Selector */}
        <div className="flex md:hidden overflow-x-auto no-scrollbar gap-2 mb-8 pb-2">
          {weekDays.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDayIdx(idx)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 rounded-2xl transition-all border",
                selectedDayIdx === idx 
                  ? "bg-luxury-black border-luxury-black text-gold-400 shadow-lg scale-105" 
                  : "bg-luxury-white border-gold-100 text-slate-400"
              )}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-tighter mb-1">
                {DAYS_HEBREW[idx].substring(0, 3)}
              </span>
              <span className="serif text-xl font-bold">
                {day.getDate()}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {weekDays.map((day, idx) => {
            const dateStr = formatDate(day);
            const daySlots = slots.filter((s) => s.dayOfWeek === idx);
            const isVisible = selectedDayIdx === idx;

            return (
              <div 
                key={dateStr} 
                className={cn(
                  "flex flex-col gap-4",
                  !isVisible && "hidden md:flex"
                )}
              >
                <div className="text-center pb-4 border-b border-gold-100 hidden md:block">
                  <div className="text-[10px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-1">
                    {DAYS_HEBREW[idx]}
                  </div>
                  <div className="serif text-xl font-bold text-luxury-black">
                    {day.getDate()}.{day.getMonth() + 1}
                  </div>
                </div>

                <div className="space-y-4">
                  {daySlots.map((slot) => (
                    <SlotCard
                      key={slot.id}
                      slot={slot}
                      date={dateStr}
                      assignments={assignments}
                      onAssign={onAssign}
                      onUnassign={onUnassign}
                      onCancel={onCancel}
                      onDelete={onDeleteSlot}
                    />
                  ))}
                  {daySlots.length === 0 && (
                    <div className="py-12 md:py-8 text-center text-slate-300 italic text-sm md:text-xs serif bg-luxury-white/30 rounded-3xl border border-dashed border-gold-100">
                      אין משבצות ליום זה
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
