import { APPOINTMENT_STATUS, USER_ROLES } from "@/lib/constants"

export interface BaseDocument {
    id: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface User extends BaseDocument {
    email: string;
    phoneNumber: string;
    photoURL?: string;
    displayName: string;
    type: keyof typeof USER_ROLES;  // Change from string union to keyof
    active: boolean;
  }
  
  export interface Doctor extends User {
    specialtyId: string;
    clinicId: string;
    surname: string;
    licenseNumber: string;
    education: {
      degree: string;
      institution: string;
      year: number;
    }[];
    experience: number;
    verified: boolean;
    available: boolean;
    consultationFee: number;
    bio: string;
    languages: string[];
    workingHours: {
      [key: string]: {
        start: string;
        end: string;
        break?: {
          start: string;
          end: string;
        };
      };
    };
  }
  
  export interface Patient extends User {
    dateOfBirth: Date;
    address: string;
    city: string;
    state: string;
    zip: string;
    gender: 'male' | 'female' | 'other';
    bloodType?: string;
    allergies?: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    medicalHistory?: MedicalRecord[];
  }
  
  export interface Appointment extends BaseDocument {
    patientId: string;
    doctorId: string;
    clinicId: string;
    appointmentDate: Date;
    duration: number;
    type: 'first-visit' | 'follow-up' | 'consultation';
    symptoms?: string;
    notes?: string;
    cancelledBy?: string;
    cancelReason?: string;
    status: AppointmentStatus;
    lastModified?: Date;
    modifiedBy?: string;
    patient?: {
      displayName: string;
      photoURL?: string;
      gender: Patient['gender'];
      dateOfBirth: Date;
    };
    doctor?: {
      displayName: string;
      surname: string;
      specialty: string;
      photoURL?: string;
    };
    clinic?: {
      name: string;
      address: string;
    };
  }
  export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

  export interface MedicalRecord extends BaseDocument {
    patientId: string;
    doctorId: string;
    appointmentId: string;
    diagnosis: string;
    symptoms: string[];
    treatment: string;
    prescriptions?: {
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      notes?: string;
    }[];
    labTests?: {
      name: string;
      results?: string;
      date?: Date;
      notes?: string;
    }[];
    followUpDate?: Date;
    notes?: string;
  }
  
  export interface Specialty extends BaseDocument {
    name: string;
    description: string;
    icon?: string;
  }
  
  export interface Clinic extends BaseDocument {
    name: string;
    address: string;
    city: string;
    phone: string;
    email?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    facilities?: string[];
    workingHours: {
      [key: string]: {
        open: string;
        close: string;
      };
    };
  }
  
  // Form related interfaces
  export interface ClientFormValues {
    email: string;
    phoneNumber: string;
    photoURL?: string;
    displayName: string;
    dateOfBirth: string; // Keep as string for form handling
    address: string;
    city: string;
    state: string;
    zip: string;
    gender: 'male' | 'female' | 'other';
    bloodType?: string;
    allergies?: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  }
  
  export interface ClientSignUpFormData extends ClientFormValues {
    password: string;
    confirmPassword: string;
  }
  
  export interface DoctorFormValues extends Omit<Doctor, keyof BaseDocument | 'type' | 'active'> {
    password?: string;
    confirmPassword?: string;
  }
  
  // Auth related interfaces
  export interface AuthResponse {
    user: Doctor | Patient;
    role: keyof typeof USER_ROLES;
    message: string;
  }
  
  export interface UserContextData {
    userData: User | null;
    role: keyof typeof USER_ROLES | null;  // Update to use keyof
    loading: boolean;
  }
  
  // Next.js related interfaces
  export interface PageProps {
    params: { [key: string]: string | string[] }
    searchParams: { [key: string]: string | string[] | undefined }
  }
  // Add these interfaces to your types.ts file

export interface PricingFeature {
  name: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: PricingFeature[];
  isPopular?: boolean;
}