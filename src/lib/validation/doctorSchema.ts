import * as Yup from 'yup';

export interface DoctorParamsFormData {
  displayName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  specialtyId: string;
  clinicId: string;
  bio: string;
  languages: string[];
  consultationFee: number;
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
  password?: string;
  confirmPassword?: string;
}

export const doctorSchema = Yup.object().shape({
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
  bio: Yup.string()
    .min(50, 'Bio must be at least 50 characters')
    .required('Bio is required'),
  languages: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one language is required'),
  consultationFee: Yup.number()
    .min(0, 'Fee cannot be negative')
    .required('Consultation fee is required'),
  workingHours: Yup.object()
    .shape({
      monday: Yup.object().shape({
        start: Yup.string().required('Start time is required'),
        end: Yup.string().required('End time is required'),
      }),
      // ... repeat for other days
    }),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .transform(value => value === "" ? undefined : value)
    .optional(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .transform(value => value === "" ? undefined : value)
    .when('password', {
      is: (password: string) => password && password.length > 0,
      then: schema => schema.required('Password confirmation is required')
    })
});