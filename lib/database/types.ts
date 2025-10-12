export interface User {
  id: number;
  email: string;
  password?: string;
  created_at: string;
}

export interface Trip {
  id: number;
  user_id: number;
  title: string;
  start_date: string;
  end_date: string;
  image_uri: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stop {
  id: number;
  trip_id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string;
  image_uri: string | null;
  notes: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: number;
  trip_id: number;
  stop_id: number | null;
  entry_date: string;
  title: string;
  content: string | null;
  audio_uri: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalPhoto {
  id: number;
  entry_id: number;
  image_uri: string;
  caption: string | null;
  order_index: number;
  created_at: string;
}

export interface ChecklistCategory {
  id: number;
  trip_id: number;
  name: string;
  icon: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: number;
  category_id: number;
  name: string;
  is_checked: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistReminder {
  id: number;
  trip_id: number;
  reminder_date: string;
  message: string;
  is_triggered: number;
  created_at: string;
}
