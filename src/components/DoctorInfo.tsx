import Image from "next/image"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Doctor, Specialty, Clinic } from "@/types"
import { COLLECTIONS } from "@/lib/constants"
import { motion } from "framer-motion"
import { Clock, MapPin, Phone, Globe, Award, Languages } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src={doctor.photoURL || "/profile/profile.jpg"}
              alt={`Dr. ${doctor.displayName} ${doctor.surname}`}
              fill
              className="rounded-full object-cover ring-4 ring-white/50"
            />
          </div>
          <div className="text-center mt-4 text-white">
            <h3 className="text-2xl font-bold">
              Dr. {doctor.displayName} {doctor.surname}
            </h3>
            <p className="text-blue-100 mt-1">{specialty?.name || 'Loading specialty...'}</p>
          </div>
        </div>

        <CardContent className="p-6">
          {clinic && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">{clinic.name}</h4>
                  <p className="text-gray-600">{clinic.address}</p>
                  <p className="text-gray-600">{clinic.city}</p>
                  <div className="flex items-center mt-2 text-blue-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{clinic.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium text-gray-900">{doctor.experience} years</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Languages className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Languages</p>
                  <p className="font-medium text-gray-900">{doctor.languages.join(", ")}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="font-medium text-gray-900">${doctor.consultationFee}</p>
                </div>
              </div>
            </div>

            {doctor.workingHours && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Working Hours</h4>
                </div>
                <div className="space-y-2">
                  {Object.entries(doctor.workingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-600">{day}</span>
                      <span className="text-gray-900">
                        {hours.start} - {hours.end}
                        {hours.break && (
                          <span className="text-gray-500 text-xs ml-2">
                            (Break: {hours.break.start} - {hours.break.end})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}