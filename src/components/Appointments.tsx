"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { db } from "@/lib/firebase"
import { COLLECTIONS, APPOINTMENT_STATUS, ROUTES } from "@/lib/constants"
import { Appointment } from "@/types"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CalendarDays, Clock, MapPin, User2 } from "lucide-react"
import { toast } from "react-hot-toast"

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

const getStatusStyle = (status: string) => {
  const styles: { [key: string]: string } = {
    [APPOINTMENT_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
    [APPOINTMENT_STATUS.APPROVED]: "bg-green-100 text-green-800",
    [APPOINTMENT_STATUS.REJECTED]: "bg-red-100 text-red-800",
    [APPOINTMENT_STATUS.RESCHEDULED]: "bg-orange-100 text-orange-800"
  }
  return styles[status] || "bg-gray-100 text-gray-800"
}

export const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 relative overflow-hidden"
      style={{ borderLeftColor: appointment.status === "APPROVED" ? "#22c55e" : 
               appointment.status === "PENDING" ? "#eab308" : 
               appointment.status === "REJECTED" ? "#ef4444" : "#f97316" }}
    >
      <div className="absolute right-0 top-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <CalendarDays className="w-full h-full text-current" />
      </div>
      
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Image
                src={appointment.doctor?.photoURL || "/default-doctor.jpg"}
                alt={`${appointment.doctor?.displayName} ${appointment.doctor?.surname}`}
                width={80}
                height={80}
                className="rounded-full ring-2 ring-offset-2 ring-blue-100"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                appointment.status === "APPROVED" ? "bg-green-500" :
                appointment.status === "PENDING" ? "bg-yellow-500" :
                appointment.status === "REJECTED" ? "bg-red-500" : "bg-orange-500"
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                Dr. {appointment.doctor?.displayName} {appointment.doctor?.surname}
              </h3>
              <p className="text-blue-600 font-medium">{appointment.doctor?.specialty}</p>
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(appointment.status as string)}`}>
              {appointment.status.toString().charAt(0).toUpperCase() + appointment.status.toString().slice(1)}
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

const Appointments = () => {
  const { userData } = useUser()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")

  const fetchAppointments = async () => {
    if (!userData?.id) {
      setError("Please log in to view your appointments.");
      setLoading(false);
      return;
    }
  
    try {
      const appointmentsCollection = collection(db, COLLECTIONS.APPOINTMENTS);
      const q = query(
        appointmentsCollection, 
        where("patientId", "==", userData.id),
        orderBy("appointmentDate", "desc")
      );
      
      const [appointmentsSnapshot, doctorsSnapshot, clinicsSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(collection(db, COLLECTIONS.DOCTORS)),
        getDocs(collection(db, COLLECTIONS.CLINICS))
      ]);
  
      const doctors: { [key: string]: any } = doctorsSnapshot.docs.reduce((acc, doc) => ({
        ...acc,
        [doc.id]: doc.data()
      }), {});
  
      const clinics: { [key: string]: { name: string; address: string } } = clinicsSnapshot.docs.reduce((acc, doc) => ({
        ...acc,
        [doc.id]: doc.data()
      }), {});
  
      if (appointmentsSnapshot.empty) {
        setError("No appointments found.");
      } else {
        const appointmentsList = appointmentsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            appointmentDate: data.appointmentDate.toDate(),
            doctor: doctors[data.doctorId] ? {
              name: doctors[data.doctorId].name,
              surname: doctors[data.doctorId].surname,
              specialty: doctors[data.doctorId].specialty,
              photoUrl: doctors[data.doctorId].photoUrl
            } : undefined,
            clinic: clinics[data.clinicId] ? {
              name: clinics[data.clinicId].name,
              address: clinics[data.clinicId].address
            } : undefined
          } as Appointment;
        });
        
        setAppointments(appointmentsList);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to fetch appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: { [key: string]: string } = {
      [APPOINTMENT_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
      [APPOINTMENT_STATUS.APPROVED]: "bg-green-100 text-green-800",
      [APPOINTMENT_STATUS.REJECTED]: "bg-red-100 text-red-800",
      [APPOINTMENT_STATUS.RESCHEDULED]: "bg-orange-100 text-orange-800"
    }
    return styles[status] || "bg-gray-100 text-gray-800"
  }

  const now = new Date()
  const getAppointmentDate = (appointmentDue: Date | { toDate(): Date }): Date => {
    return appointmentDue instanceof Date ? appointmentDue : appointmentDue.toDate()
  }
  const filteredAppointments = {
    upcoming: appointments.filter(app => getAppointmentDate(app.appointmentDate) >= now),
    past: appointments.filter(app => getAppointmentDate(app.appointmentDate) < now)
  }

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
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming ({filteredAppointments.upcoming.length})
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                onClick={() => setActiveTab("past")}
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