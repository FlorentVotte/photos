// Escape characters that would break out of a <script type="application/ld+json">
// tag or terminate a JS string literal in embedded JSON. JSON.stringify alone
// is not safe inside a <script> element because it leaves "</script>" and the
// U+2028 / U+2029 line separators intact.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const SCRIPT_ESCAPE_MAP: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [LS]: "\\u2028",
  [PS]: "\\u2029",
};
const SCRIPT_ESCAPE_RE = new RegExp("[<>&" + LS + PS + "]", "g");

function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(SCRIPT_ESCAPE_RE, (ch) =>
    SCRIPT_ESCAPE_MAP[ch] ?? ch
  );
}

async function getNonce(): Promise<string | undefined> {
  return (await headers()).get("x-nonce") ?? undefined;
}

interface WebsiteStructuredDataProps {
  name: string;
  description: string;
  url: string;
}

export async function WebsiteStructuredData({ name, description, url }: WebsiteStructuredDataProps) {
  const nonce = await getNonce();
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

interface ImageGalleryStructuredDataProps {
  name: string;
  description: string;
  url: string;
  images: {
    url: string;
    name: string;
    description?: string;
  }[];
  datePublished?: string;
  author: string;
}

export async function ImageGalleryStructuredData({
  name,
  description,
  url,
  images,
  datePublished,
  author,
}: ImageGalleryStructuredDataProps) {
  const nonce = await getNonce();
  const data = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name,
    description,
    url,
    datePublished,
    author: {
      "@type": "Person",
      name: author,
    },
    image: images.slice(0, 10).map((img) => ({
      "@type": "ImageObject",
      url: img.url,
      name: img.name,
      description: img.description,
    })),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

interface PhotoStructuredDataProps {
  name: string;
  description?: string;
  url: string;
  imageUrl: string;
  dateCreated?: string;
  author: string;
  location?: string;
  camera?: string;
  width?: number;
  height?: number;
}

export async function PhotoStructuredData({
  name,
  description,
  url,
  imageUrl,
  dateCreated,
  author,
  location,
  camera,
  width,
  height,
}: PhotoStructuredDataProps) {
  const nonce = await getNonce();
  const data = {
    "@context": "https://schema.org",
    "@type": "Photograph",
    name,
    description: description || name,
    url,
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width,
      height,
    },
    dateCreated,
    author: {
      "@type": "Person",
      name: author,
    },
    contentLocation: location
      ? {
          "@type": "Place",
          name: location,
        }
      : undefined,
    creator: {
      "@type": "Person",
      name: author,
    },
    ...(camera && {
      exifData: [
        {
          "@type": "PropertyValue",
          name: "Camera",
          value: camera,
        },
      ],
    }),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: {
    name: string;
    url: string;
  }[];
}

export async function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const nonce = await getNonce();
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
import { headers } from "next/headers";
