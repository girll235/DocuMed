"use client"

import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { useUser } from "@/contexts/UserContext"
import { ROUTES, USER_ROLES } from "@/lib/constants"
import { Button } from "./ui/button"
import Link from "next/link"
import { toast } from "react-hot-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu } from "lucide-react"

const Navbar = () => {
  const router = useRouter()
  const { userData, role, loading } = useUser()

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast.success("Logged out successfully")
      router.push(ROUTES.LOGIN)
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to logout")
    }
  }

  if (loading) {
    return <div className="h-16 bg-background border-b"></div>
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href={ROUTES.HOME} className="flex items-center space-x-2">
          <span className="font-bold">DocuMed</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {!userData ? (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href={ROUTES.SIGNUP}>
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userData.photoURL || ""} alt={userData.displayName} />
                      <AvatarFallback>{userData.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userData.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {role === "PATIENT" && (
          <>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.CLIENT_DASHBOARD}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.APPOINTMENTS}>My Appointments</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.PATIENT_RECORD}/${userData.id}`}>Medical Records</Link>
            </DropdownMenuItem>
          </>
        )}
                 {role === "DOCTOR" && (
          <>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.DOC_DASHBOARD}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ROUTES.APPOINTMENTS}>Appointments</Link>
            </DropdownMenuItem>
          </>
        )}
        {role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.ADMIN_DASHBOARD}>Admin Dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={role === "DOCTOR" ? ROUTES.DOC_PARAMS : ROUTES.CLIENT_PARAMS}>
            Settings
          </Link>
        </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </nav>
  )
}

export default Navbar