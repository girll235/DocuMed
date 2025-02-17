"use client"

import { useState, useEffect } from "react"
import { onSnapshot } from "firebase/firestore"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { db } from "@/lib/firebase"
import { COLLECTIONS, ROUTES } from "@/lib/constants"
import { Appointment, Doctor, Patient, Clinic } from "@/types"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CalendarDays, Clock, MapPin, User2 } from "lucide-react"

import { getStatusColor, getStatusStyle } from "@/lib/utils"
import { AppointmentStatus } from "@/types"
import { getStatusIndicatorColor, calculateAge } from "@/lib/utils"

const formatDate = (date: Date | { toDate(): Date } | any): string => {
    try {
      if (date instanceof Date) {
        return format(date, "MMMM d, yyyy")
      }
      if (date && typeof date.toDate === 'function') {
        return format(date.toDate(), "MMMM d, yyyy")
      }
      return 'Invalid date'
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }
  
  const formatTime = (date: Date | { toDate(): Date } | any): string => {
    try {
      if (date instanceof Date) {
        return format(date, "h:mm a")
      }
      if (date && typeof date.toDate === 'function') {
        return format(date.toDate(), "h:mm a")
      }
      return 'Invalid time'
    } catch (error) {
      console.error('Error formatting time:', error)
      return 'Invalid time'
    }
  }

  export const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const { role } = useUser();
    const displayPerson = role === 'DOCTOR' ? appointment.patient : appointment.doctor;
  
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 relative overflow-hidden"
        style={{ borderLeftColor: getStatusColor(appointment.status) }}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <Image
                  src={displayPerson?.photoURL || "/profile/profile.jpg"}
                  alt={displayPerson?.displayName || "Profile"}
                  width={80}
                  height={80}
                  className="rounded-full ring-2 ring-offset-2 ring-blue-100"
                />
                <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  getStatusIndicatorColor(appointment.status)
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                  {role === 'DOCTOR' 
                    ? displayPerson?.displayName
                    : `Dr. ${displayPerson?.displayName} ${displayPerson?.displayName}`
                  }
                </h3>
                {role === 'DOCTOR' && appointment.patient?.gender && (
                  <p className="text-gray-600">
                    Gender: {appointment.patient.gender}, 
                    Age: {appointment.patient.dateOfBirth 
                      ? calculateAge(appointment.patient.dateOfBirth) 
                      : 'N/A'}
                  </p>
                )}
                {role === 'PATIENT' && appointment.doctor?.specialty && (
                  <p className="text-blue-600 font-medium">{appointment.doctor.specialty}</p>
                )}
              </div>
            </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center text-gray-600 group-hover:text-blue-600 transition-colors">
                <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{formatDate(appointment.appointmentDate)}</span>
              </div>
              <div className="flex items-center text-gray-600 group-hover:text-blue-600 transition-colors">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{formatTime(appointment.appointmentDate)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600 group-hover:text-blue-600 transition-colors">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm truncate">{appointment.clinic?.name || "Main Clinic"}</span>
              </div>
              {appointment.type && (
                <div className="flex items-center text-gray-600 group-hover:text-blue-600 transition-colors">
                  <User2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm capitalize">{appointment.type.replace('-', ' ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
    getStatusStyle(appointment.status)
  }`}>
    {appointment.status}
    {appointment.lastModified && (
      <span className="ml-2 text-xs opacity-75">
        {format(appointment.lastModified, 'MMM d, h:mm a')}
      </span>
    )}
  </span>
  <span className="text-sm text-gray-500">
    {appointment.duration} minutes
  </span>
</div>
          {appointment.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 italic">
                "{appointment.notes}"
              </p>
            </div>
          )}
        </div>
      </CardContent>
      </Card>
  );
};

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { userData, role } = useUser()

  
  
  useEffect(() => {
    if (!userData?.id) return;
  
    setLoading(true);
    const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS);
    
    // Create query based on user role
    const q = role === 'DOCTOR' 
      ? query(
          appointmentsRef,
          where("doctorId", "==", userData.id),
          orderBy("appointmentDate", "desc")
        )
      : query(
          appointmentsRef,
          where("patientId", "==", userData.id),
          orderBy("appointmentDate", "desc")
        );
  
    const unsubscribe = onSnapshot(
      q,
      {
        next: async (appointmentsSnapshot) => {
          try {
            if (!appointmentsSnapshot.empty) {
              const [doctorsSnapshot, clinicsSnapshot, patientsSnapshot] = await Promise.all([
                getDocs(collection(db, COLLECTIONS.DOCTORS)),
                getDocs(collection(db, COLLECTIONS.CLINICS)),
                getDocs(collection(db, COLLECTIONS.PATIENTS))
              ]);
  
              // Update the lookup maps creation
const doctors: Record<string, Doctor> = Object.fromEntries(
  doctorsSnapshot.docs.map(doc => [
    doc.id,
    { id: doc.id, ...doc.data() } as Doctor
  ])
);

const patients: Record<string, Patient> = Object.fromEntries(
  patientsSnapshot.docs.map(doc => [
    doc.id,
    { id: doc.id, ...doc.data() } as Patient
  ])
);

const clinics: Record<string, Clinic> = Object.fromEntries(
  clinicsSnapshot.docs.map(doc => [
    doc.id,
    { id: doc.id, ...doc.data() } as Clinic
  ])
);
             // Update the appointments mapping section
             const appointmentsList = appointmentsSnapshot.docs.map((doc) => {
              const data = doc.data();
              const appointment: Appointment = {
                id: doc.id,
                patientId: data.patientId,
                doctorId: data.doctorId,
                clinicId: data.clinicId,
                appointmentDate: data.appointmentDate.toDate(),
                duration: data.duration,
                type: data.type,
                symptoms: data.symptoms,
                notes: data.notes,
                cancelledBy: data.cancelledBy,
                cancelReason: data.cancelReason,
                status: data.status as AppointmentStatus,
                lastModified: data.lastModified?.toDate(),
                modifiedBy: data.modifiedBy,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
                patient: patients[data.patientId] ? {
                  displayName: patients[data.patientId].displayName,
                  photoURL: patients[data.patientId].photoURL,
                  gender: patients[data.patientId].gender,
                  dateOfBirth: patients[data.patientId].dateOfBirth instanceof Date 
                    ? patients[data.patientId].dateOfBirth 
                    : new Date(patients[data.patientId].dateOfBirth) // Convert to Date directly
                } : undefined,
                doctor: doctors[data.doctorId] ? {
                  displayName: doctors[data.doctorId].displayName,
                  surname: doctors[data.doctorId].surname,
                  specialty: doctors[data.doctorId].specialtyId,
                  photoURL: doctors[data.doctorId].photoURL
                } : undefined,
                clinic: clinics[data.clinicId] ? {
                  name: clinics[data.clinicId].name,
                  address: clinics[data.clinicId].address
                } : undefined
              };
              
              return appointment;
            });
  
              setAppointments(appointmentsList);
              setError(null);
            } else {
              setAppointments([]);
              setError("No appointments found.");
            }
          } catch (error) {
            console.error('Error processing appointments:', error);
            setError('Failed to load appointments. Please try again later.');
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          console.error('Error in appointments subscription:', error);
          setError('Failed to load appointments. Please try again later.');
          setLoading(false);
        }
      }
    );
  
    return () => unsubscribe();
  }, [userData?.id, role]);

  const now = new Date()
  const getAppointmentDate = (appointmentDue: Date | { toDate(): Date }): Date => {
    return appointmentDue instanceof Date ? appointmentDue : appointmentDue.toDate()
  }
// Update the filteredAppointments object
const filteredAppointments = {
  upcoming: appointments.filter(app => 
    // Only show appointments that are:
    // 1. Not rejected, cancelled, or completed
    // 2. Have a future date
    !['REJECTED', 'CANCELLED', 'COMPLETED'].includes(app.status) && 
    getAppointmentDate(app.appointmentDate) >= now
  ),
  past: appointments.filter(app => 
    // Show appointments that are either:
    // 1. Rejected, cancelled, or completed
    // 2. Have a past date
    ['REJECTED', 'CANCELLED', 'COMPLETED'].includes(app.status) || 
    getAppointmentDate(app.appointmentDate) < now
  )
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        {error === "Please log in to view your appointments." && (
          <Link href={ROUTES.LOGIN} className="text-blue-500 hover:underline">
            Go to Login
          </Link>
        )}
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Your Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
  value="upcoming"
  className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
>
  Upcoming ({filteredAppointments.upcoming.length})
</TabsTrigger>
<TabsTrigger
  value="past"
  className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
>
  Past ({filteredAppointments.past.length})
</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-6">
            {filteredAppointments.upcoming.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAppointments.upcoming.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No upcoming appointments</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
              {filteredAppointments.past.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAppointments.past.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                <CalendarDays className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No past appointments.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default Appointments