"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CiSearch } from "react-icons/ci"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useUser } from "@/contexts/UserContext"
import { Doctor, Appointment, Patient } from "@/types"
import { COLLECTIONS, ROUTES, APPOINTMENT_STATUS } from "@/lib/constants"
import { toast } from "react-hot-toast"
import { format } from "date-fns"

const DocDashboard = () => {
  const router = useRouter()
  const { userData } = useUser()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [doctorData, setDoctorData] = useState<Doctor | null>(null)

  useEffect(() => {
    const fetchDoctorAndAppointments = async () => {
      if (!userData?.email) {
        router.push(ROUTES.LOGIN)
        return
      }

      try {
        setIsLoading(true)
        // First, get the doctor's data
        const doctorsQuery = query(
          collection(db, COLLECTIONS.DOCTORS),
          where("email", "==", userData.email)
        )
        const doctorSnapshot = await getDocs(doctorsQuery)

        if (doctorSnapshot.empty) {
          toast.error("Doctor profile not found")
          return
        }

        const doctorDoc = doctorSnapshot.docs[0]
        const doctor = { id: doctorDoc.id, ...doctorDoc.data() } as Doctor

        setDoctorData(doctor)

        // Then fetch appointments
        const appointmentsQuery = query(
          collection(db, COLLECTIONS.APPOINTMENTS),
          where("doctorId", "==", doctor.id)
        )

        const [appointmentsSnapshot, patientsSnapshot, clinicsSnapshot] = await Promise.all([
          getDocs(appointmentsQuery),
          getDocs(collection(db, COLLECTIONS.PATIENTS)),
          getDocs(collection(db, COLLECTIONS.CLINICS))
        ])

        const patients = patientsSnapshot.docs.reduce((acc, doc) => ({
          ...acc,
          [doc.id]: doc.data() as Patient
        }), {} as Record<string, Patient>)

        const clinics = clinicsSnapshot.docs.reduce((acc, doc) => ({
          ...acc,
          [doc.id]: doc.data()
        }), {} as Record<string, any>)

        const appointmentsList = appointmentsSnapshot.docs.map((doc) => {
          const data = doc.data()
          const patient = patients[data.patientId]
          const clinic = clinics[data.clinicId]

          return {
            id: doc.id,
            patientId: data.patientId,
            doctorId: data.doctorId,
            clinicId: data.clinicId,
            appointmentDate: data.appointmentDate.toDate(),
            duration: data.duration,
            status: data.status,
            notes: data.notes || "",
            specialty: data.specialty,
            appointmentType: data.appointmentType,
            appointmentDue: data.appointmentDue,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            type: data.type || "regular",
            docName: doctor.displayName || "N/A",
            docSurname: doctor.surname || "N/A",
            patient: {
              displayName: patient?.displayName || "N/A",
              photoURL: patient?.photoURL,
              gender: patient?.gender,
              dateOfBirth: patient?.dateOfBirth
            },
            clinic: {
              name: clinic?.name,
              address: clinic?.address
            }
          } as Appointment
        })

        setAppointments(appointmentsList)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load appointments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctorAndAppointments()
  }, [userData, router])
  const handleAction = async (
    appointmentId: string,
    action: "accept" | "reject" | "delay",
    patientId: string
  ) => {
    try {
      const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId)
      const status = action === "accept" ? "APPROVED" 
        : action === "reject" ? "REJECTED" 
        : "RESCHEDULED"

      await updateDoc(appointmentRef, { status })
      
      if (action === "accept") {
        router.push(`${ROUTES.PATIENT_RECORD}/${patientId}`)
      }

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status } : app
        )
      )

      toast.success(`Appointment ${action}ed successfully`)
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error)
      toast.error(`Failed to ${action} appointment`)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push(ROUTES.LOGIN)
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to logout")
    }
  }

  const formatDate = (date: Date | { toDate(): Date } | undefined): string => {
    if (!date) return 'Invalid date'
    if (date instanceof Date) return date.toLocaleString()
    if ('toDate' in date) return date.toDate().toLocaleString()
    return 'Invalid date'
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.patient?.displayName.toLowerCase().includes(searchLower) ||
      appointment.type.toLowerCase().includes(searchLower) ||
      appointment.doctor?.specialty.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <Card className="max-w-7xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Dashboard</CardTitle>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
              <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Image
                src={userData?.photoURL || "/default-avatar.png"}
                alt="Doctor Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">{userData?.displayName}</span>
            </div>
          </div>

          <section>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Today's Appointments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Surname
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Image
                          src={appointment.patient?.photoURL || "/default-patient.jpg"}
                          alt={appointment.patient?.displayName || "Patient"}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.patient?.displayName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(appointment.appointmentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.doctor?.specialty || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => handleAction(appointment.id, "accept", appointment.patientId)}
                          className="bg-green-500 hover:bg-green-600 mr-2"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleAction(appointment.id, "reject", appointment.patientId)}
                          className="bg-red-500 hover:bg-red-600 mr-2"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleAction(appointment.id, "delay", appointment.patientId)}
                          className="bg-yellow-500 hover:bg-yellow-600"
                        >
                          Delay
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

export default DocDashboard