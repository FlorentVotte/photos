import { describe, expect, it } from "vitest";
import {
  SEARCH_PAGE_SIZE,
  parseSearchState,
  reduceSearchViewState,
  reduceSearchPagination,
  mergeSearchState,
  serializeSearchState,
  shouldRehydrateSearchState,
} from "./search-state";

describe("search URL state", () => {
  it("decodes the query and accepts supported filters", () => {
    expect(parseSearchState(new URLSearchParams("query=caf%C3%A9+au+lait&filter=photos"))).toEqual({
      query: "café au lait",
      filter: "photos",
    });
  });

  it("uses the all filter for absent or invalid filters", () => {
    expect(parseSearchState(new URLSearchParams("query=coast"))).toEqual({
      query: "coast",
      filter: "all",
    });
    expect(parseSearchState(new URLSearchParams("filter=people"))).toEqual({
      query: "",
      filter: "all",
    });
  });

  it("encodes state and omits default empty parameters", () => {
    expect(serializeSearchState("", "all")).toBe("");
    expect(serializeSearchState("café au lait", "all")).toBe("?query=caf%C3%A9+au+lait");
    expect(serializeSearchState("", "albums")).toBe("?filter=albums");
  });

  it("updates only search state while preserving unrelated URL parameters", () => {
    const current = new URLSearchParams(
      "view=map&query=old&filter=albums&tag=featured&tag=film"
    );

    expect(mergeSearchState(current, "coast", "all")).toBe(
      "?view=map&query=coast&tag=featured&tag=film"
    );
  });

  it("keeps every rapid local query edit without waiting for URL state", () => {
    const initial = { query: "", filter: "all" as const, visiblePhotoCount: 150 };
    const afterFirstKey = reduceSearchViewState(initial, {
      type: "query-changed",
      query: "c",
    });
    const afterSecondKey = reduceSearchViewState(afterFirstKey, {
      type: "query-changed",
      query: "co",
    });

    expect(afterSecondKey).toEqual({
      query: "co",
      filter: "all",
      visiblePhotoCount: SEARCH_PAGE_SIZE,
    });
  });

  it("rehydrates only from the URL currently visible in the address bar", () => {
    expect(
      shouldRehydrateSearchState(
        new URLSearchParams("query=c"),
        "?query=co&tag=film&tag=film"
      )
    ).toBe(false);
    expect(
      shouldRehydrateSearchState(
        new URLSearchParams("query=co&tag=film&tag=film"),
        "?query=co&tag=film&tag=film"
      )
    ).toBe(true);
  });

  it("resets the photo batch for filter and Back/Forward URL changes", () => {
    const loaded = {
      query: "coast",
      filter: "all" as const,
      visiblePhotoCount: 150,
    };

    expect(
      reduceSearchViewState(loaded, { type: "filter-changed", filter: "photos" })
    ).toEqual({
      query: "coast",
      filter: "photos",
      visiblePhotoCount: SEARCH_PAGE_SIZE,
    });
    expect(
      reduceSearchViewState(loaded, {
        type: "url-changed",
        state: { query: "mountain", filter: "albums" },
      })
    ).toEqual({
      query: "mountain",
      filter: "albums",
      visiblePhotoCount: SEARCH_PAGE_SIZE,
    });
  });
});

describe("search pagination", () => {
  it("resets when criteria change and advances by the fixed batch size", () => {
    expect(reduceSearchPagination(150, { type: "criteria-changed" })).toBe(SEARCH_PAGE_SIZE);
    expect(reduceSearchPagination(SEARCH_PAGE_SIZE, { type: "load-more", total: 124 })).toBe(100);
    expect(reduceSearchPagination(100, { type: "load-more", total: 124 })).toBe(124);
  });
});
