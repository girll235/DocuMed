"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ROUTES } from "@/lib/constants"
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Award, Shield, Users, Heart, Check, X } from "lucide-react"
import { PRICING_PLANS } from "@/lib/constants"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2 space-y-6"
          >
            <h1 className="text-5xl font-extrabold text-blue-900 leading-tight">
              Your Health, <span className="text-blue-600">Our Priority</span>
            </h1>
            <p className="text-xl text-gray-600">
              Connect with trusted healthcare professionals and manage your medical journey seamlessly through our digital platform.
            </p>
            <div className="flex gap-4">
              <Link href={ROUTES.SIGNUP}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2"
          >
            <Image
              src="/hero-image.jpg"
              alt="Healthcare Professional"
              width={600}
              height={500}
              className="rounded-2xl shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center text-blue-900 mb-16"
          >
            Why Choose DocuMed?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-blue-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
 {/* About Section - New addition */}
 <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              About <span className="gradient-text">DocuMed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DocuMed is a comprehensive medical appointment management system designed 
              to streamline healthcare services and improve patient care through technology.
            </p>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            className="mb-20"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ ...fadeIn.transition, delay: 0.2 }}
          >
            <Card className="p-8 bg-white/80 backdrop-blur border-blue-100">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
                    <Award className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-3xl font-bold text-blue-900 mb-4">Our Mission</h3>
                  <p className="text-lg text-gray-600">
                    To provide a user-friendly, secure, and efficient platform that connects 
                    healthcare providers with patients, streamlines medical appointments, 
                    and enhances the overall healthcare experience through innovative 
                    digital solutions.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
      {/* Values Section - New addition */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={{ ...fadeIn.transition, delay: 0.4 }}
          >
            <Card className="p-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Values</h2>
                <p className="text-blue-100">The principles that guide our service</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-blue-100">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
            </motion.div>
        </div>
      </section>
      // Add after the Values Section and before the For Doctors Section

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            transition={fadeIn.transition}
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Simple, <span className="gradient-text">Transparent Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that best suits your needs with our straightforward pricing options
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {PRICING_PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative h-full transform transition-all duration-300 hover:scale-105 ${
                  plan.isPopular ? "border-2 border-blue-600 shadow-xl" : "shadow-lg"
                }`}>
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-center text-blue-900">
                      {plan.name}
                    </CardTitle>
                    <div className="text-center mt-4">
                      <div className="text-4xl font-bold text-blue-900">
                        ${plan.price.monthly}
                        <span className="text-lg text-gray-500">/month</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center text-gray-700"
                        >
                          {feature.included ? (
                            <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={feature.included ? "" : "text-gray-400"}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link href={ROUTES.PRICING} className="block">
                      <Button
                        className={`w-full ${
                          plan.isPopular
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                        }`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 mb-4">Need a custom solution?</p>
            <Link href={ROUTES.CONTACT}>
              <Button variant="outline" className="hover:bg-blue-50">
                Contact Sales
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      {/* For Doctors Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-white">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="md:w-1/2 space-y-6"
              >
                <h2 className="text-4xl font-bold">For Healthcare Providers</h2>
                <p className="text-lg text-blue-100">
                  Streamline your practice with our comprehensive digital solution. 
                  Manage appointments, access patient records, and communicate securely.
                </p>
                <Link href={ROUTES.DOC_SIGNUP}>
                  <Button size="lg" variant="secondary">
                    Join as a Doctor
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="md:w-1/2"
              >
                <Image
                  src="/doctor-dashboard.jpg"
                  alt="Doctor Dashboard"
                  width={500}
                  height={300}
                  className="rounded-xl shadow-xl"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* For Patients Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2 space-y-6"
            >
              <h2 className="text-4xl font-bold text-blue-900">For Patients</h2>
              <p className="text-lg text-gray-600">
                Take control of your healthcare journey. Book appointments, access your medical 
                records, and communicate with your healthcare providers - all in one place.
              </p>
              <Link href={ROUTES.CLIENT_SIGNUP}>
                <Button size="lg">
                  Register as Patient
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2"
            >
              <Image
                src="/patient-dashboard.jpg"
                alt="Patient Dashboard"
                width={500}
                height={300}
                className="rounded-xl shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: "/icons/calendar.svg",
    title: "Easy Scheduling",
    description: "Book appointments with your preferred healthcare providers at your convenience."
  },
  {
    icon: "/icons/records.svg",
    title: "Digital Records",
    description: "Access your complete medical history and records anytime, anywhere."
  },
  {
    icon: "/icons/communication.svg",
    title: "Secure Communication",
    description: "Stay connected with your healthcare providers through our secure messaging system."
  }
]
const values = [
  {
    icon: <Shield className="w-8 h-8 text-white" />,
    title: "Security",
    description: "We prioritize the protection of your sensitive medical information."
  },
  {
    icon: <Users className="w-8 h-8 text-white" />,
    title: "Accessibility",
    description: "Healthcare services available to everyone, anywhere."
  },
  {
    icon: <Heart className="w-8 h-8 text-white" />,
    title: "Care",
    description: "Patient-centered approach in everything we do."
  }
]

export default Home