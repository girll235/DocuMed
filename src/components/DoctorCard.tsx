import Image from "next/image"
import { Doctor, Specialty, Clinic } from "@/types"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"

interface DoctorCardProps {
  doctor: Doctor
  patientId?: string
}

export const DoctorCard = ({ doctor, patientId }: DoctorCardProps) => {
  const [specialty, setSpecialty] = useState<Specialty | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const router = useRouter()
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        // Fetch specialty data
        if (doctor.specialtyId) {
          const specialtyDoc = await getDoc(doc(db, 'specialties', doctor.specialtyId))
          if (specialtyDoc.exists()) {
            setSpecialty(specialtyDoc.data() as Specialty)
          }
        }

        // Fetch clinic data
        if (doctor.clinicId) {
          const clinicDoc = await getDoc(doc(db, 'clinics', doctor.clinicId))
          if (clinicDoc.exists()) {
            setClinic(clinicDoc.data() as Clinic)
          }
        }
      } catch (error) {
        console.error('Error fetching related data:', error)
      }
    }

    fetchRelatedData()
  }, [doctor.specialtyId, doctor.clinicId])
  const handleBookAppointment = () => {
    if (!patientId) {
      toast.error("Please log in to book an appointment")
      router.push(ROUTES.LOGIN)
      return
    }

    const queryParams = new URLSearchParams({
      doctorId: doctor.id,
      patientId: patientId
    }).toString()

    router.push(`${ROUTES.MAKE_APPOINTMENT}?${queryParams}`)
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="relative w-24 h-24">
          <Image
            src={doctor.photoURL || "/profile/profile.jpg"}
            alt={`${doctor.displayName} ${doctor.surname}`}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            Dr. {doctor.displayName} {doctor.surname}
          </h3>
          <p className="text-gray-600">{specialty?.name || 'Loading specialty...'}</p>
          {clinic && (
            <p className="text-sm text-gray-500">
              {clinic.name} - {clinic.city}
            </p>
          )}
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-500">
              Experience: {doctor.experience} years
            </p>
            <p className="text-sm text-gray-500">
              Languages: {doctor.languages.join(", ")}
            </p>
            <p className="text-sm text-gray-500">
              Consultation Fee: ${doctor.consultationFee}
            </p>
            {doctor.workingHours && (
              <p className="text-sm text-gray-500">
                Working Hours: {doctor.workingHours.monday.start} - {doctor.workingHours.monday.end}
              </p>
            )}
          </div>
          <Button
        onClick={handleBookAppointment}
        className="mt-4 w-full bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Book Appointment
      </Button>
        </div>
      </div>
    </div>
  )
}