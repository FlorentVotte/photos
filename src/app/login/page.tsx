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
    <main className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-dark rounded-xl p-8 border border-surface-border">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-5xl text-primary mb-4 block">
              admin_panel_settings
            </span>
            <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
            <p className="text-text-muted mt-2">
              Enter your password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-background-dark border border-surface-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg border border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted/50 text-xs mt-6">
          Set ADMIN_PASSWORD environment variable to configure
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
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              progress_activity
            </span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
