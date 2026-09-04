import { describe, expect, it } from "vitest";
import {
  SEARCH_PAGE_SIZE,
  parseSearchState,
  reduceSearchPagination,
  serializeSearchState,
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
});

describe("search pagination", () => {
  it("resets when criteria change and advances by the fixed batch size", () => {
    expect(reduceSearchPagination(150, { type: "criteria-changed" })).toBe(SEARCH_PAGE_SIZE);
    expect(reduceSearchPagination(SEARCH_PAGE_SIZE, { type: "load-more", total: 124 })).toBe(100);
    expect(reduceSearchPagination(100, { type: "load-more", total: 124 })).toBe(124);
  });
});
