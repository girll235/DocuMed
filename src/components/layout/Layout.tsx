import Navbar from "../Navbar"
import Footer from "../Footer"
import { UserProvider } from "@/contexts/UserContext"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <UserProvider>
      <div className={`flex flex-col min-h-screen ${inter.className}`}>
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </UserProvider>
  )
}