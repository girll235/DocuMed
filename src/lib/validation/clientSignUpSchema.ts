import * as Yup from 'yup'
import { ClientSignUpFormData } from '@/types'

export const clientSignUpSchema = Yup.object().shape({
  displayName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  address: Yup.string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address is required'),
  city: Yup.string()
    .required('City is required'),
  state: Yup.string()
    .required('State is required'),
  zip: Yup.string()
    .matches(/^\d{4}$/, 'Invalid ZIP code')
    .required('ZIP code is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Please select a valid gender')
    .required('Gender is required'),
  dateOfBirth: Yup.date()
    .max(new Date(), 'Birth date cannot be in the future')
    .required('Birth date is required'),
  bloodType: Yup.string()
    .optional(),
  allergies: Yup.array()
    .of(Yup.string())
    .default([]),
  emergencyContact: Yup.object().shape({
    name: Yup.string().required('Emergency contact name is required'),
    relationship: Yup.string().required('Relationship is required'),
    phone: Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
      .required('Emergency contact phone is required')
  })
})

export const initialValues: ClientSignUpFormData = {
  displayName: "",
  email: "",
  phoneNumber: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  gender: "other",
  dateOfBirth: "",
  bloodType: "",
  allergies: [],
  emergencyContact: {
    name: "",
    relationship: "",
    phone: ""
  },
  password: "",
  confirmPassword: ""
}