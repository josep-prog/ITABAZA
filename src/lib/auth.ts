import { supabase } from './supabase'

// User interface for TypeScript
export interface User {
  id: string
  email: string
  full_name?: string
}

// Sign up function
export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      throw error
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    return { success: false, error: error.message || 'Sign up failed' }
  }
}

// Sign in function
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    return { success: false, error: error.message || 'Sign in failed' }
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || 'Google sign in failed' };
  }
}

// Sign out function
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Sign out failed' }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw error
    }

    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get user' }
  }
} 