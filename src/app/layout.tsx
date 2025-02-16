import "./globals.css"
import type { Metadata } from "next"
import { Layout } from "@/components/layout/Layout"
import { APP_METADATA } from "@/lib/constants"
import { Toaster } from 'react-hot-toast'


export const metadata: Metadata = APP_METADATA

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
        <Toaster />
      </body>
    </html>
  )
}