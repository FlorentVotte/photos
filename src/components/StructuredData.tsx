interface WebsiteStructuredDataProps {
  name: string;
  description: string;
  url: string;
}

export function WebsiteStructuredData({ name, description, url }: WebsiteStructuredDataProps) {
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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

export function ImageGalleryStructuredData({
  name,
  description,
  url,
  images,
  datePublished,
  author,
}: ImageGalleryStructuredDataProps) {
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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

export function PhotoStructuredData({
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: {
    name: string;
    url: string;
  }[];
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
