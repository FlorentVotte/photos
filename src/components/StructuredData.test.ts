import { describe, expect, it, vi } from "vitest";

const { mockHeaders } = vi.hoisted(() => ({
  mockHeaders: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mockHeaders,
}));

import {
  BreadcrumbStructuredData,
  ImageGalleryStructuredData,
  PhotoStructuredData,
  WebsiteStructuredData,
} from "./StructuredData";

describe("structured data", () => {
  it("adds the request nonce to every escaped JSON-LD script", async () => {
    mockHeaders.mockResolvedValue(new Headers({ "x-nonce": "request-nonce" }));

    const scripts = await Promise.all([
      WebsiteStructuredData({
        name: "Regards <Perdus>",
        description: "Travel & photography",
        url: "https://photos.example.test",
      }),
      ImageGalleryStructuredData({
        name: "Gallery",
        description: "A gallery",
        url: "https://photos.example.test/albums/example",
        images: [
          {
            url: "https://photos.example.test/photos/example.jpg",
            name: "Example",
          },
        ],
        author: "Florent",
      }),
      PhotoStructuredData({
        name: "Photo",
        description: "A photo",
        url: "https://photos.example.test/albums/example/photo",
        imageUrl: "https://photos.example.test/photos/example.jpg",
        author: "Florent",
      }),
      BreadcrumbStructuredData({
        items: [{ name: "Home", url: "https://photos.example.test" }],
      }),
    ]);

    for (const script of scripts) {
      expect(script.type).toBe("script");
      expect(script.props.type).toBe("application/ld+json");
      expect(script.props.nonce).toBe("request-nonce");
    }

    expect(scripts[0].props.dangerouslySetInnerHTML.__html).toContain(
      "Regards \\u003cPerdus\\u003e"
    );
    expect(scripts[0].props.dangerouslySetInnerHTML.__html).toContain(
      "Travel \\u0026 photography"
    );
  });
});
