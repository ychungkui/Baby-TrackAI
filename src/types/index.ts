// Baby TrackAI 型別定義

export type SubscriptionTier = 'free' | 'pro';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Baby {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  gender: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type RecordType = 'sleep' | 'feeding' | 'night_wake' | 'diaper' | 'bath' | 'potty' | 'water' | 'solid_food';

export interface SleepNotes {
  duration_minutes?: number;
}

export interface FeedingNotes {
  amount_ml?: number;
  feeding_type?: 'breast' | 'bottle';
}

export interface NightWakeNotes {
  duration_minutes?: number;
}

export interface DiaperNotes {
  diaper_type?: 'wet' | 'dirty' | 'both';
}

export interface BathNotes {
  duration_minutes?: number;
}

export interface PottyNotes {
  diaper_type?: 'wet' | 'dirty' | 'both';
}

export interface WaterNotes {
  amount_ml?: number;
}

export interface SolidFoodNotes {
  amount_grams?: number;
}

export type RecordNotes = SleepNotes | FeedingNotes | NightWakeNotes | DiaperNotes | BathNotes | PottyNotes | WaterNotes | SolidFoodNotes;

export interface BabyRecord {
  id: string;
  baby_id: string;
  type: RecordType;
  start_time: string;
  end_time: string | null;
  notes: RecordNotes;
  created_at: string;
  updated_at: string;
}

export interface GrowthPhoto {
  id: string;
  baby_id: string;
  image_url: string;
  caption: string | null;
  taken_at: string;
  created_at: string;
  updated_at: string;
}

// 表單用型別
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AddBabyFormData {
  name: string;
  birth_date: string;
  gender?: string;
}
