import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatDateForForm = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const parseDateFromForm = (dateString: string): Date => {
  return new Date(dateString)
}