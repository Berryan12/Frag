import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../constants/styles';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function AgentDetail() {
  const router = useRouter();
  const { user } = useAuth();

  const params = useLocalSearchParams<{
    id: string;
    name: string;
    role: string;
    match: string;
    description?: string;
    icon?: string;
  }>();

  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favLoading, setFavLoading] = useState<boolean>(true);

  // 1. Cek ke Supabase saat halaman dibuka: apakah agen ini sudah difavoritkan user?
  useEffect(() => {
    async function checkFavoriteStatus() {
      if (!user || !params.id) {
        setFavLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('favorite_agents')
          .select('id')
          .eq('user_id', user.id)
          .eq('agent_id', params.id)
          .maybeSingle();

        if (error) throw error;
        setIsFavorite(!!data);
      } catch (err: any) {
        console.error('[Check Favorite Error]:', err.message);
      } finally {
        setFavLoading(false);
      }
    }

    checkFavoriteStatus();
  }, [user, params.id]);

  // 2. Simpan (INSERT) atau Hapus (DELETE) agen favorit ke Cloud PostgreSQL
  async function handleToggleFavorite() {
    if (!user || !params.id) return;

    setFavLoading(true);

    try {
      if (!isFavorite) {
        const { error } = await supabase.from('favorite_agents').insert([
          {
            user_id: user.id,
            agent_id: params.id,
            agent_name: params.name ?? 'Unknown',
            agent_role: params.role ?? 'Unknown',
          },
        ]);

        if (error) throw error;
        setIsFavorite(true);
        Alert.alert('Saved to Cloud', `${params.name} ditambahkan ke daftar favorit akunmu!`);
      } else {
        const { error } = await supabase
          .from('favorite_agents')
          .delete()
          .eq('user_id', user.id)
          .eq('agent_id', params.id);

        if (error) throw error;
        setIsFavorite(false);
        Alert.alert('Removed', `${params.name} dihapus dari daftar favorit.`);
      }
    } catch (err: any) {
      Alert.alert('Database Error', err.message ?? 'Gagal memperbarui data favorit.');
    } finally {
      setFavLoading(false);
    }
  }

  function handleGoBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)');
    }
  }

  function handleResetHome() {
    router.replace('/(app)');
  }

  return (
    <ScrollView contentContainerStyle={detailStyles.container}>
      <View style={detailStyles.card}>
        {params.icon ? (
          <Image source={{ uri: params.icon }} style={detailStyles.agentImage} />
        ) : (
          <Ionicons
            name="shield-checkmark"
            size={60}
            color={COLORS.red}
            style={{ alignSelf: 'center', marginBottom: 16 }}
          />
        )}

        <Text style={detailStyles.title}>{params.name ?? 'Agent Name'}</Text>
        <Text style={detailStyles.subtitle}>Role: {params.role ?? 'Unknown'}</Text>

        {params.description ? (
          <Text style={detailStyles.description}>{params.description}</Text>
        ) : null}

        <View style={detailStyles.infoBox}>
          <Text style={detailStyles.infoLabel}>Compatibility Match:</Text>
          <Text style={detailStyles.infoValue}>{params.match}%</Text>
        </View>

        <Pressable
          onPress={handleToggleFavorite}
          disabled={favLoading}
          style={[
            detailStyles.favButton,
            { backgroundColor: isFavorite ? COLORS.red : COLORS.card },
            favLoading && { opacity: 0.7 },
          ]}
        >
          {favLoading ? (
            <ActivityIndicator size="small" color={COLORS.text} />
          ) : (
            <>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={COLORS.text}
              />
              <Text style={detailStyles.favText}>
                {isFavorite ? 'Favorited (Cloud Saved)' : 'Add to Favorite'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <Pressable onPress={handleGoBack} style={detailStyles.backButton}>
        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        <Text style={detailStyles.backText}>Go Back (router.back)</Text>
      </Pressable>

      <Pressable onPress={handleResetHome} style={detailStyles.replaceButton}>
        <Ionicons name="home-outline" size={20} color={COLORS.muted} />
        <Text style={detailStyles.replaceText}>Reset to Home (router.replace)</Text>
      </Pressable>
    </ScrollView>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background,
    flexGrow: 1,
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
  agentImage: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 50,
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
    marginBottom: 12,
  },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
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