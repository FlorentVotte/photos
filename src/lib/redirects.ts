/**
 * Accept only a relative path for redirects originating from user input.
 */
export function safeInternalRedirect(
  value: string | null | undefined,
  fallback = "/admin"
): string {
  const unsafeCharacters = /[\\\u0000-\u001f\u007f]/;

  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    unsafeCharacters.test(value) ||
    /^[a-z][a-z\d+.-]*:/i.test(value)
  ) {
    return fallback;
  }

  // Search parameters are decoded before reaching this helper. Decode two
  // additional layers defensively so a double-encoded backslash or control
  // character cannot become dangerous in a later redirect boundary.
  let decoded = value;
  for (let index = 0; index < 2; index += 1) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      return fallback;
    }

    if (unsafeCharacters.test(decoded)) return fallback;
  }

  try {
    const base = new URL("https://internal.invalid");
    const resolved = new URL(value, base);
    if (resolved.origin !== base.origin) return fallback;
  } catch {
    return fallback;
  }

  return value;
}
