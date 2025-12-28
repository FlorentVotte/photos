export type Locale = "en" | "fr";

export const translations = {
  // Navigation
  nav: {
    home: { en: "Home", fr: "Accueil" },
    albums: { en: "Albums", fr: "Albums" },
    search: { en: "Search", fr: "Recherche" },
    map: { en: "Map", fr: "Carte" },
    about: { en: "About", fr: "À propos" },
    openMenu: { en: "Open menu", fr: "Ouvrir le menu" },
    closeMenu: { en: "Close menu", fr: "Fermer le menu" },
  },

  // Homepage
  home: {
    featuredStory: { en: "Featured Story", fr: "À la une" },
    viewAlbum: { en: "View Album", fr: "Voir l'album" },
    quote: {
      en: "To photograph is to hold one's breath when all faculties converge.",
      fr: "Photographier, c'est retenir son souffle quand toutes nos facultés convergent.",
    },
    quoteAuthor: {
      en: "— Henri Cartier-Bresson",
      fr: "— Henri Cartier-Bresson",
    },
    recentAlbums: { en: "Recent Albums", fr: "Albums récents" },
    viewArchive: { en: "View Archive", fr: "Voir les archives" },
    tagline: {
      en: "Capturing the fleeting moments between departures and arrivals.",
      fr: "Capturer les instants fugaces entre les départs et les arrivées.",
    },
  },

  // Albums archive page
  albums: {
    title: { en: "All Albums", fr: "Tous les albums" },
    subtitle: {
      en: "Photo albums documenting travels and visual stories from around the world.",
      fr: "Albums photos documentant voyages et récits visuels à travers le monde.",
    },
    albumCount: { en: "albums", fr: "albums" },
    photoCount: { en: "photos", fr: "photos" },
    noAlbums: { en: "No albums available", fr: "Aucun album disponible" },
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
    resolution: { en: "Size", fr: "Taille" },
    noGpsData: { en: "No GPS data", fr: "Pas de données GPS" },
    unknownLens: { en: "Unknown lens", fr: "Objectif inconnu" },
    camera: { en: "Camera", fr: "Appareil" },
    download: { en: "Download", fr: "Télécharger" },
    share: { en: "Share", fr: "Partager" },
    linkCopied: { en: "Link copied!", fr: "Lien copié !" },
  },

  // Search page
  search: {
    title: { en: "Search", fr: "Recherche" },
    placeholder: {
      en: "Search albums, photos, locations, cameras...",
      fr: "Rechercher albums, photos, lieux, appareils...",
    },
    allLocations: { en: "All Locations", fr: "Tous les lieux" },
    allCameras: { en: "All Cameras", fr: "Tous les boîtiers" },
    allLenses: { en: "All Lenses", fr: "Tous les objectifs" },
    clearFilters: { en: "Clear", fr: "Effacer" },
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
      en: "A geographical view of the archive",
      fr: "Une vue géographique des archives",
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
      en: "I photograph the spaces between destinations—the quiet corners, the fleeting light, the faces that linger in memory. My work is less about where I've been and more about how it felt to be there.",
      fr: "Je photographie les espaces entre les destinations—les recoins silencieux, la lumière fugace, les visages qui persistent en mémoire. Mon travail parle moins des lieux visités que de ce qu'on y ressent.",
    },
    shortBio: {
      en: "Documentary and landscape photography from journeys across the globe. Exploring the interplay of light, place, and human presence.",
      fr: "Photographie documentaire et paysagère au fil de voyages à travers le monde. Explorer l'interaction entre lumière, lieu et présence humaine.",
    },
    // Journey stats
    myJourney: { en: "My Journey", fr: "Mon parcours" },
    totalPhotos: { en: "Photos", fr: "Photos" },
    totalAlbums: { en: "Albums", fr: "Albums" },
    countries: { en: "Countries", fr: "Pays" },
    cities: { en: "Cities", fr: "Villes" },
    since: { en: "Since", fr: "Depuis" },
    // Social
    followMe: { en: "Follow me", fr: "Me suivre" },
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
