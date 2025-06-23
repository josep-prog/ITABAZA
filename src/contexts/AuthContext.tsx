import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { getCurrentUser, signOut, signIn, signUp as signUpFn } from '../lib/auth'
import { supabase } from '../lib/supabase'

// Auth context interface
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set initial user from session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Logout function
  async function logout() {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Login function
  async function login(email: string, password: string) {
    try {
      const result = await signIn(email, password);
      if (result.success) {
        setUser(result.user ?? null);
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  }

  // Sign up function
  async function signUp(email: string, password: string, fullName?: string) {
    try {
      const result = await signUpFn(email, password, fullName || '');
      if (result.success) {
        setUser(result.user ?? null);
      } else {
        throw new Error(result.error || 'Sign up failed');
      }
    } catch (error) {
      throw error;
    }
  }

  // Context value
  const value = {
    user,
    login,
    signUp,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 