"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";
import type { Album, Photo } from "@/lib/types";

interface Props {
  photo: Photo;
  album?: Album;
  prevPhoto: Photo | null;
  nextPhoto: Photo | null;
}

function metaRow(label: string, value?: string | number) {
  if (!value) return null;
  return (
    <div className="v2-ghost-border-t" style={{ paddingTop: 12, paddingBottom: 12 }}>
      <p className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>{label}</p>
      <p className="v2-body-md" style={{ color: "var(--v2-cream)" }}>{value}</p>
    </div>
  );
}

export default function V2PhotoContent({ photo, album, prevPhoto, nextPhoto }: Props) {
  const { locale } = useLocale();
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && prevPhoto) {
        router.push(`/v2/photo/${prevPhoto.id}`);
      } else if (e.key === "ArrowRight" && nextPhoto) {
        router.push(`/v2/photo/${nextPhoto.id}`);
      } else if (e.key === "Escape" && album) {
        router.push(`/v2/album/${album.slug}`);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prevPhoto, nextPhoto, album, router]);

  const m = photo.metadata;
  const lat = m.latitude ?? m.gps?.lat;
  const lng = m.longitude ?? m.gps?.lng;

  return (
    <div className="v2-container" style={{ paddingTop: 120, paddingBottom: 96 }}>
      {/* Breadcrumb */}
      {album && (
        <div style={{ marginBottom: 48 }}>
          <Link
            href={`/v2/album/${album.slug}`}
            className="v2-label-caps inline-flex items-center"
            style={{ color: "var(--v2-cream-dim)", gap: 8 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            {locale === "fr" ? "Retour à" : "Back to"} {album.title}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-12" style={{ gap: 48 }}>
        {/* Photo */}
        <div className="col-span-12 md:col-span-9">
          <div className="v2-ghost-border" style={{ overflow: "hidden" }}>
            <img
              src={photo.src.full || photo.src.medium}
              alt={photo.title}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
          <div className="flex justify-between items-center" style={{ marginTop: 24, gap: 24 }}>
            {prevPhoto ? (
              <Link href={`/v2/photo/${prevPhoto.id}`} className="v2-label-caps flex items-center" style={{ color: "var(--v2-cream-dim)", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                {locale === "fr" ? "Précédent" : "Previous"}
              </Link>
            ) : <span />}
            {nextPhoto ? (
              <Link href={`/v2/photo/${nextPhoto.id}`} className="v2-label-caps flex items-center" style={{ color: "var(--v2-cream-dim)", gap: 8 }}>
                {locale === "fr" ? "Suivant" : "Next"}
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
              </Link>
            ) : <span />}
          </div>
        </div>

        {/* Metadata */}
        <div className="col-span-12 md:col-span-3">
          <h1 className="v2-headline-md" style={{ color: "var(--v2-cream)", fontSize: 28, marginBottom: 8 }}>
            {photo.title}
          </h1>
          {(photo.caption || photo.description) && (
            <p className="v2-bilingual" style={{ color: "var(--v2-cream-dim)", marginBottom: 32 }}>
              {photo.caption || photo.description}
            </p>
          )}

          <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 16 }}>
            {locale === "fr" ? "Détails" : "Details"}
          </p>

          {metaRow(locale === "fr" ? "Date" : "Date", m.date)}
          {metaRow(locale === "fr" ? "Lieu" : "Location", m.location || m.city)}
          {metaRow(locale === "fr" ? "Boîtier" : "Camera", m.camera)}
          {metaRow(locale === "fr" ? "Objectif" : "Lens", m.lens)}
          {metaRow(locale === "fr" ? "Ouverture" : "Aperture", m.aperture)}
          {metaRow("ISO", m.iso)}
          {metaRow(locale === "fr" ? "Vitesse" : "Shutter", m.shutter || m.shutterSpeed)}
          {metaRow(locale === "fr" ? "Focale" : "Focal length", m.focalLength)}

          {lat != null && lng != null && (
            <div className="v2-ghost-border-t" style={{ paddingTop: 12 }}>
              <p className="v2-label-caps" style={{ color: "var(--v2-outline)" }}>GPS</p>
              <p className="v2-body-md" style={{ color: "var(--v2-cream)" }}>
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
