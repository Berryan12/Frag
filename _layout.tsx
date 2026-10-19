import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '../constants/styles';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      {/* Mendaftarkan halaman utama (index) */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'FRAG Tracker',
        }}
      />

      {/* Mendaftarkan halaman detail agen */}
      <Stack.Screen
        name="detail"
        options={{
          headerShown: true,
          title: 'Agent Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}