import * as Yup from 'yup';

export interface DoctorParamsFormData {
  displayName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  specialtyId: string;
  clinicId: string;
  licenseNumber: string;
  bio: string;
  experience: number;
  languages: string[];
  consultationFee: number;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
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
    .required('Email is required')
    .matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      'Invalid email format'
    ),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .required('Phone number is required'),
  specialtyId: Yup.string()
    .required('Specialty is required'),
  clinicId: Yup.string()
    .required('Clinic is required'),
  licenseNumber: Yup.string()
    .required('License number is required')
    .min(5, 'License number must be at least 5 characters'),
  bio: Yup.string()
    .min(50, 'Bio must be at least 50 characters')
    .required('Bio is required'),
  experience: Yup.number()
    .min(0, 'Experience cannot be negative')
    .required('Years of experience is required'),
  languages: Yup.array()
    .of(Yup.string().required('Language cannot be empty'))
    .min(1, 'At least one language is required'),
  consultationFee: Yup.number()
    .min(0, 'Fee cannot be negative')
    .required('Consultation fee is required'),
  education: Yup.array()
    .of(
      Yup.object().shape({
        degree: Yup.string().required('Degree is required'),
        institution: Yup.string().required('Institution is required'),
        year: Yup.number()
          .min(1950, 'Year must be 1950 or later')
          .max(new Date().getFullYear(), 'Year cannot be in the future')
          .required('Year is required')
      })
    )
    .min(1, 'At least one education entry is required'),
  workingHours: Yup.object().shape({
    monday: Yup.object().shape({
      start: Yup.string().required('Start time is required'),
      end: Yup.string().required('End time is required'),
      break: Yup.object().shape({
        start: Yup.string(),
        end: Yup.string()
      }).optional()
    }),
    tuesday: Yup.object().shape({
      start: Yup.string().required('Start time is required'),
      end: Yup.string().required('End time is required'),
      break: Yup.object().shape({
        start: Yup.string(),
        end: Yup.string()
      }).optional()
    }),
    wednesday: Yup.object().shape({
      start: Yup.string().required('Start time is required'),
      end: Yup.string().required('End time is required'),
      break: Yup.object().shape({
        start: Yup.string(),
        end: Yup.string()
      }).optional()
    }),
    thursday: Yup.object().shape({
      start: Yup.string().required('Start time is required'),
      end: Yup.string().required('End time is required'),
      break: Yup.object().shape({
        start: Yup.string(),
        end: Yup.string()
      }).optional()
    }),
    friday: Yup.object().shape({
      start: Yup.string().required('Start time is required'),
      end: Yup.string().required('End time is required'),
      break: Yup.object().shape({
        start: Yup.string(),
        end: Yup.string()
      }).optional()
    }),
    saturday: Yup.object().shape({
      start: Yup.string(),
      end: Yup.string(),
      break: Yup.object().shape({
        start: Yup.string(),
        end: Yup.string()
      }).optional()
    }).optional(),
    sunday: Yup.object().shape({
      start: Yup.string(),
      end: Yup.string(),
      break: Yup.object().shape({
        start: Yup.string(),
        end: Yup.string()
      }).optional()
    }).optional()
  }),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
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

export const initialValues: DoctorParamsFormData = {
  displayName: '',
  surname: '',
  email: '',
  phoneNumber: '',
  specialtyId: '',
  clinicId: '',
  licenseNumber: '',
  bio: '',
  experience: 0,
  languages: [''],
  consultationFee: 0,
  education: [{ degree: '', institution: '', year: new Date().getFullYear() }],
  workingHours: {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' }
  }
};