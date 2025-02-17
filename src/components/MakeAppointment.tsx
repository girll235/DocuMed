"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { collection, addDoc, doc, getDoc } from "firebase/firestore"
import { motion } from "framer-motion"
import { Loader2, X } from "lucide-react"
import { db } from "@/lib/firebase"
import { COLLECTIONS, ROUTES } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { DateTimeSelector } from "./DateTimeSelector"
import { DoctorInfo } from "./DoctorInfo"
import { Doctor, Appointment } from "@/types"

interface AppointmentFormData {
  appointmentDate: string;
  appointmentTime: string;
  symptoms?: string;
  type: Appointment['type'];
}

export const MakeAppointment = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctorId")
  const patientId = searchParams.get("patientId")
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
    type: "first-visit"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) {
        toast.error("Doctor ID is missing")
        router.push(ROUTES.HOME)
        return
      }

      try {
        const docRef = doc(db, COLLECTIONS.DOCTORS, doctorId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setDoctor({ id: docSnap.id, ...docSnap.data() } as Doctor)
        } else {
          toast.error("Doctor not found")
          router.push(ROUTES.HOME)
        }
      } catch (error) {
        console.error("Error fetching doctor:", error)
        toast.error("Failed to load doctor information")
        router.push(ROUTES.HOME)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctor()
  }, [doctorId, router])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!doctor || !patientId) {
      toast.error("Required information is missing")
      return
    }

    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast.error("Please select both date and time")
      return
    }

    setIsSubmitting(true)

    try {
      const appointmentDate = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`)
      
      if (appointmentDate < new Date()) {
        toast.error("Please select a future date and time")
        return
      }

      const appointmentRef = collection(db, COLLECTIONS.APPOINTMENTS)
      
      const newAppointment: Partial<Appointment> = {
        patientId,
        doctorId: doctor.id,
        clinicId: doctor.clinicId,
        appointmentDate,
        duration: 30, // Default duration in minutes
        status: "PENDING",
        type: formData.type,
        symptoms: formData.symptoms,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(appointmentRef, newAppointment)

      toast.success("Appointment request submitted successfully!")
      router.push(ROUTES.APPOINTMENTS) // This stays the same
    } catch (error) {
      console.error("Error requesting appointment:", error)
      toast.error("Failed to submit appointment request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!doctor || !patientId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Missing Information
              </h3>
              <p className="text-gray-600">
                Required information is missing. Please try again.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <CardTitle className="text-3xl font-bold text-center">
              Schedule an Appointment
            </CardTitle>
            <p className="text-blue-100 text-center mt-2">
              Book your consultation with our healthcare professional
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <DoctorInfo doctor={doctor} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Appointment Details
                  </h3>
                  
                  <DateTimeSelector
                    date={formData.appointmentDate}
                    time={formData.appointmentTime}
                    onDateChange={(date) => setFormData(prev => ({ ...prev, appointmentDate: date }))}
                    onTimeChange={(time) => setFormData(prev => ({ ...prev, appointmentTime: time }))}
                    workingHours={doctor.workingHours}
                  />
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Visit Type
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {["first-visit", "follow-up"].map((type) => (
                        <motion.button
                          key={type}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, type: type as Appointment['type'] }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.type === type
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-200 hover:border-blue-200"
                          }`}
                        >
                          <span className="block text-sm font-medium">
                            {type === "first-visit" ? "First Visit" : "Follow-up"}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="space-y-4">
                    <label htmlFor="symptoms" className="block text-lg font-semibold text-gray-900">
                      Symptoms or Concerns
                    </label>
                    <Textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                      placeholder="Please describe your symptoms or concerns in detail..."
                      className="min-h-[120px] resize-none focus:ring-blue-200"
                    />
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        <span>Submitting Request...</span>
                      </div>
                    ) : (
                      "Request Appointment"
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default MakeAppointment