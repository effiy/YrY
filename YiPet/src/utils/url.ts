/**
 * URL sanitization for captured page metadata.
 *
 * Rule: a URL that gets persisted anywhere — knowledge frontmatter, session
 * record, `from:` tag — must never carry credentials. OAuth implicit-flow
 * callbacks put the access token in the fragment (`#access_token=...`) and
 * authorization-code callbacks put a one-time code in the query string; both
 * sit in `window.location.href` verbatim, and the fragment is never sent to a
 * server, so nothing upstream notices it was copied down.
 */

/* ── Sensitive params ──────────────────────────────────────────────────── */

/** Param names whose values are blanked before a URL is stored.
 *  Matched as whole keys, so `mytoken` survives while `token` is redacted. */
const SENSITIVE_URL_PARAMS = [
  'access_token',
  'refresh_token',
  'id_token',
  'token',
  'code',
  'api_key',
  'apikey',
  'secret',
  'password',
  'pwd',
  'authorization',
  'bearer',
  'credential',
  'session_state',
];

const SENSITIVE_PARAM_RE = new RegExp(
  `([?&#](?:${SENSITIVE_URL_PARAMS.join('|')})=)[^&#]*`,
  'gi',
);

/* ── Redaction ─────────────────────────────────────────────────────────── */

/** Replace credential-bearing param values with `REDACTED`.
 *
 *  The fragment itself is preserved — SPA routes (e.g. YiVad `#/aiChat`) live
 *  there — so only the values of known-sensitive params are touched. */
export function redactUrlCredentials(url: string): string {
  return url ? url.replace(SENSITIVE_PARAM_RE, '$1REDACTED') : url;
}
