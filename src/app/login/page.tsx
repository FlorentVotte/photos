"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
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
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <header className="mb-12 text-center">
          <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted">
            Admin access
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-foreground">
            Sign in
          </h1>
          <p className="mt-3 font-sans text-sm text-text-muted">
            Enter your password to continue.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="password"
              className="font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-b border-surface-border bg-transparent pb-3 font-sans text-base text-foreground placeholder-text-muted/50 focus:border-foreground focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-400/90">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="group/cta mt-2 inline-flex items-center gap-3 self-start font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{loading ? "Signing in…" : "Sign in"}</span>
            <span
              aria-hidden="true"
              className="h-px w-8 bg-text-muted/60 transition-all duration-300 group-hover/cta:w-12 group-hover/cta:bg-foreground"
            />
          </button>
        </form>

        <p className="mt-16 text-center font-sans text-[12px] uppercase tracking-[0.24em] text-text-muted/50">
          Set ADMIN_PASSWORD env var to configure
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <p className="font-sans text-[12px] uppercase tracking-[0.32em] text-text-muted animate-pulse">
              Loading
            </p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
