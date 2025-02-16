"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Formik, Form } from "formik"
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
import { clientSignUpSchema, initialValues } from "@/lib/validation/clientSignUpSchema"

import type { ClientSignUpFormData } from "@/types"
import { toast } from "react-hot-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"


const CITIES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Sousse",
  "Sfax",
  "Bizerte",
] as const

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const
export default function ClientSignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()


  const handleSubmit = async (values: ClientSignUpFormData) => {
    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      )

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: values.displayName
        })

        await setDoc(doc(db, COLLECTIONS.PATIENTS, userCredential.user.uid), {
          displayName: values.displayName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          address: values.address,
          city: values.city,
          state: values.state,
          zip: values.zip,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
          bloodType: values.bloodType,
          allergies: values.allergies,
          emergencyContact: values.emergencyContact,
          type: USER_ROLES.PATIENT,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })

        toast.success("Registration successful!")
        router.push(ROUTES.CLIENT_DASHBOARD)
      }
    } catch (error) {
      console.error("Error signing up:", error)
      toast.error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
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
                  src="/logo.jpg"
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
  <Formik<ClientSignUpFormData>
    initialValues={initialValues}
    validationSchema={clientSignUpSchema}
    onSubmit={handleSubmit}
  >
    {({ errors, touched, getFieldProps, setFieldValue }) => (
      <Form className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <Label htmlFor="name" className="text-gray-700">
                Full Name
              </Label>
              <Input
                id="name"
                {...getFieldProps("name")}
                className={`mt-1 transition-all duration-200 ${
                  errors.displayName && touched.displayName
                    ? "border-red-500 ring-red-200"
                    : "hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200"
                }`}
                placeholder="John Doe"
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
                </div>

              {/* Email Field */}
              <div>
                          <Label htmlFor="email" className="text-gray-700">
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            {...getFieldProps("email")}
                            className={`mt-1 transition-all duration-200 ${
                              errors.email && touched.email
                                ? "border-red-500 ring-red-200"
                                : "hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200"
                            }`}
                            placeholder="john@example.com"
                          />
                          {errors.email && touched.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1"
                            >
                              {errors.email}
                            </motion.p>
                          )}
                        </div>
                      
                        {/* Phone Number Field */}
                        <div>
                          <Label htmlFor="phone" className="text-gray-700">
                            phone Number
                          </Label>
                          <Input
                            id="phone"
                            type="phone"
                            {...getFieldProps("phone")}
                            className={`mt-1 transition-all duration-200 ${
                              errors.phoneNumber && touched.phoneNumber
                                ? "border-red-500 ring-red-200"
                                : "hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200"
                            }`}
                            placeholder="john@example.com"
                          />
                          {errors.phoneNumber && touched.phoneNumber && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm mt-1"
                            >
                              {errors.email}
                            </motion.p>
                          )}
                        </div>
                <div>
                  <Label htmlFor="birthDate">Date of Birth</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...getFieldProps("birthDate")}
                    max={new Date().toISOString().split("T")[0]}
                    className={errors.dateOfBirth && touched.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && touched.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(value) => setFieldValue("gender", value)}
                    defaultValue={initialValues.gender}
                  >
                    <SelectTrigger className={errors.gender && touched.gender ? "border-red-500" : ""}>
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

                <div className="space-y-6 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Location Details
                      </h3>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...getFieldProps("address")}
                    className={errors.address && touched.address ? "border-red-500" : ""}
                  />
                  {errors.address && touched.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select
                      onValueChange={(value) => setFieldValue("city", value)}
                      defaultValue={initialValues.city}
                    >
                      <SelectTrigger className={errors.city && touched.city ? "border-red-500" : ""}>
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
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      {...getFieldProps("zip")}
                      className={errors.zip && touched.zip ? "border-red-500" : ""}
                    />
                    {errors.zip && touched.zip && (
                      <p className="text-red-500 text-sm mt-1">{errors.zip}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Account Security
                      </h3>
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
                        "Create Account"
                      )}
                    </Button>
              </Form>
            )}
          </Formik>

          <p className="text-center text-sm text-gray-600">
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