import * as Yup from "yup"

export interface MedicalRecordFormValues {
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  prescriptions: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  labTests: {
    name: string;
    results?: string;
    date?: string;
    notes?: string;
  }[];
  followUpDate?: string;
  notes?: string;
}

export const medicalRecordSchema = Yup.object().shape({
  diagnosis: Yup.string().required("Diagnosis is required"),
  symptoms: Yup.array().of(Yup.string()).min(1, "At least one symptom is required"),
  treatment: Yup.string().required("Treatment is required"),
  prescriptions: Yup.array().of(
    Yup.object().shape({
      medication: Yup.string().required("Medication name is required"),
      dosage: Yup.string().required("Dosage is required"),
      frequency: Yup.string().required("Frequency is required"),
      duration: Yup.string().required("Duration is required"),
      notes: Yup.string()
    })
  ),
  labTests: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Test name is required"),
      results: Yup.string(),
      date: Yup.string(),
      notes: Yup.string()
    })
  ),
  followUpDate: Yup.string(),
  notes: Yup.string()
})