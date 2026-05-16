"use client";

import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import { useLocale } from "@/lib/LocaleContext";

export default function V2PrivacyPage() {
  const { locale } = useLocale();
  const sections =
    locale === "fr"
      ? [
          { title: "Données collectées", body: "Ce site ne collecte aucune donnée personnelle au-delà des journaux serveurs standard." },
          { title: "Cookies", body: "Seul un cookie technique est utilisé pour mémoriser la langue choisie." },
          { title: "Analytique", body: "Aucun service d'analytique tiers n'est utilisé." },
          { title: "Droits d'image", body: "Toutes les photographies sont protégées par le droit d'auteur." },
          { title: "Contact", body: "Pour toute question relative à la vie privée, contactez le propriétaire du site." },
        ]
      : [
          { title: "Data collected", body: "This site does not collect any personal data beyond standard server logs." },
          { title: "Cookies", body: "Only a technical cookie is used to remember the chosen language." },
          { title: "Analytics", body: "No third-party analytics service is used." },
          { title: "Image rights", body: "All photographs are protected by copyright." },
          { title: "Contact", body: "For any privacy-related question, please contact the site owner." },
        ];

  return (
    <>
      <V2Header />
      <main className="v2-container" style={{ paddingTop: 160, paddingBottom: 160 }}>
        <div style={{ maxWidth: 720 }}>
          <p className="v2-label-caps" style={{ color: "var(--v2-gold)", marginBottom: 16 }}>
            {locale === "fr" ? "Confidentialité" : "Privacy"}
          </p>
          <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)", marginBottom: 64 }}>
            {locale === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
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
