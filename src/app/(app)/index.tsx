import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, styles } from '../../constants/styles';
import SecureVaultDemo from '../../components/SecureVaultDemo';
import { useAuth } from '../../contexts/AuthContext';
import { getAgentObjects } from '../../services/agentService';
import {
  createMission,
  deleteMission,
  getMissions,
  updateMissionStatus,
} from '../../services/missionService';
import type { Agent, Player, Role } from '../../types/agent';
import type { Mission, MissionStatus } from '../../types/mission';

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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default function Index() {
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionTitle, setMissionTitle] = useState<string>('');
  const [missionReward, setMissionReward] = useState<string>('150');
  const [missionLoading, setMissionLoading] = useState<boolean>(true);
  const [missionBusy, setMissionBusy] = useState<boolean>(false);
  const [busyMissionId, setBusyMissionId] = useState<string>('');
  const [missionError, setMissionError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [accountMessage, setAccountMessage] = useState<string>('');

  const recommendedRole: Role = getRecommendedRole(player);
  const callsign =
    typeof user?.user_metadata?.callsign === 'string'
      ? user.user_metadata.callsign
      : user?.email ?? 'FRAG Player';

  async function loadAgents(): Promise<void> {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const fetchedAgents = await getAgentObjects(recommendedRole);
      setAgents(fetchedAgents);

      if (fetchedAgents.length > 0) {
        setSelectedAgent((current) => current || fetchedAgents[0].id);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMissions(): Promise<void> {
    if (!user) return;

    setMissionLoading(true);
    setMissionError('');

    try {
      const data = await getMissions(user.id);
      setMissions(data);
    } catch (error) {
      setMissionError(getErrorMessage(error));
    } finally {
      setMissionLoading(false);
    }
  }

  useEffect(() => {
    void loadAgents();
  }, []);

  useEffect(() => {
    if (user?.id) {
      void loadMissions();
    }
  }, [user?.id]);

  async function refreshAll(): Promise<void> {
    setRefreshing(true);
    try {
      await Promise.all([loadAgents(), loadMissions()]);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleAddMission(): Promise<void> {
    if (!user || missionBusy) return;

    const cleanTitle = missionTitle.trim();
    if (!cleanTitle) {
      setMissionError('Enter a mission title first.');
      return;
    }

    const parsedReward = Number(missionReward);
    const rewardPoints =
      Number.isFinite(parsedReward) && parsedReward >= 0
        ? Math.floor(parsedReward)
        : 150;

    const temporaryMission: Mission = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      title: cleanTitle,
      reward_points: rewardPoints,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setMissionError('');
    setMissionBusy(true);
    setMissions((current) => [temporaryMission, ...current]);
    setMissionTitle('');
    setMissionReward('150');

    try {
      const savedMission = await createMission(user.id, cleanTitle, rewardPoints);
      setMissions((current) =>
        current.map((mission) =>
          mission.id === temporaryMission.id ? savedMission : mission
        )
      );
    } catch (error) {
      setMissions((current) =>
        current.filter((mission) => mission.id !== temporaryMission.id)
      );
      setMissionError(getErrorMessage(error));
    } finally {
      setMissionBusy(false);
    }
  }

  async function handleToggleMission(mission: Mission): Promise<void> {
    if (!user || busyMissionId) return;

    const nextStatus: MissionStatus =
      mission.status === 'completed' ? 'pending' : 'completed';
    const previousMissions = missions;

    setBusyMissionId(mission.id);
    setMissionError('');
    setMissions((current) =>
      current.map((item) =>
        item.id === mission.id ? { ...item, status: nextStatus } : item
      )
    );

    try {
      const updatedMission = await updateMissionStatus(
        user.id,
        mission.id,
        nextStatus
      );
      setMissions((current) =>
        current.map((item) => (item.id === mission.id ? updatedMission : item))
      );
    } catch (error) {
      setMissions(previousMissions);
      setMissionError(getErrorMessage(error));
    } finally {
      setBusyMissionId('');
    }
  }

  async function handleDeleteMission(missionId: string): Promise<void> {
    if (!user || busyMissionId) return;

    const previousMissions = missions;
    setBusyMissionId(missionId);
    setMissionError('');
    setMissions((current) => current.filter((item) => item.id !== missionId));

    try {
      await deleteMission(user.id, missionId);
    } catch (error) {
      setMissions(previousMissions);
      setMissionError(getErrorMessage(error));
    } finally {
      setBusyMissionId('');
    }
  }

  async function handleSignOut(): Promise<void> {
    setAccountMessage('');

    try {
      await signOut();
    } catch (error) {
      setAccountMessage(getErrorMessage(error));
    }
  }

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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshAll()}
            tintColor={COLORS.red}
            colors={[COLORS.red]}
          />
        }
      >
        <View style={styles.sectionHeading}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="stats-chart" size={30} color={COLORS.red} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.brand}>FRAG</Text>
              <Text style={styles.subtitle}>Player Stats & Agent Finder</Text>
            </View>
          </View>
          <Pressable style={styles.signOutButton} onPress={() => void handleSignOut()}>
            <Ionicons name="log-out-outline" size={16} color={COLORS.text} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={styles.userBadge}>
          <Ionicons name="person-circle-outline" size={17} color={COLORS.red} />
          <Text style={styles.userBadgeText}>Signed in as {callsign}</Text>
        </View>
        {accountMessage !== '' && <Text style={styles.formError}>{accountMessage}</Text>}

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

        <View style={styles.card}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>MISSION BOARD</Text>
              <Text style={styles.apiNote}>Private missions for your account</Text>
            </View>
            <Text style={styles.demoTag}>{missions.length} TOTAL</Text>
          </View>

          <View style={styles.missionFormRow}>
            <TextInput
              value={missionTitle}
              onChangeText={setMissionTitle}
              placeholder="Mission objective"
              placeholderTextColor={COLORS.muted}
              style={styles.missionInput}
              editable={!missionBusy}
              maxLength={120}
            />
            <TextInput
              value={missionReward}
              onChangeText={setMissionReward}
              placeholder="Points"
              placeholderTextColor={COLORS.muted}
              style={styles.missionRewardInput}
              keyboardType="number-pad"
              editable={!missionBusy}
            />
            <Pressable
              style={[styles.missionAddButton, missionBusy && styles.disabledButton]}
              onPress={() => void handleAddMission()}
              disabled={missionBusy}
            >
              <Text style={styles.missionAddText}>Add</Text>
            </Pressable>
          </View>

          {missionError !== '' && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{missionError}</Text>
              <Pressable onPress={() => void loadMissions()}>
                <Text style={styles.sectionAction}>Retry loading missions</Text>
              </Pressable>
            </View>
          )}

          {missionLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={COLORS.red} />
              <Text style={styles.mutedText}>Loading your missions...</Text>
            </View>
          ) : missions.length === 0 ? (
            <Text style={styles.emptyText}>No missions yet. Add your first mission above.</Text>
          ) : (
            missions.map((mission) => (
              <View key={mission.id} style={styles.missionCard}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionMeta}>
                  {mission.reward_points} points · {mission.status}
                </Text>
                <View style={styles.missionActions}>
                  <Pressable
                    style={[
                      styles.missionStatusButton,
                      mission.status === 'completed' && styles.missionStatusDone,
                      busyMissionId === mission.id && styles.disabledButton,
                    ]}
                    onPress={() => void handleToggleMission(mission)}
                    disabled={busyMissionId !== '' || mission.id.startsWith('temp-')}
                  >
                    <Text style={styles.missionStatusText}>
                      {mission.status === 'completed' ? 'Mark Pending' : 'Complete'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.missionDeleteButton,
                      busyMissionId === mission.id && styles.disabledButton,
                    ]}
                    onPress={() => void handleDeleteMission(mission.id)}
                    disabled={busyMissionId !== '' || mission.id.startsWith('temp-')}
                  >
                    <Text style={styles.missionDeleteText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>SUGGESTED AGENTS</Text>
            <Text style={styles.apiNote}>Live data from Valorant API</Text>
          </View>
          <Pressable
            style={styles.refreshButton}
            onPress={() => void loadAgents()}
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
            <Pressable style={styles.primaryButton} onPress={() => void loadAgents()}>
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

        <SecureVaultDemo />

        <Text style={styles.footerText}>
          FRAG · React Native and TypeScript prototype
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
