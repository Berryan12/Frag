export type RoleName = 'Duelist' | 'Sentinel' | 'Controller' | 'Initiator' | string;

export interface Player {
  name: string;
  rank: string;
  kd: number;
  winRate: number;
  headshot: number;
}

export interface RawValorantAgent {
  uuid: string;
  displayName: string;
  description: string;
  displayIcon: string;
  role?: {
    displayName: RoleName;
    description: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  role: RoleName;
  description: string;
  icon: string;
  match: number;
}