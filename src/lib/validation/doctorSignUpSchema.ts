import * as Yup from 'yup';

export interface DoctorSignUpFormData {
  displayName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  specialtyId: string;
  clinicId: string;
  licenseNumber: string;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  experience: number;
  languages: string[];
  consultationFee: number;
  bio: string;
  password: string;
  confirmPassword: string;
}

export const doctorSignUpSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  surname: Yup.string()
    .min(2, 'Surname must be at least 2 characters')
    .required('Surname is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .required('Phone number is required'),
  specialtyId: Yup.string()
    .required('Specialty is required'),
  clinicId: Yup.string()
    .required('Clinic is required'),
  licenseNumber: Yup.string()
    .required('License number is required'),
  education: Yup.array().of(
    Yup.object().shape({
      degree: Yup.string().required('Degree is required'),
      institution: Yup.string().required('Institution is required'),
      year: Yup.number()
        .min(1950, 'Invalid year')
        .max(new Date().getFullYear(), 'Year cannot be in the future')
        .required('Year is required')
    })
  ).min(1, 'At least one education entry is required'),
  experience: Yup.number()
    .min(0, 'Experience cannot be negative')
    .required('Experience is required'),
  languages: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one language is required'),
  consultationFee: Yup.number()
    .min(0, 'Fee cannot be negative')
    .required('Consultation fee is required'),
  bio: Yup.string()
    .min(50, 'Bio must be at least 50 characters')
    .required('Bio is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
});

export const initialValues: DoctorSignUpFormData = {
  displayName: "",
  surname: "",
  email: "",
  phoneNumber: "",
  specialtyId: "",
  clinicId: "",
  licenseNumber: "",
  education: [{
    degree: "",
    institution: "",
    year: new Date().getFullYear()
  }],
  experience: 0,
  languages: ["English"],
  consultationFee: 0,
  bio: "",
  password: "",
  confirmPassword: ""
};