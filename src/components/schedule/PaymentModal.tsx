// src/components/schedule/PaymentModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { DollarSign, CreditCard, Wallet } from "lucide-react";
import { Modal } from "../common/Modal";

type PaymentMethod = "cash" | "link";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, method: PaymentMethod) => void;
  traineeName: string;
  defaultAmount?: number; // default 120
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onConfirm,
  traineeName,
  defaultAmount = 120,
}) => {
  const [amountStr, setAmountStr] = useState<string>(String(defaultAmount));
  const [method, setMethod] = useState<PaymentMethod>("link");

  useEffect(() => {
    if (open) {
      setAmountStr(String(defaultAmount));
      setMethod("link");
    }
  }, [open, defaultAmount]);

  const amountNum = useMemo(() => {
    const n = Number(String(amountStr).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }, [amountStr]);

  const canSubmit = useMemo(() => {
    return Number.isFinite(amountNum) && amountNum > 0;
  }, [amountNum]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // סכום בש"ח (מספר), השרת יהפוך לאגורות אם צריך
    onConfirm(amountNum, method);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={`תשלום עבור ${traineeName}`} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            סכום (₪)
          </label>
          <div className="flex items-center gap-3 bg-gold-50/60 border border-gold-100 rounded-2xl px-4 py-3">
            <DollarSign className="text-gold-500" size={18} />
            <input
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              inputMode="decimal"
              placeholder="120"
              className="w-full bg-transparent outline-none font-bold text-luxury-black"
            />
          </div>
          {!canSubmit && (
            <div className="text-[11px] text-rose-600 font-semibold">
              סכום לא תקין
            </div>
          )}
        </div>

        {/* Method */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            אמצעי תשלום
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("cash")}
              className={[
                "rounded-2xl border px-4 py-3 flex items-center justify-center gap-2 font-extrabold text-[11px] uppercase tracking-widest transition-all",
                method === "cash"
                  ? "bg-luxury-black text-gold-400 border-luxury-black shadow-lg"
                  : "bg-luxury-white text-slate-500 border-gold-100 hover:bg-gold-50",
              ].join(" ")}
            >
              <Wallet size={16} />
              מזומן
            </button>

            <button
              type="button"
              onClick={() => setMethod("link")}
              className={[
                "rounded-2xl border px-4 py-3 flex items-center justify-center gap-2 font-extrabold text-[11px] uppercase tracking-widest transition-all",
                method === "link"
                  ? "bg-luxury-black text-gold-400 border-luxury-black shadow-lg"
                  : "bg-luxury-white text-slate-500 border-gold-100 hover:bg-gold-50",
              ].join(" ")}
            >
              <CreditCard size={16} />
              לינק
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gold-100 bg-luxury-white py-3 font-extrabold text-[11px] uppercase tracking-widest text-slate-500 hover:bg-gold-50 transition-all"
          >
            ביטול
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              "flex-1 rounded-2xl py-3 font-extrabold text-[11px] uppercase tracking-widest transition-all shadow-lg",
              canSubmit
                ? "bg-luxury-black text-gold-400 hover:bg-gold-900"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
            ].join(" ")}
          >
            אשר תשלום
          </button>
        </div>
      </form>
    </Modal>
  );
};