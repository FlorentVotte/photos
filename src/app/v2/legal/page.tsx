"use client";

import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import { useLocale } from "@/lib/LocaleContext";

export default function V2LegalPage() {
  const { locale } = useLocale();
  const sections =
    locale === "fr"
      ? [
          { title: "Éditeur du site", body: "Regards Perdus — site personnel de photographies de voyage." },
          { title: "Hébergeur", body: "Auto-hébergé sur infrastructure privée." },
          { title: "Propriété intellectuelle", body: "L'ensemble des photographies, textes et éléments visuels sont la propriété exclusive de l'auteur." },
          { title: "Utilisation des images", body: "Toute reproduction, même partielle, est interdite sans autorisation préalable." },
          { title: "Responsabilité", body: "L'éditeur s'efforce d'assurer l'exactitude des informations diffusées, sans toutefois garantir leur exhaustivité." },
        ]
      : [
          { title: "Site editor", body: "Regards Perdus — personal travel photography site." },
          { title: "Hosting", body: "Self-hosted on private infrastructure." },
          { title: "Copyright and IP", body: "All photographs, texts and visual elements are the sole property of the author." },
          { title: "Image usage", body: "Any reproduction, even partial, is forbidden without prior written authorization." },
          { title: "Liability", body: "The publisher strives to ensure the accuracy of the information provided, without guaranteeing its completeness." },
        ];

  return (
    <>
      <V2Header />
      <main className="v2-container" style={{ paddingTop: 160, paddingBottom: 160 }}>
        <div style={{ maxWidth: 720 }}>
          <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 16 }}>
            {locale === "fr" ? "Légal" : "Legal"}
          </p>
          <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)", marginBottom: 64 }}>
            {locale === "fr" ? "Mentions légales" : "Legal Notice"}
          </h1>
          {sections.map((s) => (
            <section key={s.title} style={{ marginBottom: 48 }}>
              <h2 className="v2-headline-md" style={{ color: "var(--v2-cream)", marginBottom: 16 }}>{s.title}</h2>
              <p className="v2-body-lg" style={{ color: "var(--v2-cream-dim)" }}>{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <V2Footer />
    </>
  );
}
