export interface Trainee {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  notes?: string;
}

/** ✅ New: Location (migrash) */
export interface Location {
  id: number;
  name: string;
}

export interface Slot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;

  /** ✅ New: which location this slot belongs to */
  locationId: number;
}

export interface WeeklyAssignment {
  slotId: number;
  traineeId: number;
  date: string; // YYYY-MM-DD
  firstName?: string;
  lastName?: string;

  /** ✅ From weekly_trainees (wt.*) */
  isPaid?: number; // 0/1
  paymentType?: 'cash' | 'link' | null;
  amount_agorot?: number; // e.g. 12000
}

export interface Debt {
  id: number;
  traineeId: number;
  date: string;
  status: 'unpaid' | 'paid';
  paymentType?: 'cash' | 'link';
  amount: number; // server returns d.amount_agorot / 100.0 as amount (shekels)
  notes?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export type ActiveTab = 'schedule' | 'payments' | 'trainees';
export type PaymentTab = 'pending' | 'history';

export interface ConfirmState {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm?: () => void | Promise<void>;
}

export interface PayModalState {
  open: boolean;
  title: string;
  traineeName?: string;
  ids: number[];
  debtsCount: number;
  mode: 'cash' | 'link';
  amount: string;
  link: string;
}

export interface InputModalState {
  open: boolean;
  title: string;
  description?: string;
  date?: string;
  amount?: string;
  showDate?: boolean;
  showAmount?: boolean;
  submitText?: string;
  onSubmit?: (v: { date?: string; amount?: number }) => void | Promise<void>;
}