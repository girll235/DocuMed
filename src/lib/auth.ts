import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword,  
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {  Doctor, Patient, AuthResponse } from '@/types';
import { AppError } from './errors';
import {  AUTH_ERRORS, COLLECTIONS, USER_ROLES } from './constants';

export const initializeUserRole = async (uid: string, email: string, role: string) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      email,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Log successful initialization
    console.log(`User role initialized: ${role}`);
  } catch (error) {
    console.error('Error initializing user role:', error);
    throw new Error('Failed to initialize user role');
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // First authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user role from users collection first
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));
      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        throw new Error('User role not found');
      }

      const userRole = userDoc.data().role;

      // Then get full user data based on role
      if (userRole === USER_ROLES.DOCTOR) {
        const doctorDoc = await getDoc(doc(db, COLLECTIONS.DOCTORS, userCredential.user.uid));
        if (!doctorDoc.exists()) {
          await firebaseSignOut(auth);
          throw new Error('Doctor profile not found');
        }

        const doctorData = doctorDoc.data() as Doctor;
        const user: Doctor = {
          ...doctorData,
          id: doctorDoc.id,
          email: userCredential.user.email!,
          photoURL: userCredential.user.photoURL || undefined,
          type: "DOCTOR"
        };
        return { user, message: 'Login successful', role: "DOCTOR" };
      }
      
      if (userRole === USER_ROLES.PATIENT) {
        const patientDoc = await getDoc(doc(db, COLLECTIONS.PATIENTS, userCredential.user.uid));
        if (!patientDoc.exists()) {
          await firebaseSignOut(auth);
          throw new Error('Patient profile not found');
        }

        const patientData = patientDoc.data() as Patient;
        const user: Patient = {
          ...patientData,
          id: patientDoc.id,
          email: userCredential.user.email!,
          photoURL: userCredential.user.photoURL || undefined,
          type: "PATIENT"
        };
        return { user, message: 'Login successful', role: "PATIENT" };
      }

      // If we get here, something went wrong
      await firebaseSignOut(auth);
      throw new Error('Invalid user role');
      
    } catch (error) {
      console.error('Login error:', error);
      throw new AppError(
        error instanceof Error ? error.message : AUTH_ERRORS.INVALID_CREDENTIALS,
        'AUTH_LOGIN_FAILED',
        401
      );
    }
},

getCurrentUser: async (): Promise<Doctor | Patient | null> => {
    const user = auth.currentUser;
    if (!user) return null;
  
    try {
      // First check users collection for role
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      if (!userDoc.exists()) return null;
      
      const userData = userDoc.data();
      const role = userData.role;

      // Then get full user data from appropriate collection
      if (role === USER_ROLES.DOCTOR) {
        const doctorDoc = await getDoc(doc(db, COLLECTIONS.DOCTORS, user.uid));
        if (doctorDoc.exists()) {
          const data = doctorDoc.data() as Doctor;
          return {
            ...data,
            id: doctorDoc.id,
            email: user.email!,
            photoURL: user.photoURL || undefined,
            type: "DOCTOR"
          };
        }
      } else if (role === USER_ROLES.PATIENT) {
        const patientDoc = await getDoc(doc(db, COLLECTIONS.PATIENTS, user.uid));
        if (patientDoc.exists()) {
          const data = patientDoc.data() as Patient;
          return {
            ...data,
            id: patientDoc.id,
            email: user.email!,
            photoURL: user.photoURL || undefined,
            type: "PATIENT"
          };
        }
      }
  
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  logout: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : 'Logout failed',
        'AUTH_LOGOUT_FAILED',
        401
      );
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : 'Password reset failed',
        'AUTH_RESET_PASSWORD_FAILED',
        400
      );
    }
  },

  updateUserProfile: async (displayName: string, photoURL?: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new AppError('No user logged in', 'AUTH_NO_USER', 401);
    }

    try {
      await updateProfile(user, {
        displayName,
        photoURL: photoURL || null
      });
    } catch (error) {
      throw new AppError(
        error instanceof Error ? error.message : 'Profile update failed',
        'AUTH_UPDATE_PROFILE_FAILED',
        400
      );
    }
  }
};

export default authService;