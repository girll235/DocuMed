import About from "@/components/About"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'About | DocuMed',
  description: 'Learn more about DocuMed healthcare management system',
}

export default function AboutPage() {
  return <About />
}