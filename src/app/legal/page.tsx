import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice - Regards Perdus",
  description: "Legal information and terms of use.",
};

export default function LegalPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Legal <span className="text-primary italic font-serif">Notice</span>
            </h1>
            <div className="h-px w-24 bg-primary mx-auto mb-8"></div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 md:py-12 px-4 md:px-8 lg:px-16">
          <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
            <p className="text-text-muted leading-relaxed mb-8">
              Last updated: December 2024
            </p>

            <h2 className="text-2xl font-bold text-foreground mb-4">Website Owner</h2>
            <p className="text-text-muted leading-relaxed mb-2">
              <strong className="text-foreground">Florent Votte</strong> (Individual)
            </p>
            <p className="text-text-muted leading-relaxed mb-2">
              Email:{" "}
              <a href="mailto:florent@votte.eu" className="text-primary hover:underline">
                florent@votte.eu
              </a>
            </p>
            <p className="text-text-muted leading-relaxed mb-6">
              Website:{" "}
              <a href="https://www.votte.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.votte.eu
              </a>
            </p>

            <h2 className="text-2xl font-bold text-foreground mb-4">Publication Director</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              Florent Votte
            </p>

            <h2 className="text-2xl font-bold text-foreground mb-4">Hosting</h2>
            <p className="text-text-muted leading-relaxed mb-2">
              <strong className="text-foreground">OVH SAS</strong>
            </p>
            <p className="text-text-muted leading-relaxed mb-2">
              2 rue Kellermann, 59100 Roubaix, France
            </p>
            <p className="text-text-muted leading-relaxed mb-6">
              Phone: 09 72 10 10 07
            </p>

            <h2 className="text-2xl font-bold text-foreground mb-4">Intellectual Property</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              All content on this website (photographs, images, texts, graphics, logos) is the exclusive
              property of Florent Votte unless otherwise stated. Any reproduction, distribution,
              modification, or use without prior written permission is strictly prohibited.
            </p>
            <p className="text-text-muted leading-relaxed mb-6">
              For licensing inquiries, please contact{" "}
              <a href="mailto:florent@votte.eu" className="text-primary hover:underline">
                florent@votte.eu
              </a>.
            </p>

            <h2 className="text-2xl font-bold text-foreground mb-4">Terms of Use</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              By accessing and using this website, you agree to the following terms:
            </p>
            <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
              <li>You may browse and view the content for personal, non-commercial purposes only.</li>
              <li>You may not download, copy, or redistribute any images without explicit permission.</li>
              <li>You may not use any automated tools to scrape or download content from this website.</li>
              <li>You may share links to pages on this website.</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mb-4">Disclaimer</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              The information provided on this website is for general informational purposes only.
              While we strive to keep the information accurate and up-to-date, we make no representations
              or warranties of any kind about the completeness, accuracy, reliability, or availability
              of the website or the information contained on it.
            </p>

            <h2 className="text-2xl font-bold text-foreground mb-4">External Links</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              This website may contain links to external websites (Adobe Lightroom, social networks).
              We have no control over the content and availability of these sites and are not responsible
              for their content or privacy practices.
            </p>

            <h2 className="text-2xl font-bold text-foreground mb-4">Applicable Law</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              This legal notice is governed by and construed in accordance with the laws of the
              European Union and France. Any disputes arising from the use of this website shall
              be subject to the exclusive jurisdiction of the French courts.
            </p>

            <h2 className="text-2xl font-bold text-foreground mb-4">Credits</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              Design and development: Florent Votte<br />
              Photography: Florent Votte
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
