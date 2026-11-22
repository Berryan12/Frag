import type { Mission, MissionStatus } from './mission';

export interface Database {
  public: {
    Tables: {
      missions: {
        Row: Mission;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          reward_points?: number;
          status?: MissionStatus;
          created_at?: string;
        };
        Update: {
          title?: string;
          reward_points?: number;
          status?: MissionStatus;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
