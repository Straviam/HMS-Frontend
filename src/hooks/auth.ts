import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
export function useAuth() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !token) {
      navigate("/login", { state: { from: location.pathname } })
      return
    }

    const currentTimeInSecond = Math.floor(Date.now() / 1000);

    if (user.exp < currentTimeInSecond) {
      logout();
      navigate("/login", { state: { from: location.pathname } })
    }
  }, [token, user, navigate, location.pathname, logout]);

  return {
    isAuthenticated: !!token && !!user,
    user,
  }
} 
