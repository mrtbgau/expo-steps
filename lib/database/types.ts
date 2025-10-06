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
  description: string | null;
  image_uri: string | null;
  notes: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}
