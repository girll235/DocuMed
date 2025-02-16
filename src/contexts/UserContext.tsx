"use client"

import { createContext, useEffect, useContext, useState, type ReactNode } from "react"
import { auth, db } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { getDocs, collection, query, where } from "firebase/firestore"
import { User, Doctor, Patient } from "@/types"
import { COLLECTIONS, USER_ROLES } from "@/lib/constants"
import { UserContextData } from "@/types"


const UserContext = createContext<UserContextData | null>(null)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, loading] = useAuthState(auth)
  const [userData, setUserData] = useState<User | null>(null)
  const [role, setRole] = useState<keyof typeof USER_ROLES | null>(null)
  const [contextLoading, setContextLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && user.email) {
        try {
          // Check in doctors collection by email
          const doctorsRef = collection(db, COLLECTIONS.DOCTORS)
          const doctorQuery = query(doctorsRef, where("email", "==", user.email))
          const doctorSnapshot = await getDocs(doctorQuery)

          if (!doctorSnapshot.empty) {
            const doctorData = doctorSnapshot.docs[0].data() as Doctor
            setRole("DOCTOR")
            setUserData({
              id: doctorSnapshot.docs[0].id,
              email: user.email,
              phoneNumber: doctorData.phoneNumber,
              photoURL: user.photoURL || undefined,
              displayName: doctorData.displayName,
              type: "DOCTOR",
              active: doctorData.active,
              createdAt: doctorData.createdAt,
              updatedAt: doctorData.updatedAt
            })
            setContextLoading(false)
            return
          }

          // Check in patients collection by email
          const patientsRef = collection(db, COLLECTIONS.PATIENTS)
          const patientQuery = query(patientsRef, where("email", "==", user.email))
          const patientSnapshot = await getDocs(patientQuery)

         
          if (!patientSnapshot.empty) {
            const patientData = patientSnapshot.docs[0].data() as Patient
            setRole("PATIENT")
            setUserData({
              id: patientSnapshot.docs[0].id,
              email: user.email,
              phoneNumber: patientData.phoneNumber,
              photoURL: user.photoURL || undefined,
              displayName: patientData.displayName,
              type: "PATIENT",
              active: patientData.active,
              createdAt: patientData.createdAt,
              updatedAt: patientData.updatedAt
            })
            setContextLoading(false)
            return
          }


          // If we reach here, user was not found in either collection
          console.error("User not found in doctors or patients collection")
          setRole(null)
          setUserData(null)
        } catch (error) {
          console.error("Error fetching user role:", error)
          setRole(null)
          setUserData(null)
        }
      } else {
        setUserData(null)
        setRole(null)
      }
      setContextLoading(false)
    }

    if (!loading) {
      fetchUserRole()
    }
  }, [user, loading])

  return (
    <UserContext.Provider value={{ 
      userData, 
      role, 
      loading: contextLoading 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}