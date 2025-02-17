"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Formik, Form, FormikHelpers } from "formik"
import Image from "next/image"
import Link from "next/link"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROUTES, COLLECTIONS, USER_ROLES } from "@/lib/constants"
import { clientSchema, initialValues } from "@/lib/validation/clientSchema"
import type { ClientSignUpFormData } from "@/types"
import { toast } from "react-hot-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { initializeUserRole } from '@/lib/auth';



const CITIES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Sousse",
  "Sfax",
  "Bizerte",
] as const
const STATE_GOVERNORATES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Medenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kebili"
] as const

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const

export default function ClientSignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (
    values: ClientSignUpFormData,
    { setSubmitting, setStatus }: FormikHelpers<ClientSignUpFormData>
  ) => {
    setIsLoading(true);
    setSubmitting(true);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
  
      const user = userCredential.user;
  

      console.log("User account created:", userCredential.user.uid); // Debug log
      await initializeUserRole(user.uid, values.email, USER_ROLES.PATIENT);

      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: values.displayName
      })

      // Create user document in Firestore
      await setDoc(doc(db, COLLECTIONS.PATIENTS, user.uid), {
        displayName: values.displayName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        city: values.city,
        state: values.state,
        zip: values.zip,
        gender: values.gender,
        dateOfBirth: new Date(values.dateOfBirth),
        bloodType: values.bloodType || "",
        allergies: values.allergies || [],
        emergencyContact: {
          name: values.emergencyContact.name,
          relationship: values.emergencyContact.relationship,
          phone: values.emergencyContact.phone
        },
        type: USER_ROLES.PATIENT,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        photoURL: ""
      })

      console.log("User document created in Firestore"); // Debug log
      toast.success("Registration successful!")
      router.push(ROUTES.CLIENT_DASHBOARD)
    } catch (error) {
      console.error("Error during signup:", error); // Debug log
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      toast.error(errorMessage)
      setStatus(errorMessage)
    } finally {
      setIsLoading(false)
      setSubmitting(false)
    }
  }

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl space-y-4 px-6 py-8">
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
                  Patient Registration
                </CardTitle>
                <p className="text-blue-100 text-center">
                  Create your account to get started
                </p>
              </CardHeader>
    
              <CardContent className="p-8">
              <Formik
      initialValues={initialValues}
      validationSchema={clientSchema}
      onSubmit={handleSubmit}
      validateOnMount={true}
    >
      {({ errors, touched, getFieldProps, setFieldValue, isSubmitting, status, isValid }) => (
                <Form className="space-y-6" noValidate>

                      {/* Personal Information Section */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="displayName">Full Name</Label>
                            <Input
                              id="displayName"
                              {...getFieldProps("displayName")}
                              className={`mt-1 ${
                                errors.displayName && touched.displayName
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {errors.displayName && touched.displayName && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.displayName}
                              </p>
                            )}
                          </div>
    
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              {...getFieldProps("email")}
                              className={`mt-1 ${
                                errors.email && touched.email ? "border-red-500" : ""
                              }`}
                            />
                            {errors.email && touched.email && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                              </p>
                            )}
                          </div>
                        </div>
    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              {...getFieldProps("phoneNumber")}
                              className={`mt-1 ${
                                errors.phoneNumber && touched.phoneNumber
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {errors.phoneNumber && touched.phoneNumber && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.phoneNumber}
                              </p>
                            )}
                          </div>
    
                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                              id="dateOfBirth"
                              type="date"
                              {...getFieldProps("dateOfBirth")}
                              className={`mt-1 ${
                                errors.dateOfBirth && touched.dateOfBirth
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {errors.dateOfBirth && touched.dateOfBirth && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.dateOfBirth}
                              </p>
                            )}
                          </div>
                        </div>
    
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            onValueChange={(value) => setFieldValue("gender", value)}
                            defaultValue={initialValues.gender}
                          >
                            <SelectTrigger
                              className={`${
                                errors.gender && touched.gender ? "border-red-500" : ""
                              }`}
                            >
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                            <SelectContent>
                              {GENDERS.map((gender) => (
                                <SelectItem key={gender.value} value={gender.value}>
                                  {gender.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.gender && touched.gender && (
                            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                          )}
                        </div>
                      </div>
    
                      {/* Location Details Section */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          Location Details
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              {...getFieldProps("address")}
                              className={`${
                                errors.address && touched.address ? "border-red-500" : ""
                              }`}
                            />
                            {errors.address && touched.address && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.address}
                              </p>
                            )}
                          </div>
    
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Select
                                onValueChange={(value) => setFieldValue("city", value)}
                                defaultValue={initialValues.city}
                              >
                                <SelectTrigger
                                  className={`${
                                    errors.city && touched.city ? "border-red-500" : ""
                                  }`}
                                >
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CITIES.map((city) => (
                                    <SelectItem key={city} value={city}>
                                      {city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.city && touched.city && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors.city}
                                </p>
                              )}
                            </div>
<div>
  <Label htmlFor="state">State/Governorate</Label>
  <Select
    onValueChange={(value) => setFieldValue("state", value)}
    defaultValue={initialValues.state}
  >
    <SelectTrigger
      className={`${
        errors.state && touched.state ? "border-red-500" : ""
      }`}
    >
      <SelectValue placeholder="Select state" />
    </SelectTrigger>
    <SelectContent>
      {STATE_GOVERNORATES.map((state) => (
        <SelectItem key={state} value={state}>
          {state}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  {errors.state && touched.state && (
    <p className="text-red-500 text-sm mt-1">
      {errors.state}
    </p>
  )}
</div>
                            <div>
                              <Label htmlFor="zip">ZIP Code</Label>
                              <Input
                                id="zip"
                                {...getFieldProps("zip")}
                                className={`${
                                  errors.zip && touched.zip ? "border-red-500" : ""
                                }`}
                              />
                              {errors.zip && touched.zip && (
                                <p className="text-red-500 text-sm mt-1">{errors.zip}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
   {/* Emergency Contact Section */}
<div className="space-y-6">
  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
    Emergency Contact
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <Label htmlFor="emergencyContact.name">Contact Name</Label>
      <Input
        id="emergencyContact.name"
        {...getFieldProps("emergencyContact.name")}
        className={`${
          errors.emergencyContact?.name && touched.emergencyContact?.name
            ? "border-red-500"
            : ""
        }`}
      />
      {errors.emergencyContact?.name && touched.emergencyContact?.name && (
        <p className="text-red-500 text-sm mt-1">
          {errors.emergencyContact.name}
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="emergencyContact.relationship">Relationship</Label>
      <Input
        id="emergencyContact.relationship"
        {...getFieldProps("emergencyContact.relationship")}
        className={`${
          errors.emergencyContact?.relationship && touched.emergencyContact?.relationship
            ? "border-red-500"
            : ""
        }`}
      />
      {errors.emergencyContact?.relationship && touched.emergencyContact?.relationship && (
        <p className="text-red-500 text-sm mt-1">
          {errors.emergencyContact.relationship}
        </p>
      )}
    </div>

    <div className="md:col-span-2">
      <Label htmlFor="emergencyContact.phone">Contact Phone</Label>
      <Input
        id="emergencyContact.phone"
        type="tel"
        {...getFieldProps("emergencyContact.phone")}
        className={`${
          errors.emergencyContact?.phone && touched.emergencyContact?.phone
            ? "border-red-500"
            : ""
        }`}
        placeholder="+216-XX-XXX-XXX"
      />
      {errors.emergencyContact?.phone && touched.emergencyContact?.phone && (
        <p className="text-red-500 text-sm mt-1">
          {errors.emergencyContact.phone}
        </p>
      )}
    </div>
  </div>
</div>
                      {/* Account Security Section */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          Account Security
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              {...getFieldProps("password")}
                              className={`${
                                errors.password && touched.password
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {errors.password && touched.password && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.password}
                              </p>
                            )}
                          </div>
    
                          <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              {...getFieldProps("confirmPassword")}
                              className={`${
                                errors.confirmPassword && touched.confirmPassword
                                  ? "border-red-500"
                                  : ""
                              }`}
                            />
                            {errors.confirmPassword && touched.confirmPassword && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
    
                      <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading || isSubmitting || !isValid}
          >
            {isLoading || isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </Button>

       {/* Add form-level error message */}
       {status && (
            <p className="text-red-500 text-sm text-center mt-2">{status}</p>
          )}

          {/* Add validation errors summary for debugging */}
          {Object.keys(errors).length > 0 && (
            <div className="text-red-500 text-sm mt-4">
              <p>Form has validation errors:</p>
              <ul>
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{`${field}: ${error}`}</li>
                ))}
              </ul>
            </div>
          )}
        </Form>
  )}
</Formik>
    
                <p className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{" "}
                  <Link
                    href={ROUTES.LOGIN}
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
}