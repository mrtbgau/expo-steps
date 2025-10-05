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
