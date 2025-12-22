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
        <section className="relative py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-primary italic font-serif">Me</span>
            </h1>
            <div className="h-px w-24 bg-primary mx-auto mb-8"></div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 px-4 md:px-8 lg:px-16">
          <div className="max-w-3xl mx-auto">
            {/* Profile Image Placeholder */}
            <div className="flex justify-center mb-12">
              <div className="w-48 h-48 rounded-full bg-surface-dark border-4 border-primary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-primary/50">person</span>
              </div>
            </div>

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

              <p className="text-text-muted leading-relaxed mb-6">
                Through this website, I invite you to explore the world through my lens. From
                bustling city streets to serene landscapes, every album is a chapter in my
                ongoing adventure.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 my-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10+</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Photos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5+</div>
                <div className="text-sm text-text-muted uppercase tracking-wider">Years</div>
              </div>
            </div>

            {/* Equipment Section */}
            <div className="bg-surface-dark rounded-xl p-8 mb-12 border border-surface-border">
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

            {/* Contact Section */}
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-white mb-4">Get in Touch</h3>
              <p className="text-text-muted mb-6">
                Have questions or want to collaborate? Feel free to reach out!
              </p>
              <a
                href="mailto:hello@example.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined">mail</span>
                Contact Me
              </a>
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-6 py-8">
              {siteConfig.socialLinks.instagram && (
                <a
                  href={siteConfig.socialLinks.instagram}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-dark border border-surface-border hover:border-primary hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {siteConfig.socialLinks.twitter && (
                <a
                  href={siteConfig.socialLinks.twitter}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-dark border border-surface-border hover:border-primary hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {siteConfig.socialLinks.unsplash && (
                <a
                  href={siteConfig.socialLinks.unsplash}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-dark border border-surface-border hover:border-primary hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
