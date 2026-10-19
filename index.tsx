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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { COLORS, styles } from '../constants/styles';

type Role = 'Duelist' | 'Sentinel' | 'Controller';

interface Player {
  name: string;
  rank: string;
  kd: number;
  winRate: number;
  headshot: number;
}

interface Agent {
  id: number;
  name: string;
  role: Role;
  match: number;
}

// 1. DATABASE DUMMY BEBERAPA PLAYER
const PLAYERS_DATABASE: Player[] = [
  {
    name: 'Koyok',
    rank: 'Ascendant 2',
    kd: 1.42,
    winRate: 55.6,
    headshot: 24.7,
  },
  {
    name: 'TenZ',
    rank: 'Radiant',
    kd: 1.68,
    winRate: 64.2,
    headshot: 32.5,
  },
  {
    name: 'Chronicle',
    rank: 'Immortal 3',
    kd: 1.25,
    winRate: 58.0,
    headshot: 22.4,
  },
  {
    name: 'Boaster',
    rank: 'Immortal 1',
    kd: 0.95,
    winRate: 53.8,
    headshot: 18.2,
  },
  {
    name: 'Forsaken',
    rank: 'Radiant',
    kd: 1.55,
    winRate: 62.0,
    headshot: 29.8,
  },
];

const agents: Agent[] = [
  { id: 1, name: 'Raze', role: 'Duelist', match: 92 },
  { id: 2, name: 'Jett', role: 'Duelist', match: 88 },
  { id: 3, name: 'Killjoy', role: 'Sentinel', match: 74 },
];

const recentMatches: string[] = ['W', 'W', 'L', 'W', 'L'];

function getRecommendedRole(currentPlayer: Player): Role {
  if (currentPlayer.kd >= 1.3 && currentPlayer.headshot >= 20) {
    return 'Duelist';
  } else if (currentPlayer.winRate >= 55) {
    return 'Sentinel';
  }

  return 'Controller';
}

function getRoleMessage(role: Role): string {
  if (role === 'Duelist') {
    return 'Your stats fit an aggressive entry playstyle.';
  } else if (role === 'Sentinel') {
    return 'Your stats fit a more defensive and consistent playstyle.';
  }

  return 'Your stats fit a supportive and map-control playstyle.';
}

export default function Index() {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<number>(1);
  
  // 2. State untuk player yang sedang aktif ditampilkan (default: player pertama / Koyok)
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYERS_DATABASE[0]);

  // Rekomendasi role otomatis dihitung berdasarkan player yang sedang aktif
  const recommendedRole: Role = getRecommendedRole(currentPlayer);

  // 3. useEffect saat komponen dimuat pertama kali
  useEffect(() => {
    console.log(`[FRAG Info]: Profile ${currentPlayer.name} loaded.`);
  }, []);

  // 4. useEffect yang terpicu setiap kali player berganti
  useEffect(() => {
    console.log(`[FRAG Search]: Currently viewing stats for ${currentPlayer.name}`);
  }, [currentPlayer]);

  // 5. Fungsi Pencarian Player Dummy
  function handleAnalyze() {
    if (search.trim() === '') {
      Alert.alert('FRAG', 'Enter a player name first.');
      return;
    }

    // Mencari di array PLAYERS_DATABASE (case-insensitive)
    const found = PLAYERS_DATABASE.find(
      (p) => p.name.toLowerCase() === search.trim().toLowerCase()
    );

    if (found) {
      setCurrentPlayer(found);
      Alert.alert('Player Found', `Loaded stats for ${found.name}!`);
      setSearch(''); // Kosongkan kolom pencarian
    } else {
      Alert.alert(
        'Player Not Found',
        `Player "${search}" not found.\n\nTry searching for: TenZ, Chronicle, Boaster, Forsaken, or Koyok.`
      );
    }
  }

  function handleOpenAgentDetail(agent: Agent) {
    router.push({
      pathname: '/detail',
      params: {
        id: agent.id.toString(),
        name: agent.name,
        role: agent.role,
        match: agent.match.toString(),
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
            <Text style={styles.subtitle}>Player Stats Prototype</Text>
          </View>
        </View>

        {/* Kolom Pencarian */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Find Player</Text>
          <Text style={[styles.mutedText, { marginBottom: 8 }]}>
            Available: Koyok, TenZ, Chronicle, Boaster, Forsaken
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="e.g. TenZ, Boaster, Forsaken"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />

          <Button title="Analyze Player" color={COLORS.red} onPress={handleAnalyze} />
        </View>

        {/* Kartu Profil Player yang sedang aktif */}
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

        {/* Kartu Rekomendasi Role Dinamis */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recommended Role</Text>

          <View style={styles.roleRow}>
            <Ionicons name="flash-outline" size={30} color={COLORS.red} />

            <View style={styles.roleText}>
              <Text style={styles.roleName}>{recommendedRole}</Text>
              <Text style={styles.mutedText}>
                {getRoleMessage(recommendedRole)}
              </Text>
            </View>
          </View>
        </View>

        {/* Daftar Agen (Bisa diklik untuk navigasi) */}
        <Text style={styles.sectionTitle}>Suggested Agents (Click to View Details)</Text>

        {agents.map((agent) => {
          const isSelected = selectedAgent === agent.id;

          return (
            <Pressable
              key={agent.id}
              onPress={() => {
                setSelectedAgent(agent.id);
                handleOpenAgentDetail(agent);
              }}
              style={[
                styles.agentCard,
                {
                  borderColor: isSelected ? COLORS.red : COLORS.border,
                  backgroundColor: isSelected ? COLORS.redDark : COLORS.card,
                },
              ]}
            >
              <View>
                <Text style={styles.agentName}>{agent.name}</Text>
                <Text style={styles.mutedText}>{agent.role}</Text>
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
        })}

        <Text style={styles.sectionTitle}>Recent Matches</Text>

        <View style={styles.matchesRow}>
          {recentMatches.map((result, index) => (
            <View
              key={index}
              style={[
                styles.matchBox,
                {
                  backgroundColor:
                    result === 'W' ? COLORS.win : COLORS.redDark,
                },
              ]}
            >
              <Text style={styles.matchText}>{result}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footerText}>
          Module 2 - State, Hooks, & Page Navigation
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}