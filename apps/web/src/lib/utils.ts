import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBDT(amount: number | string, decimals = 0): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "৳ 0";

  // Use Bangladeshi Taka symbol ৳ or BDT cleanly without decimal clutter unless needed
  const formatted = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

  return `৳ ${formatted}`;
}
