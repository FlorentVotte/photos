import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `About - ${siteConfig.siteName}`,
  description: `Learn more about ${siteConfig.photographerName} and their photography journey.`,
};

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              About <span className="text-primary italic font-serif">Me</span>
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
                {siteConfig.photographerName}
              </h2>

              <p className="text-text-muted leading-relaxed mb-6">
                {siteConfig.photographerBio}
              </p>

              <p className="text-text-muted leading-relaxed mb-6">
                Photography has always been my way of preserving memories and sharing the beauty
                I discover during my travels. Each image tells a story - a moment frozen in time
                that speaks of the places I've been and the experiences that shaped my journey.
              </p>
            </div>

            {/* Equipment Section */}
            <div className="bg-surface-dark rounded-xl p-6 md:p-8 my-12 border border-surface-border">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_camera</span>
                My Gear
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm text-text-muted uppercase tracking-wider mb-3">Camera</h4>
                  <ul className="space-y-2 text-white">
                    <li>Fujifilm X-T5</li>
                    <li>Fujifilm X100V</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm text-text-muted uppercase tracking-wider mb-3">Lenses</h4>
                  <ul className="space-y-2 text-white">
                    <li>XF 16-55mm f/2.8</li>
                    <li>XF 35mm f/1.4</li>
                    <li>XF 56mm f/1.2</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Link to main site */}
            <div className="text-center py-8">
              <p className="text-text-muted mb-4">
                Want to know more?
              </p>
              <a
                href="https://www.votte.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-dark border border-surface-border text-white font-medium rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">open_in_new</span>
                Visit votte.eu
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
