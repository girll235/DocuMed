import { Suspense } from "react"
import DocInsertion from "@/components/DocInsertion"
import { Metadata } from "next"
import { Loader2 } from "lucide-react"
import ErrorBoundary from "@/components/ErrorBoundary"


export const metadata: Metadata = {
  title: 'Add Medical Record | DocuMed',
  description: 'Add a new medical record for a patient',
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="p-8 rounded-lg flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-blue-600 animate-pulse">Loading form...</p>
      </div>
    </div>
  )
}

export default function DocInsertionPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <DocInsertion />
      </Suspense>
    </ErrorBoundary>
  )
}