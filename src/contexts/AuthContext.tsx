'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  uid: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, uid: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsub = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u);
    });
    
    // Always try to sign in anonymously when component mounts
    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (error) {
        // Retry after a delay
        setTimeout(() => {
          signInAnonymously(auth).catch(() => {});
        }, 2000);
      }
    };
    
    initAuth();
    
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, uid: user?.uid ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
