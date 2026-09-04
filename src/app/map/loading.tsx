import Header from "@/components/Header";
import { Skeleton } from "@/components/Skeleton";
import { cookies, headers } from "next/headers";
import { resolveLocale } from "@/lib/locale";
import { t } from "@/lib/translations";

export default async function MapLoading() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(
    cookieStore.get("locale")?.value,
    requestHeaders.get("accept-language")
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <main className="flex-1 px-6 pt-20 pb-20 md:px-12 md:pt-28">
        <div className="mx-auto max-w-[1200px]">
          <header className="mb-12 max-w-2xl">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </header>

          <div className="w-full h-[70vh] bg-surface-dark flex items-center justify-center border-y border-surface-border">
            <p className="font-sans text-eyebrow uppercase text-text-muted animate-pulse">
              {t("map", "loadingMap", locale)}
            </p>
          </div>

          <Skeleton className="h-3 w-48 mx-auto mt-6" />
        </div>
      </main>
    </div>
  );
}
