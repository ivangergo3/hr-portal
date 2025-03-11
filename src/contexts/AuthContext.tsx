'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User, AuthError } from '@supabase/supabase-js';
import { User as DbUser } from '@/types/database.types';

// Define the shape of our context
interface AuthContextType {
  // User state
  user: User | null;
  dbUser: DbUser | null;
  isAdmin: boolean;

  // Loading states
  isLoading: boolean;
  isPageLoading: boolean;

  // Error state
  error: string | null;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Helper methods
  checkIsAdmin: (user: User) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize Supabase client
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State variables
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation tracking for page loading state
  const prevPathRef = React.useRef<string>('');
  const initialRenderRef = React.useRef<boolean>(true);
  const pageLoadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Function to fetch or create the database user
  const fetchOrCreateDbUser = async (
    authUser: User,
  ): Promise<DbUser | null> => {
    try {
      // Try to fetch the user from the database
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (dbError) {
        console.error('[AuthContext] DB user fetch error:', dbError.message);

        // If user doesn't exist in the database, create them
        if (dbError.code === 'PGRST116') {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([
              {
                id: authUser.id,
                email: authUser.email,
                role: 'employee',
                full_name: authUser.user_metadata?.full_name || '',
              },
            ])
            .select()
            .single();

          if (createError) {
            console.error(
              '[AuthContext] User creation error:',
              createError.message,
            );
            throw createError;
          }

          if (!newUser) {
            throw new Error('Failed to create user record');
          }

          return newUser;
        } else {
          throw dbError;
        }
      }

      return dbUser;
    } catch (err) {
      console.error('[AuthContext] Error fetching/creating DB user:', err);
      return null;
    }
  };

  // Function to check if a user has admin rights
  const checkIsAdmin = async (user: User): Promise<boolean> => {
    try {
      // Fetch the user from the database
      const dbUser = await fetchOrCreateDbUser(user);

      // Check if the user has admin role
      return dbUser?.role === 'admin';
    } catch (err) {
      console.error('Error in checkIsAdmin:', err);
      return false;
    }
  };

  // Function to refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (currentUser) {
        setUser(currentUser);

        // Fetch or create the database user
        const dbUserData = await fetchOrCreateDbUser(currentUser);
        setDbUser(dbUserData);

        // Check if the user has admin rights
        setIsAdmin(dbUserData?.role === 'admin');
      } else {
        setUser(null);
        setDbUser(null);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Email/password login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setUser(data.user);

        // Fetch or create the database user
        const dbUserData = await fetchOrCreateDbUser(data.user);
        setDbUser(dbUserData);

        // Check if the user has admin rights
        setIsAdmin(dbUserData?.role === 'admin');

        // Redirect to dashboard after successful login
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google login function
  const loginWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Store a flag in localStorage to indicate Google auth is in progress
      localStorage.setItem('googleAuthInProgress', 'true');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // Note: We don't need to set user here as the redirect will happen
      // and the auth state will be handled when the user returns
    } catch (err) {
      console.error('Google login error:', err);
      // Remove the flag since the auth attempt failed
      localStorage.removeItem('googleAuthInProgress');

      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during Google login');
      }
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setDbUser(null);
      setIsAdmin(false);

      // Redirect to login page after logout
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during logout');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to initialize auth state and listen for changes
  useEffect(() => {
    // Function to initialize auth state
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check if returning from Google auth
        const isReturningFromGoogleAuth =
          localStorage.getItem('googleAuthInProgress') === 'true';

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          setUser(session.user);

          // Fetch or create the database user
          const dbUserData = await fetchOrCreateDbUser(session.user);
          setDbUser(dbUserData);

          // Check if the user has admin rights
          setIsAdmin(dbUserData?.role === 'admin');
        } else {
          setUser(null);
          setDbUser(null);
          setIsAdmin(false);
        }

        // Clear the Google auth flag if we have a session or if we're not returning from Google auth
        if (session || !isReturningFromGoogleAuth) {
          localStorage.removeItem('googleAuthInProgress');
        }

        // Set up auth state change listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event);

          if (session?.user) {
            setUser(session.user);

            // Fetch or create the database user
            const dbUserData = await fetchOrCreateDbUser(session.user);
            setDbUser(dbUserData);

            // Check if the user has admin rights
            setIsAdmin(dbUserData?.role === 'admin');

            // Clear the Google auth flag
            localStorage.removeItem('googleAuthInProgress');

            // Redirect to dashboard if signing in
            if (event === 'SIGNED_IN') {
              router.push('/dashboard');
            }
          } else {
            setUser(null);
            setDbUser(null);
            setIsAdmin(false);

            // Redirect to login if signing out
            if (event === 'SIGNED_OUT') {
              router.push('/login');
            }
          }
        });

        // Cleanup function to remove the subscription
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Effect to handle page transitions and loading states
  useEffect(() => {
    // Skip the initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      prevPathRef.current = pathname + searchParams.toString();
      return;
    }

    // Get current path
    const currentPath = pathname + searchParams.toString();

    // Skip if the path hasn't changed
    if (currentPath === prevPathRef.current) {
      return;
    }

    // Update previous path
    prevPathRef.current = currentPath;

    // Show loading indicator
    setIsPageLoading(true);

    // Clear any existing timeout
    if (pageLoadingTimeoutRef.current) {
      clearTimeout(pageLoadingTimeoutRef.current);
    }

    // Create a timeout to hide the loading indicator
    pageLoadingTimeoutRef.current = setTimeout(() => {
      setIsPageLoading(false);
      pageLoadingTimeoutRef.current = null;
    }, 500);

    // Safety timeout to ensure loading state doesn't get stuck
    const safetyTimeout = setTimeout(() => {
      console.log(
        '[AuthContext] Safety timeout triggered - resetting page loading state',
      );
      setIsPageLoading(false);
    }, 5000);

    return () => {
      if (pageLoadingTimeoutRef.current) {
        clearTimeout(pageLoadingTimeoutRef.current);
      }
      clearTimeout(safetyTimeout);
    };
  }, [pathname, searchParams]);

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    dbUser,
    isAdmin,
    isLoading,
    isPageLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    checkIsAdmin,
    refreshUser,
  };

  // Provide the context to children
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
