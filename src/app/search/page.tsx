import { getAlbums } from "@/lib/synced-data";
import { getPhotosByAlbum } from "@/lib/synced-data";
import SearchClient from "./SearchClient";
import type { Album, Photo } from "@/lib/types";

export default function SearchPage() {
  // Fetch data on server
  const albums = getAlbums();
  const photos: Photo[] = albums.flatMap((album) => getPhotosByAlbum(album.id));

  return <SearchClient albums={albums} photos={photos} />;
}
