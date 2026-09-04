import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalContent from "@/components/LegalContent";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { resolveLocale } from "@/lib/locale";
import { t } from "@/lib/translations";

export async function generateMetadata(): Promise<Metadata> {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale(
    cookieStore.get("locale")?.value,
    requestHeaders.get("accept-language")
  );

  return {
    title: `${t("legal", "metadataTitle", locale)} - Regards Perdus`,
    description: t("legal", "metadataDescription", locale),
  };
}

export default function LegalPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <LegalContent />
      <Footer />
    </div>
  );
}
