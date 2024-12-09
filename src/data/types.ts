export interface Candidate {
  id: string;
  name: string;
  age: number;
  region: string;
  image: string;
  bio: string;
  official_photo_url?: string;
  portrait_url?: string;
  instagram?: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}