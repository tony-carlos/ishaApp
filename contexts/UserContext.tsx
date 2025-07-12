import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
// Supabase import removed
// import { supabase } from '@/config/supabase';
import { User, Dependent } from '@/types';
// import { Session } from '@supabase/supabase-js';
import apiService from '@/utils/api';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
  addDependent: (
    dependentData: Omit<Dependent, 'id' | 'userId'>
  ) => Promise<string>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      // First check if we have a stored token
      const hasToken = await apiService.hasAuthToken();

      if (!hasToken) {
        // No token stored, user is not authenticated
        setUser(null);
        return;
      }

      // We have a token, so check if it's valid
      const response = await apiService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        // Token exists but is invalid, clear it
        await apiService.clearAuthToken();
        setUser(null);
      }
    } catch (error: any) {
      // Only log errors that aren't related to authentication
      if (
        !error.message.includes('Unauthenticated') &&
        !error.message.includes('401')
      ) {
        console.error('Auth check failed:', error);
      }
      // Clear any invalid token
      await apiService.clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);

      if (response.success) {
        await apiService.saveAuthToken(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      // Don't console.error for authentication failures - let the UI handle it
      if (error.message && error.message.includes('Invalid credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.message && error.message.includes('401')) {
        throw new Error('Invalid email or password. Please try again.');
      } else {
        // Only log unexpected errors
        console.error('Unexpected login error:', error);
        throw new Error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);

      if (response.success) {
        await apiService.saveAuthToken(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      // Don't console.error for expected registration failures - let the UI handle it
      if (
        error.message &&
        (error.message.includes('validation') ||
          error.message.includes('already exists'))
      ) {
        throw error;
      } else {
        // Only log unexpected errors
        console.error('Unexpected registration error:', error);
        throw new Error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await apiService.updateUser(user.id, data);

      if (response.success) {
        setUser(response.data);
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addDependent = async (
    dependentData: Omit<Dependent, 'id' | 'userId'>
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const response = await apiService.createDependent({
        ...dependentData,
        user_id: user.id,
      });

      if (response.success) {
        return response.data.id;
      } else {
        throw new Error(response.message || 'Failed to add dependent');
      }
    } catch (error) {
      console.error('Add dependent error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await apiService.clearAuthToken();
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        updateUser,
        addDependent,
        logout,
        isAuthenticated,
        login,
        register,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
