"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/lib/constants"
import { ArrowLeft, Stethoscope, User } from "lucide-react"

const SignUp = () => {
  const router = useRouter()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 }
  }

  const options = [
    {
      id: "doctor",
      title: "I am a Doctor",
      description: "Create an account to manage your practice and patients",
      icon: <Stethoscope className="w-12 h-12 text-blue-500" />,
      href: ROUTES.DOC_SIGNUP,
      color: "bg-blue-50 hover:bg-blue-100",
      borderColor: "border-blue-200",
    },
    {
      id: "patient",
      title: "I am a Patient",
      description: "Create an account to book appointments and access medical records",
      icon: <User className="w-12 h-12 text-green-500" />,
      href: ROUTES.CLIENT_SIGNUP,
      color: "bg-green-50 hover:bg-green-100",
      borderColor: "border-green-200",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href={ROUTES.HOME} className="flex items-center space-x-2">
            <Image 
              src="/logo.jpg" 
              alt="DocuMed Logo" 
              width={40} 
              height={40} 
              className="rounded-md"
            />
            <span className="text-xl font-bold text-gray-800">DocuMed</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href={ROUTES.HOME}>
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
            <Link href={ROUTES.LOGIN}>
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join DocuMed Today
            </h1>
            <p className="text-lg text-gray-600">
              Choose your account type to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {options.map((option) => (
              <motion.div
                key={option.id}
                variants={cardVariants}
                initial="initial"
                whileHover="hover"
                onHoverStart={() => setHoveredCard(option.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Link href={option.href}>
                  <Card className={`h-full border-2 transition-colors duration-300 ${
                    option.color
                  } ${
                    hoveredCard === option.id ? option.borderColor : "border-transparent"
                  }`}>
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {option.icon}
                        <h2 className="text-2xl font-bold text-gray-900">
                          {option.title}
                        </h2>
                        <p className="text-gray-600">
                          {option.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link 
                href={ROUTES.LOGIN}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp