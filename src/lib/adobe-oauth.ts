// Shared constants for the Adobe OAuth flow. Kept outside the route handler
// file because Next.js App Router rejects any non-standard export from
// src/app/.../route.ts ("not a valid Route export field").
export const ADOBE_OAUTH_STATE_COOKIE = "adobe_oauth_state";
export const ADOBE_OAUTH_STATE_MAX_AGE_SECONDS = 600;
