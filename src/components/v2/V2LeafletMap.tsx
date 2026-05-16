"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Photo } from "@/lib/types";

export default function V2LeafletMap({ photos }: { photos: Photo[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap, &copy; CARTO",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const goldIcon = L.divIcon({
        className: "v2-map-pin",
        html: '<div style="width:10px;height:10px;background:#e9c176;border:1px solid #f5f2ed;transform:rotate(45deg);"></div>',
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const bounds: [number, number][] = [];
      for (const p of photos) {
        const lat = p.metadata.latitude ?? p.metadata.gps?.lat;
        const lng = p.metadata.longitude ?? p.metadata.gps?.lng;
        if (lat == null || lng == null) continue;
        bounds.push([lat, lng]);
        const marker = L.marker([lat, lng], { icon: goldIcon }).addTo(map);
        const popup = `
          <a href="/v2/photo/${p.id}" style="text-decoration:none;color:#f5f2ed;font-family:'Hanken Grotesk',sans-serif;">
            <img src="${p.src.thumb || p.src.medium}" alt="${p.title}" style="width:160px;height:120px;object-fit:cover;filter:grayscale(1);"/>
            <div style="padding:8px 0 0;">
              <div style="font-size:13px;">${p.title}</div>
              <div style="font-size:11px;color:#c8c7be;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;">${p.metadata.location || ""}</div>
            </div>
          </a>
        `;
        marker.bindPopup(popup);
      }
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
      }

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      if (m && typeof m.remove === "function") m.remove();
      mapRef.current = null;
    };
  }, [photos]);

  return (
    <div className="v2-ghost-border" style={{ height: "70vh", background: "#0e0e0e", overflow: "hidden" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
