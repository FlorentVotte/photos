/**
 * Does an If-None-Match header match this ETag? Handles `*`, comma-separated
 * lists and weak (`W/`) validators (weak comparison, per RFC 9110).
 */
export function etagMatches(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false;
  const strip = (v: string) => v.trim().replace(/^W\//, "");
  const target = strip(etag);
  return ifNoneMatch
    .split(",")
    .some((candidate) => candidate.trim() === "*" || strip(candidate) === target);
}

/**
 * Is this fs error "the path does not exist"? ENOTDIR (a path segment under a
 * regular file, e.g. `x.jpg/extra`) is a miss, not a server fault.
 */
export function isNotFoundError(err: unknown): boolean {
  const code = (err as NodeJS.ErrnoException | null)?.code;
  return code === "ENOENT" || code === "ENOTDIR";
}
