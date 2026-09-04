import { describe, expect, it } from "vitest";
import {
  formatPhotoAccessibleLabel,
  formatPhotoLocation,
  formatPhotoMetadataDescription,
  formatPhotoShareText,
} from "./photo-display";

describe("formatPhotoAccessibleLabel", () => {
  const album = { title: "A Quiet Coast" };

  it("prefers a caption over a descriptive title", () => {
    expect(
      formatPhotoAccessibleLabel(
        { title: "Morning light", caption: "A fisherman at dawn" },
        album,
        6,
        "en"
      )
    ).toBe("A fisherman at dawn");
  });

  it("uses a descriptive title before a filename-like title", () => {
    expect(
      formatPhotoAccessibleLabel({ title: "Morning light" }, album, 6, "en")
    ).toBe("Morning light");
  });

  it("uses an album-aware localized fallback for camera filenames", () => {
    expect(
      formatPhotoAccessibleLabel({ title: "DSCF0678.RAF" }, album, 6, "en")
    ).toBe("A Quiet Coast — Photo 7");
    expect(
      formatPhotoAccessibleLabel({ title: "IMG_0678.jpg" }, album, 6, "fr")
    ).toBe("A Quiet Coast — Photo 7");
  });
});

describe("photo sharing and metadata copy", () => {
  it("uses the cleaned location when one is available", () => {
    const photo = {
      caption: undefined,
      metadata: { city: " Paris ", locationDetail: "Unknown", location: "France" },
    };

    expect(formatPhotoLocation(photo)).toBe("Paris, France");
    expect(formatPhotoShareText(photo, "Morning light")).toBe(
      "Morning light - Paris, France"
    );
    expect(formatPhotoMetadataDescription(photo, "Morning light")).toBe(
      "Photo from Paris, France"
    );
  });

  it("omits a location suffix instead of rendering undefined", () => {
    const photo = { caption: undefined, metadata: {} };

    expect(formatPhotoLocation(photo)).toBe("");
    expect(formatPhotoShareText(photo, "Morning light")).toBe("Morning light");
    expect(formatPhotoMetadataDescription(photo, "Morning light")).toBe(
      "Morning light"
    );
  });
});
