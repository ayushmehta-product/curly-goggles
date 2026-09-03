import { countNodes, treeFromGlobalNavHtml, type TreeNode } from '@/data/tree-utils';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_BYTES = 3_000_000;
const FETCH_MS = 15000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

interface NavTreeResponse {
  tree: TreeNode[];
  source: 'navigation';
  urlCount: number;
  site: string;
}

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function isBlockedHost(hostname: string): boolean {
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

function normalizeInputUrl(raw: string): URL | null {
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

async function fetchLimited(url: string): Promise<{ ok: boolean; status: number; text: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_MS);
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
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-CH-UA': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
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
    if (buffer.byteLength > MAX_BYTES) {
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

function isBlockedPage(html: string, status: number): boolean {
  if (/AwsWafIntegration|challenge\.js|captcha-delivery|cf-challenge/i.test(html)) return true;
  if (status === 202) return true;
  const tooSmall = html.replace(/\s+/g, ' ').length < 4000;
  if (tooSmall && (status === 403 || status === 429)) return true;
  if (
    tooSmall &&
    !/<nav\b/i.test(html) &&
    !/navbar-nav|header-wrapper|panel-title|allCatV4/i.test(html)
  ) {
    return true;
  }
  return false;
}

function homeLabel(hostname: string): string {
  const host = hostname.replace(/^www\./i, '');
  return host.charAt(0).toUpperCase() + host.slice(1);
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return jsonError('Enter a website URL');
  }

  const start = normalizeInputUrl(body.url ?? '');
  if (!start) {
    return jsonError('Enter a public http(s) website URL');
  }

  try {
    const page = await fetchLimited(start.toString());
    if (page.text && isBlockedPage(page.text, page.status)) {
      return jsonError(
        'This website blocked the request. Open a public page we can read, or import a spreadsheet.',
        422
      );
    }
    if (!page.ok || !page.text) {
      return jsonError('Could not reach that website', 422);
    }

    const tree = treeFromGlobalNavHtml(
      page.text,
      homeLabel(new URL(page.finalUrl || start.toString()).hostname)
    );
    if (tree.length === 0) {
      return jsonError('No navigation was found on that page', 422);
    }

    const payload: NavTreeResponse = {
      tree,
      source: 'navigation',
      urlCount: countNodes(tree),
      site: start.hostname.replace(/^www\./i, ''),
    };
    return Response.json(payload);
  } catch {
    return jsonError('Could not fetch that website', 502);
  }
}
