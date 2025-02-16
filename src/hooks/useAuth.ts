import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Doctor, Patient } from '@/types';
import { authService } from '@/lib/auth';
import { ROUTES } from '@/lib/constants';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<Doctor | Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Handle redirection based on user type
          if (currentUser.type === "DOCTOR") {
            router.push(ROUTES.DOC_DASHBOARD);
          } else if (currentUser.type === "PATIENT") {
            router.push(ROUTES.CLIENT_DASHBOARD);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push(ROUTES.LOGIN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout error');
    }
  };

  return { 
    user, 
    loading, 
    error,
    handleLogout
  };
};

export default useAuth;