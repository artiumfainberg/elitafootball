import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../common/Modal';
import { Trainee } from '../../types';
import { Contact } from 'lucide-react';
import { toast } from 'sonner';

interface TraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee?: Trainee;
  onSubmit: (data: Partial<Trainee>) => Promise<void>;
}

// small util
const cleanPhone = (s: string) =>
  String(s || '')
    .replace(/\s+/g, '')
    .replace(/[()-]/g, '');

const splitName = (fullName: string) => {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

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

  // ✅ Contact picker support
  const [isContactPickerSupported, setIsContactPickerSupported] = useState(false);

  useEffect(() => {
    // check support when modal opens
    if (!isOpen) return;

    // Web Contact Picker API (not supported everywhere)
    const supported =
      typeof navigator !== 'undefined' &&
      // @ts-ignore
      'contacts' in navigator &&
      // @ts-ignore
      typeof (navigator as any).contacts?.select === 'function';

    setIsContactPickerSupported(Boolean(supported));
  }, [isOpen]);

  useEffect(() => {
    if (trainee) {
      setFormData(trainee);
    } else {
      setFormData({ firstName: '', lastName: '', phone: '', notes: '' });
    }
  }, [trainee, isOpen]);

  const handlePickContact = async () => {
    try {
      // @ts-ignore
      const contactsApi = (navigator as any).contacts;

      if (!contactsApi?.select) {
        toast.error('המכשיר לא תומך בייבוא אנשי קשר');
        return;
      }

      // request name + tel
      const result = await contactsApi.select(['name', 'tel'], { multiple: false });

      const c = Array.isArray(result) ? result[0] : null;
      if (!c) return;

      const fullName =
        (Array.isArray(c.name) ? c.name[0] : c.name) ||
        '';

      const tel =
        (Array.isArray(c.tel) ? c.tel[0] : c.tel) ||
        '';

      const { firstName, lastName } = splitName(fullName);

      setFormData((p) => ({
        ...p,
        firstName: firstName || p.firstName || '',
        lastName: lastName || p.lastName || '',
        phone: cleanPhone(tel) || p.phone || '',
      }));

      toast.success('פרטי איש קשר נטענו');
    } catch (e: any) {
      // user cancelled usually throws
      if (String(e?.name || '').toLowerCase().includes('abort')) return;
      toast.error('לא הצלחנו לייבא אנשי קשר');
    }
  };

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

        {/* ✅ Add from contacts (only new trainee + supported) */}
        {!trainee && isContactPickerSupported && (
          <button
            type="button"
            onClick={handlePickContact}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-gold-50 text-gold-700 rounded-2xl border border-gold-200 font-extrabold text-[11px] uppercase tracking-widest hover:bg-gold-100 transition-all mb-2"
          >
            <Contact size={16} />
            הוספה מאנשי קשר
          </button>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">שם פרטי</label>
            <input
              required
              value={formData.firstName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">שם משפחה</label>
            <input
              required
              value={formData.lastName || ''}
              onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">טלפון</label>
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-3 px-5 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all"
          />
        </div>

        <div>
          <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">הערות</label>
          <textarea
            rows={3}
            value={formData.notes || ''}
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