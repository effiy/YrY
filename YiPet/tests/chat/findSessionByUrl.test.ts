import { describe, expect, it } from 'vitest';
import { findSessionByUrl } from '@/chat/stores/chatUtils';

interface TestSession {
  id: string;
  url: string;
  title: string;
}

function makeSession(id: string, url: string, title = 'Test'): TestSession {
  return { id, url, title };
}

describe('findSessionByUrl', () => {
  const sessions: TestSession[] = [
    makeSession('s1', 'https://example.com/page-a', 'Page A'),
    makeSession('s2', 'https://example.com/page-b', 'Page B'),
    makeSession('s3', 'http://localhost:8848/#/aiChat?session=abc', 'AiChat'),
  ];

  it('finds a session by exact URL match', () => {
    const result = findSessionByUrl(sessions, 'https://example.com/page-a');
    expect(result).toBeDefined();
    expect(result!.id).toBe('s1');
    expect(result!.title).toBe('Page A');
  });

  it('finds a session with hash/query in URL', () => {
    const result = findSessionByUrl(sessions, 'http://localhost:8848/#/aiChat?session=abc');
    expect(result).toBeDefined();
    expect(result!.id).toBe('s3');
  });

  it('returns undefined when no session matches the URL', () => {
    const result = findSessionByUrl(sessions, 'https://example.com/unknown');
    expect(result).toBeUndefined();
  });

  it('returns undefined when URL is empty string', () => {
    const result = findSessionByUrl(sessions, '');
    expect(result).toBeUndefined();
  });

  it('returns undefined when sessions array is empty', () => {
    const result = findSessionByUrl([], 'https://example.com/page-a');
    expect(result).toBeUndefined();
  });

  it('is case-sensitive (URLs must match exactly)', () => {
    const result = findSessionByUrl(sessions, 'https://EXAMPLE.com/page-a');
    expect(result).toBeUndefined();
  });

  it('does not match partial URL prefixes', () => {
    const result = findSessionByUrl(sessions, 'https://example.com/page');
    expect(result).toBeUndefined();
  });
});