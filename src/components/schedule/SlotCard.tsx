import React from "react";
import { Clock, Plus, Trash2, XCircle, DollarSign, Check } from "lucide-react";
import { Slot, WeeklyAssignment } from "../../types";
import { formatTime } from "../../utils/dateUtils";

interface SlotCardProps {
  slot: Slot;
  date: string;
  assignments: WeeklyAssignment[];
  onAssign: (slotId: number, date: string) => void;
  onUnassign: (slotId: number, traineeId: number, date: string) => void;
  onCancel: (slotId: number, date: string) => void;
  onDelete: (slotId: number) => void;

  // ✅ NEW: open payment flow / toggle paid
  onPayClick: (assignment: WeeklyAssignment) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  date,
  assignments,
  onAssign,
  onUnassign,
  onCancel,
  onDelete,
  onPayClick,
}) => {
  const slotAssignments = assignments.filter((a) => a.slotId === slot.id && a.date === date);

  return (
    <div className="bg-luxury-white rounded-3xl p-5 border border-gold-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gold-600">
          <Clock size={16} />
          <span className="font-bold tracking-tighter text-sm">
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onCancel(slot.id, date)}
            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
            title="ביטול אימון"
          >
            <XCircle size={16} />
          </button>

          <button
            onClick={() => onDelete(slot.id)}
            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
            title="מחיקת משבצת מהלו״ז"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {slotAssignments.map((a) => {
          const paid = Number((a as any).isPaid) === 1; // כדי שלא ישבור עד שתעדכן types

          return (
            <div
              key={`${a.slotId}-${a.traineeId}-${a.date}`}
              className="flex items-center justify-between bg-gold-50/50 rounded-xl py-2 px-3 border border-gold-100/50 group/item"
            >
              <span className="font-bold text-xs text-luxury-black">
                {a.firstName} {a.lastName}
              </span>

              <div className="flex items-center gap-2">
                {/* ✅ Pay button */}
                <button
                  onClick={() => onPayClick(a)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    paid
                      ? "bg-emerald-500/20 text-emerald-600"
                      : "bg-luxury-white text-slate-400 hover:text-gold-700 border border-gold-100"
                  }`}
                  title={paid ? "סומן כשילם (לחץ לביטול/עריכה)" : "סמן תשלום"}
                >
                  {paid ? <Check size={14} /> : <DollarSign size={14} />}
                </button>

                {/* Unassign */}
                <button
                  onClick={() => onUnassign(slot.id, a.traineeId, date)}
                  className="text-slate-300 hover:text-rose-500 transition-colors opacity-100 md:opacity-0 group-hover/item:opacity-100"
                  title="הסר מהמשבצת"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => onAssign(slot.id, date)}
          className="w-full py-2.5 border-2 border-dashed border-gold-200 rounded-xl text-gold-400 hover:border-gold-400 hover:text-gold-600 transition-all flex items-center justify-center gap-2 group/btn"
        >
          <Plus size={16} className="group-hover/btn:scale-110 transition-transform" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">שבץ מתאמן</span>
        </button>
      </div>
    </div>
  );
};