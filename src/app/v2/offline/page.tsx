"use client";

import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import { useLocale } from "@/lib/LocaleContext";

export default function V2OfflinePage() {
  const { locale } = useLocale();
  return (
    <>
      <V2Header />
      <main className="v2-container" style={{ paddingTop: 200, paddingBottom: 200, textAlign: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--v2-cream-dim)", display: "inline-block", marginBottom: 32 }}>
          cloud_off
        </span>
        <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)", marginBottom: 16 }}>
          {locale === "fr" ? "Hors ligne" : "You're offline"}
        </h1>
        <p className="v2-body-lg" style={{ color: "var(--v2-cream-dim)", maxWidth: 480, margin: "0 auto 48px" }}>
          {locale === "fr"
            ? "Cette partie du site nécessite une connexion. Les pages déjà visitées restent peut-être accessibles."
            : "This part of the site needs a connection. Previously visited pages may still be available."}
        </p>
        <button onClick={() => window.location.reload()} className="v2-btn-ghost">
          {locale === "fr" ? "Réessayer" : "Try Again"}
        </button>
      </main>
      <V2Footer />
    </>
  );
}
