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
  icon,
}: AdminLinkCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-4 bg-surface-dark rounded-xl border border-surface-border hover:border-primary/50 transition-colors group"
    >
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-2xl text-text-muted group-hover:text-primary transition-colors">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-text-muted">{description}</p>
        </div>
      </div>
      <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">
        chevron_right
      </span>
    </Link>
  );
}
