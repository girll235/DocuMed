"use client"

import { useState } from "react"
import Link from "next/link"
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
import { AuthResponse, Doctor } from "@/types"

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.jpg"
              alt="DocuMed Logo"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Field
                    as={Input}
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className={errors.email && touched.email ? "border-red-500" : ""}
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    className={errors.password && touched.password ? "border-red-500" : ""}
                  />
                  {errors.password && touched.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="mt-4 text-center text-sm">
            <Link 
              href={ROUTES.HOME} 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link 
                href="/signup" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LogIn