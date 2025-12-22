"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Album, Photo } from "@/lib/types";

type FilterType = "all" | "albums" | "photos";

interface SearchClientProps {
  albums: Album[];
  photos: Photo[];
}

export default function SearchClient({ albums, photos }: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("");

  // Get unique locations
  const locations = useMemo(() => {
    const locs = new Set<string>();
    albums.forEach((a) => a.location && a.location !== "Unknown" && locs.add(a.location));
    photos.forEach((p) => p.metadata.location && p.metadata.location !== "Unknown" && locs.add(p.metadata.location));
    return Array.from(locs).sort();
  }, [albums, photos]);

  // Filter results
  const filteredAlbums = useMemo(() => {
    if (filterType === "photos") return [];

    return albums.filter((album) => {
      const matchesQuery =
        !query ||
        album.title.toLowerCase().includes(query.toLowerCase()) ||
        album.location.toLowerCase().includes(query.toLowerCase()) ||
        album.date.toLowerCase().includes(query.toLowerCase());

      const matchesLocation =
        !selectedLocation || album.location === selectedLocation;

      return matchesQuery && matchesLocation;
    });
  }, [albums, query, filterType, selectedLocation]);

  const filteredPhotos = useMemo(() => {
    if (filterType === "albums") return [];

    return photos.filter((photo) => {
      const matchesQuery =
        !query ||
        photo.title.toLowerCase().includes(query.toLowerCase()) ||
        photo.metadata.location?.toLowerCase().includes(query.toLowerCase()) ||
        photo.metadata.date?.toLowerCase().includes(query.toLowerCase());

      const matchesLocation =
        !selectedLocation || photo.metadata.location === selectedLocation;

      return matchesQuery && matchesLocation;
    });
  }, [photos, query, filterType, selectedLocation]);

  const totalResults = filteredAlbums.length + filteredPhotos.length;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      <main className="flex-1 py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Search</h1>

          {/* Search Input */}
          <div className="bg-surface-dark rounded-xl p-6 mb-8 border border-surface-border">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Box */}
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined">
                  search
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search albums, photos, locations..."
                  className="w-full pl-12 pr-4 py-3 bg-background-dark border border-surface-border rounded-lg text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 bg-background-dark border border-surface-border rounded-lg text-white min-w-[180px]"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <div className="flex rounded-lg overflow-hidden border border-surface-border">
                {(["all", "albums", "photos"] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-3 capitalize transition-colors ${
                      filterType === type
                        ? "bg-primary text-black"
                        : "bg-background-dark text-white hover:bg-surface-border"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-text-muted mb-6">
            {totalResults} result{totalResults !== 1 ? "s" : ""} found
            {query && ` for "${query}"`}
            {selectedLocation && ` in ${selectedLocation}`}
          </p>

          {/* Albums Results */}
          {filteredAlbums.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_album</span>
                Albums ({filteredAlbums.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlbums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.slug}`}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-dark"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url("${album.coverImage}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {album.title}
                      </h3>
                      <p className="text-sm text-text-muted">
                        {album.location} • {album.date}
                      </p>
                      <p className="text-xs text-primary mt-2">
                        {album.photoCount} photos
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Photos Results */}
          {filteredPhotos.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">image</span>
                Photos ({filteredPhotos.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredPhotos.slice(0, 50).map((photo) => (
                  <Link
                    key={photo.id}
                    href={`/photo/${photo.id}`}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-surface-dark"
                  >
                    <img
                      src={photo.src.thumb}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-xs text-white truncate">
                        {photo.metadata.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {filteredPhotos.length > 50 && (
                <p className="text-center text-text-muted mt-6">
                  Showing first 50 of {filteredPhotos.length} photos
                </p>
              )}
            </section>
          )}

          {/* No Results */}
          {totalResults === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-text-muted/30 mb-4 block">
                search_off
              </span>
              <p className="text-text-muted">No results found</p>
              <p className="text-sm text-text-muted/70 mt-2">
                Try a different search term or filter
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
