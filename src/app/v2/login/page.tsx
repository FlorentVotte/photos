"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import { useLocale } from "@/lib/LocaleContext";

function LoginForm() {
  const { locale } = useLocale();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(redirect);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || (locale === "fr" ? "Mot de passe invalide" : "Invalid password"));
      }
    } catch {
      setError(locale === "fr" ? "La connexion a échoué." : "Login failed.");
    }
    setLoading(false);
  }

  return (
    <main className="v2-container" style={{ paddingTop: 160, paddingBottom: 160, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--v2-gold)", display: "inline-block", marginBottom: 24 }}>lock</span>
          <h1 className="v2-display-lg" style={{ color: "var(--v2-cream)", fontSize: 40 }}>
            {locale === "fr" ? "Connexion" : "Sign in"}
          </h1>
          <p className="v2-bilingual" style={{ color: "var(--v2-cream-dim)", marginTop: 16 }}>
            {locale === "fr" ? "Espace administrateur" : "Administrator area"}
          </p>
        </div>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div>
            <label htmlFor="password" className="v2-label-caps block" style={{ color: "var(--v2-cream-dim)", marginBottom: 12 }}>
              {locale === "fr" ? "Mot de passe" : "Password"}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="v2-body-md w-full"
              style={{
                background: "transparent",
                color: "var(--v2-cream)",
                border: "none",
                borderBottom: "1px solid var(--v2-gold)",
                padding: "12px 0",
                outline: "none",
              }}
            />
          </div>
          {error && (
            <p className="v2-label-caps" style={{ color: "var(--v2-cream)", background: "rgba(255, 100, 100, 0.1)", border: "1px solid rgba(255, 100, 100, 0.3)", padding: 16 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            className="v2-btn-ghost"
            style={{ opacity: !password || loading ? 0.5 : 1, cursor: !password || loading ? "not-allowed" : "pointer" }}
          >
            {loading
              ? locale === "fr" ? "Connexion…" : "Signing in…"
              : locale === "fr" ? "Se connecter" : "Sign in"}
          </button>
        </form>
        <p className="v2-bilingual" style={{ color: "var(--v2-outline)", textAlign: "center", marginTop: 48, fontSize: 12 }}>
          ADMIN_PASSWORD
        </p>
      </div>
    </main>
  );
}

export default function V2LoginPage() {
  return (
    <>
      <V2Header />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <V2Footer />
    </>
  );
}
