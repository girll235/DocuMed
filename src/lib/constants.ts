
import { PricingPlan } from '@/types';

export const COLLECTIONS = {
    USERS: 'users',
    DOCTORS: 'doctors',
    PATIENTS: 'patients',
    APPOINTMENTS: 'patientAppointments',
    MEDICAL_RECORDS: 'medicalRecords',
    SPECIALTIES: 'specialties',
    CLINICS: 'clinics'
  } as const;
  
export const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    RESCHEDULED: 'rescheduled'
  } as const;

  export const USER_ROLES = {
    DOCTOR: "DOCTOR",
    PATIENT: "PATIENT",
    ADMIN: "ADMIN"
  } as const;
  export type UserRole = keyof typeof USER_ROLES;
  
  export const AUTH_ERRORS = {
    ROLE_NOT_FOUND: 'User role not found',
    INVALID_CREDENTIALS: 'Invalid credentials'
  } as const;

  
  
  export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    SIGNUP: "/signup",
    APPOINTMENTS: "/appointments",
    MAKE_APPOINTMENT: "/appointments/new",
    ADMIN_DASHBOARD: "/admin-dashboard",
    DOC_DASHBOARD: "/doc-dashboard", // Changed from "/doctor/dashboard"
    PATIENT_RECORD: "/patient-record",
    CLIENT_DASHBOARD: "/client-dashboard", // Changed from "/client/dashboard"
    DOC_INSERTION: "/doc-insertion",
    DOC_SIGNUP: "/doc-signup",
    CLIENT_SIGNUP: "/client-signup",
    CONTACT: "/contact",
    DOC_PARAMS: "/doc-params",
    PRICING: "/pricing",
    CLIENT_PARAMS: "/client-params",
  } as const;
  
  export const APP_METADATA = {
    title: "DocuMed",
    description: "Connecting Doctors and Patients through the Digital World",
    icons: {
      icon: '/favicon.ico',
    },
  } as const;

export const PRICING_PLANS: PricingPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: {
        monthly: 9.99,
        yearly: 99,
      },
      features: [
        { name: "Up to 10 appointments per month", included: true },
        { name: "Basic patient records", included: true },
        { name: "Email support", included: true },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
      ],
    },
    {
      id: "pro",
      name: "Professional",
      price: {
        monthly: 29.99,
        yearly: 299,
      },
      features: [
        { name: "Unlimited appointments", included: true },
        { name: "Advanced patient records", included: true },
        { name: "Priority email & phone support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom branding", included: true },
      ],
      isPopular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: {
        monthly: 49.99,
        yearly: 399,
      },
      features: [
        { name: "All Pro features", included: true },
        { name: "Multiple doctor accounts", included: true },
        { name: "Custom integrations", included: true },
        { name: "24/7 phone support", included: true },
        { name: "Dedicated account manager", included: true },
      ],
    },
  ];
  