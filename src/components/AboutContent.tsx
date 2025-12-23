"use client";

import { useLocale } from "@/lib/LocaleContext";

interface GearItem {
  name: string;
  count: number;
}

interface AboutContentProps {
  photographerName: string;
  photographerBio: string;
  gear: {
    cameras: GearItem[];
    lenses: GearItem[];
  };
}

export default function AboutContent({
  photographerName,
  photographerBio,
  gear,
}: AboutContentProps) {
  const { t } = useLocale();

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t("about", "title")} <span className="text-primary italic font-serif">{t("about", "me")}</span>
          </h1>
          <div className="h-px w-24 bg-primary mx-auto mb-8"></div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">
          {/* Bio */}
          <div className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {photographerName}
            </h2>

            <p className="text-text-muted leading-relaxed mb-6">
              {photographerBio}
            </p>

            <p className="text-text-muted leading-relaxed mb-6">
              {t("about", "bio")}
            </p>
          </div>

          {/* Equipment Section */}
          {(gear.cameras.length > 0 || gear.lenses.length > 0) && (
            <div className="bg-surface-dark rounded-xl p-6 md:p-8 my-12 border border-surface-border">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_camera</span>
                {t("about", "myGear")}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {gear.cameras.length > 0 && (
                  <div>
                    <h4 className="text-sm text-text-muted uppercase tracking-wider mb-3">
                      {t("about", "cameras")}
                    </h4>
                    <ul className="space-y-2">
                      {gear.cameras.map((camera) => (
                        <li key={camera.name} className="flex items-center justify-between">
                          <span className="text-white">{camera.name}</span>
                          <span className="text-text-muted text-sm">
                            {camera.count} {t("about", "photos")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {gear.lenses.length > 0 && (
                  <div>
                    <h4 className="text-sm text-text-muted uppercase tracking-wider mb-3">
                      {t("about", "lenses")}
                    </h4>
                    <ul className="space-y-2">
                      {gear.lenses.map((lens) => (
                        <li key={lens.name} className="flex items-center justify-between">
                          <span className="text-white">{lens.name}</span>
                          <span className="text-text-muted text-sm">
                            {lens.count} {t("about", "photos")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Link to main site */}
          <div className="text-center py-8">
            <p className="text-text-muted mb-4">
              {t("about", "wantToKnowMore")}
            </p>
            <a
              href="https://www.votte.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface-dark border border-surface-border text-white font-medium rounded-lg hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">open_in_new</span>
              {t("about", "visitSite")}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
