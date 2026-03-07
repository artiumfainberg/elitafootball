import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CreditCard,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { motion } from 'motion/react';

// Types
import {
  Trainee, Slot, WeeklyAssignment, Debt,
  ActiveTab, PaymentTab, ConfirmState, PayModalState, InputModalState,
  Location
} from './types';

// Hooks
import { useApi } from './hooks/useApi';
import { useWeek } from './hooks/useWeek';
import { useDebts } from './hooks/useDebts';

// Utils
import { formatDate } from './utils/dateUtils';
import { roundTo2, buildPaymentNotes } from './utils/formatUtils';

// Components
import { Login } from './components/auth/Login';
import { ScheduleView } from './components/schedule/ScheduleView';
import { PaymentsView } from './components/payments/PaymentsView';
import { TraineesView } from './components/trainees/TraineesView';
import { ConfirmModal } from './components/common/ConfirmModal';
import { InputModal } from './components/common/InputModal';
import { PayModal } from './components/payments/PayModal';
import { TraineeModal } from './components/trainees/TraineeModal';
import { SlotModal } from './components/schedule/SlotModal';
import { AssignModal } from './components/schedule/AssignModal';
import { PaymentDetailsModal } from './components/payments/PaymentDetailsModal';
import { TraineePickerModal } from './components/common/TraineePickerModal';

// Payment in schedule
import { PaymentModal } from './components/schedule/PaymentModal';

const LS_LAST_AMOUNT = 'elita_last_payment_amount';

type PaymentMethod = 'cash' | 'link';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('elita_auth_token'));
  const [activeTab, setActiveTab] = useState<ActiveTab>('schedule');
  const [paymentTab, setPaymentTab] = useState<PaymentTab>('pending');

  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [weeklyAssignments, setWeeklyAssignments] = useState<WeeklyAssignment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // ✅ NEW: locations + selectedLocation
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const { currentWeekStart, weekDays, nextWeek, prevWeek, goToToday } = useWeek();
  const api = useApi();
  const { unpaidDebtsByTrainee, paidDebtsHistory } = useDebts(debts, trainees);

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Modals
  const [showTraineeModal, setShowTraineeModal] = useState<{ open: boolean; trainee?: Trainee }>({ open: false });
  const [showSlotModal, setShowSlotModal] = useState<{ open: boolean; slot?: Slot }>({ open: false });
  const [showAssignModal, setShowAssignModal] = useState<{ open: boolean; slotId?: number; date?: string }>({ open: false });
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState<{ open: boolean; debt?: Debt }>({ open: false });
  const [showTraineePicker, setShowTraineePicker] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '' });

  const [payModal, setPayModal] = useState<PayModalState>({
    open: false, title: 'סגירת תשלום', ids: [], debtsCount: 0, mode: 'cash', amount: '', link: '',
  });

  const [inputModal, setInputModal] = useState<InputModalState>({
    open: false, title: '', showDate: false, showAmount: false,
  });

  // Payment-in-schedule modal
  const [schedulePaymentModal, setSchedulePaymentModal] = useState<{
    open: boolean;
    assignment?: WeeklyAssignment;
  }>({ open: false });

  const fetchData = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const [tRes, sRes, dRes, lRes] = await Promise.all([
        api.trainees.getAll(),
        api.slots.getAll(),
        api.debts.getAll(),
        api.locations.getAll(), // ✅ NEW
      ]);

      setTrainees(tRes || []);
      setSlots(sRes || []);
      setDebts(dRes || []);

      const locs = (lRes || []) as Location[];
      setLocations(locs);

      // אם אין בחירה עדיין, תבחר מגרש ראשון
      if (!selectedLocation && locs.length > 0) {
        setSelectedLocation(locs[0]);
      } else if (selectedLocation && locs.length > 0) {
        // אם המגרש שנבחר נמחק/לא קיים - fallback
        const stillExists = locs.some((x) => x.id === selectedLocation.id);
        if (!stillExists) setSelectedLocation(locs[0]);
      }

      const end = new Date(currentWeekStart);
      end.setDate(currentWeekStart.getDate() + 6);

      const aRes = await api.weekly.get(formatDate(currentWeekStart), formatDate(end));
      setWeeklyAssignments(aRes || []);
    } catch (e) {
      // Error handled by useApi
    } finally {
      setLoading(false);
      setLastSynced(new Date());
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      api.auth.resetCheck().catch(() => {});
      fetchData();

      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, currentWeekStart]);

  const handleLogin = (token: string) => {
    localStorage.setItem('elita_auth_token', token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('elita_auth_token');
    setIsLoggedIn(false);
  };

  // update paid/unpaid for weekly schedule
  const updateWeeklyPayment = async (params: {
    slotId: number;
    traineeId: number;
    date: string;
    isPaid: boolean;
    amount?: number;
    paymentType?: PaymentMethod;
  }) => {
    const token = localStorage.getItem('elita_auth_token') || '';
    const res = await fetch('/api/weekly/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(txt || 'Failed updating payment');
    }
    return res.json().catch(() => ({}));
  };

  // --- Actions ---
  const handleAddTrainee = async (data: Partial<Trainee>) => {
    await api.trainees.create(data);
    await fetchData();
    setShowTraineeModal({ open: false });
    toast.success('מתאמן נוסף בהצלחה');
  };

  const handleUpdateTrainee = async (id: number, data: Partial<Trainee>) => {
    await api.trainees.update(id, data);
    await fetchData();
    setShowTraineeModal({ open: false });
    toast.success('מתאמן עודכן בהצלחה');
  };

  const handleDeleteTrainee = (id: number) => {
    setConfirmState({
      open: true,
      title: 'מחיקת מתאמן',
      message: 'האם אתה בטוח שברצונך למחוק מתאמן זה?',
      destructive: true,
      confirmText: 'מחק',
      onConfirm: async () => {
        await api.trainees.delete(id);
        await fetchData();
        setConfirmState({ open: false, message: '' });
        toast.success('המתאמן נמחק');
      },
    });
  };

  // ✅ Updated: ensure locationId on new slot
  const handleAddSlot = async (data: Partial<Slot>) => {
    const payload: any = {
      ...data,
      locationId: (data as any)?.locationId ?? selectedLocation?.id ?? 1,
    };
    await api.slots.create(payload);
    await fetchData();
    setShowSlotModal({ open: false });
    toast.success('משבצת נוספה');
  };

  const handleDeleteSlot = (id: number) => {
    setConfirmState({
      open: true,
      title: 'מחיקת משבצת',
      message: 'האם אתה בטוח שברצונך למחוק משבצת זו לצמיתות?',
      destructive: true,
      confirmText: 'מחק',
      onConfirm: async () => {
        await api.slots.delete(id);
        await fetchData();
        setConfirmState({ open: false, message: '' });
        toast.success('המשבצת נמחקה');
      },
    });
  };

  const handleAssignTrainee = async (traineeId: number) => {
    if (!showAssignModal.slotId || !showAssignModal.date) return;
    await api.weekly.assign({ slotId: showAssignModal.slotId, traineeId, date: showAssignModal.date });
    await fetchData();
    setShowAssignModal({ open: false });
    toast.success('שיבוץ בוצע');
  };

  const handleUnassignTrainee = async (slotId: number, traineeId: number, date: string) => {
    await api.weekly.unassign({ slotId, traineeId, date });
    await fetchData();
    toast.success('הסרה בוצעה');
  };

  const handleCancelSession = (slotId: number, date: string) => {
    setConfirmState({
      open: true,
      title: 'ביטול אימון',
      message: 'האם לבטל את האימון בתאריך זה?',
      destructive: true,
      confirmText: 'בטל אימון',
      onConfirm: async () => {
        await api.weekly.cancelSlot({ slotId, date });
        await fetchData();
        setConfirmState({ open: false, message: '' });
        toast.success('האימון בוטל');
      },
    });
  };

  const handleManualReset = () => {
    setConfirmState({
      open: true,
      title: 'איפוס שבועי ידני',
      message: 'האם לבצע איפוס שבועי ידני עכשיו?',
      destructive: true,
      confirmText: 'בצע איפוס',
      onConfirm: async () => {
        const data = await api.auth.resetCheck(true);
        if (data?.resetPerformed) {
          toast.success(`האיפוס בוצע! ${data?.count || 0} הועברו לחובות.`);
        } else {
          toast.info('לא בוצע איפוס');
        }
        await fetchData();
        setConfirmState({ open: false, message: '' });
      },
    });
  };

  const submitPayModal = async () => {
    const amountStr = String(payModal.amount || '').trim();
    if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
      toast.error('סכום לא תקין');
      return;
    }

    const totalAmount = Number(amountStr);
    localStorage.setItem(LS_LAST_AMOUNT, amountStr);

    const count = payModal.debtsCount > 0 ? payModal.debtsCount : payModal.ids.length || 1;
    const perSessionAmount = roundTo2(totalAmount / count);
    const notes = buildPaymentNotes(totalAmount, perSessionAmount, count, payModal.mode === 'link' ? payModal.link : '');

    const payload: Partial<Debt> = {
      status: 'paid',
      paymentType: payModal.mode,
      notes: notes,
    };

    if (payModal.ids.length === 1) {
      payload.amount = totalAmount;
    }

    await api.debts.bulkUpdate({ ids: payModal.ids, ...payload });
    await fetchData();
    setPayModal(p => ({ ...p, open: false }));
    toast.success('תשלום עודכן');
  };

  const handleDeleteDebt = (id: number) => {
    setConfirmState({
      open: true,
      title: 'מחיקת חוב',
      message: 'האם למחוק חוב זה?',
      destructive: true,
      confirmText: 'מחק',
      onConfirm: async () => {
        await api.debts.delete(id);
        await fetchData();
        setConfirmState({ open: false, message: '' });
        toast.success('החוב נמחק');
      },
    });
  };

  const handleAddManualDebt = () => {
    setShowTraineePicker(true);
  };

  const handleTraineeSelectedForDebt = (trainee: Trainee) => {
    setInputModal({
      open: true,
      title: `הוספת חוב ל${trainee.firstName}`,
      showDate: true,
      showAmount: true,
      date: formatDate(new Date()),
      amount: '120',
      onSubmit: async (v) => {
        await api.debts.create({
          traineeId: trainee.id,
          date: v.date,
          amount: v.amount,
          status: 'unpaid'
        });
        await fetchData();
        toast.success(`חוב נוסף ל${trainee.firstName}`);
      }
    });
  };

  // Pay click from schedule
  const handleSchedulePayClick = (assignment: WeeklyAssignment) => {
    const paid = Number((assignment as any).isPaid) === 1;

    if (paid) {
      setConfirmState({
        open: true,
        title: 'ביטול סימון תשלום',
        message: `להחזיר את ${assignment.firstName} ${assignment.lastName} ל"לא שילם"?`,
        destructive: true,
        confirmText: 'הפוך ללא שילם',
        onConfirm: async () => {
          try {
            await updateWeeklyPayment({
              slotId: assignment.slotId,
              traineeId: assignment.traineeId,
              date: assignment.date,
              isPaid: false,
            });
            await fetchData();
            toast.success('עודכן ל"לא שילם"');
          } catch {
            toast.error('שגיאה בעדכון תשלום');
          } finally {
            setConfirmState({ open: false, message: '' });
          }
        },
      });
      return;
    }

    setSchedulePaymentModal({ open: true, assignment });
  };

  const closeSchedulePaymentModal = () => {
    setSchedulePaymentModal({ open: false, assignment: undefined });
  };

  const confirmSchedulePayment = async (amount: number, method: PaymentMethod) => {
    const a = schedulePaymentModal.assignment;
    if (!a) return;

    try {
      await updateWeeklyPayment({
        slotId: a.slotId,
        traineeId: a.traineeId,
        date: a.date,
        isPaid: true,
        amount,
        paymentType: method,
      });
      await fetchData();
      toast.success('סומן כשילם');
      closeSchedulePaymentModal();
    } catch {
      toast.error('שגיאה בעדכון תשלום (בדוק שהשרת עודכן)');
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const paymentDetailsTrainee = showPaymentDetailsModal.debt
    ? trainees.find(t => t.id === showPaymentDetailsModal.debt?.traineeId) || null
    : null;

  const paymentDetailsDebts = showPaymentDetailsModal.debt
    ? debts.filter(d => d.traineeId === showPaymentDetailsModal.debt?.traineeId && d.status === 'unpaid')
    : [];

  const schedulePaymentTraineeName = schedulePaymentModal.assignment
    ? `${schedulePaymentModal.assignment.firstName} ${schedulePaymentModal.assignment.lastName}`
    : '';

  return (
    <div className="min-h-screen bg-luxury-cream text-luxury-black font-sans flex flex-col selection:bg-gold-100" dir="rtl">
      <Toaster position="top-center" richColors />

      {/* Sync Status Bar */}
      <div className="bg-luxury-black text-[10px] text-gold-400/60 py-1 px-4 flex justify-between items-center border-b border-gold-900/20">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold uppercase tracking-widest">מחובר לענן</span>
        </div>
        <div className="flex items-center gap-3">
          {lastSynced && (
            <span>סונכרן לאחרונה: {lastSynced.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
          )}
          <button
            onClick={() => fetchData()}
            className="hover:text-gold-400 transition-colors flex items-center gap-1"
            disabled={loading}
          >
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            <span>רענן</span>
          </button>
        </div>
      </div>

      {loading && !lastSynced && (
        <div className="fixed inset-0 bg-luxury-cream/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <RefreshCw className="text-gold-500 animate-spin" size={40} />
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {activeTab === 'schedule' && (
          <ScheduleView
            weekDays={weekDays}
            slots={slots}
            assignments={weeklyAssignments}
            onPrevWeek={prevWeek}
            onNextWeek={nextWeek}
            onToday={goToToday}
            onAssign={(slotId, date) => setShowAssignModal({ open: true, slotId, date })}
            onUnassign={handleUnassignTrainee}
            onCancel={handleCancelSession}
            onDeleteSlot={handleDeleteSlot}
            onAddSlot={() => setShowSlotModal({ open: true })}
            onManualReset={handleManualReset}
            onPayClick={handleSchedulePayClick}

            // ✅ NEW props for locations
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            activeTab={paymentTab}
            onTabChange={setPaymentTab}
            unpaidDebts={unpaidDebtsByTrainee}
            paidDebts={paidDebtsHistory}
            onPay={(trainee, debts, mode) => setPayModal({
              open: true,
              title: 'סגירת תשלום',
              traineeName: `${trainee.firstName} ${trainee.lastName}`,
              ids: debts.map(d => d.id),
              debtsCount: debts.length,
              mode,
              amount: localStorage.getItem(LS_LAST_AMOUNT) || '120',
              link: '',
            })}
            onShowDetails={(debt) => setShowPaymentDetailsModal({ open: true, debt })}
            onDeleteDebt={handleDeleteDebt}
            onAddManualDebt={handleAddManualDebt}
          />
        )}

        {activeTab === 'trainees' && (
          <TraineesView
            trainees={trainees.filter(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddTrainee={() => setShowTraineeModal({ open: true })}
            onEditTrainee={(t) => setShowTraineeModal({ open: true, trainee: t })}
            onDeleteTrainee={handleDeleteTrainee}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-luxury-white border-t border-gold-100 pb-safe pt-2 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <NavButton id="schedule" icon={Calendar} label="לו״ז" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <NavButton id="payments" icon={CreditCard} label="תשלומים" active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
          <NavButton id="trainees" icon={Users} label="מתאמנים" active={activeTab === 'trainees'} onClick={() => setActiveTab('trainees')} />
        </div>
      </nav>

      {/* Modals */}
      <ConfirmModal state={confirmState} onClose={() => setConfirmState(p => ({ ...p, open: false }))} />
      <InputModal state={inputModal} onClose={() => setInputModal(p => ({ ...p, open: false }))} setState={setInputModal} />
      <PayModal state={payModal} onClose={() => setPayModal(p => ({ ...p, open: false }))} setState={setPayModal} onSubmit={submitPayModal} />

      <PaymentModal
        open={schedulePaymentModal.open}
        onClose={closeSchedulePaymentModal}
        onConfirm={confirmSchedulePayment}
        traineeName={schedulePaymentTraineeName}
        defaultAmount={Number(localStorage.getItem(LS_LAST_AMOUNT) || '120')}
      />

      <TraineeModal
        isOpen={showTraineeModal.open}
        onClose={() => setShowTraineeModal({ open: false })}
        trainee={showTraineeModal.trainee}
        onSubmit={async (data) => {
          if (showTraineeModal.trainee) await handleUpdateTrainee(showTraineeModal.trainee.id, data);
          else await handleAddTrainee(data);
        }}
      />

      <SlotModal 
  isOpen={showSlotModal.open}
  onClose={() => setShowSlotModal({ open: false })}
  onSubmit={handleAddSlot}
  locations={locations}
  selectedLocationId={selectedLocation?.id ?? 1}
/>

      <AssignModal
        isOpen={showAssignModal.open}
        onClose={() => setShowAssignModal({ open: false })}
        trainees={trainees}
        onAssign={handleAssignTrainee}
      />

      <PaymentDetailsModal
        isOpen={showPaymentDetailsModal.open}
        onClose={() => setShowPaymentDetailsModal({ open: false })}
        trainee={paymentDetailsTrainee}
        debts={paymentDetailsDebts}
        onDeleteDebt={handleDeleteDebt}
      />

      <TraineePickerModal
        isOpen={showTraineePicker}
        onClose={() => setShowTraineePicker(false)}
        trainees={trainees}
        onSelect={handleTraineeSelectedForDebt}
        title="בחירת מתאמן להוספת חוב"
      />
    </div>
  );
};

const NavButton = ({ id, icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 px-6 transition-all relative min-w-[80px] ${
      active ? 'text-gold-600' : 'text-slate-400 hover:text-gold-400'
    }`}
  >
    <Icon size={24} strokeWidth={active ? 2 : 1.5} />
    <span className={`text-[11px] mt-1.5 font-extrabold uppercase tracking-[0.15em] ${active ? 'opacity-100' : 'opacity-60'}`}>
      {label}
    </span>
    {active && <motion.div layoutId="tab-indicator" className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[3px] bg-gold-500 rounded-full" />}
  </button>
);

export default App;