export const SEARCH_PAGE_SIZE = 50;

export type FilterType = "all" | "albums" | "photos";

export interface SearchState {
  query: string;
  filter: FilterType;
}

type SearchParams = Pick<URLSearchParams, "get">;

const FILTERS: ReadonlySet<string> = new Set(["all", "albums", "photos"]);

export function parseSearchState(params: SearchParams): SearchState {
  const requestedFilter = params.get("filter");

  return {
    query: params.get("query") ?? "",
    filter: FILTERS.has(requestedFilter ?? "")
      ? (requestedFilter as FilterType)
      : "all",
  };
}

export function serializeSearchState(query: string, filter: FilterType): string {
  const params = new URLSearchParams();

  if (query) params.set("query", query);
  if (filter !== "all") params.set("filter", filter);

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export type SearchPaginationAction =
  | { type: "criteria-changed" }
  | { type: "load-more"; total: number };

export function reduceSearchPagination(
  visibleCount: number,
  action: SearchPaginationAction
): number {
  if (action.type === "criteria-changed") return SEARCH_PAGE_SIZE;

  return Math.min(visibleCount + SEARCH_PAGE_SIZE, Math.max(0, action.total));
}
