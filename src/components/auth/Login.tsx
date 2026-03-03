import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token);
        toast.success('ברוך הבא!');
      } else {
        toast.error(data.error || 'סיסמה שגויה');
      }
    } catch (error) {
      toast.error('שגיאת תקשורת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-cream flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-luxury-white w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gold-200 shadow-2xl"
      >
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold-100">
            <Lock className="text-gold-600" size={24} />
          </div>
          <h1 className="serif text-2xl sm:text-3xl font-bold text-luxury-black mb-1 sm:mb-2">ELITA</h1>
          <p className="text-slate-500 font-medium italic serif text-sm sm:text-base">ניהול אימונים אישיים</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-extrabold text-gold-500 uppercase tracking-[0.2em] mb-2">
              סיסמת מנהל
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הזן סיסמה..."
              autoFocus
              className="w-full bg-gold-50/30 border border-gold-100 rounded-2xl py-4 px-6 focus:ring-4 focus:ring-gold-500/5 focus:border-gold-400 outline-none font-bold transition-all tracking-widest text-center"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-luxury-black text-gold-400 hover:bg-gold-900 font-extrabold text-[11px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'התחברות'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
