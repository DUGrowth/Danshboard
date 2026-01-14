export interface Streak {
  id: number;
  name: string;
  current_count: number;
  best_count: number;
  last_check_in: string | null;
  created_at: string;
}

export interface Accomplishment {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  points: number;
  completed_at: string;
  created_at: string;
}

export interface DailyCheckIn {
  id: number;
  date: string;
  mood: number;
  energy: number;
  notes: string | null;
  created_at: string;
}

export interface Milestone {
  id: number;
  streak_id: number;
  milestone_count: number;
  achieved_at: string;
  streak_name?: string;
}
