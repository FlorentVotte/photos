import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Regards Perdus",
  description: "Privacy policy and data protection information.",
};

export default function PrivacyPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Privacy <span className="text-primary italic font-serif">Policy</span>
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

            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              This website is a personal photography portfolio. We are committed to protecting your privacy
              and processing your data in accordance with the General Data Protection Regulation (GDPR)
              and other applicable data protection laws.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Data Controller</h2>
            <p className="text-text-muted leading-relaxed mb-2">
              <strong className="text-white">Florent Votte</strong>
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

            <h2 className="text-2xl font-bold text-white mb-4">Data We Collect</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              This website collects minimal data:
            </p>
            <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
              <li>
                <strong className="text-white">Navigation data:</strong> Server logs including IP addresses,
                browser type, operating system, pages visited, timestamps, and referrer URLs. These are used
                for security and website maintenance purposes and are retained for a maximum of 12 months.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              This website uses only essential cookies:
            </p>
            <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
              <li>
                <strong className="text-white">Theme preferences:</strong> Stores your light/dark mode preference
                in localStorage for a better browsing experience.
              </li>
              <li>
                <strong className="text-white">Language preference:</strong> Stores your language choice (English/French)
                in localStorage.
              </li>
              <li>
                <strong className="text-white">Service Worker / Cache:</strong> Enables offline mode and improves
                loading performance.
              </li>
            </ul>
            <p className="text-text-muted leading-relaxed mb-6">
              No advertising or third-party tracking cookies are used on this website.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              Images on this website are served from Adobe Lightroom servers. Please refer to{" "}
              <a href="https://www.adobe.com/privacy.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Adobe&apos;s privacy policy
              </a>{" "}
              for information on how they handle data. We do not share any of your personal data with
              third parties for marketing or advertising purposes.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              Under the GDPR, you have the following rights:
            </p>
            <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
              <li>Right of access to your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent at any time</li>
            </ul>
            <p className="text-text-muted leading-relaxed mb-6">
              To exercise any of these rights, please contact{" "}
              <a href="mailto:florent@votte.eu" className="text-primary hover:underline">
                florent@votte.eu
              </a>. We will respond within one month.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
              <li>HTTPS secure connection (SSL/TLS)</li>
              <li>Certified hosting infrastructure</li>
              <li>Restricted access to data</li>
              <li>Regular backups</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">Complaints</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              If you believe your data protection rights have been violated, you have the right to lodge
              a complaint with the French data protection authority (CNIL):<br />
              <strong className="text-white">CNIL</strong> - 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, France<br />
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                www.cnil.fr
              </a>
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              We may update this privacy policy from time to time. Any changes will be posted on this
              page with an updated revision date.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
