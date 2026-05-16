"use client";

import Link from "next/link";

interface AdminLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export default function AdminLinkCard({
  title,
  description,
  href,
}: AdminLinkCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-6 border-b border-surface-border py-6 transition-colors hover:border-foreground/30"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground group-hover:text-foreground transition-colors">
          {title}
        </h3>
        <p className="font-sans text-sm text-text-muted">{description}</p>
      </div>
      <span
        aria-hidden="true"
        className="h-px w-8 shrink-0 bg-text-muted/60 transition-all duration-300 group-hover:w-12 group-hover:bg-foreground"
      />
    </Link>
  );
}
