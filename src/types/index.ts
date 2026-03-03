export interface Trainee {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  notes?: string;
}

export interface Slot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface WeeklyAssignment {
  slotId: number;
  traineeId: number;
  date: string;
  firstName?: string;
  lastName?: string;
}

export interface Debt {
  id: number;
  traineeId: number;
  date: string;
  status: 'unpaid' | 'paid';
  paymentType?: 'cash' | 'link';
  amount: number; // Stored in agorot/cents (integer) ideally, but currently float in DB. I will migrate it to integer.
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
