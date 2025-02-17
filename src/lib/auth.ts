import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  UserCredential 
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, Doctor, Patient, AuthResponse } from '@/types';
import { AppError } from './errors';
import { USER_ROLES, AUTH_ERRORS, COLLECTIONS } from './constants';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // First authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Then query Firestore for user data in both collections
      const [patientsSnapshot, doctorsSnapshot] = await Promise.all([
        getDocs(query(collection(db, COLLECTIONS.PATIENTS), where('email', '==', email))),
        getDocs(query(collection(db, COLLECTIONS.DOCTORS), where('email', '==', email)))
      ]);
      
      try {
        // Check doctors collection first
        if (!doctorsSnapshot.empty) {
          const doctorData = doctorsSnapshot.docs[0].data() as Doctor;
          const user: Doctor = {
            ...doctorData,
            id: doctorsSnapshot.docs[0].id,
            email: userCredential.user.email!,
            photoURL: userCredential.user.photoURL || undefined,
            type: "DOCTOR"
          };
          return { user, message: 'Login successful', role: "DOCTOR" };
        }
        
        // Then check patients collection
        if (!patientsSnapshot.empty) {
          const patientData = patientsSnapshot.docs[0].data() as Patient;
          const user: Patient = {
            ...patientData,
            id: patientsSnapshot.docs[0].id,
            email: userCredential.user.email!,
            photoURL: userCredential.user.photoURL || undefined,
            type: "PATIENT"
          };
          return { user, message: 'Login successful', role: "PATIENT" };
        }

        // If no user document found in either collection, sign out and throw error
        await firebaseSignOut(auth);
        throw new Error('User account not found');
        
      } catch (firestoreError) {
        // If Firestore query fails, sign out and throw error
        await firebaseSignOut(auth);
        console.error('Firestore query error:', firestoreError);
        throw new Error('Failed to retrieve user data');
      }
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
      const [doctorDoc, patientDoc] = await Promise.all([
        getDoc(doc(db, COLLECTIONS.DOCTORS, user.uid)),
        getDoc(doc(db, COLLECTIONS.PATIENTS, user.uid))
      ]);
  
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