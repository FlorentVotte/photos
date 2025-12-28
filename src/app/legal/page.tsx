import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LegalContent from "@/components/LegalContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Notice - Regards Perdus",
  description: "Legal information and terms of use.",
};

export default function LegalPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark">
      <Header />
      <LegalContent />
      <Footer />
    </div>
  );
}
