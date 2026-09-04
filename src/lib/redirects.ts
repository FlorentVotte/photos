/**
 * Accept only a relative path for redirects originating from user input.
 */
export function safeInternalRedirect(
  value: string | null | undefined,
  fallback = "/admin"
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /^[a-z][a-z\d+.-]*:/i.test(value)
  ) {
    return fallback;
  }

  return value;
}
