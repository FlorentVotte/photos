import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col md:flex-row items-center justify-between py-10 border-t border-surface-border mt-8 text-gray-500 px-6 lg:px-40 gap-4">
      <div className="text-xs">
        © {currentYear} Travelogue Portfolio. All rights reserved.
      </div>
      <div className="flex items-center gap-6 text-xs">
        <Link href="/privacy" className="hover:text-primary transition-colors">
          Privacy Policy
        </Link>
        <Link href="/legal" className="hover:text-primary transition-colors">
          Legal Notice
        </Link>
      </div>
    </footer>
  );
}
