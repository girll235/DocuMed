import Image from "next/image"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Doctor, Specialty, Clinic } from "@/types"
import { COLLECTIONS } from "@/lib/constants"

interface DoctorInfoProps {
  doctor: Doctor
}

export const DoctorInfo = ({ doctor }: DoctorInfoProps) => {
  const [specialty, setSpecialty] = useState<Specialty | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)

  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        if (doctor.specialtyId) {
          const specialtyDoc = await getDoc(doc(db, COLLECTIONS.SPECIALTIES, doctor.specialtyId))
          if (specialtyDoc.exists()) {
            setSpecialty(specialtyDoc.data() as Specialty)
          }
        }

        if (doctor.clinicId) {
          const clinicDoc = await getDoc(doc(db, COLLECTIONS.CLINICS, doctor.clinicId))
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
    <div className="text-center mb-6">
      <div className="relative w-24 h-24 mx-auto mb-4">
        <Image
          src={doctor.photoURL || "/default-doctor.jpg"}
          alt={`Dr. ${doctor.displayName} ${doctor.surname}`}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <h3 className="text-xl font-semibold">
        Dr. {doctor.displayName} {doctor.surname}
      </h3>
      <p className="text-gray-600">{specialty?.name || 'Loading specialty...'}</p>
      {clinic && (
        <div className="text-gray-500 text-sm space-y-1">
          <p>{clinic.name}</p>
          <p>{clinic.address}</p>
          <p>{clinic.city}</p>
          <p>Tel: {clinic.phone}</p>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        <p>Experience: {doctor.experience} years</p>
        <p>Languages: {doctor.languages.join(", ")}</p>
        <p>Consultation Fee: ${doctor.consultationFee}</p>
      </div>
      {doctor.workingHours && (
        <div className="mt-4 text-sm">
          <h4 className="font-semibold mb-2">Working Hours</h4>
          {Object.entries(doctor.workingHours).map(([day, hours]) => (
            <p key={day} className="capitalize text-gray-600">
              {day}: {hours.start} - {hours.end}
              {hours.break && ` (Break: ${hours.break.start} - ${hours.break.end})`}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}