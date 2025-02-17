"use client"
import { signOut } from "firebase/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { CalendarDays, Clock, User2 } from "lucide-react"
import { CiSearch } from "react-icons/ci"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useUser } from "@/contexts/UserContext"
import { Doctor, Appointment, Patient, AppointmentStatus } from "@/types"
import { COLLECTIONS, ROUTES } from "@/lib/constants"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { confirm } from "@/lib/utils"
import { getStatusStyle } from "@/lib/utils"

const filterAppointments = (appointments: Appointment[]) => {
  const now = new Date();
  return {
    active: appointments.filter(app => 
      app.status === 'PENDING' &&
      new Date(app.appointmentDate) >= now
    ),
    upcoming: appointments.filter(app => 
      (app.status === 'APPROVED' || app.status === 'RESCHEDULED') &&
      new Date(app.appointmentDate) >= now
    ),
    ongoing: appointments.filter(app => 
      app.status === 'ONGOING'
    ),
    past: appointments.filter(app => 
      (app.status === 'COMPLETED' || app.status === 'REJECTED' || app.status === 'CANCELLED') ||
      new Date(app.appointmentDate) < now
    )
  };
};


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
    appointmentDate: Date
  ) => {
    try {
      let status: AppointmentStatus;
      const now = new Date();
      
      switch (action) {
        case "accept":
          const appointmentTime = new Date(appointmentDate);
          const timeDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60);
          status = timeDiff <= 60 && timeDiff >= -30 ? "ONGOING" : "APPROVED";
          break;
        case "reject":
          status = "REJECTED";
          break;
        case "delay":
          status = "RESCHEDULED";
          break;
        default:
          throw new Error("Invalid action");
      }
  
      const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    await updateDoc(appointmentRef, {
      status,
      lastModified: now,
      modifiedBy: userData?.id
    });

    // Update local state based on the new status
    if (["REJECTED", "COMPLETED", "CANCELLED"].includes(status)) {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } else {
      setAppointments(prev => prev.map(app => 
        app.id === appointmentId 
          ? { ...app, status, lastModified: now }
          : app
      ));
    }

    const actionMessages: Record<AppointmentStatus, string> = {
      ONGOING: "started",
      APPROVED: "accepted",
      REJECTED: "rejected",
      RESCHEDULED: "rescheduled",
      PENDING: "pending",
      CANCELLED: "cancelled",
      COMPLETED: "completed"
    };
    toast.success(`Appointment ${actionMessages[status]} successfully`);
  } catch (error) {
    console.error(`Error handling appointment action:`, error);
    toast.error(`Failed to process appointment action`);
  }
};
// Update the stats section in your JSX

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully")
      router.push(ROUTES.LOGIN)
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out")
    }
  }

  const handleEditDecision = async (
    appointmentId: string, 
    currentStatus: string
  ) => {
    const confirmed = await confirm(
      `Do you want to change your ${currentStatus.toLowerCase()} decision?`
    );
    
    if (confirmed) {
      try {
        const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
        await updateDoc(appointmentRef, {
          status: 'PENDING',
          lastModified: new Date(),
          modifiedBy: userData?.id
        });
        
        toast.success('Appointment status reset successfully');
      } catch (error) {
        console.error('Error resetting appointment status:', error);
        toast.error('Failed to reset appointment status');
      }
    }
  };




  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-lg flex flex-col items-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-blue-600 animate-pulse">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Doctor Dashboard</CardTitle>
                <p className="text-blue-100 mt-1">Welcome back, Dr. {userData?.displayName}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-blue-100">Current Time</p>
                  <p className="text-lg">{new Date().toLocaleTimeString()}</p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="hover:bg-white/20 text-white"
                >
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Image
                    src={userData?.photoURL || "/profile/profile.jpg"}
                    alt="Doctor Profile"
                    width={64}
                    height={64}
                    className="rounded-full ring-4 ring-white shadow-lg"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{userData?.displayName}</h2>
                  <p className="text-blue-600">{doctorData?.specialtyId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none md:w-64">
                  <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">

{/* Stats Section */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  {(() => {
    const filtered = filterAppointments(appointments);
    return [
      { 
        title: "Pending Appointments", 
        value: filtered.active.length, 
        icon: CalendarDays 
      },
      { 
        title: "Upcoming Approved", 
        value: filtered.upcoming.length, 
        icon: Clock 
      },
      { 
        title: "Ongoing Sessions", 
        value: filtered.ongoing.length, 
        icon: User2 
      },
      { 
        title: "Past Appointments", 
        value: filtered.past.length, 
        icon: Clock 
      }
    ].map((stat, index) => (
      <motion.div
        key={stat.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <stat.icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </motion.div>
    ));
  })()}
</div>

              {/* Appointments Table */}
              <Card className="overflow-hidden">
  <CardHeader className="bg-gray-50 py-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Pending Appointments</h3>
      <Link href={ROUTES.APPOINTMENTS}>
        <Button variant="outline" className="flex items-center">
          View All Appointments
        </Button>
      </Link>
    </div>
              </CardHeader>
  <CardContent className="p-0">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
        {filterAppointments(appointments).active.map((appointment) => (
          <motion.tr
            key={appointment.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-gray-50 transition-colors"
          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Image
                                  src={appointment.patient?.photoURL || "/profile/profile.jpg"}
                                  alt={appointment.patient?.displayName || "Patient"}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900">
                                    {appointment.patient?.displayName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Patient ID: {appointment.patientId.slice(0, 8)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {format(appointment.appointmentDate, 'PPP')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(appointment.appointmentDate, 'p')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
  {appointment.status === 'PENDING' ? (
    <div className="flex space-x-2">
      <Button
        onClick={() => handleAction(
          appointment.id, 
          "accept", 
          appointment.appointmentDate
        )}
        variant="outline"
        className="bg-green-50 text-green-700 hover:bg-green-100"
      >
        Accept
      </Button>
      <Button
        onClick={() => handleAction(
          appointment.id, 
          "reject", 
          appointment.appointmentDate
        )}
        variant="outline"
        className="bg-red-50 text-red-700 hover:bg-red-100"
      >
        Reject
      </Button>
      <Button
        onClick={() => handleAction(
          appointment.id, 
          "delay", 
          appointment.appointmentDate
        )}
        variant="outline"
        className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
      >
        Delay
      </Button>
    </div>
  ) : (
    <div className="flex items-center space-x-2">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${getStatusStyle(appointment.status)}`}>
        {appointment.status === 'ONGOING' && 
          <span className="mr-2 h-2 w-2 rounded-full bg-purple-500 animate-pulse"/>
        }
        {appointment.status}
      </span>
      <Button
        onClick={() => handleEditDecision(appointment.id, appointment.status)}
        variant="ghost"
        className="text-blue-600 hover:text-blue-800"
        size="sm"
      >
        Edit Decision
      </Button>
      <Link
        href={`${ROUTES.PATIENT_RECORD}/${appointment.patientId}`}
        className="text-blue-600 hover:text-blue-800 text-sm underline"
      >
        View Profile
      </Link>
    </div>
  )}
</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    
                   
                      </table>
    {filterAppointments(appointments).active.length === 0 && (
      <div className="text-center py-8">
        <p className="text-gray-500">No pending appointments</p>
      </div>
    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DocDashboard