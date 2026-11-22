import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/styles';

function AppNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const firstSegment = segments[0];

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = firstSegment === '(auth)';
    const inAppGroup = firstSegment === '(app)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login' as never);
    } else if (user && !inAppGroup) {
      router.replace('/(app)' as never);
    }
  }, [user, isLoading, firstSegment, router]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>

      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.background,
          }}
        >
          <ActivityIndicator size="large" color={COLORS.red} />
          <Text style={{ color: COLORS.muted, marginTop: 12 }}>
            Checking saved session...
          </Text>
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
