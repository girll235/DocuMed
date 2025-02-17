"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Doctor, Specialty, Clinic, Appointment } from "@/types"
import { COLLECTIONS, ROUTES, USER_ROLES } from "@/lib/constants"
import { useUser } from "@/contexts/UserContext"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore"
import { authService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { DoctorCard } from "./DoctorCard"
import { SearchBar } from "./SearchBar"
import { toast } from "react-hot-toast"

export const ClientDashboard = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])

    const router = useRouter()
    const { userData, role } = useUser()
  
    useEffect(() => {
      if (role && role !== USER_ROLES.PATIENT) {
        router.push(ROUTES.LOGIN);
        return;
      }
    
      const fetchData = async () => {
        if (!userData?.id) return;
    
        try {
          setLoading(true);
          
          // 1. Fetch appointments and related doctors
          const appointmentsSnap = await getDocs(
            query(
              collection(db, COLLECTIONS.APPOINTMENTS),
              where("patientId", "==", userData.id),
              where("status", "in", ["PENDING", "APPROVED"])
            )
          );
    
          // Get full appointment data with typing
          const appointmentData = appointmentsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            appointmentDate: doc.data().appointmentDate?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            lastModified: doc.data().lastModified?.toDate()
          })) as Array<Omit<Appointment, 'doctor' | 'clinic'>>;
    
          // 2. Create a Set of doctor IDs with appointments
          const doctorsWithAppointments = new Set(
            appointmentData.map(apt => apt.doctorId)
          );
    
          // 3. Fetch all collections in parallel
          const [doctorsSnap, specialtiesSnap, clinicsSnap] = await Promise.all([
            getDocs(query(
              collection(db, COLLECTIONS.DOCTORS),
              where("verified", "==", true),
              where("active", "==", true)
            )),
            getDocs(collection(db, COLLECTIONS.SPECIALTIES)),
            getDocs(collection(db, COLLECTIONS.CLINICS))
          ]);
    
          // 4. Create lookup maps for better performance
          const specialtiesList = specialtiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Specialty[];
    
          const clinicsMap = new Map(
            clinicsSnap.docs.map(doc => [
              doc.id, 
              { id: doc.id, ...doc.data() } as Clinic
            ])
          );
    
          // 5. Process available doctors (filtering out those with appointments)
          const availableDoctors = doctorsSnap.docs
            .filter(doc => !doctorsWithAppointments.has(doc.id))
            .map(doc => {
              const doctorData = doc.data() as Doctor;
              const specialty = specialtiesList.find(s => s.id === doctorData.specialtyId);
              const clinic = clinicsMap.get(doctorData.clinicId);
    
              return {
                ...doctorData,
                id: doc.id,
                specialty: specialty?.name || 'Unknown Specialty',
                clinic: clinic ? {
                  name: clinic.name,
                  address: clinic.address
                } : undefined
              };
            });
    
          // 6. Process doctors with appointments
          const appointmentDoctors = await Promise.all(
            Array.from(doctorsWithAppointments).map(async (id) => {
              const docSnap = await getDoc(doc(db, COLLECTIONS.DOCTORS, id));
              if (!docSnap.exists()) return null;
              
              const doctorData = docSnap.data() as Doctor;
              const specialty = specialtiesList.find(s => s.id === doctorData.specialtyId);
              
              return {
                ...doctorData,
                id: docSnap.id,
                specialty: specialty?.name,
              };
            })
          );
    
          // 7. Combine appointments with doctor details
          const appointmentsWithDoctors = appointmentData.map(apt => {
            const doctor = appointmentDoctors.find(d => d?.id === apt.doctorId);
            const clinic = clinicsMap.get(apt.clinicId);
            
            return {
              ...apt,
              doctor: doctor ? {
                displayName: doctor.displayName,
                surname: doctor.surname,
                specialty: doctor.specialty || 'Unknown Specialty',
                photoURL: doctor.photoURL
              } : undefined,
              clinic: clinic ? {
                name: clinic.name,
                address: clinic.address
              } : undefined
            };
          }) as Appointment[];
    
          // 8. Update state
          setDoctors(availableDoctors);
          setSpecialties(specialtiesList);
          setAppointments(appointmentsWithDoctors);
    
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load dashboard data");
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
    }, [role, router, userData?.id]);

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push(ROUTES.LOGIN)
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = (
      (doctor.displayName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (doctor.surname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (doctor.specialtyId?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )

    const matchesSpecialty = !selectedSpecialty || doctor.specialtyId === selectedSpecialty

    return matchesSearch && matchesSpecialty
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="p-8 rounded-lg flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-blue-600 animate-pulse">Loading doctors...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="bg-white rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-900">
                Welcome back, {userData?.displayName}
              </h1>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Logout
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  className="w-full"
                />
              </div>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 
                          focus:ring-blue-500 focus:border-transparent transition-all duration-200
                          bg-white shadow-sm hover:border-blue-400"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-blue-900">
              Available Doctors
            </h2>
            <div className="text-sm text-gray-600">
              Showing {filteredDoctors.length} doctors
            </div>
          </div>
          {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DoctorCard
                  doctor={doctor}
                  patientId={userData?.id}
                />
              </motion.div>
            ))}
          </div>
        )}


{appointments.length > 0 && (
  <section className="mt-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold text-blue-900">
        Your Appointments
      </h2>
      <Button
        variant="outline"
        onClick={() => router.push(ROUTES.APPOINTMENTS)}
        className="text-blue-600 hover:text-blue-700"
      >
        View All Appointments
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {appointments.slice(0, 3).map((appointment) => (
        <motion.div
          key={appointment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              appointment.status === 'APPROVED' 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {appointment.status}
            </span>
            <span className="text-gray-500 text-sm">
              {appointment.appointmentDate.toLocaleDateString()}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {appointment.type} Appointment
          </h3>
          <div className="text-gray-600 space-y-2">
            <p>Date: {appointment.appointmentDate.toLocaleDateString()}</p>
            <p>Time: {appointment.appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            {appointment.symptoms && (
              <p className="text-sm text-gray-500">
                Symptoms: {appointment.symptoms}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4"
            onClick={() => router.push(`${ROUTES.APPOINTMENTS}/${appointment.id}`)}
          >
            View Details
          </Button>
        </motion.div>
      ))}
    </div>
  </section>
)}
      </main>
    </div>
  </div>
)
}

export default ClientDashboard