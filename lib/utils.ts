import { type ClassValue } from 'clsx'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency values in Ghanaian Cedi (GHS)
 * @param value - The numeric value to format
 * @param options - Intl.NumberFormatOptions for customization
 * @returns Formatted currency string (e.g., "₵1,234.56")
 */
export function formatGHS(value: number, options?: Intl.NumberFormatOptions): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }
  
  return new Intl.NumberFormat('en-GH', defaultOptions).format(value)
}

/**
 * Format currency values without the currency symbol (just the number)
 * @param value - The numeric value to format
 * @param options - Intl.NumberFormatOptions for customization
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatGHSValue(value: number, options?: Intl.NumberFormatOptions): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }
  
  return new Intl.NumberFormat('en-GH', defaultOptions).format(value)
}
