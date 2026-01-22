// Generic normalizer for URLs stored in DB. Handles Uploads paths without leading slash.
export function normalizeUrl(raw) {
  if (!raw) return null;
  if (typeof raw !== 'string') return raw;

  // If the value already looks like a full URL or data URI, return as-is
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;

  // Normalize Uploads paths that may start with 'Uploads', '/Uploads' or contain '/Uploads/'
  const uploadsMatch = raw.match(/(^\/?Uploads\/.*)/i);
  if (uploadsMatch) {
    const path = uploadsMatch[1].startsWith('/') ? uploadsMatch[1] : '/' + uploadsMatch[1];
    return `${window.location.origin}${path}`;
  }

  // If it's a relative path, make it absolute relative to origin
  if (raw.startsWith('/')) return `${window.location.origin}${raw}`;
  return `${window.location.origin}/${raw}`;
}

// Backwards-compatible alias used by avatar code
export const normalizeAvatar = normalizeUrl;
