export interface Candidate {
  id: string;
  name: string;
  age: number;
  region: string;
  image: string;
  bio: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}