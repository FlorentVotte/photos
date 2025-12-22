"use client";

import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-surface-border px-6 py-4 lg:px-40 transition-all duration-300 ${
        transparent
          ? "bg-background-dark/80 backdrop-blur-md"
          : "bg-background-dark/95 backdrop-blur-md"
      }`}
    >
      <Link href="/" className="flex items-center gap-4">
        <div className="size-8 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">public</span>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] hidden sm:block">
          TRAVELOGUE
        </h2>
      </Link>

      <div className="flex flex-1 justify-end gap-8">
        <nav className="hidden md:flex items-center gap-9">
          <Link
            href="/"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#albums"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            Albums
          </Link>
          <Link
            href="/search"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            Search
          </Link>
          <Link
            href="/map"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            Map
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium leading-normal hover:text-primary transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center size-10 text-white hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background-dark/95 backdrop-blur-md border-b border-surface-border md:hidden">
          <nav className="flex flex-col p-4 gap-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              Home
            </Link>
            <Link
              href="/#albums"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              Albums
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              Search
            </Link>
            <Link
              href="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              Map
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium leading-normal hover:text-primary transition-colors py-2"
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
