/** Normalize a user-entered URL for opening / storing. Bare domains get https://. */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}

/** True when the string is a usable http(s) web URL (after normalization). */
export function isValidUrl(raw: string): boolean {
  const normalized = normalizeUrl(raw);
  if (!normalized) return false;

  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    // Require a hostname with a dot, or localhost
    const host = url.hostname;
    if (host === 'localhost') return true;
    return host.includes('.');
  } catch {
    return false;
  }
}
