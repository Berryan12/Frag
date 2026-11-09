import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS, styles } from '../constants/styles';
import { Agent, Player, RoleName } from '../types/agent';
import { fetchValorantAgents } from '../services/agentService';

const PLAYERS_DATABASE: Player[] = [
  { name: 'Koyok', rank: 'Ascendant 2', kd: 1.42, winRate: 55.6, headshot: 24.7 },
  { name: 'TenZ', rank: 'Radiant', kd: 1.68, winRate: 64.2, headshot: 32.5 },
  { name: 'Chronicle', rank: 'Immortal 3', kd: 1.25, winRate: 58.0, headshot: 22.4 },
  { name: 'Boaster', rank: 'Immortal 1', kd: 0.95, winRate: 53.8, headshot: 18.2 },
  { name: 'Forsaken', rank: 'Radiant', kd: 1.55, winRate: 62.0, headshot: 29.8 },
];

const recentMatches: string[] = ['W', 'W', 'L', 'W', 'L'];

function getRecommendedRole(currentPlayer: Player): RoleName {
  if (currentPlayer.kd >= 1.3 && currentPlayer.headshot >= 20) {
    return 'Duelist';
  } else if (currentPlayer.winRate >= 55) {
    return 'Sentinel';
  }
  return 'Controller';
}

function getRoleMessage(role: RoleName): string {
  if (role === 'Duelist') return 'Your stats fit an aggressive entry playstyle.';
  if (role === 'Sentinel') return 'Your stats fit a defensive and consistent playstyle.';
  return 'Your stats fit a supportive and map-control playstyle.';
}

export default function Index() {
  const router = useRouter();
  const [newSearch, setNewSearch] = useState<string>('');
  const [newSelectedAgent, setNewSelectedAgent] = useState<string>('');
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYERS_DATABASE[0]);

  // State untuk penanganan Asynchronous API (Modul 3)
  const [apiAgents, setApiAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recommendedRole = getRecommendedRole(currentPlayer);

  // Load Data dari API menggunakan Custom Async Function & .then()
  useEffect(() => {
    setIsLoading(true);
    fetchValorantAgents()
      .then((data) => {
        setApiAgents(data);
        if (data.length > 0) setNewSelectedAgent(data[0].id);
        setIsLoading(false);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Gagal memuat agen dari server.');
        setIsLoading(false);
      });
  }, []);

  function handleAnalyze() {
    if (newSearch.trim() === '') {
      Alert.alert('FRAG', 'Enter a player name first.');
      return;
    }

    const found = PLAYERS_DATABASE.find(
      (p) => p.name.toLowerCase() === newSearch.trim().toLowerCase()
    );

    if (found) {
      setCurrentPlayer(found);
      Alert.alert('Player Found', `Loaded stats for ${found.name}!`);
      setNewSearch('');
    } else {
      Alert.alert(
        'Player Not Found',
        `Player "${newSearch}" not found.\nAvailable: Koyok, TenZ, Chronicle, Boaster, Forsaken.`
      );
    }
  }

  function handleOpenAgentDetail(agent: Agent) {
    router.push({
      pathname: '/detail',
      params: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        match: agent.match.toString(),
        description: agent.description,
        icon: agent.icon,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/frag-logo.png')}
            style={styles.logo}
          />
          <View style={styles.headerText}>
            <Text style={styles.brand}>FRAG</Text>
            <Text style={styles.subtitle}>Player Stats Prototype (Live API)</Text>
          </View>
        </View>

        {/* Kolom Pencarian */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Find Player</Text>
          <Text style={[styles.mutedText, { marginBottom: 8 }]}>
            Available: Koyok, TenZ, Chronicle, Boaster, Forsaken
          </Text>

          <TextInput
            value={newSearch}
            onChangeText={setNewSearch}
            placeholder="e.g. TenZ, Boaster, Forsaken"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />

          <Button title="Analyze Player" color={COLORS.red} onPress={handleAnalyze} />
        </View>

        {/* Kartu Profil Player */}
        <View style={styles.card}>
          <View style={styles.playerRow}>
            <Ionicons name="person-circle-outline" size={54} color={COLORS.red} />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{currentPlayer.name}</Text>
              <Text style={styles.mutedText}>{currentPlayer.rank}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentPlayer.kd}</Text>
              <Text style={styles.statLabel}>K/D</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentPlayer.winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentPlayer.headshot}%</Text>
              <Text style={styles.statLabel}>Headshot</Text>
            </View>
          </View>
        </View>

        {/* Kartu Rekomendasi Role */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recommended Role</Text>
          <View style={styles.roleRow}>
            <Ionicons name="flash-outline" size={30} color={COLORS.red} />
            <View style={styles.roleText}>
              <Text style={styles.roleName}>{recommendedRole}</Text>
              <Text style={styles.mutedText}>{getRoleMessage(recommendedRole)}</Text>
            </View>
          </View>
        </View>

        {/* Daftar Agen dari API External */}
        <Text style={styles.sectionTitle}>Live Valorant Agents (API Call)</Text>

        {isLoading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.red} />
            <Text style={[styles.mutedText, { marginTop: 8 }]}>Fetching API Agents...</Text>
          </View>
        ) : errorMessage ? (
          <Text style={{ color: COLORS.red, marginVertical: 10 }}>{errorMessage}</Text>
        ) : (
          apiAgents.map((agent) => {
            const isSelected = newSelectedAgent === agent.id;

            return (
              <Pressable
                key={agent.id}
                onPress={() => {
                  setNewSelectedAgent(agent.id);
                  handleOpenAgentDetail(agent);
                }}
                style={[
                  styles.agentCard,
                  {
                    borderColor: isSelected ? COLORS.red : COLORS.border,
                    backgroundColor: isSelected ? COLORS.redDark : COLORS.card,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {agent.icon ? (
                    <Image source={{ uri: agent.icon }} style={{ width: 40, height: 40 }} />
                  ) : (
                    <Ionicons name="shield-outline" size={32} color={COLORS.text} />
                  )}
                  <View>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <Text style={styles.mutedText}>{agent.role}</Text>
                  </View>
                </View>

                <Text
                  style={{
                    color: isSelected ? COLORS.text : COLORS.red,
                    fontWeight: '700',
                  }}
                >
                  {agent.match}% Match ›
                </Text>
              </Pressable>
            );
          })
        )}

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Recent Matches</Text>
        <View style={styles.matchesRow}>
          {recentMatches.map((result, index) => (
            <View
              key={index}
              style={[
                styles.matchBox,
                { backgroundColor: result === 'W' ? COLORS.win : COLORS.redDark },
              ]}
            >
              <Text style={styles.matchText}>{result}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footerText}>Module 3 - Asynchronous Programming & API Call</Text>
      </ScrollView>
    </SafeAreaView>
  );
}