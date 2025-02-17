"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
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
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
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
  const patientId = searchParams?.get("patientId")
  const { userData } = useUser()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    if (!searchParams) return  // Add early return if searchParams is null

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
  }, [patientId, searchParams])  

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-lg flex flex-col items-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-blue-600 animate-pulse">Loading patient data...</p>
        </motion.div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-lg flex flex-col items-center text-center"
        >
          <div className="text-red-500 mb-4 text-xl">⚠️</div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </motion.div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                New Medical Record
              </CardTitle>
              <p className="text-blue-100 text-center mt-2">
                Patient: {patient?.displayName}
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <Formik
                initialValues={initialValues}
                validationSchema={medicalRecordSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, isSubmitting }) => (
                  <Form className="space-y-8">
                    {/* Diagnosis Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Primary Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="diagnosis" className="text-gray-700">Diagnosis</Label>
                          <Field
                            as={Textarea}
                            id="diagnosis"
                            name="diagnosis"
                            className={`mt-1 h-24 ${
                              errors.diagnosis && touched.diagnosis
                                ? "border-red-500 focus:ring-red-200"
                                : "focus:ring-blue-200"
                            }`}
                            placeholder="Enter detailed diagnosis..."
                          />
                          {errors.diagnosis && touched.diagnosis && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1"
                            >
                              {errors.diagnosis}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Symptoms Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Symptoms & Treatment
                      </h3>

                      <FieldArray name="symptoms">
                        {({ push, remove }) => (
                          <div className="space-y-4">
                            <Label className="text-gray-700">Symptoms</Label>
                            {values.symptoms.map((_, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-2"
                              >
                                <Field
                                  as={Input}
                                  name={`symptoms.${index}`}
                                  placeholder="Enter symptom"
                                  className="flex-1"
                                />
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </motion.div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => push("")}
                              className="w-full border-dashed"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Symptom
                            </Button>
                          </div>
                        )}
                      </FieldArray>

                      <div className="space-y-4">
                        <Label htmlFor="treatment" className="text-gray-700">Treatment Plan</Label>
                        <Field
                          as={Textarea}
                          id="treatment"
                          name="treatment"
                          className="mt-1 h-24"
                          placeholder="Describe the treatment plan..."
                        />
                      </div>
                    </div>

                    {/* Follow-up Section */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Follow-up & Notes
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="followUpDate" className="text-gray-700">Follow-up Date</Label>
                          <Field
                            as={Input}
                            type="date"
                            id="followUpDate"
                            name="followUpDate"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes" className="text-gray-700">Additional Notes</Label>
                        <Field
                          as={Textarea}
                          id="notes"
                          name="notes"
                          className="mt-1"
                          placeholder="Any additional notes or observations..."
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Saving Record...</span>
                          </div>
                        ) : (
                          "Save Medical Record"
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default DocInsertion