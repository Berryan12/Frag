import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/styles';

export default function AgentDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    role: string;
    match: string;
  }>();

  // State lokal untuk tombol favorit di halaman detail
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // 1. Fungsi Kembali menggunakan router.canGoBack() & router.back()
  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  // 2. Fungsi Reset menggunakan router.replace()
  function handleResetHome() {
    router.replace('/');
  }

  return (
    <View style={detailStyles.container}>
      <View style={detailStyles.card}>
        <Ionicons name="shield-checkmark" size={60} color={COLORS.red} style={{ alignSelf: 'center', marginBottom: 16 }} />
        
        <Text style={detailStyles.title}>{params.name ?? 'Agent Name'}</Text>
        <Text style={detailStyles.subtitle}>Role: {params.role ?? 'Unknown'}</Text>

        <View style={detailStyles.infoBox}>
          <Text style={detailStyles.infoLabel}>Compatibility Match:</Text>
          <Text style={detailStyles.infoValue}>{params.match}%</Text>
        </View>

        <Pressable 
          onPress={() => setIsFavorite(!isFavorite)} 
          style={[detailStyles.favButton, { backgroundColor: isFavorite ? COLORS.red : COLORS.card }]}
        >
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={COLORS.text} />
          <Text style={detailStyles.favText}>{isFavorite ? "Favorited" : "Add to Favorite"}</Text>
        </Pressable>
      </View>

      {/* Tombol Back menggunakan router.back() */}
      <Pressable onPress={handleGoBack} style={detailStyles.backButton}>
        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        <Text style={detailStyles.backText}>Go Back (router.back)</Text>
      </Pressable>

      {/* Tombol Replace menggunakan router.replace() */}
      <Pressable onPress={handleResetHome} style={detailStyles.replaceButton}>
        <Ionicons name="home-outline" size={20} color={COLORS.muted} />
        <Text style={detailStyles.replaceText}>Reset to Home (router.replace)</Text>
      </Pressable>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    marginBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  favButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.red,
    gap: 8,
  },
  favText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.red,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  backText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  replaceText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});