import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  // Assuming amount is in Shekels (float for now, will migrate to cents later)
  return `${amount.toLocaleString()}₪`;
};

export const roundTo2 = (n: number) => Math.round(n * 100) / 100;

export const buildPaymentNotes = (totalAmount: number, perSessionAmount: number, debtsCount: number, link?: string) => {
  const cleanLink = String(link || '').trim();
  const parts: string[] = [];
  parts.push(`סה״כ: ${roundTo2(totalAmount)}₪`);
  if (debtsCount > 1) parts.push(`פר אימון: ${roundTo2(perSessionAmount)}₪`);
  if (cleanLink) parts.push(`לינק: ${cleanLink}`);
  return parts.join(' | ');
};
