import Image from "next/image"
import Link from "next/link"
import { Doctor, Specialty, Clinic } from "@/types"
import { ROUTES } from "@/lib/constants"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface DoctorCardProps {
  doctor: Doctor
  patientId?: string
}

export const DoctorCard = ({ doctor, patientId }: DoctorCardProps) => {
  const [specialty, setSpecialty] = useState<Specialty | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="relative w-24 h-24">
          <Image
            src={doctor.photoURL || "/default-doctor.jpg"}
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
          <Link
            href={{
              pathname: ROUTES.MAKE_APPOINTMENT,
              query: { doctorId: doctor.id, patientId }
            }}
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}