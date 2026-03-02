import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/formatUtils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxWidth = 'max-w-md',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] bg-luxury-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={cn(
              "bg-luxury-white w-full rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gold-200 shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]",
              maxWidth,
              className
            )}
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 10, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 left-4 sm:top-6 sm:left-6 text-slate-400 hover:text-gold-600 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <div className="mb-4 sm:mb-6">
              <h2 className="serif text-xl sm:text-2xl font-bold text-luxury-black pl-8 sm:pl-0">{title}</h2>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
