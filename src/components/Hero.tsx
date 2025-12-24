import Link from "next/link";

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage: string;
  tag?: string;
  ctaText?: string;
  ctaLink?: string;
  showScrollHint?: boolean;
}

export default function Hero({
  title,
  subtitle,
  description,
  backgroundImage,
  tag = "Featured Story",
  ctaText = "Read Story",
  ctaLink,
  showScrollHint = true,
}: HeroProps) {
  return (
    <div className="@container mb-12">
      <div
        className="flex min-h-[560px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-6 pb-12 pt-40 md:px-12"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 40%, rgba(0, 0, 0, 0.8) 100%), url("${backgroundImage}")`,
        }}
      >
        <div className="flex flex-col gap-3 text-left max-w-2xl">
          {tag && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 w-fit mb-2">
              <span className="material-symbols-outlined text-primary text-sm">
                auto_awesome
              </span>
              <span className="text-foreground text-xs font-bold uppercase tracking-widest">
                {tag}
              </span>
            </div>
          )}

          <h1 className="text-foreground text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em]">
            {title}
          </h1>

          {subtitle && (
            <p className="text-primary text-xl md:text-2xl font-medium italic">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-gray-200 text-base md:text-lg font-normal leading-relaxed font-sans max-w-xl">
              {description}
            </p>
          )}
        </div>

        {ctaLink && (
          <Link
            href={ctaLink}
            className="flex items-center gap-2 cursor-pointer overflow-hidden rounded-lg h-12 px-6 bg-white text-background-dark hover:bg-gray-100 transition-colors text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span>{ctaText}</span>
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        )}

        {showScrollHint && (
          <div className="animate-bounce text-foreground/50 mt-4 self-center">
            <span className="material-symbols-outlined text-3xl">
              keyboard_arrow_down
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
