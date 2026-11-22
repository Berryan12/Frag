import { supabase } from '../lib/supabase';
import type { Mission, MissionStatus } from '../types/mission';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the URL and anon key to .env.');
  }

  return supabase;
}

export async function getMissions(userId: string): Promise<Mission[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createMission(
  userId: string,
  title: string,
  rewardPoints: number
): Promise<Mission> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('missions')
    .insert({
      user_id: userId,
      title,
      reward_points: rewardPoints,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMissionStatus(
  userId: string,
  missionId: string,
  status: MissionStatus
): Promise<Mission> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('missions')
    .update({ status })
    .eq('id', missionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMission(
  userId: string,
  missionId: string
): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from('missions')
    .delete()
    .eq('id', missionId)
    .eq('user_id', userId);

  if (error) throw error;
}
