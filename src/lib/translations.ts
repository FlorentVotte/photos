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

  // Privacy Policy
  privacy: {
    title: { en: "Privacy", fr: "Politique de" },
    titleAccent: { en: "Policy", fr: "confidentialité" },
    lastUpdated: { en: "Last updated: December 2024", fr: "Dernière mise à jour : décembre 2024" },
    overviewTitle: { en: "Overview", fr: "Aperçu" },
    overviewText: {
      en: "This website is a personal photography portfolio. We are committed to protecting your privacy and processing your data in accordance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.",
      fr: "Ce site web est un portfolio de photographie personnel. Nous nous engageons à protéger votre vie privée et à traiter vos données conformément au Règlement Général sur la Protection des Données (RGPD) et aux autres lois applicables en matière de protection des données.",
    },
    controllerTitle: { en: "Data Controller", fr: "Responsable du traitement" },
    email: { en: "Email:", fr: "Email :" },
    website: { en: "Website:", fr: "Site web :" },
    dataCollectTitle: { en: "Data We Collect", fr: "Données collectées" },
    dataCollectIntro: { en: "This website collects minimal data:", fr: "Ce site web collecte un minimum de données :" },
    navigationData: { en: "Navigation data:", fr: "Données de navigation :" },
    navigationDataDesc: {
      en: "Server logs including IP addresses, browser type, operating system, pages visited, timestamps, and referrer URLs. These are used for security and website maintenance purposes and are retained for a maximum of 12 months.",
      fr: "Journaux serveur incluant les adresses IP, le type de navigateur, le système d'exploitation, les pages visitées, les horodatages et les URL de provenance. Ces données sont utilisées à des fins de sécurité et de maintenance du site et sont conservées pendant un maximum de 12 mois.",
    },
    cookiesTitle: { en: "Cookies", fr: "Cookies" },
    cookiesIntro: { en: "This website uses only essential cookies:", fr: "Ce site web utilise uniquement des cookies essentiels :" },
    languagePref: { en: "Language preference:", fr: "Préférence de langue :" },
    languagePrefDesc: {
      en: "Stores your language choice (English/French) in localStorage.",
      fr: "Enregistre votre choix de langue (anglais/français) dans le stockage local.",
    },
    serviceWorker: { en: "Service Worker / Cache:", fr: "Service Worker / Cache :" },
    serviceWorkerDesc: {
      en: "Enables offline mode and improves loading performance.",
      fr: "Permet le mode hors ligne et améliore les performances de chargement.",
    },
    noCookiesTracking: {
      en: "No advertising or third-party tracking cookies are used on this website.",
      fr: "Aucun cookie publicitaire ou de suivi tiers n'est utilisé sur ce site.",
    },
    thirdPartyTitle: { en: "Third-Party Services", fr: "Services tiers" },
    thirdPartyText: {
      en: "Images on this website are served from Adobe Lightroom servers. Please refer to",
      fr: "Les images de ce site sont hébergées sur les serveurs Adobe Lightroom. Veuillez consulter",
    },
    adobePrivacy: { en: "Adobe's privacy policy", fr: "la politique de confidentialité d'Adobe" },
    thirdPartyEnd: {
      en: "for information on how they handle data. We do not share any of your personal data with third parties for marketing or advertising purposes.",
      fr: "pour plus d'informations sur la gestion de vos données. Nous ne partageons aucune de vos données personnelles avec des tiers à des fins marketing ou publicitaires.",
    },
    rightsTitle: { en: "Your Rights", fr: "Vos droits" },
    rightsIntro: { en: "Under the GDPR, you have the following rights:", fr: "En vertu du RGPD, vous disposez des droits suivants :" },
    rightAccess: { en: "Right of access to your personal data", fr: "Droit d'accès à vos données personnelles" },
    rightRectification: { en: "Right to rectification of inaccurate data", fr: "Droit de rectification des données inexactes" },
    rightErasure: { en: 'Right to erasure ("right to be forgotten")', fr: "Droit à l'effacement (« droit à l'oubli »)" },
    rightRestriction: { en: "Right to restriction of processing", fr: "Droit à la limitation du traitement" },
    rightPortability: { en: "Right to data portability", fr: "Droit à la portabilité des données" },
    rightObject: { en: "Right to object to processing", fr: "Droit d'opposition au traitement" },
    rightWithdraw: { en: "Right to withdraw consent at any time", fr: "Droit de retirer votre consentement à tout moment" },
    rightsContact: {
      en: "To exercise any of these rights, please contact",
      fr: "Pour exercer l'un de ces droits, veuillez contacter",
    },
    rightsResponse: { en: ". We will respond within one month.", fr: ". Nous répondrons dans un délai d'un mois." },
    securityTitle: { en: "Data Security", fr: "Sécurité des données" },
    securityIntro: {
      en: "We implement appropriate technical and organizational measures to protect your personal data:",
      fr: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles :",
    },
    securityHttps: { en: "HTTPS secure connection (SSL/TLS)", fr: "Connexion sécurisée HTTPS (SSL/TLS)" },
    securityHosting: { en: "Certified hosting infrastructure", fr: "Infrastructure d'hébergement certifiée" },
    securityAccess: { en: "Restricted access to data", fr: "Accès restreint aux données" },
    securityBackups: { en: "Regular backups", fr: "Sauvegardes régulières" },
    complaintsTitle: { en: "Complaints", fr: "Réclamations" },
    complaintsText: {
      en: "If you believe your data protection rights have been violated, you have the right to lodge a complaint with the French data protection authority (CNIL):",
      fr: "Si vous estimez que vos droits en matière de protection des données ont été violés, vous avez le droit de déposer une plainte auprès de l'autorité française de protection des données (CNIL) :",
    },
    changesTitle: { en: "Changes to This Policy", fr: "Modifications de cette politique" },
    changesText: {
      en: "We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date.",
      fr: "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Toute modification sera publiée sur cette page avec une date de révision mise à jour.",
    },
  },

  // Legal Notice
  legal: {
    title: { en: "Legal", fr: "Mentions" },
    titleAccent: { en: "Notice", fr: "légales" },
    lastUpdated: { en: "Last updated: December 2024", fr: "Dernière mise à jour : décembre 2024" },
    ownerTitle: { en: "Website Owner", fr: "Propriétaire du site" },
    individual: { en: "(Individual)", fr: "(Particulier)" },
    email: { en: "Email:", fr: "Email :" },
    website: { en: "Website:", fr: "Site web :" },
    directorTitle: { en: "Publication Director", fr: "Directeur de la publication" },
    hostingTitle: { en: "Hosting", fr: "Hébergement" },
    phone: { en: "Phone:", fr: "Téléphone :" },
    ipTitle: { en: "Intellectual Property", fr: "Propriété intellectuelle" },
    ipText: {
      en: "All content on this website (photographs, images, texts, graphics, logos) is the exclusive property of Florent Votte unless otherwise stated. Any reproduction, distribution, modification, or use without prior written permission is strictly prohibited.",
      fr: "Tout le contenu de ce site (photographies, images, textes, graphismes, logos) est la propriété exclusive de Florent Votte sauf mention contraire. Toute reproduction, distribution, modification ou utilisation sans autorisation écrite préalable est strictement interdite.",
    },
    licensingText: { en: "For licensing inquiries, please contact", fr: "Pour toute demande de licence, veuillez contacter" },
    termsTitle: { en: "Terms of Use", fr: "Conditions d'utilisation" },
    termsIntro: { en: "By accessing and using this website, you agree to the following terms:", fr: "En accédant et en utilisant ce site, vous acceptez les conditions suivantes :" },
    termBrowse: {
      en: "You may browse and view the content for personal, non-commercial purposes only.",
      fr: "Vous pouvez consulter le contenu uniquement à des fins personnelles et non commerciales.",
    },
    termNoDownload: {
      en: "You may not download, copy, or redistribute any images without explicit permission.",
      fr: "Vous ne pouvez pas télécharger, copier ou redistribuer les images sans autorisation explicite.",
    },
    termNoScrape: {
      en: "You may not use any automated tools to scrape or download content from this website.",
      fr: "Vous ne pouvez pas utiliser d'outils automatisés pour extraire ou télécharger le contenu de ce site.",
    },
    termShare: { en: "You may share links to pages on this website.", fr: "Vous pouvez partager des liens vers les pages de ce site." },
    disclaimerTitle: { en: "Disclaimer", fr: "Avertissement" },
    disclaimerText: {
      en: "The information provided on this website is for general informational purposes only. While we strive to keep the information accurate and up-to-date, we make no representations or warranties of any kind about the completeness, accuracy, reliability, or availability of the website or the information contained on it.",
      fr: "Les informations fournies sur ce site le sont à titre informatif uniquement. Bien que nous nous efforcions de maintenir ces informations exactes et à jour, nous ne faisons aucune déclaration ni garantie quant à l'exhaustivité, l'exactitude, la fiabilité ou la disponibilité du site ou des informations qu'il contient.",
    },
    linksTitle: { en: "External Links", fr: "Liens externes" },
    linksText: {
      en: "This website may contain links to external websites (Adobe Lightroom, social networks). We have no control over the content and availability of these sites and are not responsible for their content or privacy practices.",
      fr: "Ce site peut contenir des liens vers des sites externes (Adobe Lightroom, réseaux sociaux). Nous n'avons aucun contrôle sur le contenu et la disponibilité de ces sites et ne sommes pas responsables de leur contenu ou de leurs pratiques de confidentialité.",
    },
    lawTitle: { en: "Applicable Law", fr: "Droit applicable" },
    lawText: {
      en: "This legal notice is governed by and construed in accordance with the laws of the European Union and France. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the French courts.",
      fr: "Ces mentions légales sont régies et interprétées conformément aux lois de l'Union européenne et de la France. Tout litige découlant de l'utilisation de ce site sera soumis à la compétence exclusive des tribunaux français.",
    },
    creditsTitle: { en: "Credits", fr: "Crédits" },
    creditsDesign: { en: "Design and development:", fr: "Design et développement :" },
    creditsPhoto: { en: "Photography:", fr: "Photographie :" },
  },

  // Story Mode
  story: {
    storyMode: { en: "Story Mode", fr: "Mode histoire" },
    galleryMode: { en: "Gallery View", fr: "Vue galerie" },
    switchToStory: { en: "View as Story", fr: "Voir en histoire" },
    switchToGallery: { en: "View as Gallery", fr: "Voir en galerie" },
    scrollToExplore: { en: "Scroll to explore", fr: "Faites défiler pour explorer" },
    viewAllPhotos: { en: "View all photos", fr: "Voir toutes les photos" },
    morePhotos: { en: "more photos", fr: "photos de plus" },
    noLocationData: { en: "No location data", fr: "Pas de données de localisation" },
    chapter: { en: "Chapter", fr: "Chapitre" },
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
