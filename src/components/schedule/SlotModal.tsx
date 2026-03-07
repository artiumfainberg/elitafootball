import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Slot, Location } from '../../types';
import { DAYS_HEBREW } from '../../utils/dateUtils';

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot?: Slot;
  onSubmit: (data: Partial<Slot>) => Promise<void>;

  /** ✅ New */
  locations: Location[];
  selectedLocationId: number; // fallback/default
}

const TimeSelect = ({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (val: string) => void
}) => {
  const [h, m] = (value || '00:00').split(':');

  return (
    <div>
      <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">{label}</label>
      <div className="flex items-center bg-gold-50/30 border border-gold-100 rounded-2xl py-1 px-2 focus-within:ring-4 focus-within:ring-gold-500/5 focus-within:border-gold-400 transition-all">
        <select
          value={h}
          onChange={(e) => onChange(`${e.target.value}:${m}`)}
          className="bg-transparent outline-none font-bold py-2 px-2 flex-1 text-center appearance-none cursor-pointer"
        >
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <span className="font-bold text-gold-300 mx-1">:</span>
        <select
          value={m}
          onChange={(e) => onChange(`${h}:${e.target.value}`)}
          className="bg-transparent outline-none font-bold py-2 px-2 flex-1 text-center appearance-none cursor-pointer"
        >
          {MINUTES.map((min) => (
            <option key={min} value={min}>
              {min}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const SlotModal: React.FC<SlotModalProps> = ({
  isOpen,
  onClose,
  slot,
  onSubmit,
  locations,
  selectedLocationId,
}) => {
  const [formData, setFormData] = useState<Partial<Slot>>({
    dayOfWeek: 0,
    startTime: '16:00',
    endTime: '17:00',
    locationId: selectedLocationId,
  });

  useEffect(() => {
    if (slot) {
      setFormData(slot);
    } else {
      setFormData({
        dayOfWeek: 0,
        startTime: '16:00',
        endTime: '17:00',
        locationId: selectedLocationId,
      });
    }
  }, [slot, isOpen, selectedLocationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // guarantee locationId
    const locationId = (formData as any).locationId ?? selectedLocationId;

    await onSubmit({
      ...formData,
      locationId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={slot ? 'עריכת משבצת' : 'משבצת חדשה'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Location */}
        <div>
          <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">
            מגרש
          </label>

          <select
            value={(formData as any).locationId ?? selectedLocationId}
            onChange={(e) => setFormData((p) => ({ ...p, locationId: Number(e.target.value) } as any))}
            className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          {locations.length === 0 && (
            <div className="text-xs text-slate-400 italic mt-2">אין מגרשים (בדוק את השרת)</div>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">יום בשבוע</label>
          <select
            value={formData.dayOfWeek}
            onChange={(e) => setFormData((p) => ({ ...p, dayOfWeek: Number(e.target.value) }))}
            className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
          >
            {DAYS_HEBREW.map((day, idx) => (
              <option key={idx} value={idx}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TimeSelect
            label="שעת התחלה"
            value={formData.startTime || '16:00'}
            onChange={(val) => setFormData((p) => ({ ...p, startTime: val }))}
          />
          <TimeSelect
            label="שעת סיום"
            value={formData.endTime || '17:00'}
            onChange={(val) => setFormData((p) => ({ ...p, endTime: val }))}
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