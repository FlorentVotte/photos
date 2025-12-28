import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrivacyContent from "@/components/PrivacyContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Regards Perdus",
  description: "Privacy policy and data protection information.",
};

export default function PrivacyPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <PrivacyContent />
      <Footer />
    </div>
  );
}
