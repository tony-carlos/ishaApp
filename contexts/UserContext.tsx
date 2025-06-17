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

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
  addDependent: (
    dependentData: Omit<Dependent, 'id' | 'userId'>
  ) => Promise<string>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Mocked user state for UI-only
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // No backend session check
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Mocked updateUser
  const updateUser = async (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  // Mocked addDependent
  const addDependent = async (
    dependentData: Omit<Dependent, 'id' | 'userId'>
  ): Promise<string> => {
    // Return a mock ID
    return Promise.resolve('mock-dependent-id');
  };

  // Mocked logout
  const logout = async () => {
    setUser(null);
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
