import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.siteName}`,
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
            <p className="text-text-muted leading-relaxed mb-6">
              The data controller responsible for this website is {siteConfig.photographerName}.
              For any questions regarding your personal data, please visit{" "}
              <a href="https://www.votte.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                votte.eu
              </a>.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Data We Collect</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              This website collects minimal data:
            </p>
            <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
              <li>
                <strong className="text-white">Server logs:</strong> Standard web server logs including IP addresses,
                browser type, and pages visited. These are used for security and website maintenance purposes
                and are automatically deleted after 30 days.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              This website does not use tracking cookies or analytics services. We may use essential
              cookies that are strictly necessary for the website to function properly. These do not
              require your consent under GDPR.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              Images on this website may be served from Adobe Lightroom servers. Please refer to
              Adobe's privacy policy for information on how they handle data. We do not share any
              of your personal data with third parties for marketing purposes.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-text-muted leading-relaxed mb-4">
              Under the GDPR, you have the following rights:
            </p>
            <ul className="list-disc list-inside text-text-muted mb-6 space-y-2">
              <li>Right of access to your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p className="text-text-muted leading-relaxed mb-6">
              To exercise any of these rights, please contact us through{" "}
              <a href="https://www.votte.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                votte.eu
              </a>.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              We implement appropriate technical and organizational measures to protect your personal
              data against unauthorized access, alteration, disclosure, or destruction. This website
              uses HTTPS encryption to secure all data in transit.
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
