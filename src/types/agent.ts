export type Role =
  | 'Duelist'
  | 'Sentinel'
  | 'Controller'
  | 'Initiator'
  | 'Unknown';

export interface Player {
  name: string;
  rank: string;
  kd: number;
  winRate: number;
  headshot: number;
}

export interface ApiAgent {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string | null;
  isPlayableCharacter: boolean;
  role: { displayName: string } | null;
}

export interface ValorantApiResponse {
  status: number;
  data: ApiAgent[];
}

export interface Agent {
  id: string;
  name: string;
  role: Role;
  description: string;
  icon: string | null;
  fit: number;
}
