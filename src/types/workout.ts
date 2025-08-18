export interface Workout {
  id: string;
  user_id: string;
  name: string;
  date: Date;
  start_time: string;
  distance: number;
  duration_minutes?: number;
  duration_seconds?: number;
  pace_minutes?: number;
  pace_seconds?: number;
  calories?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  elevation_gain?: number;
  workout_type: 'running' | 'walking' | 'cycling' | 'interval' | 'tempo' | 'long_run' | 'recovery';
  perceived_effort?: number; // 1-10 scale
  weather?: string;
  temperature?: number;
  route_name?: string;
  notes?: string;
  shoes_used?: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkoutFormData {
  name: string;
  date: Date;
  start_time: string;
  distance: number;
  duration_minutes?: number;
  duration_seconds?: number;
  calories?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  elevation_gain?: number;
  workout_type: 'running' | 'walking' | 'cycling' | 'interval' | 'tempo' | 'long_run' | 'recovery';
  perceived_effort?: number;
  weather?: string;
  temperature?: number;
  route_name?: string;
  notes?: string;
  shoes_used?: string;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDistance: number;
  totalTime: number; // in minutes
  averagePace: number; // in seconds per km
  thisWeekDistance: number;
  thisMonthDistance: number;
  longestRun: number;
  averageHeartRate?: number;
  totalCalories: number;
}