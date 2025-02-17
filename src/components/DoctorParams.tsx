"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, FieldArray } from "formik"
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore"
import { motion } from "framer-motion"
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

const defaultWorkingHours = {
  monday: { start: "09:00", end: "17:00" },
  tuesday: { start: "09:00", end: "17:00" },
  wednesday: { start: "09:00", end: "17:00" },
  thursday: { start: "09:00", end: "17:00" },
  friday: { start: "09:00", end: "17:00" },
  saturday: { start: "", end: "" },
  sunday: { start: "", end: "" }
};

const initialValues: DoctorParamsFormData = {
  displayName: "",
  surname: "",
  email: "",
  phoneNumber: "",
  specialtyId: "",
  clinicId: "",
  licenseNumber: "",
  bio: "",
  experience: 0,
  languages: ["English"],
  consultationFee: 0,
  education: [{ degree: '', institution: '', year: new Date().getFullYear() }],
  workingHours: defaultWorkingHours,
  password: "",
  confirmPassword: ""
};

const DoctorParams = () => {
  const { userData } = useUser()
    const [loading, setLoading] = useState(true)
    const [formValues, setFormValues] = useState(initialValues)
    const [specialties, setSpecialties] = useState<Specialty[]>([])
    const [clinics, setClinics] = useState<Clinic[]>([])

    useEffect(() => {
      const fetchData = async () => {
        if (!userData?.id) return;
    
        try {
          const [doctorDoc, specialtiesSnap, clinicsSnap] = await Promise.all([
            getDoc(doc(db, COLLECTIONS.DOCTORS, userData.id)),
            getDocs(collection(db, COLLECTIONS.SPECIALTIES)),
            getDocs(collection(db, COLLECTIONS.CLINICS))
          ]);
    
          if (doctorDoc.exists()) {
            const data = doctorDoc.data() as Doctor;
            setFormValues({
              ...initialValues,
              ...data,
              workingHours: data.workingHours || defaultWorkingHours,
              password: "",
              confirmPassword: ""
            });
          }
    
          setSpecialties(specialtiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Specialty[]);
    
          setClinics(clinicsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Clinic[]);
    
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load doctor data");
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
    }, [userData?.id]);
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-lg flex flex-col items-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-blue-600 animate-pulse">Loading your profile...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl p-8">
            <CardTitle className="text-3xl font-bold text-center">Profile Settings</CardTitle>
            <p className="text-blue-100 text-center mt-2">
              Manage your professional information
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <Formik
              initialValues={formValues}
              enableReinitialize
              validationSchema={doctorSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                <Form className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="doctor-form-section">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                 {/* Professional Information */}
   <div className="doctor-form-section">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Professional Details
                    </h3>
                    <div className="space-y-6"></div>
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


                      {/* Specialty and Clinic Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

{/* Bio */}
<div>
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Field
                          as={Textarea}
                          id="bio"
                          name="bio"
                          className={`h-32 ${
                            errors.bio && touched.bio
                              ? "border-red-500 focus:ring-red-200"
                              : "focus:ring-blue-200"
                          }`}
                          placeholder="Tell us about your experience and expertise..."
                        />
                        {errors.bio && touched.bio && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-1"
                          >
                            {errors.bio}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>


{/* Languages and Consultation */}
<div className="doctor-form-section">
  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
    Languages & Fees
  </h3>
  <FieldArray name="languages">
    {({ push, remove }) => (
      <div className="space-y-2">
        {values.languages.map((_, index) => (  // Changed 'language' to '_'
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
{/* Education Section */}
<div className="doctor-form-section">
  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
    Education & Experience
  </h3>
  <div className="space-y-6">
    <div>
      <Label htmlFor="experience">Years of Experience</Label>
      <Field
        as={Input}
        id="experience"
        name="experience"
        type="number"
        min="0"
        className={errors.experience && touched.experience ? "border-red-500" : ""}
      />
      {errors.experience && touched.experience && (
        <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
      )}
    </div>

    <FieldArray name="education">
      {({ push, remove }) => (
        <div className="space-y-4">
          {values.education.map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 border rounded-lg bg-gray-50 hover:shadow-md transition-all duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`education.${index}.degree`}>Degree</Label>
                  <Field
                    as={Input}
                    name={`education.${index}.degree`}
                    placeholder="e.g., MD, MBBS"
                    className={
                      typeof errors.education?.[index] === 'object' && 'degree' in errors.education[index] && 
                      touched.education?.[index]?.degree ? "border-red-500" : ""
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`education.${index}.institution`}>Institution</Label>
                  <Field
                    as={Input}
                    name={`education.${index}.institution`}
                    placeholder="University name"
                    className={
                      typeof errors.education?.[index] === 'object' && 'institution' in errors.education[index] && 
                      touched.education?.[index]?.institution ? "border-red-500" : ""
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`education.${index}.year`}>Year</Label>
                  <Field
                    as={Input}
                    type="number"
                    name={`education.${index}.year`}
                    min="1950"
                    max={new Date().getFullYear()}
                    className={
                      typeof errors.education?.[index] === 'object' && 'year' in errors.education[index] && 
                      touched.education?.[index]?.year ? "border-red-500" : ""
                    }
                  />
                </div>
              </div>
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </motion.div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => push({ 
              degree: '', 
              institution: '', 
              year: new Date().getFullYear() 
            })}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>
      )}
    </FieldArray>
  </div>
</div>
 {/* Working Hours */}
<div className="doctor-form-section">
  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
    Working Hours
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Object.entries(values.workingHours || defaultWorkingHours).map(([day, hours]) => (
      <div
        key={day}
        className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all duration-200"
      >
        <div className="flex flex-col space-y-4">
          <h4 className="font-medium capitalize">{day}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`workingHours.${day}.start`}>Start Time</Label>
              <Field
                as={Input}
                type="time"
                id={`workingHours.${day}.start`}
                name={`workingHours.${day}.start`}
                value={hours.start}
                className={
                  errors.workingHours?.[day]?.start && 
                  touched.workingHours?.[day]?.start 
                    ? "border-red-500" 
                    : ""
                }
              />
            </div>
            <div>
              <Label htmlFor={`workingHours.${day}.end`}>End Time</Label>
              <Field
                as={Input}
                type="time"
                id={`workingHours.${day}.end`}
                name={`workingHours.${day}.end`}
                value={hours.end}
                className={
                  errors.workingHours?.[day]?.end && 
                  touched.workingHours?.[day]?.end 
                    ? "border-red-500" 
                    : ""
                }
              />
            </div>
            {/* Optional break time */}
            {hours.break && (
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`workingHours.${day}.break.start`}>Break Start</Label>
                  <Field
                    as={Input}
                    type="time"
                    id={`workingHours.${day}.break.start`}
                    name={`workingHours.${day}.break.start`}
                    value={hours.break.start}
                  />
                </div>
                <div>
                  <Label htmlFor={`workingHours.${day}.break.end`}>Break End</Label>
                  <Field
                    as={Input}
                    type="time"
                    id={`workingHours.${day}.break.end`}
                    name={`workingHours.${day}.break.end`}
                    value={hours.break.end}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
                {/* Password Section */}
                <div className="doctor-form-section">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Security
                    </h3>
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

                 {/* Submit Button */}
                 <motion.div
                    className="pt-6"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </motion.div>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default DoctorParams