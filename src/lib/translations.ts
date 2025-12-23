export type Locale = "en" | "fr";

export const translations = {
  // Navigation
  nav: {
    home: { en: "Home", fr: "Accueil" },
    albums: { en: "Albums", fr: "Albums" },
    search: { en: "Search", fr: "Recherche" },
    map: { en: "Map", fr: "Carte" },
    about: { en: "About", fr: "À propos" },
  },

  // Homepage
  home: {
    featuredStory: { en: "Featured Story", fr: "À la une" },
    viewAlbum: { en: "View Album", fr: "Voir l'album" },
    quote: {
      en: "The world is a book and those who do not travel read only one page.",
      fr: "Le monde est un livre et ceux qui ne voyagent pas n'en lisent qu'une page.",
    },
    recentAlbums: { en: "Recent Albums", fr: "Albums récents" },
    viewArchive: { en: "View Archive", fr: "Voir les archives" },
  },

  // Album page
  album: {
    travelDiary: { en: "Travel Diary", fr: "Carnet de voyage" },
    chapter: { en: "Chapter", fr: "Chapitre" },
    nextJourney: { en: "Next Journey", fr: "Prochain voyage" },
    gallery: { en: "Gallery", fr: "Galerie" },
  },

  // Photo page
  photo: {
    slideshow: { en: "Slideshow", fr: "Diaporama" },
    backTo: { en: "Back to", fr: "Retour à" },
    aperture: { en: "Aperture", fr: "Ouverture" },
    shutter: { en: "Shutter", fr: "Vitesse" },
    iso: { en: "ISO", fr: "ISO" },
    focal: { en: "Focal", fr: "Focale" },
    noGpsData: { en: "No GPS data", fr: "Pas de données GPS" },
    unknownLens: { en: "Unknown lens", fr: "Objectif inconnu" },
    camera: { en: "Camera", fr: "Appareil" },
  },

  // Search page
  search: {
    title: { en: "Search", fr: "Recherche" },
    placeholder: {
      en: "Search albums, photos, locations...",
      fr: "Rechercher albums, photos, lieux...",
    },
    allLocations: { en: "All Locations", fr: "Tous les lieux" },
    all: { en: "all", fr: "tout" },
    albums: { en: "albums", fr: "albums" },
    photos: { en: "photos", fr: "photos" },
    results: { en: "results found", fr: "résultats trouvés" },
    result: { en: "result found", fr: "résultat trouvé" },
    for: { en: "for", fr: "pour" },
    in: { en: "in", fr: "à" },
    noResults: { en: "No results found", fr: "Aucun résultat" },
    tryDifferent: {
      en: "Try a different search term or filter",
      fr: "Essayez un autre terme ou filtre",
    },
    showingFirst: { en: "Showing first 50 of", fr: "Affichage des 50 premiers sur" },
  },

  // Map page
  map: {
    title: { en: "Photo Map", fr: "Carte des photos" },
    subtitle: {
      en: "Explore photos from around the world",
      fr: "Explorez les photos du monde entier",
    },
    noPhotos: {
      en: "No photos with GPS data available",
      fr: "Aucune photo avec données GPS disponible",
    },
    gpsNote: {
      en: "GPS coordinates are extracted from photo EXIF data during sync",
      fr: "Les coordonnées GPS sont extraites des données EXIF lors de la synchronisation",
    },
    photosWithGps: { en: "photos with GPS data", fr: "photos avec données GPS" },
  },

  // About page
  about: {
    title: { en: "About", fr: "À propos" },
    me: { en: "Me", fr: "de moi" },
    myGear: { en: "My Gear", fr: "Mon équipement" },
    cameras: { en: "Cameras", fr: "Boîtiers" },
    lenses: { en: "Lenses", fr: "Objectifs" },
    photos: { en: "photos", fr: "photos" },
    wantToKnowMore: { en: "Want to know more?", fr: "Envie d'en savoir plus ?" },
    visitSite: { en: "Visit votte.eu", fr: "Visiter votte.eu" },
    bio: {
      en: "Photography has always been my way of preserving memories and sharing the beauty I discover during my travels. Each image tells a story - a moment frozen in time that speaks of the places I've been and the experiences that shaped my journey.",
      fr: "La photographie a toujours été ma façon de préserver les souvenirs et de partager la beauté que je découvre lors de mes voyages. Chaque image raconte une histoire - un moment figé dans le temps qui parle des lieux que j'ai visités et des expériences qui ont façonné mon parcours.",
    },
  },

  // Footer
  footer: {
    allRightsReserved: { en: "All rights reserved.", fr: "Tous droits réservés." },
    privacyPolicy: { en: "Privacy Policy", fr: "Politique de confidentialité" },
    legalNotice: { en: "Legal Notice", fr: "Mentions légales" },
  },

  // Chapter stats
  stats: {
    photos: { en: "Photos", fr: "Photos" },
    traveled: { en: "traveled", fr: "parcourus" },
  },

  // Lightbox
  lightbox: {
    close: { en: "Close", fr: "Fermer" },
    previous: { en: "Previous photo", fr: "Photo précédente" },
    next: { en: "Next photo", fr: "Photo suivante" },
    pause: { en: "Pause slideshow", fr: "Pause diaporama" },
    play: { en: "Play slideshow", fr: "Lancer le diaporama" },
    viewDetails: { en: "View details", fr: "Voir les détails" },
    arrows: { en: "Arrows: navigate", fr: "Flèches : naviguer" },
    space: { en: "Space: slideshow", fr: "Espace : diaporama" },
    info: { en: "I: details", fr: "I : détails" },
    esc: { en: "Esc: close", fr: "Échap : fermer" },
  },

  // Common
  common: {
    showing: { en: "Showing", fr: "Affichage de" },
    of: { en: "of", fr: "sur" },
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(
  section: keyof typeof translations,
  key: string,
  locale: Locale
): string {
  const sectionData = translations[section] as Record<string, Record<Locale, string>>;
  if (sectionData && sectionData[key]) {
    return sectionData[key][locale] || sectionData[key]["en"];
  }
  return key;
}
