export type MissionStatus = 'pending' | 'completed';

export type Mission = {
  id: string;
  user_id: string;
  title: string;
  reward_points: number;
  status: MissionStatus;
  created_at: string;
};
