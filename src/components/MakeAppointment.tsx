"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { APPOINTMENT_STATUS, COLLECTIONS, ROUTES } from "@/lib/constants"
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
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
    type: "first-visit"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      router.push(ROUTES.APPOINTMENTS)
    } catch (error) {
      console.error("Error requesting appointment:", error)
      toast.error("Failed to submit appointment request")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!doctor || !patientId) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="p-6">
          <p className="text-destructive text-center">
            Required information is missing
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Schedule an Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <DoctorInfo doctor={doctor} />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <DateTimeSelector
            date={formData.appointmentDate}
            time={formData.appointmentTime}
            onDateChange={(date) => setFormData(prev => ({ ...prev, appointmentDate: date }))}
            onTimeChange={(time) => setFormData(prev => ({ ...prev, appointmentTime: time }))}
            workingHours={doctor.workingHours}
          />

          <div className="space-y-2">
            <label htmlFor="symptoms" className="text-sm font-medium text-gray-700">
              Symptoms or Concerns
            </label>
            <Textarea
              id="symptoms"
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              placeholder="Describe your symptoms or concerns..."
              className="min-h-[100px]"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Request Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default MakeAppointment