import React from 'react';
import { CreditCard, Banknote, Link as LinkIcon, Trash2, Edit2, Search, Plus } from 'lucide-react';
import { Debt, Trainee, PaymentTab } from '../../types';
import { formatDisplayDate } from '../../utils/dateUtils';
import { formatCurrency, cn } from '../../utils/formatUtils';
import { motion } from 'motion/react';

interface PaymentsViewProps {
  activeTab: PaymentTab;
  onTabChange: (tab: PaymentTab) => void;
  unpaidDebts: { trainee: Trainee; debts: Debt[] }[];
  paidDebts: (Debt & { trainee?: Trainee })[];
  onPay: (trainee: Trainee, debts: Debt[], mode: 'cash' | 'link') => void;
  onShowDetails: (debt: Debt) => void;
  onDeleteDebt: (id: number) => void;
  onAddManualDebt: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  activeTab,
  onTabChange,
  unpaidDebts,
  paidDebts,
  onPay,
  onShowDetails,
  onDeleteDebt,
  onAddManualDebt,
}) => {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="serif text-3xl md:text-4xl font-bold text-luxury-black mb-1 md:mb-2">תשלומים וחובות</h1>
            <p className="text-slate-500 font-medium italic serif text-sm md:text-base">מעקב גבייה והיסטוריה</p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="flex bg-luxury-white rounded-full p-1 shadow-sm border border-gold-100 flex-1 md:flex-none">
              <button
                onClick={() => onTabChange('pending')}
                className={cn(
                  "flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest transition-all",
                  activeTab === 'pending' ? 'bg-luxury-black text-gold-400 shadow-lg' : 'text-slate-400 hover:text-gold-600'
                )}
              >
                חובות
              </button>
              <button
                onClick={() => onTabChange('history')}
                className={cn(
                  "flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest transition-all",
                  activeTab === 'history' ? 'bg-luxury-black text-gold-400 shadow-lg' : 'text-slate-400 hover:text-gold-600'
                )}
              >
                היסטוריה
              </button>
            </div>

            <button
              onClick={onAddManualDebt}
              className="bg-gold-500 text-white p-2.5 md:p-3 rounded-full hover:bg-gold-600 transition-all shadow-lg flex-shrink-0"
              title="הוספת חוב ידני"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {activeTab === 'pending' ? (
          <div className="space-y-4 md:space-y-6">
            {unpaidDebts.length === 0 ? (
              <div className="bg-luxury-white rounded-[2rem] md:rounded-[2.5rem] p-10 md:p-16 text-center border border-gold-100 shadow-sm">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                  <CreditCard className="text-emerald-500" size={28} />
                </div>
                <h3 className="serif text-xl md:text-2xl font-bold text-luxury-black mb-2">אין חובות פתוחים</h3>
                <p className="text-slate-500 font-medium italic serif text-sm md:text-base">כל המתאמנים שילמו, עבודה טובה!</p>
              </div>
            ) : (
              unpaidDebts.map(({ trainee, debts }) => (
                <motion.div
                  key={trainee.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-luxury-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gold-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gold-50 rounded-full flex items-center justify-center border border-gold-100 serif text-xl md:text-2xl font-bold text-gold-600 flex-shrink-0">
                      {trainee.firstName[0]}
                    </div>
                    <div>
                      <h3 className="serif text-xl md:text-2xl font-bold text-luxury-black">
                        {trainee.firstName} {trainee.lastName}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium mt-0.5 md:mt-1">
                        <span>{trainee.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
                    <div className="flex flex-col items-stretch md:items-end gap-2 md:min-w-[140px]">
                      <div className="px-4 py-1.5 md:py-2 bg-rose-50 text-rose-600 rounded-full font-extrabold text-[10px] md:text-[11px] uppercase tracking-widest border border-rose-100 text-center">
                        {debts.length} אימונים
                      </div>
                      <div className="px-4 py-1.5 md:py-2 bg-rose-600 text-white rounded-full font-extrabold text-[10px] md:text-[11px] uppercase tracking-widest shadow-md text-center">
                        סה״כ: {formatCurrency(debts.reduce((sum, d) => sum + (d.amount || 0), 0))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onShowDetails(debts[0])}
                        className="px-4 py-1.5 md:py-2 text-gold-600 text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest hover:bg-gold-50 rounded-full transition-all text-center border border-gold-100"
                      >
                        פירוט תאריכים
                      </button>
                    </div>

                    <div className="flex gap-2 md:gap-3 justify-center">
                      <button
                        onClick={() => onPay(trainee, debts, 'cash')}
                        className="flex flex-col items-center justify-center flex-1 md:flex-none w-full md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all group"
                      >
                        <Banknote size={20} className="md:size-6 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-extrabold uppercase tracking-widest">מזומן</span>
                      </button>
                      <button
                        onClick={() => onPay(trainee, debts, 'link')}
                        className="flex flex-col items-center justify-center flex-1 md:flex-none w-full md:w-20 h-16 md:h-20 rounded-2xl md:rounded-3xl bg-gold-50 text-gold-600 border border-gold-100 hover:bg-gold-600 hover:text-white transition-all group"
                      >
                        <LinkIcon size={20} className="md:size-6 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-extrabold uppercase tracking-widest">לינק</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-luxury-white rounded-[2.5rem] border border-gold-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-gold-100 bg-gold-50/30">
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gold-500 uppercase tracking-widest">מתאמן</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gold-500 uppercase tracking-widest">תאריך</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gold-500 uppercase tracking-widest">סכום</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gold-500 uppercase tracking-widest">אמצעי תשלום</th>
                      <th className="px-8 py-5 text-[11px] font-extrabold text-gold-500 uppercase tracking-widest">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-50">
                    {paidDebts.map((debt) => (
                      <tr key={debt.id} className="hover:bg-gold-50/20 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="font-bold text-luxury-black">
                            {debt.trainee ? `${debt.trainee.firstName} ${debt.trainee.lastName}` : 'מתאמן נמחק'}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-medium">{formatDisplayDate(debt.date)}</td>
                        <td className="px-8 py-5">
                          <span className="font-bold text-emerald-600">{formatCurrency(debt.amount)}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {debt.paymentType === 'cash' ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-emerald-100">
                                <Banknote size={12} />
                                מזומן
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-gold-50 text-gold-600 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-gold-100">
                                <LinkIcon size={12} />
                                לינק
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onShowDetails(debt)}
                              className="p-2 text-slate-400 hover:text-gold-600 transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => onDeleteDebt(debt.id)}
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {paidDebts.map((debt) => (
                <div key={debt.id} className="bg-luxury-white rounded-3xl p-5 border border-gold-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-bold text-luxury-black text-lg">
                        {debt.trainee ? `${debt.trainee.firstName} ${debt.trainee.lastName}` : 'מתאמן נמחק'}
                      </div>
                      <div className="text-slate-400 text-xs font-medium">{formatDisplayDate(debt.date)}</div>
                    </div>
                    <div className="text-lg font-bold text-emerald-600">{formatCurrency(debt.amount)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gold-50 text-gold-600 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-gold-100">
                      {debt.paymentType === 'cash' ? <Banknote size={10} /> : <LinkIcon size={10} />}
                      {debt.paymentType === 'cash' ? 'מזומן' : 'לינק'}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onShowDetails(debt)} className="p-2 text-slate-400 bg-slate-50 rounded-full">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDeleteDebt(debt.id)} className="p-2 text-rose-400 bg-rose-50 rounded-full">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {paidDebts.length === 0 && (
              <div className="bg-luxury-white rounded-[2rem] p-12 text-center border border-gold-100 shadow-sm text-slate-400 italic serif">
                אין היסטוריית תשלומים
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
