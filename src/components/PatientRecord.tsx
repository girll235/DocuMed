"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MedicalRecord, Patient } from "@/types"
import { COLLECTIONS, ROUTES } from "@/lib/constants"
import { toast } from "react-hot-toast"
import { Loader2, User, Phone, Mail, MapPin, Calendar, FileText } from "lucide-react"
import Image from "next/image"

export const PatientRecord = () => {
  const params = useParams()
  const patientId = params?.patientId as string
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true)
      try {
        // Get patient data
        const patientDoc = await getDoc(doc(db, COLLECTIONS.PATIENTS, patientId))

        if (!patientDoc.exists()) {
          toast.error("Patient not found!")
          setPatient(null)
          return
        }

        setPatient({ id: patientDoc.id, ...patientDoc.data() } as Patient)

        // Get medical records
        const medicalRecordsRef = collection(db, COLLECTIONS.MEDICAL_RECORDS)
        const recordsQuery = query(
          medicalRecordsRef,
          where("patientId", "==", patientId),
          orderBy("createdAt", "desc")
        )

        const recordsSnapshot = await getDocs(recordsQuery)
        const records = recordsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as MedicalRecord[]


        
        setMedicalHistory(records)
      } catch (error) {
        console.error("Error fetching patient data:", error)
        toast.error("Failed to load patient data")
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  const handleInsertDiagnosis = () => {
    router.push(`${ROUTES.DOC_INSERTION}?patientId=${patientId}`)
  }

  const handleEditInfo = () => {
    router.push(`${ROUTES.CLIENT_DASHBOARD}?patientId=${patientId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-red-500">Patient not found</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Image
              src={patient?.photoURL || "/default-patient.jpg"}
              alt={patient?.displayName || "Patient"}
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{patient?.displayName}</h1>
                  <p className="text-gray-500">Patient ID: {patient?.id}</p>
                </div>
                <Button variant="outline" onClick={handleEditInfo}>
                  Edit Profile
                </Button>
              </div>
              
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span>{patient?.gender}, {new Date().getFullYear() - new Date(patient?.dateOfBirth).getFullYear()} years old</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span>{patient?.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span>{patient?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>{patient?.address}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add overview content */}
            </CardContent>
          </Card>
        </TabsContent>
      <TabsContent value="history" className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Medical History</CardTitle>
            <Button onClick={handleInsertDiagnosis}>
              Add New Record
            </Button>
          </CardHeader>
          <CardContent>
            {medicalHistory.length > 0 ? (
              <div className="space-y-6">
                {medicalHistory.map((record) => (
                  <Card key={record.id} className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {record.createdAt.toLocaleString()}
                        </span>
                      </div>
                        
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">Diagnosis</h4>
                          <p>{record.diagnosis}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">Symptoms</h4>
                          <ul className="list-disc list-inside">
                            {record.symptoms.map((symptom, index) => (
                              <li key={index}>{symptom}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">Treatment</h4>
                          <p>{record.treatment}</p>
                        </div>
                        
                        {record.notes && (
                          <div>
                            <h4 className="font-semibold">Notes</h4>
                            <p>{record.notes}</p>
                          </div>
                        )}

{record.prescriptions && record.prescriptions.length > 0 && (
                          <div className="col-span-2">
                            <h4 className="font-semibold mb-2">Prescriptions</h4>
                            {record.prescriptions.map((prescription, index) => (
                              <div key={index} className="mb-2 p-2 bg-white rounded">
                                <p><strong>Medication:</strong> {prescription.medication}</p>
                                <p><strong>Dosage:</strong> {prescription.dosage}</p>
                                <p><strong>Frequency:</strong> {prescription.frequency}</p>
                                <p><strong>Duration:</strong> {prescription.duration}</p>
                                {prescription.notes && <p><strong>Notes:</strong> {prescription.notes}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No medical records available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      </Tabs>
    </div>
  )
}

export default PatientRecord