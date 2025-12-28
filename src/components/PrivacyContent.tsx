"use client";

import { useLocale } from "@/lib/LocaleContext";
import { t } from "@/lib/translations";

export default function PrivacyContent() {
  const { locale } = useLocale();

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t("privacy", "title", locale)}{" "}
            <span className="text-primary italic font-serif">
              {t("privacy", "titleAccent", locale)}
            </span>
          </h1>
          <div className="h-px w-24 bg-primary mx-auto mb-8"></div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
          <p className="text-text-muted leading-relaxed mb-8">
            {t("privacy", "lastUpdated", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("privacy", "overviewTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("privacy", "overviewText", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("privacy", "controllerTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-2">
            <strong className="text-foreground">Florent Votte</strong>
          </p>
          <p className="text-text-muted leading-relaxed mb-2">
            {t("privacy", "email", locale)}{" "}
            <a href="mailto:florent@votte.eu" className="text-primary hover:underline">
              florent@votte.eu
            </a>
          </p>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("privacy", "website", locale)}{" "}
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
            {t("privacy", "dataCollectTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-4">
            {t("privacy", "dataCollectIntro", locale)}
          </p>
          <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
            <li>
              <strong className="text-foreground">
                {t("privacy", "navigationData", locale)}
              </strong>{" "}
              {t("privacy", "navigationDataDesc", locale)}
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("privacy", "cookiesTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-4">
            {t("privacy", "cookiesIntro", locale)}
          </p>
          <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
            <li>
              <strong className="text-foreground">
                {t("privacy", "languagePref", locale)}
              </strong>{" "}
              {t("privacy", "languagePrefDesc", locale)}
            </li>
            <li>
              <strong className="text-foreground">
                {t("privacy", "serviceWorker", locale)}
              </strong>{" "}
              {t("privacy", "serviceWorkerDesc", locale)}
            </li>
          </ul>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("privacy", "noCookiesTracking", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("privacy", "thirdPartyTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("privacy", "thirdPartyText", locale)}{" "}
            <a
              href="https://www.adobe.com/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t("privacy", "adobePrivacy", locale)}
            </a>{" "}
            {t("privacy", "thirdPartyEnd", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("privacy", "rightsTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-4">
            {t("privacy", "rightsIntro", locale)}
          </p>
          <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
            <li>{t("privacy", "rightAccess", locale)}</li>
            <li>{t("privacy", "rightRectification", locale)}</li>
            <li>{t("privacy", "rightErasure", locale)}</li>
            <li>{t("privacy", "rightRestriction", locale)}</li>
            <li>{t("privacy", "rightPortability", locale)}</li>
            <li>{t("privacy", "rightObject", locale)}</li>
            <li>{t("privacy", "rightWithdraw", locale)}</li>
          </ul>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("privacy", "rightsContact", locale)}{" "}
            <a href="mailto:florent@votte.eu" className="text-primary hover:underline">
              florent@votte.eu
            </a>
            {t("privacy", "rightsResponse", locale)}
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("privacy", "securityTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-4">
            {t("privacy", "securityIntro", locale)}
          </p>
          <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
            <li>{t("privacy", "securityHttps", locale)}</li>
            <li>{t("privacy", "securityHosting", locale)}</li>
            <li>{t("privacy", "securityAccess", locale)}</li>
            <li>{t("privacy", "securityBackups", locale)}</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("privacy", "complaintsTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("privacy", "complaintsText", locale)}
            <br />
            <strong className="text-foreground">CNIL</strong> - 3 Place de Fontenoy, TSA
            80715, 75334 Paris Cedex 07, France
            <br />
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              www.cnil.fr
            </a>
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t("privacy", "changesTitle", locale)}
          </h2>
          <p className="text-text-muted leading-relaxed mb-6">
            {t("privacy", "changesText", locale)}
          </p>
        </div>
      </section>
    </main>
  );
}
