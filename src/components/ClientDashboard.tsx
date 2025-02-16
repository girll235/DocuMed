"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Doctor, Specialty, Clinic } from "@/types"
import { COLLECTIONS, ROUTES, USER_ROLES } from "@/lib/constants"
import { useUser } from "@/contexts/UserContext"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
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
  
    const router = useRouter()
    const { userData, role } = useUser()
  
    useEffect(() => {
      if (role && role !== USER_ROLES.PATIENT) {
        router.push(ROUTES.LOGIN)
        return
      }
  
      const fetchData = async () => {
        try {
          const [doctorsSnap, specialtiesSnap] = await Promise.all([
            getDocs(query(
              collection(db, COLLECTIONS.DOCTORS),
              where("verified", "==", true),
              where("active", "==", true)
            )),
            getDocs(collection(db, COLLECTIONS.SPECIALTIES))
          ]);
  
          const specialtiesList = specialtiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Specialty[];
  
          const doctorsList = await Promise.all(doctorsSnap.docs.map(async (docSnap) => {
            const doctorData = docSnap.data() as Doctor;
            const specialty = specialtiesList.find(s => s.id === doctorData.specialtyId);
            const clinicSnap = await getDocs(
              query(collection(db, COLLECTIONS.CLINICS), 
              where("id", "==", doctorData.clinicId))
            );
            const clinic = clinicSnap.docs[0]?.data() as Clinic;
  
            return {
              ...doctorData,
              id: docSnap.id,
              specialty: specialty?.name || 'Unknown Specialty',
              clinic: clinic ? {
                name: clinic.name,
                address: clinic.address
              } : undefined
            };
          }));
  
          setDoctors(doctorsList);
          setSpecialties(specialtiesList);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load doctors");
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [role, router]);

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
      </main>
    </div>
  </div>
)
}

export default ClientDashboard