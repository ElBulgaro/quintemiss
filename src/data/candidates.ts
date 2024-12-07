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
  },
  {
    id: "4",
    name: "Claire Moreau",
    age: 23,
    region: "Normandie",
    image: "/placeholder.svg",
    bio: "Passionnée d'écologie, Claire travaille sur des projets de développement durable dans sa région.",
    socialMedia: {
      instagram: "https://instagram.com/clairemoreau",
    }
  },
  {
    id: "5",
    name: "Léa Bernard",
    age: 24,
    region: "Grand Est",
    image: "/placeholder.svg",
    bio: "Danseuse classique, Léa enseigne la danse aux enfants défavorisés.",
    socialMedia: {
      instagram: "https://instagram.com/leabernard",
    }
  },
  {
    id: "6",
    name: "Julie Petit",
    age: 22,
    region: "Hauts-de-France",
    image: "/placeholder.svg",
    bio: "Étudiante en droit, Julie rêve de devenir avocate pour défendre les droits des femmes.",
    socialMedia: {
      instagram: "https://instagram.com/juliepetit",
    }
  },
  {
    id: "7",
    name: "Emma Roux",
    age: 23,
    region: "Auvergne-Rhône-Alpes",
    image: "/placeholder.svg",
    bio: "Photographe professionnelle, Emma capture la beauté des paysages français.",
    socialMedia: {
      instagram: "https://instagram.com/emmaroux",
    }
  },
  {
    id: "8",
    name: "Chloé Leroy",
    age: 25,
    region: "Occitanie",
    image: "/placeholder.svg",
    bio: "Ingénieure en environnement, Chloé développe des solutions pour préserver la biodiversité.",
    socialMedia: {
      instagram: "https://instagram.com/chloeleroy",
    }
  },
  {
    id: "9",
    name: "Inès Fournier",
    age: 24,
    region: "Nouvelle-Aquitaine",
    image: "/placeholder.svg",
    bio: "Championne d'équitation, Inès participe à des compétitions internationales.",
    socialMedia: {
      instagram: "https://instagram.com/inesfournier",
    }
  },
  {
    id: "10",
    name: "Manon Girard",
    age: 23,
    region: "Bourgogne-Franche-Comté",
    image: "/placeholder.svg",
    bio: "Œnologue en formation, Manon valorise le patrimoine viticole français.",
    socialMedia: {
      instagram: "https://instagram.com/manongirard",
    }
  },
  {
    id: "11",
    name: "Sarah Lambert",
    age: 22,
    region: "Centre-Val de Loire",
    image: "/placeholder.svg",
    bio: "Étudiante en histoire de l'art, Sarah guide des visites dans les châteaux de la Loire.",
    socialMedia: {
      instagram: "https://instagram.com/sarahlambert",
    }
  },
  {
    id: "12",
    name: "Camille Mercier",
    age: 24,
    region: "Pays de la Loire",
    image: "/placeholder.svg",
    bio: "Biologiste marine, Camille étudie la protection des écosystèmes côtiers.",
    socialMedia: {
      instagram: "https://instagram.com/camillemercier",
    }
  },
  {
    id: "13",
    name: "Zoé Durand",
    age: 23,
    region: "Corse",
    image: "/placeholder.svg",
    bio: "Guide touristique, Zoé fait découvrir les trésors de son île aux visiteurs.",
    socialMedia: {
      instagram: "https://instagram.com/zoedurand",
    }
  },
  {
    id: "14",
    name: "Louise Bonnet",
    age: 25,
    region: "Guadeloupe",
    image: "/placeholder.svg",
    bio: "Professeure de danse traditionnelle, Louise préserve le patrimoine culturel local.",
    socialMedia: {
      instagram: "https://instagram.com/louisebonnet",
    }
  },
  {
    id: "15",
    name: "Alice Dupont",
    age: 24,
    region: "Martinique",
    image: "/placeholder.svg",
    bio: "Créatrice de mode, Alice s'inspire des traditions caribéennes dans ses collections.",
    socialMedia: {
      instagram: "https://instagram.com/alicedupont",
    }
  },
  {
    id: "16",
    name: "Victoria Rousseau",
    age: 23,
    region: "Guyane",
    image: "/placeholder.svg",
    bio: "Botaniste, Victoria étudie les plantes médicinales de la forêt amazonienne.",
    socialMedia: {
      instagram: "https://instagram.com/victoriarousseau",
    }
  },
  {
    id: "17",
    name: "Jade Lemoine",
    age: 22,
    region: "La Réunion",
    image: "/placeholder.svg",
    bio: "Championne de surf, Jade sensibilise à la protection des océans.",
    socialMedia: {
      instagram: "https://instagram.com/jadelemoine",
    }
  },
  {
    id: "18",
    name: "Nina Gauthier",
    age: 24,
    region: "Mayotte",
    image: "/placeholder.svg",
    bio: "Infirmière, Nina s'engage pour l'accès aux soins dans les zones isolées.",
    socialMedia: {
      instagram: "https://instagram.com/ninagauthier",
    }
  },
  {
    id: "19",
    name: "Lola Perrin",
    age: 23,
    region: "Nouvelle-Calédonie",
    image: "/placeholder.svg",
    bio: "Biologiste, Lola étudie la préservation des récifs coralliens.",
    socialMedia: {
      instagram: "https://instagram.com/lolaperrin",
    }
  },
  {
    id: "20",
    name: "Éléna Morel",
    age: 25,
    region: "Polynésie française",
    image: "/placeholder.svg",
    bio: "Danseuse traditionnelle, Éléna enseigne le ori tahiti aux nouvelles générations.",
    socialMedia: {
      instagram: "https://instagram.com/elenamorel",
    }
  },
  {
    id: "21",
    name: "Anaïs Simon",
    age: 24,
    region: "Saint-Pierre-et-Miquelon",
    image: "/placeholder.svg",
    bio: "Photographe nature, Anaïs documente la vie sauvage de l'archipel.",
    socialMedia: {
      instagram: "https://instagram.com/anaissimon",
    }
  },
  {
    id: "22",
    name: "Luna Garcia",
    age: 23,
    region: "Saint-Barthélemy",
    image: "/placeholder.svg",
    bio: "Chef cuisinière, Luna promeut la gastronomie locale et durable.",
    socialMedia: {
      instagram: "https://instagram.com/lunagarcia",
    }
  },
  {
    id: "23",
    name: "Rose Michel",
    age: 22,
    region: "Saint-Martin",
    image: "/placeholder.svg",
    bio: "Artiste peintre, Rose s'inspire des paysages caribéens dans ses œuvres.",
    socialMedia: {
      instagram: "https://instagram.com/rosemichel",
    }
  },
  {
    id: "24",
    name: "Lily Thomas",
    age: 24,
    region: "Wallis-et-Futuna",
    image: "/placeholder.svg",
    bio: "Enseignante, Lily œuvre pour la préservation des langues locales.",
    socialMedia: {
      instagram: "https://instagram.com/lilythomas",
    }
  },
  {
    id: "25",
    name: "Mia Robert",
    age: 23,
    region: "Alsace",
    image: "/placeholder.svg",
    bio: "Architecte, Mia travaille sur la rénovation du patrimoine historique.",
    socialMedia: {
      instagram: "https://instagram.com/miarobert",
    }
  },
  {
    id: "26",
    name: "Eva Marchand",
    age: 25,
    region: "Lorraine",
    image: "/placeholder.svg",
    bio: "Journaliste, Eva couvre les enjeux environnementaux de sa région.",
    socialMedia: {
      instagram: "https://instagram.com/evamarchand",
    }
  },
  {
    id: "27",
    name: "Léna Duval",
    age: 24,
    region: "Champagne",
    image: "/placeholder.svg",
    bio: "Sommelière, Léna fait découvrir les vins de sa région.",
    socialMedia: {
      instagram: "https://instagram.com/lenaduval",
    }
  },
  {
    id: "28",
    name: "Alix Renard",
    age: 23,
    region: "Picardie",
    image: "/placeholder.svg",
    bio: "Restauratrice d'art, Alix préserve le patrimoine culturel français.",
    socialMedia: {
      instagram: "https://instagram.com/alixrenard",
    }
  },
  {
    id: "29",
    name: "Jade Blanc",
    age: 22,
    region: "Poitou-Charentes",
    image: "/placeholder.svg",
    bio: "Sportive de haut niveau, Jade pratique l'athlétisme en compétition.",
    socialMedia: {
      instagram: "https://instagram.com/jadeblanc",
    }
  },
  {
    id: "30",
    name: "Flora Vincent",
    age: 24,
    region: "Limousin",
    image: "/placeholder.svg",
    bio: "Botaniste, Flora étudie les plantes médicinales traditionnelles.",
    socialMedia: {
      instagram: "https://instagram.com/floravincent",
    }
  }
];