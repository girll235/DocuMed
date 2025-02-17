import { Suspense } from "react"
import { MakeAppointment } from "@/components/MakeAppointment"
import { Metadata } from "next"
import { Loader2 } from "lucide-react"
import ErrorBoundary from "@/components/ErrorBoundary"

export const metadata: Metadata = {
  title: "Make Appointment | DocuMed",
  description: "Schedule an appointment with your healthcare provider"
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="p-8 rounded-lg flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-blue-600 animate-pulse">Loading appointment form...</p>
      </div>
    </div>
  )
}

export default function MakeAppointmentPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <MakeAppointment />
      </Suspense>
    </ErrorBoundary>
  )
}