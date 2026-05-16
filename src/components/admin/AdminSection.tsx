"use client";

import { ReactNode } from "react";

interface AdminSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function AdminSection({
  title,
  description,
  children,
  action,
  className = "",
}: AdminSectionProps) {
  return (
    <section className={`flex flex-col gap-6 ${className}`}>
      {(title || description || action) && (
        <header className="flex items-start justify-between gap-6 border-b border-surface-border pb-4">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="font-sans text-sm text-text-muted">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
