"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, FieldArray } from "formik"
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore"
import { updatePassword } from "firebase/auth"
import { toast } from "react-hot-toast"
import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@/contexts/UserContext"
import { COLLECTIONS } from "@/lib/constants"
import { doctorSchema, DoctorParamsFormData } from "@/lib/validation/doctorSchema"
import { Loader2, Plus, X } from "lucide-react"
import { Doctor, Specialty, Clinic } from "@/types"

const initialValues: DoctorParamsFormData = {
  displayName: "",
  surname: "",
  email: "",
  phoneNumber: "",
  specialtyId: "",
  clinicId: "",
  bio: "",
  languages: ["English"],
  consultationFee: 0,
  workingHours: {
    monday: { start: "09:00", end: "17:00" },
    tuesday: { start: "09:00", end: "17:00" },
    wednesday: { start: "09:00", end: "17:00" },
    thursday: { start: "09:00", end: "17:00" },
    friday: { start: "09:00", end: "17:00" }
  },
  password: "",
  confirmPassword: ""
}

const DoctorParams = () => {
  const { userData } = useUser()
    const [loading, setLoading] = useState(true)
    const [formValues, setFormValues] = useState(initialValues)
    const [specialties, setSpecialties] = useState<Specialty[]>([])
    const [clinics, setClinics] = useState<Clinic[]>([])

    useEffect(() => {
      const fetchData = async () => {
        if (!userData?.id) return
  
        try {
          const [doctorDoc, specialtiesSnap, clinicsSnap] = await Promise.all([
            getDoc(doc(db, COLLECTIONS.DOCTORS, userData.id)),
            getDocs(collection(db, COLLECTIONS.SPECIALTIES)),
            getDocs(collection(db, COLLECTIONS.CLINICS))
          ])
  
          if (doctorDoc.exists()) {
            const data = doctorDoc.data() as Doctor
            setFormValues({
              displayName: data.displayName,
              surname: data.surname,
              email: data.email,
              phoneNumber: data.phoneNumber,
              specialtyId: data.specialtyId,
              clinicId: data.clinicId,
              bio: data.bio,
              languages: data.languages,
              consultationFee: data.consultationFee,
              workingHours: data.workingHours,
              password: "",
              confirmPassword: ""
            })
          }
  
          setSpecialties(specialtiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Specialty[])
  
          setClinics(clinicsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Clinic[])
  
        } catch (error) {
          console.error("Error fetching data:", error)
          toast.error("Failed to load doctor data")
        } finally {
          setLoading(false)
        }
      }
  
      fetchData()
    }, [userData?.id])
    const handleSubmit = async (values: DoctorParamsFormData, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
      if (!userData?.id) {
        toast.error("No user ID found")
        return
      }
  
      try {
        const docRef = doc(db, COLLECTIONS.DOCTORS, userData.id)
        const updateData: Partial<Doctor> = {
          displayName: values.displayName,
          surname: values.surname,
          email: values.email,
          phoneNumber: values.phoneNumber,
          specialtyId: values.specialtyId,
          clinicId: values.clinicId,
          bio: values.bio,
          languages: values.languages,
          consultationFee: values.consultationFee,
          workingHours: values.workingHours,
          updatedAt: new Date()
        }
  
        await updateDoc(docRef, updateData)
      // Only update password if a new one is provided
      if (values.password && values.password.length > 0 && auth.currentUser) {
        await updatePassword(auth.currentUser, values.password)
      }

      toast.success("Profile updated successfully!")
    } catch (err) {
      console.error("Error updating profile:", err)
      toast.error("Failed to update profile")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }


  return (
    <div className="container mx-auto p-4 mt-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Doctor Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={formValues}
            enableReinitialize
            validationSchema={doctorSchema}
            onSubmit={handleSubmit}
          >
           {({ values, errors, touched, isSubmitting, getFieldProps, setFieldValue }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">First Name</Label>
                    <Field
                      as={Input}
                      id="displayName"
                      name="displayName"
                      className={errors.displayName && touched.displayName ? "border-red-500" : ""}
                    />
                    {errors.displayName && touched.displayName && (
                      <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="surname">Last Name</Label>
                    <Field
                      as={Input}
                      id="surname"
                      name="surname"
                      className={errors.surname && touched.surname ? "border-red-500" : ""}
                    />
                    {errors.surname && touched.surname && (
                      <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                    )}
                  </div>
                </div>

                // Add after the name fields grid and before the password section
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Field
      as={Input}
      id="email"
      name="email"
      type="email"
      className={errors.email && touched.email ? "border-red-500" : ""}
    />
    {errors.email && touched.email && (
      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
    )}
  </div>

  <div>
    <Label htmlFor="phoneNumber">Phone Number</Label>
    <Field
      as={Input}
      id="phoneNumber"
      name="phoneNumber"
      className={errors.phoneNumber && touched.phoneNumber ? "border-red-500" : ""}
    />
    {errors.phoneNumber && touched.phoneNumber && (
      <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
    )}
  </div>
</div>

<div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="specialtyId">Specialty</Label>
    <Select
      onValueChange={(value) => setFieldValue("specialtyId", value)}
      value={values.specialtyId}
    >
      <SelectTrigger className={errors.specialtyId && touched.specialtyId ? "border-red-500" : ""}>
        <SelectValue placeholder="Select specialty" />
      </SelectTrigger>
      <SelectContent>
        {specialties.map((specialty) => (
          <SelectItem key={specialty.id} value={specialty.id}>
            {specialty.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors.specialtyId && touched.specialtyId && (
      <p className="text-red-500 text-sm mt-1">{errors.specialtyId}</p>
    )}
  </div>

  <div>
    <Label htmlFor="clinicId">Clinic</Label>
    <Select
      onValueChange={(value) => setFieldValue("clinicId", value)}
      value={values.clinicId}
    >
      <SelectTrigger className={errors.clinicId && touched.clinicId ? "border-red-500" : ""}>
        <SelectValue placeholder="Select clinic" />
      </SelectTrigger>
      <SelectContent>
        {clinics.map((clinic) => (
          <SelectItem key={clinic.id} value={clinic.id}>
            {clinic.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {errors.clinicId && touched.clinicId && (
      <p className="text-red-500 text-sm mt-1">{errors.clinicId}</p>
    )}
  </div>
</div>

<div>
  <Label htmlFor="bio">Bio</Label>
  <Field
    as={Textarea}
    id="bio"
    name="bio"
    className={errors.bio && touched.bio ? "border-red-500" : ""}
  />
  {errors.bio && touched.bio && (
    <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
  )}
</div>

<div>
  <Label>Languages</Label>
  <FieldArray name="languages">
    {({ push, remove }) => (
      <div className="space-y-2">
        {values.languages.map((language, index) => (
          <div key={index} className="flex gap-2">
            <Field
              as={Input}
              name={`languages.${index}`}
              placeholder="Enter language"
              className={
                errors.languages?.[index] && 
                Array.isArray(touched.languages) && 
                touched.languages[index] 
                  ? "border-red-500" 
                  : ""
              }
            />
            {index > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => push("")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>
    )}
  </FieldArray>
</div>

<div>
  <Label htmlFor="consultationFee">Consultation Fee</Label>
  <Field
    as={Input}
    id="consultationFee"
    name="consultationFee"
    type="number"
    min="0"
    className={errors.consultationFee && touched.consultationFee ? "border-red-500" : ""}
  />
  {errors.consultationFee && touched.consultationFee && (
    <p className="text-red-500 text-sm mt-1">{errors.consultationFee}</p>
  )}
</div>

<div>
  <Label>Working Hours</Label>
  {Object.entries(values.workingHours).map(([day, hours]) => (
    <div key={day} className="grid grid-cols-2 gap-4 mt-2">
      <div>
        <Label htmlFor={`workingHours.${day}.start`} className="capitalize">{day} Start</Label>
        <Field
          as={Input}
          type="time"
          id={`workingHours.${day}.start`}
          name={`workingHours.${day}.start`}
          className={
            errors.workingHours?.[day]?.start && 
            touched.workingHours?.[day]?.start 
              ? "border-red-500" 
              : ""
          }
        />
      </div>
      <div>
        <Label htmlFor={`workingHours.${day}.end`} className="capitalize">{day} End</Label>
        <Field
          as={Input}
          type="time"
          id={`workingHours.${day}.end`}
          name={`workingHours.${day}.end`}
          className={
            errors.workingHours?.[day]?.end && 
            touched.workingHours?.[day]?.end 
              ? "border-red-500" 
              : ""
          }
        />
      </div>
    </div>
  ))}
</div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="password">New Password</Label>
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type="password"
                        className={errors.password && touched.password ? "border-red-500" : ""}
                      />
                      {errors.password && touched.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Field
                        as={Input}
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className={errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""}
                      />
                      {errors.confirmPassword && touched.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  )
}

export default DoctorParams