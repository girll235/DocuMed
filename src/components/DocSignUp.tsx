"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { initializeDatabase } from "@/scripts/initializeDatabase"
import { Formik, Form, FieldArray, FormikTouched, FormikErrors } from "formik"
import Image from "next/image"
import Link from "next/link"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { collection, addDoc, updateDoc, doc, getDocs, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES, COLLECTIONS, USER_ROLES } from "@/lib/constants"
import { doctorSignUpSchema, initialValues, DoctorSignUpFormData } from "@/lib/validation/doctorSignUpSchema"
import { toast } from "react-hot-toast"
import { Specialty, Clinic } from "@/types"
import { Loader2, ArrowLeft, Plus, X } from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DocSignUp = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [clinics, setClinics] = useState<Clinic[]>([])
  const router = useRouter()

  const handleSubmit = async (values: DoctorSignUpFormData) => {
    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      const user = userCredential.user

      await updateProfile(user, {
        displayName: `${values.displayName} ${values.surname}`
      })

      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        ...values,
        password: undefined,
        confirmPassword: undefined,
        role: USER_ROLES.DOCTOR,
        uid: user.uid,
        createdAt: new Date().toISOString()
      })

      toast.success("Registration successful!")
      router.push(ROUTES.LOGIN)
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        // Check if collections exist first
        const [specialtiesSnap, clinicsSnap] = await Promise.all([
          getDocs(collection(db, COLLECTIONS.SPECIALTIES)),
          getDocs(collection(db, COLLECTIONS.CLINICS))
        ])

        if (specialtiesSnap.empty || clinicsSnap.empty) {
          console.error("Required collections are empty")
          // Initialize database if collections are empty
          await initializeDatabase()
          
          // Fetch data again after initialization
          const [newSpecialtiesSnap, newClinicsSnap] = await Promise.all([
            getDocs(collection(db, COLLECTIONS.SPECIALTIES)),
            getDocs(collection(db, COLLECTIONS.CLINICS))
          ])

          setSpecialties(newSpecialtiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Specialty[])

          setClinics(newClinicsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Clinic[])
        } else {
          setSpecialties(specialtiesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Specialty[])

          setClinics(clinicsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Clinic[])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load required data. Please try again.")
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  // Show loading state while fetching data
  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading registration form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl space-y-4 p-8">
            <div className="flex items-center justify-between">
              <Link href={ROUTES.SIGNUP}>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Image
                src="/logo/logo.png"
                alt="DocuMed Logo"
                width={48}
                height={48}
                className="rounded-full ring-2 ring-white/50"
              />
            </div>
            <CardTitle className="text-3xl font-bold text-center">
              Doctor Registration
            </CardTitle>
            <p className="text-blue-100 text-center">
              Join our network of healthcare professionals
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={doctorSignUpSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, getFieldProps, setFieldValue }) => (
                <Form className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Fields */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="displayName">First Name</Label>
                        <Input
                          id="displayName"
                          {...getFieldProps("displayName")}
                          className={`transition-all duration-200 ${
                            errors.displayName && touched.displayName
                              ? "border-red-500 ring-red-200"
                              : "hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200"
                          }`}
                        />
                        {errors.displayName && touched.displayName && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-1"
                          >
                            {errors.displayName}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="surname">Last Name</Label>
                      <Input
                        id="surname"
                        {...getFieldProps("surname")}
                        className={errors.surname && touched.surname ? "border-red-500" : ""}
                      />
                      {errors.surname && touched.surname && (
                        <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Specialty and Clinic Selection */}
                      <div className="space-y-4">
                        <Label htmlFor="specialtyId">Specialty</Label>
                        <Select
                          onValueChange={(value) => setFieldValue("specialtyId", value)}
                          defaultValue={values.specialtyId}
                        >
                          <SelectTrigger 
                            className={`transition-all duration-200 ${
                              errors.specialtyId && touched.specialtyId
                                ? "border-red-500 ring-red-200"
                                : "hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200"
                            }`}
                          >
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem
                                key={specialty.id}
                                value={specialty.id}
                                className="cursor-pointer hover:bg-blue-50"
                              >
                                {specialty.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                  <div>
                    <Label htmlFor="clinicId">Clinic</Label>
                    <Select
                      onValueChange={(value) => setFieldValue("clinicId", value)}
                      defaultValue={values.clinicId}
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
                </div>

                <div>
                <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    {...getFieldProps("licenseNumber")}
                    className={errors.licenseNumber && touched.licenseNumber ? "border-red-500" : ""}
                  />
                  {errors.licenseNumber && touched.licenseNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...getFieldProps("bio")}
                    className={errors.bio && touched.bio ? "border-red-500" : ""}
                  />
                  {errors.bio && touched.bio && (
                    <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      {...getFieldProps("experience")}
                      className={errors.experience && touched.experience ? "border-red-500" : ""}
                    />
                    {errors.experience && touched.experience && (
                      <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="consultationFee">Consultation Fee</Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      min="0"
                      {...getFieldProps("consultationFee")}
                      className={errors.consultationFee && touched.consultationFee ? "border-red-500" : ""}
                    />
                    {errors.consultationFee && touched.consultationFee && (
                      <p className="text-red-500 text-sm mt-1">{errors.consultationFee}</p>
                    )}
                  </div>
                </div>
                
 {/* Education Section */}
 <div className="space-y-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Education & Qualifications
                    </h3>
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
            <div className="flex justify-between">
              <h4>Education #{index + 1}</h4>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor={`education.${index}.degree`}>Degree</Label>
        <Input
          {...getFieldProps(`education.${index}.degree`)}
          className={
            (errors.education?.[index] as { degree?: string })?.degree && 
            touched.education?.[index]?.degree ? "border-red-500" : ""
          }
        />
      </div>
              <div>
                <Label htmlFor={`education.${index}.institution`}>Institution</Label>
                <Input
                  {...getFieldProps(`education.${index}.institution`)}
                  className={
                    (errors.education?.[index] as { institution?: string })?.institution && 
                    touched.education?.[index]?.institution ? "border-red-500" : ""
                  }
                />
              </div>
              <div>
                <Label htmlFor={`education.${index}.year`}>Year</Label>
                <Input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  {...getFieldProps(`education.${index}.year`)}
                  className={
                    (errors.education?.[index] as { year?: string })?.year && 
                    touched.education?.[index]?.year ? "border-red-500" : ""
                  }
                />
              </div>
            </div>
            </motion.div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => push({ degree: "", institution: "", year: new Date().getFullYear() })}
                            className="w-full border-dashed hover:border-blue-500 hover:text-blue-500 transition-all"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        </div>
                      )}
                    </FieldArray>
                  </div>

<div>
  <Label>Languages</Label>
  <FieldArray name="languages">
    {({ push, remove }) => (
      <div className="space-y-2">
        {values.languages.map((language, index) => (
          <div key={index} className="flex gap-2">
            <Input
              {...getFieldProps(`languages.${index}`)}
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
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    {...getFieldProps("email")}
    className={errors.email && touched.email ? "border-red-500" : ""}
  />
  {errors.email && touched.email && (
    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
  )}
</div>

<div>
  <Label htmlFor="phoneNumber">Phone Number</Label>
  <Input
    id="phoneNumber"
    type="tel"
    {...getFieldProps("phoneNumber")}
    className={errors.phoneNumber && touched.phoneNumber ? "border-red-500" : ""}
  />
  {errors.phoneNumber && touched.phoneNumber && (
    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
  )}
</div>

<div>
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    {...getFieldProps("password")}
    className={errors.password && touched.password ? "border-red-500" : ""}
  />
  {errors.password && touched.password && (
    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
  )}
</div>

<div>
  <Label htmlFor="confirmPassword">Confirm Password</Label>
  <Input
    id="confirmPassword"
    type="password"
    {...getFieldProps("confirmPassword")}
    className={errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""}
  />
  {errors.confirmPassword && touched.confirmPassword && (
    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
  )}
  </div>

  {/* Submit Button */}
  <div className="pt-6 border-t">
    <Button
      type="submit"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Creating Account...</span>
        </div>
      ) : (
        "Complete Registration"
      )}
    </Button>
  </div>
</Form>
            )}
            </Formik>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DocSignUp;