import { describe, expect, it } from "vitest";
import { formatPhotoAccessibleLabel } from "./photo-display";

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
