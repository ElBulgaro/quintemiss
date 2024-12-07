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

export const candidates: Candidate[] = [
  {
    id: "1",
    name: "Eve Martin",
    age: 23,
    region: "Île-de-France",
    image: "/placeholder.svg",
    bio: "Passionnée de mode et d'art, Eve est diplômée en design et s'engage pour la promotion de la culture française.",
    socialMedia: {
      instagram: "https://instagram.com/evemartin",
    }
  },
  {
    id: "2",
    name: "Sophie Dubois",
    age: 24,
    region: "Provence-Alpes-Côte d'Azur",
    image: "/placeholder.svg",
    bio: "Étudiante en médecine, Sophie consacre son temps libre à des associations caritatives.",
    socialMedia: {
      instagram: "https://instagram.com/sophiedubois",
    }
  },
  {
    id: "3",
    name: "Marie Laurent",
    age: 22,
    region: "Bretagne",
    image: "/placeholder.svg",
    bio: "Sportive accomplie, Marie est championne régionale de natation et s'investit dans l'éducation sportive des jeunes.",
    socialMedia: {
      instagram: "https://instagram.com/marielaurent",
    }
  }
];