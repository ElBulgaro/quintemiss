export interface Candidate {
  id: string;
  name: string;
  age: number | null;
  region: string;
  image_url: string;
  bio: string | null;
  official_photo_url?: string | null;
  portrait_url?: string | null;
  instagram?: string | null;
  created_at?: string;
  updated_at?: string;
}