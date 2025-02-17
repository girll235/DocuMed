
import { PricingPlan } from '@/types';

export const COLLECTIONS = {
    USERS: 'users',
    DOCTORS: 'doctors',
    PATIENTS: 'patients',
    APPOINTMENTS: 'appointments', // Changed from 'patientAppointments'
    MEDICAL_RECORDS: 'medicalRecords',
    SPECIALTIES: 'specialties',
    CLINICS: 'clinics'
  } as const;
  
  export const APPOINTMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
    RESCHEDULED: 'RESCHEDULED',
    ONGOING: 'ONGOING'  // Add this new status
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
    // Auth & General Routes
    HOME: "/",
    LOGIN: "/login",
    SIGNUP: "/signup",
    CONTACT: "/contact",
    PRICING: "/pricing",
  
    // Dashboard Routes
    ADMIN_DASHBOARD: "/admin-dashboard",
    DOC_DASHBOARD: "/doc-dashboard",
    CLIENT_DASHBOARD: "/client-dashboard",
  
    // Medical Records & Patient Routes
    PATIENT_RECORD: "/patient-record",
    MEDICAL_RECORDS: "/medical-records/edit", // Changed from DOC_INSERTION
    
    // Appointment Routes
    APPOINTMENTS: "/appointments",
    MAKE_APPOINTMENT: "/make-appointment",
  
    // Settings & Parameters Routes
    DOC_PARAMS: "/doc-params",
    CLIENT_PARAMS: "/client-params",
  
    // Registration Routes
    DOC_SIGNUP: "/doc-signup",
    CLIENT_SIGNUP: "/client-signup",
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
  