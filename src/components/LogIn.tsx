"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Formik, Form, Field } from "formik"
import * as Yup from "yup"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/lib/auth"
import { ROUTES, USER_ROLES } from "@/lib/constants"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { Doctor } from "@/types"

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required")
})


interface LoginFormValues {
  email: string
  password: string
}

const LogIn = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      const response = await authService.login(values.email, values.password)
      toast.success("Login successful!")
      
      // Handle role-based redirection
      switch (response.role) {
        case USER_ROLES.DOCTOR:
          const doctorUser = response.user as Doctor
          if (!doctorUser.verified) {
            toast("Your account is pending verification", { icon: '⚠️' })
          }
          router.push(ROUTES.DOC_DASHBOARD)
          break
        case USER_ROLES.PATIENT:
          router.push(ROUTES.CLIENT_DASHBOARD)
          break
        case USER_ROLES.ADMIN:
          router.push(ROUTES.ADMIN_DASHBOARD)
          break
        default:
          toast.error("Unknown user role")
          router.push(ROUTES.HOME)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center">
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/logo/logo.png"
                  alt="DocuMed Logo"
                  width={80}
                  height={80}
                  className="rounded-full ring-4 ring-white/30"
                />
              </motion.div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Welcome Back</CardTitle>
            <p className="text-blue-100">
              Enter your credentials to access your account
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email Address
                    </Label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`transition-all duration-200 ${
                        errors.email && touched.email
                          ? "border-red-500 focus:ring-red-200"
                          : "hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {errors.email && touched.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">
                      Password
                    </Label>
                    <Field
                      as={Input}
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      className={`transition-all duration-200 ${
                        errors.password && touched.password
                          ? "border-red-500 focus:ring-red-200"
                          : "hover:border-blue-400 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {errors.password && touched.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Logging in...</span>
                        </div>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </motion.div>
                </Form>
              )}
            </Formik>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href={ROUTES.HOME}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="text-sm">
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Create account
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default LogIn