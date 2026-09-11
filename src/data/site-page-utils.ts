export interface SitePage {
  id: string;
  label: string;
  path: string;
  url: string;
}

export interface PageLandmark {
  id: string;
  label: string;
  selectorHint: string;
}

export interface PageControl {
  id: string;
  label: string;
  kind: 'link' | 'button';
  selectorHint: string;
}

export interface PageLandmarks {
  sections: PageLandmark[];
  controls: PageControl[];
}

const MAX_PAGES = 40;
const MAX_SECTIONS = 24;
const MAX_CONTROLS = 30;

const SKIP_URL_PATTERN =
  /\.(xml|jpg|jpeg|png|gif|webp|svg|ico|css|js|mjs|json|woff2?|ttf|map|mp4|mp3|pdf)(\?|$)/i;
const SKIP_PATH_PATTERN = /^\/(cdn-cgi|wp-admin|wp-json|_next|static|assets)\b/i;

const SKIP_LABEL =
  /^(skip to( content| navigation)?|skip navigation|cookie(s)?( settings)?|search( icon)?|log( ?in| ?out)|sign( ?in| ?up)|register|cart|bag|account|my account|profile|close|menu|open menu|close menu|linkedin|twitter(\s*\(x\))?|facebook|instagram|youtube|x|language(\b.*)?|privacy|terms|subscribe|newsletter)$/i;

function decodeHtmlText(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugId(prefix: string, value: string, index: number): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `${prefix}-${slug || index}`;
}

function sentenceLabel(path: string): string {
  const segment = path.split('/').filter(Boolean).pop() ?? '';
  if (!segment) return 'Home';
  const decoded = decodeURIComponent(segment.replace(/\+/g, ' ')).replace(/[-_]/g, ' ');
  return decoded.replace(/\b\w/g, (ch) => ch.toUpperCase()).slice(0, 60);
}

function isUsefulLabel(label: string): boolean {
  if (!label || label.length < 2) return false;
  if (SKIP_LABEL.test(label)) return false;
  if (/^[\W_]+$/.test(label)) return false;
  return true;
}

function sameOriginUrl(href: string, base: URL): URL | null {
  try {
    const resolved = new URL(href, base);
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return null;
    if (resolved.hostname.replace(/^www\./i, '') !== base.hostname.replace(/^www\./i, '')) return null;
    if (SKIP_URL_PATTERN.test(resolved.pathname)) return null;
    if (SKIP_PATH_PATTERN.test(resolved.pathname)) return null;
    resolved.hash = '';
    return resolved;
  } catch {
    return null;
  }
}

function canonicalize(url: URL): string {
  const copy = new URL(url.toString());
  copy.hash = '';
  if (copy.pathname.length > 1) copy.pathname = copy.pathname.replace(/\/+$/, '');
  return copy.toString();
}

export function pageFromUrl(url: URL, label?: string): SitePage {
  const path = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '') || '/';
  return {
    id: slugId('page', path === '/' ? 'home' : path, 0),
    label: label || (path === '/' ? 'Home' : sentenceLabel(path)),
    path,
    url: canonicalize(url),
  };
}

export function pagesFromHtml(html: string, pageUrl: URL): SitePage[] {
  const byUrl = new Map<string, SitePage>();
  const home = pageFromUrl(pageUrl);
  byUrl.set(home.url, home);

  const navChunks = html.match(/<(header|nav)\b[^>]*>[\s\S]*?<\/\1>/gi) ?? [html.slice(0, 80_000)];
  const sources = [...navChunks, html];

  for (const chunk of sources) {
    const linkRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = linkRe.exec(chunk))) {
      const href = match[1].match(/href=["']([^"']+)["']/i)?.[1];
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
      const resolved = sameOriginUrl(href, pageUrl);
      if (!resolved) continue;
      const key = canonicalize(resolved);
      if (byUrl.has(key)) continue;
      const text = decodeHtmlText(match[2]);
      const label = isUsefulLabel(text) ? text.slice(0, 60) : sentenceLabel(resolved.pathname);
      byUrl.set(key, pageFromUrl(resolved, label));
      if (byUrl.size >= MAX_PAGES) break;
    }
    if (byUrl.size >= MAX_PAGES) break;
  }

  return [...byUrl.values()].slice(0, MAX_PAGES);
}

export function pagesFromSitemapXml(xml: string, origin: URL): SitePage[] {
  const locs = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
  const pages: SitePage[] = [];
  const seen = new Set<string>();
  for (const loc of locs) {
    const resolved = sameOriginUrl(loc, origin);
    if (!resolved) continue;
    const key = canonicalize(resolved);
    if (seen.has(key)) continue;
    seen.add(key);
    pages.push(pageFromUrl(resolved));
    if (pages.length >= MAX_PAGES) break;
  }
  return pages;
}

export function mergePages(primary: SitePage[], extra: SitePage[]): SitePage[] {
  const byUrl = new Map<string, SitePage>();
  for (const page of [...primary, ...extra]) {
    if (!byUrl.has(page.url)) byUrl.set(page.url, page);
    if (byUrl.size >= MAX_PAGES) break;
  }
  return [...byUrl.values()];
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'))?.[1];
}

export function landmarksFromHtml(html: string): PageLandmarks {
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const sections: PageLandmark[] = [];
  const seenSection = new Set<string>();

  const headingRe = /<(h[1-3])\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let headingMatch: RegExpExecArray | null;
  while ((headingMatch = headingRe.exec(stripped))) {
    const label = decodeHtmlText(headingMatch[3]);
    if (!isUsefulLabel(label)) continue;
    const idAttr = attr(headingMatch[2], 'id');
    const key = (idAttr || label).toLowerCase();
    if (seenSection.has(key)) continue;
    seenSection.add(key);
    sections.push({
      id: slugId('section', key, sections.length),
      label: label.slice(0, 80),
      selectorHint: idAttr ? `#${idAttr}` : headingMatch[1].toLowerCase() + ':' + label.slice(0, 40),
    });
    if (sections.length >= MAX_SECTIONS) break;
  }

  if (sections.length < 6) {
    const idRe = /<(section|article|div)\b([^>]*\bid=["']([^"']+)["'][^>]*)>/gi;
    let idMatch: RegExpExecArray | null;
    while ((idMatch = idRe.exec(stripped))) {
      const idAttr = idMatch[3];
      if (!idAttr || /cookie|modal|nav|footer|header|banner|ad-/i.test(idAttr)) continue;
      const key = idAttr.toLowerCase();
      if (seenSection.has(key)) continue;
      seenSection.add(key);
      const label = sentenceLabel(idAttr);
      if (!isUsefulLabel(label)) continue;
      sections.push({
        id: slugId('section', key, sections.length),
        label,
        selectorHint: `#${idAttr}`,
      });
      if (sections.length >= MAX_SECTIONS) break;
    }
  }

  const controls: PageControl[] = [];
  const seenControl = new Set<string>();

  function addControl(kind: 'link' | 'button', label: string, hint: string) {
    const key = `${kind}:${label.toLowerCase()}`;
    if (seenControl.has(key) || !isUsefulLabel(label)) return;
    seenControl.add(key);
    controls.push({
      id: slugId(kind, label, controls.length),
      label: label.slice(0, 60),
      kind,
      selectorHint: hint,
    });
  }

  const buttonRe = /<(button)\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let buttonMatch: RegExpExecArray | null;
  while ((buttonMatch = buttonRe.exec(stripped))) {
    const label = decodeHtmlText(buttonMatch[3]) || attr(buttonMatch[2], 'aria-label') || '';
    const idAttr = attr(buttonMatch[2], 'id');
    addControl('button', label, idAttr ? `#${idAttr}` : `button:${label.slice(0, 40)}`);
    if (controls.length >= MAX_CONTROLS) break;
  }

  const inputRe = /<input\b([^>]*type=["'](?:submit|button)["'][^>]*)>/gi;
  let inputMatch: RegExpExecArray | null;
  while ((inputMatch = inputRe.exec(stripped)) && controls.length < MAX_CONTROLS) {
    const tag = inputMatch[1];
    const label = attr(tag, 'value') || attr(tag, 'aria-label') || '';
    addControl('button', label, attr(tag, 'id') ? `#${attr(tag, 'id')}` : `input:${label.slice(0, 40)}`);
  }

  const linkRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkRe.exec(stripped)) && controls.length < MAX_CONTROLS) {
    const label = decodeHtmlText(linkMatch[2]) || attr(linkMatch[1], 'aria-label') || '';
    if (!isUsefulLabel(label) || label.length > 48) continue;
    const href = attr(linkMatch[1], 'href') ?? '';
    addControl('link', label, href || `a:${label.slice(0, 40)}`);
  }

  return { sections, controls };
}
