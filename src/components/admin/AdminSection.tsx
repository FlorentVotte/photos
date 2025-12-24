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
    <section
      className={`bg-surface-dark rounded-xl p-6 border border-surface-border ${className}`}
    >
      {(title || description || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-text-muted mt-1">{description}</p>
            )}
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
