"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { 
  Calendar, 
  Shield, 
  Clock, 
  MessageSquare, 
  FileText,
  Award,
  Users,
  Heart 
} from "lucide-react"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={fadeIn.transition}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            About <span className="gradient-text">DocuMed</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            DocuMed is a comprehensive medical appointment management system designed 
            to streamline healthcare services and improve patient care through technology.
          </p>
        </motion.div>

        {/* Mission Section */}
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
                <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Mission</h2>
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

        {/* Features Grid */}
        <motion.div
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={{ ...fadeIn.transition, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="p-6 h-full bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
  className="mt-20"
  initial={fadeIn.initial}
  animate={fadeIn.animate}
  transition={{ ...fadeIn.transition, delay: 0.6 }}
>
  <Card className="p-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold mb-4">Our Values</h2>
      <p className="text-blue-100">The principles that guide our service</p>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      {values.map((value) => (
        <div key={value.title} className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            {value.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
          <p className="text-blue-100">{value.description}</p>
        </div>
      ))}
    </div>
  </Card>
</motion.div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: <Calendar className="w-6 h-6 text-blue-600" />,
    title: "Easy Scheduling",
    description: "Book and manage appointments with healthcare providers seamlessly."
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-600" />,
    title: "Secure Records",
    description: "Your medical data is protected with state-of-the-art security measures."
  },
  {
    icon: <Clock className="w-6 h-6 text-blue-600" />,
    title: "Real-time Updates",
    description: "Get instant notifications about your appointment status changes."
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
    title: "Direct Communication",
    description: "Connect with your healthcare providers through secure messaging."
  },
  {
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    title: "Medical History",
    description: "Access and maintain your comprehensive medical records digitally."
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Multi-provider Access",
    description: "Connect with multiple healthcare providers on a single platform."
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

export default About