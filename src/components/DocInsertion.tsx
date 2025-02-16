"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Formik, Form, Field, FieldArray } from "formik"
import { collection, addDoc, doc, getDoc } from "firebase/firestore"
import { toast } from "react-hot-toast"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { useUser } from "@/contexts/UserContext"
import { COLLECTIONS, ROUTES } from "@/lib/constants"
import { medicalRecordSchema, MedicalRecordFormValues } from "@/lib/validation/medicalRecordsSchema"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Patient } from "@/types"

const initialValues: MedicalRecordFormValues = {
  diagnosis: "",
  symptoms: [""],
  treatment: "",
  prescriptions: [],
  labTests: [],
  followUpDate: "",
  notes: ""
}

const DocInsertion = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get("patientId")
  const { userData } = useUser()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) {
        setError("No patient ID provided")
        setLoading(false)
        return
      }

      try {
        const patientRef = doc(db, COLLECTIONS.PATIENTS, patientId)
        const patientSnap = await getDoc(patientRef)
        
        if (!patientSnap.exists()) {
          setError("Patient not found")
          return
        }

        setPatient(patientSnap.data() as Patient)
      } catch (err) {
        console.error("Error fetching patient data:", err)
        setError("Failed to load patient data")
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [patientId])

  const handleSubmit = async (values: MedicalRecordFormValues, { setSubmitting }: any) => {
    if (!userData?.id || !patient) {
      toast.error("Missing required data")
      return
    }

    try {
      const recordRef = collection(db, COLLECTIONS.MEDICAL_RECORDS)
      await addDoc(recordRef, {
        patientId: patientId,
        doctorId: userData.id,
        appointmentId: searchParams.get("appointmentId") || "",
        diagnosis: values.diagnosis,
        symptoms: values.symptoms,
        treatment: values.treatment,
        prescriptions: values.prescriptions,
        labTests: values.labTests,
        followUpDate: values.followUpDate ? new Date(values.followUpDate) : null,
        notes: values.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      })

     
      toast.success("Medical record added successfully")
      router.push(`${ROUTES.PATIENT_RECORD}/${patientId}`)
    } catch (error) {
      console.error("Error adding medical record:", error)
      toast.error("Failed to add medical record")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            New Medical Record for {patient?.displayName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={medicalRecordSchema}
            onSubmit={handleSubmit}
          >
           {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form className="space-y-6">
                {/* Symptoms */}
                <FieldArray name="symptoms">
                  {({ push, remove }) => (
                    <div className="space-y-2">
                      <Label>Symptoms</Label>
                      {values.symptoms.map((_, index) => (
                        <div key={index} className="flex gap-2">
                          <Field
                            as={Input}
                            name={`symptoms.${index}`}
                            placeholder="Enter symptom"
                          />
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                <Button
                        type="button"
                        variant="outline"
                        onClick={() => push("")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Symptom
                      </Button>
                    </div>
                  )}
                </FieldArray>

                {/* Add similar FieldArray components for prescriptions and labTests */}
                
        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Field
            as={Textarea}
            id="diagnosis"
            name="diagnosis"
            className={errors.diagnosis && touched.diagnosis ? "border-red-500" : ""}
          />
          {errors.diagnosis && touched.diagnosis && (
            <p className="text-red-500 text-sm">{errors.diagnosis}</p>
          )}
        </div>
        <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment</Label>
                  <Field
                    as={Textarea}
                    id="treatment"
                    name="treatment"
                    className={errors.treatment && touched.treatment ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Field
                    as={Input}
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Field
                    as={Textarea}
                    id="notes"
                    name="notes"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Record...
                    </>
                  ) : (
                    "Save Medical Record"
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

export default DocInsertion