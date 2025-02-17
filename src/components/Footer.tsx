"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/logo/logo.png"
              alt="DocuMed Logo"
              width={150}
              height={50}
              className="rounded-lg"
            />
            <p className="text-gray-600 mt-4">
              Providing innovative healthcare solutions through our digital platform.
            </p>
            <div className="flex items-center space-x-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 p-2 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <Linkedin size={20} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'About', 'Services', 'Contact'].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Link href={`/${item.toLowerCase()}`}>
                    {item}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Services</h3>
            <ul className="space-y-2">
              {[
                'Online Consultations',
                'Medical Records',
                'Appointment Booking',
                'Health Monitoring'
              ].map((service) => (
                <motion.li
                  key={service}
                  whileHover={{ x: 5 }}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Link href="/services">
                    {service}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                <span>123 Healthcare St, Medical City, MC 12345</span>
              </li>
              <li className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2 text-blue-600" />
                <span>+216 123 456 789</span>
              </li>
              <li className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                <span>contact@documed.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} DocuMed. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer