import type { Album, Photo, Chapter, SiteConfig } from "./types";
import {
  albums as syncedAlbums,
  photos as syncedPhotos,
  chapters as syncedChapters,
  getAlbums as getSyncedAlbums,
  getAlbumBySlug as getSyncedAlbumBySlug,
  getPhotosByAlbum as getSyncedPhotosByAlbum,
  getPhotoById as getSyncedPhotoById,
  getChaptersByAlbum as getSyncedChaptersByAlbum,
  getFeaturedAlbum as getSyncedFeaturedAlbum,
} from "./synced-data";

// Re-export synced data as the primary data source
export const albums = syncedAlbums;
export const photos = syncedPhotos;
export const chapters = syncedChapters;

// Use synced data helpers, falling back to sample data if empty
export function getAlbums(): Album[] {
  const synced = getSyncedAlbums();
  return synced.length > 0 ? synced : sampleAlbums;
}

export function getFeaturedAlbum(): Album | undefined {
  const synced = getSyncedFeaturedAlbum();
  return synced || sampleAlbums.find((a) => a.featured) || sampleAlbums[0];
}

export function getAlbumBySlug(slug: string): Album | undefined {
  return getSyncedAlbumBySlug(slug) || sampleAlbums.find((a) => a.slug === slug);
}

export function getPhotosByAlbum(albumId: string): Photo[] {
  const synced = getSyncedPhotosByAlbum(albumId);
  return synced.length > 0 ? synced : samplePhotos.filter((p) => p.albumId === albumId);
}

export function getPhotoById(id: string): Photo | undefined {
  return getSyncedPhotoById(id) || samplePhotos.find((p) => p.id === id);
}

export function getChaptersByAlbum(albumSlug: string): Chapter[] {
  const synced = getSyncedChaptersByAlbum(albumSlug);
  if (synced.length > 0) return synced;
  // Fallback to sample chapters for Kyoto demo
  if (albumSlug === "kyoto-autumn-2023") return sampleChapters;
  return [];
}

// Sample albums for development/demo (fallback if no synced data)
const sampleAlbums: Album[] = [
  {
    id: "1",
    slug: "kyoto-autumn-2023",
    title: "Lost in Kyoto",
    subtitle: "Autumn 2023",
    description:
      "Capturing the fleeting moments between departures and arrivals. Experience the silence of the temples and the vibrant colors of the fall season.",
    location: "Japan",
    date: "October 2023",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDye5slRmUThZe5WiDW5H6mBKOwGzvXUPHbDAkXUcJ5bzjTT6DAIxO2T7zUleXiB0_aJuAuR8HuBiGhIjU0P4Sxm2a61Qy1oIMvM1VcDWNdEiPBLsxLaOcs8Ct9_gmBvrX5rJNMpuAu3F5E5hZodCvp7tSF4d69eZNVu1jfme1LbjUv4JzjPoJSjaHmRHZxslBRfSUG-bP4cci1oQNiy1tOHa2xmgbGId1r21e0JxFjKJ0b-CSYx2bwaySvV-QDEUqQNrEoi0L9M1k",
    photoCount: 42,
    featured: true,
  },
  {
    id: "2",
    slug: "iceland-ring-road",
    title: "Ring Road Expedition",
    description:
      "A journey around Iceland's famous Ring Road, from glaciers to volcanoes.",
    location: "Iceland",
    date: "July 2022",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuActuI4_JGT32MW0SSscbxC4qJTbciTg3Gt18JTay34pRdoxk0Wu8FnVpo6Wbm-3M_5cDwCw4GiJBHKRTmMaaKps6dFuq4Dwa0_OiEBd69zB-bnXmL2kLK4BnS3SArVWKbFPx8betkXKxPCS8hzi9wvK9wSpvSBAKJOF5LG6FUNJ8ajzIPAnOdmeSaouviFcKrFjg3lwuHFlLVxURL1gEYpUqjsRT8qcxUmlzzYNt7fKN9uq_hOte3UdEylfLKUJlrjtNSkartlBqM",
    photoCount: 38,
  },
  {
    id: "3",
    slug: "lisbon-streets",
    title: "Streets of Lisbon",
    description: "The colorful trams and cobblestone streets of Portugal's capital.",
    location: "Portugal",
    date: "May 2023",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgQwNC0YqfptkVgI6JdKGSR2qX_zAYCmNjVoNQ_vArEnMIQL2TNlLH7kck6s3GqE13TTiWQK53DFxhEVU5UXcXBbVUCruKU3E_gIzlF_1D2L962eD-oiZpM17GPwzFc9bj7nZNqE_Mmo4TqbderqgCE3KXH4XiqlfZGUt4a4z1uAfzM-qwWfOP9rd-mFLOcFSua0xGrbZvA5VcJDxa2IArKtPAvWLSdt56UZaeyC4zP-Xzd1yYtSKKxUm9ogkeJ_9kVuznPeIU0zE",
    photoCount: 18,
  },
  {
    id: "4",
    slug: "patagonia-trek",
    title: "Patagonia Trek",
    description: "Hiking through the rugged beauty of South America's southern tip.",
    location: "Argentina",
    date: "January 2021",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkz6LX6xgDblO56IoNeaQGvS_iXYdWsr_m5ZqsM98y0VadyfKCvPwMrxsoktbDLKJiIyi-X6QG6mmcE7QLUyoB7XYzUlV5qhBuI08-pAWICHEjUNqHLlQyJo3ETRXcsNYpSUs14gXt3JLOm3j03IQ-fy_8Z62PaITncxLuQvYtm-m-MClVSpGKc4KjIdrw4ZLGPEALQQiIRaMpH4ZuIuBi7yYuDj9nla_6hh6aFzeY6-7XCtdn5Wc0DQAsOYD_-SFmYqspgigXseM",
    photoCount: 25,
  },
  {
    id: "5",
    slug: "marrakech-souks",
    title: "Marrakech Souks",
    description: "Colors, spices, and the vibrant chaos of Moroccan markets.",
    location: "Morocco",
    date: "October 2023",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCseTR5DP-jfnKip_jIgz83zm9beqlkL39wfL8Amcf8wUkQorZX6M02DjksObiMIBNPUm_38BftVGN0UppLx-Nw-xKKEU6RCDrTu4olomNw12BmXdOM2D-Fl4V1H1JHrHjg38eLgIB9vZIakfTpzfJAq0gKL596wgw6gJCoBF-KBogcLzzFKNEPxskLpmDhm3Usa2iyPsW6uHc0ibT8dAo4LnODFLVnynKnDhls8_7j4_CEaJabdFSrjFThjHSA1nF6c1TWEIVX9Us",
    photoCount: 31,
  },
  {
    id: "6",
    slug: "kenya-safari",
    title: "Kenya Safari",
    description: "Wildlife encounters in the African savanna.",
    location: "Kenya",
    date: "September 2022",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDF_Ew-cP74LrxCRKVRqGfmKCqRtxR5t4mGbPDMaGh6dyfRjIMP28SG3CsuGoItHQz9XrNg4DiaRaxFgP6DAYQu27HDoTNFBDYOhsFKZ80p13EUiOwH3Pdq-hOqdxAwlwB57m1i7ex__zb7hdxLSM_GQ7UnGTCD9sKs1f0E3DtYV7NfhBtRtgbZHCN6_xx4XXChw2rlaBVMwOrxUYLoEekVQFZG08oiUMsJGIE3LiSwJKasCLCPchv09Z9jrE-RAg_nownn9--Tbns",
    photoCount: 45,
  },
];

export const siteConfig: SiteConfig = {
  siteName: "Travelogue",
  tagline: "Capturing the fleeting moments between departures and arrivals.",
  photographerName: "Florent",
  photographerBio:
    "I travel the world documenting landscapes, cultures, and the quiet moments in between. Join me as I explore the intersection of nature and humanity.",
  socialLinks: {
    instagram: "#",
    twitter: "#",
    unsplash: "#",
  },
};

// Sample photos for the Kyoto album (fallback)
export const samplePhotos: Photo[] = [
  {
    id: "p1",
    title: "Gion at Dusk",
    description: "The historic geisha district comes alive as lanterns begin to glow.",
    src: {
      thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzyh4CcyJU0TI7_b1mFLdK40TfkgLk3vGCIupWHVTWl6oHLqs4_T3ntD7ZkqKoOqEE9rLTc5qshwmuPrpnnb6ai6T6OBxTDb_U8DP-ERlLAnaj1oHGYsslwHr80rbgKigoPIJXUPRK_br0olovdetqA9gxkiA4U-dnKAX7hMgmTgC321L6GqPGBx1XvLDnTfy_SivS4GdOQ3RMJ0A4bkawib2YxWZpziZDr8LStZajh1mcR7mJbyPMuhWoRJCjIWO6vBn1DfoXRpc",
      medium: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzyh4CcyJU0TI7_b1mFLdK40TfkgLk3vGCIupWHVTWl6oHLqs4_T3ntD7ZkqKoOqEE9rLTc5qshwmuPrpnnb6ai6T6OBxTDb_U8DP-ERlLAnaj1oHGYsslwHr80rbgKigoPIJXUPRK_br0olovdetqA9gxkiA4U-dnKAX7hMgmTgC321L6GqPGBx1XvLDnTfy_SivS4GdOQ3RMJ0A4bkawib2YxWZpziZDr8LStZajh1mcR7mJbyPMuhWoRJCjIWO6vBn1DfoXRpc",
      full: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzyh4CcyJU0TI7_b1mFLdK40TfkgLk3vGCIupWHVTWl6oHLqs4_T3ntD7ZkqKoOqEE9rLTc5qshwmuPrpnnb6ai6T6OBxTDb_U8DP-ERlLAnaj1oHGYsslwHr80rbgKigoPIJXUPRK_br0olovdetqA9gxkiA4U-dnKAX7hMgmTgC321L6GqPGBx1XvLDnTfy_SivS4GdOQ3RMJ0A4bkawib2YxWZpziZDr8LStZajh1mcR7mJbyPMuhWoRJCjIWO6vBn1DfoXRpc",
    },
    metadata: {
      date: "Oct 14, 2023",
      location: "Kyoto, Japan",
      locationDetail: "Hanamikoji Street",
      camera: "Sony A7R IV",
      lens: "35mm f/1.4 GM",
      aperture: "f/2.8",
      shutter: "1/200s",
      iso: "100",
    },
    albumId: "1",
  },
  {
    id: "p2",
    title: "Lantern Light",
    description: "Traditional Japanese lantern glowing warmly against the night.",
    src: {
      thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxQNfxkR9ElNtntivWE6GM5CC6dZgn8CI9QQmJXt9luB6VHEK9g5B4YbGlHLsbSWpqgb4bcsmIBB8dibfXa5H6mz2WsVR2STBLWvO6CUGkjRYhTSTr6GIV2G_ZG0eH2yPtQxS6EcA6iCjC1ASqDMi4vhwpjrw9Hoy-e7TSPBZZxQjo8qETK1AoqdIQpJ5cqg4bYTtqw1OjuYOUU7lxgNpaRlX90mr6EyUwXOcEe-BEqAdCXBKRjOaEYjo7pe7I6QaSqbvqnpc1aeA",
      medium: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxQNfxkR9ElNtntivWE6GM5CC6dZgn8CI9QQmJXt9luB6VHEK9g5B4YbGlHLsbSWpqgb4bcsmIBB8dibfXa5H6mz2WsVR2STBLWvO6CUGkjRYhTSTr6GIV2G_ZG0eH2yPtQxS6EcA6iCjC1ASqDMi4vhwpjrw9Hoy-e7TSPBZZxQjo8qETK1AoqdIQpJ5cqg4bYTtqw1OjuYOUU7lxgNpaRlX90mr6EyUwXOcEe-BEqAdCXBKRjOaEYjo7pe7I6QaSqbvqnpc1aeA",
      full: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxQNfxkR9ElNtntivWE6GM5CC6dZgn8CI9QQmJXt9luB6VHEK9g5B4YbGlHLsbSWpqgb4bcsmIBB8dibfXa5H6mz2WsVR2STBLWvO6CUGkjRYhTSTr6GIV2G_ZG0eH2yPtQxS6EcA6iCjC1ASqDMi4vhwpjrw9Hoy-e7TSPBZZxQjo8qETK1AoqdIQpJ5cqg4bYTtqw1OjuYOUU7lxgNpaRlX90mr6EyUwXOcEe-BEqAdCXBKRjOaEYjo7pe7I6QaSqbvqnpc1aeA",
    },
    metadata: {
      date: "Oct 14, 2023",
      location: "Kyoto, Japan",
      locationDetail: "Pontocho Alley",
      camera: "Sony A7R IV",
      lens: "85mm f/1.4 GM",
      aperture: "f/1.8",
      shutter: "1/125s",
      iso: "800",
    },
    albumId: "1",
  },
  {
    id: "p3",
    title: "Bamboo Grove",
    description: "The towering bamboo of Arashiyama filtering sunlight into a green haze.",
    src: {
      thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuAr0oLmej_k59nHAk1KvwqMhEzqaoLbzc2aY2xuKxPEjRdxAVixtQ_wD4c-H42OZG_f8MgZWIb0sEC6aPzd-vru6VGG93cE_YBR84aHG_nF_bPbDspg68oVp4KwZLtL7PoYvnruUN-0cpf3f0kp0rSUu3KbG8WF2WRw9RjupCKq1AeYP-AOWNbKSn-BgYTwyaPaFhHsmcNmI_DtPggPpvXR3-yqkyiZ7Gw9eWDVMAV1Q2vln5fu7k2YQGOhRqAWK8wrmT8KOcvvaww",
      medium: "https://lh3.googleusercontent.com/aida-public/AB6AXuAr0oLmej_k59nHAk1KvwqMhEzqaoLbzc2aY2xuKxPEjRdxAVixtQ_wD4c-H42OZG_f8MgZWIb0sEC6aPzd-vru6VGG93cE_YBR84aHG_nF_bPbDspg68oVp4KwZLtL7PoYvnruUN-0cpf3f0kp0rSUu3KbG8WF2WRw9RjupCKq1AeYP-AOWNbKSn-BgYTwyaPaFhHsmcNmI_DtPggPpvXR3-yqkyiZ7Gw9eWDVMAV1Q2vln5fu7k2YQGOhRqAWK8wrmT8KOcvvaww",
      full: "https://lh3.googleusercontent.com/aida-public/AB6AXuAr0oLmej_k59nHAk1KvwqMhEzqaoLbzc2aY2xuKxPEjRdxAVixtQ_wD4c-H42OZG_f8MgZWIb0sEC6aPzd-vru6VGG93cE_YBR84aHG_nF_bPbDspg68oVp4KwZLtL7PoYvnruUN-0cpf3f0kp0rSUu3KbG8WF2WRw9RjupCKq1AeYP-AOWNbKSn-BgYTwyaPaFhHsmcNmI_DtPggPpvXR3-yqkyiZ7Gw9eWDVMAV1Q2vln5fu7k2YQGOhRqAWK8wrmT8KOcvvaww",
    },
    metadata: {
      date: "Oct 15, 2023",
      location: "Kyoto, Japan",
      locationDetail: "Arashiyama Bamboo Grove",
      camera: "Sony A7R IV",
      lens: "24mm f/1.4 GM",
      aperture: "f/2.8",
      shutter: "1/250s",
      iso: "400",
    },
    albumId: "1",
  },
  {
    id: "p4",
    title: "Fushimi Inari Gates",
    description: "The endless vermilion torii gates leading up the sacred mountain.",
    src: {
      thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsSy3j7zMzqoA8IkGEIJOrtwKIuljCzNGg1SvZa2NHkashhNmVd1x8nWTX9cQqRern3ApxkFxw1BYFDmn5tT7IWvibP61ysh5r8NQsmV994A7q6U_HxkzjSWC4RTe_0-UZUgFSddM-Bv4pwjw7EsaLcVHi-Rl5Z76OhHG0qE20qRphAQdEzniaw4quk_ne-Y-9abs8DeJuuO__h84zrdZGay4BXs2IZpPNHur-LTo0S2TJmDKP5_p1xZPYtWenCYLAb7E_4tGZkho",
      medium: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsSy3j7zMzqoA8IkGEIJOrtwKIuljCzNGg1SvZa2NHkashhNmVd1x8nWTX9cQqRern3ApxkFxw1BYFDmn5tT7IWvibP61ysh5r8NQsmV994A7q6U_HxkzjSWC4RTe_0-UZUgFSddM-Bv4pwjw7EsaLcVHi-Rl5Z76OhHG0qE20qRphAQdEzniaw4quk_ne-Y-9abs8DeJuuO__h84zrdZGay4BXs2IZpPNHur-LTo0S2TJmDKP5_p1xZPYtWenCYLAb7E_4tGZkho",
      full: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsSy3j7zMzqoA8IkGEIJOrtwKIuljCzNGg1SvZa2NHkashhNmVd1x8nWTX9cQqRern3ApxkFxw1BYFDmn5tT7IWvibP61ysh5r8NQsmV994A7q6U_HxkzjSWC4RTe_0-UZUgFSddM-Bv4pwjw7EsaLcVHi-Rl5Z76OhHG0qE20qRphAQdEzniaw4quk_ne-Y-9abs8DeJuuO__h84zrdZGay4BXs2IZpPNHur-LTo0S2TJmDKP5_p1xZPYtWenCYLAb7E_4tGZkho",
    },
    metadata: {
      date: "Oct 16, 2023",
      location: "Kyoto, Japan",
      locationDetail: "Fushimi Inari Taisha",
      camera: "Sony A7R IV",
      lens: "35mm f/1.4 GM",
      aperture: "f/4.0",
      shutter: "1/500s",
      iso: "100",
    },
    albumId: "1",
  },
  {
    id: "p5",
    title: "Golden Pavilion",
    description: "Kinkaku-ji reflecting in the mirror pond on a clear autumn day.",
    src: {
      thumb: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZgpBtLttd1tI0ElMLMrNt9EN4wIGnE2b0vgoV5iNOT7E6CCBUFwnfnaZ1XwoYPYl0P2sl1OeBB62nv1OTvVph-1u-_aMZ7ruAeD54U-LF9aCVPhTibkfcCHfmfEHXlRrFtNeAMcLqIHe56hAr3gntdk8Cfq0uNV6Fss8LiByZMQ8KksDmAhTBWa3TCvWd5LmZmlExp0GoQUnpS8GpnPuu7f2gMTiDQgUCaFF3Un-4cP34M8AvW9fQh7_9vGQXguEpsClgzzKddwg",
      medium: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZgpBtLttd1tI0ElMLMrNt9EN4wIGnE2b0vgoV5iNOT7E6CCBUFwnfnaZ1XwoYPYl0P2sl1OeBB62nv1OTvVph-1u-_aMZ7ruAeD54U-LF9aCVPhTibkfcCHfmfEHXlRrFtNeAMcLqIHe56hAr3gntdk8Cfq0uNV6Fss8LiByZMQ8KksDmAhTBWa3TCvWd5LmZmlExp0GoQUnpS8GpnPuu7f2gMTiDQgUCaFF3Un-4cP34M8AvW9fQh7_9vGQXguEpsClgzzKddwg",
      full: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZgpBtLttd1tI0ElMLMrNt9EN4wIGnE2b0vgoV5iNOT7E6CCBUFwnfnaZ1XwoYPYl0P2sl1OeBB62nv1OTvVph-1u-_aMZ7ruAeD54U-LF9aCVPhTibkfcCHfmfEHXlRrFtNeAMcLqIHe56hAr3gntdk8Cfq0uNV6Fss8LiByZMQ8KksDmAhTBWa3TCvWd5LmZmlExp0GoQUnpS8GpnPuu7f2gMTiDQgUCaFF3Un-4cP34M8AvW9fQh7_9vGQXguEpsClgzzKddwg",
    },
    metadata: {
      date: "Oct 15, 2023",
      location: "Kyoto, Japan",
      locationDetail: "Kinkaku-ji",
      camera: "Sony A7R IV",
      lens: "70-200mm f/2.8 GM",
      aperture: "f/5.6",
      shutter: "1/320s",
      iso: "100",
    },
    albumId: "1",
  },
];

// Sample chapters for the Kyoto album
export const sampleChapters: Chapter[] = [
  {
    id: "ch1",
    title: "The Streets",
    narrative: "The air was crisp as we stepped off the train. Kyoto greeted us not with the bustle of Tokyo, but with a quiet, ancient dignity.",
    photos: samplePhotos.slice(0, 2),
  },
  {
    id: "ch2",
    title: "Serenity",
    narrative: "Beyond the city limits, the mountains called. We took a train to Arashiyama, where the bamboo groves filter the sunlight into a green haze.",
    photos: samplePhotos.slice(2, 5),
  },
];

