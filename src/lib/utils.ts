import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { APPOINTMENT_STATUS } from "./constants"
import type { AppointmentStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatDateForForm = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const parseDateFromForm = (dateString: string): Date => {
  return new Date(dateString)
}
export const confirm = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const result = window.confirm(message);
    resolve(result);
  });
};
export const getStatusColor = (status: AppointmentStatus): string => {
  const colors = {
    [APPOINTMENT_STATUS.PENDING]: '#FCD34D',    // yellow
    [APPOINTMENT_STATUS.APPROVED]: '#34D399',    // green
    [APPOINTMENT_STATUS.REJECTED]: '#EF4444',    // red
    [APPOINTMENT_STATUS.RESCHEDULED]: '#F97316', // orange
    [APPOINTMENT_STATUS.CANCELLED]: '#6B7280',   // gray
    [APPOINTMENT_STATUS.COMPLETED]: '#3B82F6',   // blue
    [APPOINTMENT_STATUS.ONGOING]: '#8B5CF6'      // purple
  };
  return colors[status] || '#9CA3AF';
};

export const getStatusStyle = (status: AppointmentStatus): string => {
  const styles = {
    [APPOINTMENT_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
    [APPOINTMENT_STATUS.APPROVED]: "bg-green-100 text-green-800",
    [APPOINTMENT_STATUS.REJECTED]: "bg-red-100 text-red-800",
    [APPOINTMENT_STATUS.RESCHEDULED]: "bg-orange-100 text-orange-800",
    [APPOINTMENT_STATUS.CANCELLED]: "bg-gray-100 text-gray-800",
    [APPOINTMENT_STATUS.COMPLETED]: "bg-blue-100 text-blue-800",
    [APPOINTMENT_STATUS.ONGOING]: "bg-purple-100 text-purple-800 animate-pulse"
  };
  return styles[status] || "bg-gray-100 text-gray-800";
};
// Add these new functions
export const getStatusIndicatorColor = (status: AppointmentStatus): string => {
  const colors = {
    [APPOINTMENT_STATUS.PENDING]: 'bg-yellow-500',
    [APPOINTMENT_STATUS.APPROVED]: 'bg-green-500',
    [APPOINTMENT_STATUS.REJECTED]: 'bg-red-500',
    [APPOINTMENT_STATUS.RESCHEDULED]: 'bg-orange-500',
    [APPOINTMENT_STATUS.CANCELLED]: 'bg-gray-500',
    [APPOINTMENT_STATUS.COMPLETED]: 'bg-blue-500',
    [APPOINTMENT_STATUS.ONGOING]: 'bg-purple-500 animate-pulse'
  };
  return colors[status] || 'bg-gray-500';
};

export const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};