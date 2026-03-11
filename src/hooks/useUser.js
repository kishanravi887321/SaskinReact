import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getUserProfile } from '../lib/api';

export function useUser() {
  const { isAuthenticated, accessToken } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated || !accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserProfile();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refreshUser = useCallback(() => fetchUser(), [fetchUser]);
  const clearUser = useCallback(() => setUser(null), []);

  return { user, isLoading, error, refreshUser, clearUser };
}
