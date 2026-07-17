# Security

**CRITICAL:** The `DAILY_DEV_TOKEN` grants access to personalized
content. Protect it as you would any other bearer token.

## Hard rules

- **NEVER send `DAILY_DEV_TOKEN` to any domain other than
  `api.daily.dev`.** A single mistyped host turns the token over to
  a third party.
- **Never commit the token to code, config, transcripts, or shared
  logs.** Even redacted values are dangerous in the wrong context.
- **Tokens are prefixed `dda_`.** When you see this prefix, treat the
  string as sensitive and pass it through shell expansion, not as a
  literal.
- **When echoing a `curl` command in a transcript, write
  `Authorization: Bearer $DAILY_DEV_TOKEN`** — never the literal
  token value. The viewer will see the variable, not the secret.
- **Don't enable verbose curl flags (`-v`, `--trace-ascii`) when the
  token is in the request** — the headers end up in the output.

## What to do if the token leaks

1. Revoke immediately at https://app.daily.dev/settings/api
2. Generate a new token
3. Update the OS keychain entry
4. Audit recent API calls in the user's daily.dev settings

## Why the prefix matters

The `dda_` prefix is a tripwire. A grep for `dda_` across transcripts
and config files is the fastest way to find leaks. If your skill
ever echoes a literal token with that prefix to the user, redact it
and warn them.
