"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, FieldArray } from "formik"
import { motion } from "framer-motion"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { updatePassword } from "firebase/auth"
import { toast, Toaster } from "react-hot-toast"
import { db, auth } from "@/lib/firebase"
import { useUser } from "@/contexts/UserContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { clientSchema, initialValues } from "@/lib/validation/clientSchema"
import { ClientFormValues } from "@/types"
import { Loader2, Plus, X } from "lucide-react"
import { COLLECTIONS } from "@/lib/constants"

export const ClientParams = () => {
  const { userData } = useUser()
  const [formValues, setFormValues] = useState(initialValues)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (userData?.id) {
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.PATIENTS, userData.id))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setFormValues({
              displayName: data.displayName || "",
              email: data.email || "",
              phoneNumber: data.phoneNumber || "",
              address: data.address || "",
              city: data.city || "",
              state: data.state || "",
              zip: data.zip || "",
              gender: data.gender || "other",
              dateOfBirth: data.dateOfBirth?.toDate()?.toISOString().split('T')[0] || "",
              bloodType: data.bloodType || "",
              allergies: data.allergies || [],
              emergencyContact: data.emergencyContact || {
                name: "",
                relationship: "",
                phone: ""
              },
            })
          }
        } catch (error) {
          toast.error("Error fetching user data")
          console.error("Error fetching user data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchUserData()
    fetchUserData()
  }, [userData?.id])

  const handleSubmit = async (values: ClientFormValues) => {
    if (!userData?.id) return

    setIsSaving(true)
    try {
      const updateData = {
        ...values,
        updatedAt: new Date()
      }
      await updateDoc(doc(db, COLLECTIONS.PATIENTS, userData.id), updateData)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Error updating profile")
      console.error("Error updating user data:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwords.new || !passwords.confirm || !passwords.current) {
      toast.error("Please fill in all password fields")
      return
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match")
      return
    }

    setIsChangingPassword(true)
    try {
      const user = auth.currentUser
      if (user) {
        await updatePassword(user, passwords.new)
        toast.success("Password updated successfully")
        setPasswords({
          current: "",
          new: "",
          confirm: ""
        })
      }
    } catch (error) {
      toast.error("Error updating password")
      console.error("Error updating password:", error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="p-8 rounded-lg flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-blue-600 animate-pulse">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Please log in to view this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-xl px-6 py-8">
              <CardTitle className="text-3xl font-bold text-center">
                Profile Settings
              </CardTitle>
              <p className="text-blue-100 text-center mt-2">
                Manage your personal information and preferences
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <Formik
                initialValues={formValues}
                enableReinitialize
                validationSchema={clientSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Personal Information */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          Personal Information
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="displayName">Full Name</Label>
                            <Field
                              as={Input}
                              id="displayName"
                              name="displayName"
                              className={`mt-1 ${
                                errors.displayName && touched.displayName
                                  ? "border-red-500 focus:ring-red-500"
                                  : "focus:ring-blue-500"
                              }`}
                            />
                            {errors.displayName && touched.displayName && (
                              <p className="mt-1 text-sm text-red-500">{errors.displayName}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Field
                              as={Input}
                              id="email"
                              name="email"
                              type="email"
                              className="mt-1"
                            />
                            {errors.email && touched.email && (
                              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Field
                              as={Input}
                              id="phoneNumber"
                              name="phoneNumber"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Field
                              as={Input}
                              id="dateOfBirth"
                              name="dateOfBirth"
                              type="date"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          Address Details
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="address">Street Address</Label>
                            <Field
                              as={Input}
                              id="address"
                              name="address"
                              className="mt-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Field
                                as={Input}
                                id="city"
                                name="city"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Field
                                as={Input}
                                id="state"
                                name="state"
                                className="mt-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Field
                              as={Input}
                              id="zip"
                              name="zip"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Medical Information */}
                    <div className="pt-8 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Medical Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <Label htmlFor="bloodType">Blood Type</Label>
                          <Field
                            as={Select}
                            id="bloodType"
                            name="bloodType"
                            className="mt-1"
                          >
                            <option value="">Select Blood Type</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </Field>
                        </div>

                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Field
                            as={Select}
                            id="gender"
                            name="gender"
                            className="mt-1"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </Field>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="pt-8 border-t">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Emergency Contact
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="emergencyContact.name">Contact Name</Label>
                          <Field
                            as={Input}
                            id="emergencyContact.name"
                            name="emergencyContact.name"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="emergencyContact.relationship">Relationship</Label>
                          <Field
                            as={Input}
                            id="emergencyContact.relationship"
                            name="emergencyContact.relationship"
                            className="mt-1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="emergencyContact.phone">Contact Phone</Label>
                          <Field
                            as={Input}
                            id="emergencyContact.phone"
                            name="emergencyContact.phone"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isSubmitting || isSaving}
                      >
                        {isSaving ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Saving Changes...</span>
                          </div>
                        ) : (
                          "Save Changes"
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
    </div>
  )
}

export default ClientParams