import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, styles } from '../constants/styles';
import { getAgentObjects } from '../services/agentService';
import type { Agent, Player, Role } from '../types/agent';

const player: Player = {
  name: 'Koyok',
  rank: 'Ascendant 2',
  kd: 1.42,
  winRate: 55.6,
  headshot: 24.7,
};

const recentMatches: string[] = ['W', 'W', 'L', 'W', 'L'];

function getRecommendedRole(currentPlayer: Player): Role {
  if (currentPlayer.kd >= 1.3 && currentPlayer.headshot >= 20) {
    return 'Duelist';
  } else if (currentPlayer.winRate >= 52) {
    return 'Sentinel';
  }

  return 'Controller';
}

function getRoleMessage(role: Role): string {
  if (role === 'Duelist') {
    return 'Your stats fit an aggressive entry playstyle.';
  } else if (role === 'Sentinel') {
    return 'Your stats fit a defensive and consistent playstyle.';
  } else if (role === 'Initiator') {
    return 'Your stats fit a team-support and information playstyle.';
  }

  return 'Your stats fit a supportive and map-control playstyle.';
}

function getMatchSummary(results: string[]): string {
  let wins = 0;

  for (const result of results) {
    if (result === 'W') {
      wins++;
    }
  }

  return `${wins} wins from ${results.length} recent matches`;
}

export default function Index() {
  const [search, setSearch] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const recommendedRole: Role = getRecommendedRole(player);

  // Custom async function. It waits for the API request and updates the screen state.
  async function loadAgents(): Promise<void> {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const fetchedAgents = await getAgentObjects(recommendedRole);
      setAgents(fetchedAgents);

      if (fetchedAgents.length > 0) {
        setSelectedAgent(fetchedAgents[0].id);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not load agents. Check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAgents();
  }, []);

  // Search is applied to the API data already stored in state.
  const filteredAgents = agents.filter((agent) => {
    const searchText = search.trim().toLowerCase();

    return (
      agent.name.toLowerCase().includes(searchText) ||
      agent.role.toLowerCase().includes(searchText)
    );
  });

  const matchSummary = getMatchSummary(recentMatches);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="stats-chart" size={30} color={COLORS.red} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.brand}>FRAG</Text>
            <Text style={styles.subtitle}>Player Stats & Agent Finder</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>PLAYER SNAPSHOT</Text>
            <Text style={styles.demoTag}>DEMO DATA</Text>
          </View>

          <View style={styles.playerRow}>
            <Ionicons
              name="person-circle-outline"
              size={54}
              color={COLORS.red}
            />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.mutedText}>{player.rank}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.kd}</Text>
              <Text style={styles.statLabel}>K/D</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.headshot}%</Text>
              <Text style={styles.statLabel}>Headshot</Text>
            </View>
          </View>
          <Text style={styles.apiNote}>
            These player statistics are sample values for the prototype.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RECOMMENDED ROLE</Text>
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

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>SUGGESTED AGENTS</Text>
            <Text style={styles.apiNote}>Live data from Valorant API</Text>
          </View>
          <Pressable
            style={styles.refreshButton}
            onPress={() => {
              void loadAgents();
            }}
            disabled={isLoading}
          >
            <Ionicons name="refresh-outline" size={17} color={COLORS.text} />
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search agent or role"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          autoCapitalize="none"
        />

        {!isLoading && errorMessage === '' && (
          <Text style={styles.resultCount}>
            Showing {filteredAgents.length} of {agents.length} agents · highest role fit first
          </Text>
        )}

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.red} />
            <Text style={styles.mutedText}>Loading agents...</Text>
          </View>
        )}

        {errorMessage !== '' && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Unable to load agents</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                void loadAgents();
              }}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {!isLoading && errorMessage === '' && agents.length === 0 && (
          <Text style={styles.emptyText}>No agents were returned by the API.</Text>
        )}

        {!isLoading && errorMessage === '' && agents.length > 0 && filteredAgents.length === 0 && (
          <Text style={styles.emptyText}>No agents match your search.</Text>
        )}

        {!isLoading &&
          errorMessage === '' &&
          filteredAgents.map((agent) => {
            const isSelected = selectedAgent === agent.id;

            return (
              <Pressable
                key={agent.id}
                onPress={() => setSelectedAgent(agent.id)}
                style={[
                  styles.agentCard,
                  {
                    borderColor: isSelected ? COLORS.red : COLORS.border,
                    backgroundColor: isSelected ? COLORS.redDark : COLORS.card,
                  },
                ]}
              >
                {agent.icon ? (
                  <Image source={{ uri: agent.icon }} style={styles.agentIcon} />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={42}
                    color={COLORS.red}
                  />
                )}

                <View style={styles.agentInfo}>
                  <Text style={styles.agentName}>{agent.name}</Text>
                  <Text style={styles.mutedText}>{agent.role}</Text>
                  <Text style={styles.agentDescription} numberOfLines={2}>
                    {agent.description}
                  </Text>
                </View>

                <View style={styles.fitContainer}>
                  <Text style={styles.fitValue}>{agent.fit}%</Text>
                  <Text style={styles.fitLabel}>Role Fit</Text>
                </View>
              </Pressable>
            );
          })}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>RECENT MATCHES</Text>
          <View style={styles.matchesRow}>
            {recentMatches.map((result, index) => (
              <View
                key={`${result}-${index}`}
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
          <Text style={styles.mutedText}>{matchSummary}</Text>
        </View>

        <Text style={styles.footerText}>
          FRAG · React Native and TypeScript prototype
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
