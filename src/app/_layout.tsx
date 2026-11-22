import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/styles';

function NavigationGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Tahan proses redirect selama aplikasi masih membaca token dari SecureStore
    if (isLoading) return;

    // 2. Cek apakah posisi pengguna saat ini berada di grup folder (auth)
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Belum login tapi mencoba masuk ke area (app) -> arahkan ke halaman login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Sudah login tapi masih berada di halaman login -> arahkan ke halaman utama
      router.replace('/(app)');
    }
  }, [user, isLoading, segments]);

  // 3. Tampilkan indikator loading untuk mencegah layar berkedip (flicker)
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.red} />
      </View>
    );
  }

  // 4. Render halaman aktif setelah lolos pengecekan
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationGuard />
    </AuthProvider>
  );
}