export const SITE_FETCH_MAX_BYTES = 3_000_000;
export const SITE_FETCH_MS = 15_000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === 'metadata.google.internal'
  ) {
    return true;
  }
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    const [a, b] = host.split('.').map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

export function normalizeInputUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (isBlockedHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

export async function fetchLimited(url: string): Promise<{
  ok: boolean;
  status: number;
  text: string;
  finalUrl: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SITE_FETCH_MS);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': USER_AGENT,
      },
    });
    const finalUrl = response.url || url;
    let parsed: URL;
    try {
      parsed = new URL(finalUrl);
    } catch {
      return { ok: false, status: response.status, text: '', finalUrl };
    }
    if (isBlockedHost(parsed.hostname)) {
      return { ok: false, status: 403, text: '', finalUrl };
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > SITE_FETCH_MAX_BYTES) {
      return { ok: false, status: 413, text: '', finalUrl };
    }
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
    return { ok: response.ok, status: response.status, text, finalUrl };
  } catch {
    return { ok: false, status: 0, text: '', finalUrl: url };
  } finally {
    clearTimeout(timer);
  }
}

export function isBlockedPage(html: string, status: number): boolean {
  if (/AwsWafIntegration|challenge\.js|captcha-delivery|cf-challenge/i.test(html)) return true;
  if (status === 202) return true;
  const tooSmall = html.replace(/\s+/g, ' ').length < 4000;
  if (tooSmall && (status === 403 || status === 429)) return true;
  return false;
}
