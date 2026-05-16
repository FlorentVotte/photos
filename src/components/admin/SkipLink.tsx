"use client";

interface SkipLinkProps {
  targetId?: string;
  children?: string;
}

export default function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background-dark focus:font-sans focus:text-[11px] focus:uppercase focus:tracking-[0.24em] focus:outline-none focus:ring-1 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background-dark"
    >
      {children}
    </a>
  );
}
