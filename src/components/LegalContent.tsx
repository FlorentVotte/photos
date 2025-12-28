"use client";

import { useLocale } from "@/lib/LocaleContext";
import { t } from "@/lib/translations";

export default function LegalContent() {
  const { locale } = useLocale();

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t("legal", "title", locale)}{" "}
            <span className="text-primary italic font-serif">
              {t("legal", "titleAccent", locale)}
            </span>
          </h1>
          <div className="h-px w-24 bg-primary mx-auto mb-8"></div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
          <p className="text-text-muted leading-relaxed mb-8">
            {t("legal", "lastUpdated", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "ownerTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-2">
            <strong className="text-foreground">Florent Votte</strong>{" "}
            {t("legal", "individual", locale)}
          </p>
          <p className="text-text-muted leading-relaxed mb-2">
            {t("legal", "email", locale)}{" "}
            <a href="mailto:florent@votte.eu" className="text-primary hover:underline">
              florent@votte.eu
            </a>
          </p>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("legal", "website", locale)}{" "}
            <a
              href="https://www.votte.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.votte.eu
            </a>
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "directorTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">Florent Votte</p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "hostingTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-2">
            <strong className="text-foreground">OVH SAS</strong>
          </p>
          <p className="text-text-muted leading-relaxed mb-2">
            2 rue Kellermann, 59100 Roubaix, France
          </p>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("legal", "phone", locale)} 09 72 10 10 07
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "ipTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("legal", "ipText", locale)}
          </p>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("legal", "licensingText", locale)}{" "}
            <a href="mailto:florent@votte.eu" className="text-primary hover:underline">
              florent@votte.eu
            </a>
            .
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "termsTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-4">
            {t("legal", "termsIntro", locale)}
          </p>
          <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
            <li>{t("legal", "termBrowse", locale)}</li>
            <li>{t("legal", "termNoDownload", locale)}</li>
            <li>{t("legal", "termNoScrape", locale)}</li>
            <li>{t("legal", "termShare", locale)}</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "disclaimerTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("legal", "disclaimerText", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "linksTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("legal", "linksText", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "lawTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("legal", "lawText", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("legal", "creditsTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("legal", "creditsDesign", locale)} Florent Votte
            <br />
            {t("legal", "creditsPhoto", locale)} Florent Votte
          </p>
        </div>
      </section>
    </main>
  );
}
