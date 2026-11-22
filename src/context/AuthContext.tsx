import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

// 1. Membuat Context dengan nilai default
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

// 2. Provider yang akan membungkus seluruh aplikasi di Root Layout
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // A. Rehidrasi Sesi: Cek apakah ada token tersimpan di SecureStore saat aplikasi dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // B. Real-time Subscription: Pantau perubahan status auth (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // C. Bersihkan listener saat komponen tidak lagi digunakan
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fungsi global untuk logout dan menghapus token dari SecureStore
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom Hook agar halaman lain mudah memanggil data auth
export const useAuth = () => useContext(AuthContext);