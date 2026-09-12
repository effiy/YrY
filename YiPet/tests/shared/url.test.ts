import { describe, expect, it } from 'vitest';
import { redactUrlCredentials } from '@/utils/url';

/** The shape of a real leak: a Google implicit-flow callback captured by the
 *  page-context auto-save and written into YiKnowledge frontmatter. */
const OAUTH_CALLBACK =
  'https://www.trae.ai/google-oauth-callback#state=oauth_info:&iss=https://accounts.google.com' +
  '&access_token=ya29.a0AdMD6EhhL-IkKeGXJWjApGTsY3vB6QUrEUxe9jjoYHuj4sxsVoye' +
  '&token_type=Bearer&expires_in=3599&scope=email%20profile&authuser=0&prompt=none';

describe('redactUrlCredentials()', () => {
  it('strips an access token carried in the fragment', () => {
    const out = redactUrlCredentials(OAUTH_CALLBACK);
    expect(out).not.toContain('ya29.a0AdMD6EhhL');
    expect(out).toContain('access_token=REDACTED');
    // non-credential neighbours survive
    expect(out).toContain('token_type=Bearer');
    expect(out).toContain('expires_in=3599');
    expect(out).toContain('scope=email%20profile');
    expect(out).toContain('#state=oauth_info:');
  });

  it('strips credentials from the query string too', () => {
    expect(redactUrlCredentials('https://x.dev/cb?access_token=abc&next=/home')).toBe(
      'https://x.dev/cb?access_token=REDACTED&next=/home',
    );
  });

  it('strips a one-time authorization code', () => {
    expect(redactUrlCredentials('https://x.dev/cb?code=4/0AeanS0&state=xyz')).toBe(
      'https://x.dev/cb?code=REDACTED&state=xyz',
    );
  });

  it('redacts every occurrence, not just the first', () => {
    const out = redactUrlCredentials('https://x.dev/?token=a#token=b');
    expect(out).toBe('https://x.dev/?token=REDACTED#token=REDACTED');
  });

  it('matches whole keys only', () => {
    expect(redactUrlCredentials('https://x.dev/?mytoken=a&tokenizer=b')).toBe(
      'https://x.dev/?mytoken=a&tokenizer=b',
    );
  });

  it('is case-insensitive', () => {
    expect(redactUrlCredentials('https://x.dev/?Access_Token=abc')).toBe(
      'https://x.dev/?Access_Token=REDACTED',
    );
  });

  it('preserves SPA hash routes', () => {
    // YiVad hash routing — the fragment is a route, not a param bag.
    const spa = 'http://localhost:8848/#/aiChat?session=abc123';
    expect(redactUrlCredentials(spa)).toBe(spa);
  });

  it('leaves a credential-free URL untouched', () => {
    const plain = 'https://example.com/docs/intro?a=1&b=2';
    expect(redactUrlCredentials(plain)).toBe(plain);
  });

  it('handles the empty string', () => {
    expect(redactUrlCredentials('')).toBe('');
  });
});
