import { fetchLimited, isBlockedPage, jsonError, normalizeInputUrl } from '@/data/site-fetch';
import {
  mergePages,
  pageFromUrl,
  pagesFromHtml,
  pagesFromSitemapXml,
  type SitePage,
} from '@/data/site-page-utils';

export const runtime = 'nodejs';
export const maxDuration = 30;

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
    const origin = new URL(page.finalUrl || start.toString());
    const fallback: SitePage[] = [pageFromUrl(origin)];

    if (page.text && isBlockedPage(page.text, page.status)) {
      return Response.json({
        site: start.hostname.replace(/^www\./i, ''),
        pages: fallback,
        blocked: true,
        error: 'This website blocked the request. You can still add page URLs by hand.',
      });
    }

    let pages = fallback;
    if (page.ok && page.text) {
      pages = pagesFromHtml(page.text, origin);
    }

    const sitemapUrl = new URL('/sitemap.xml', origin.origin);
    const sitemap = await fetchLimited(sitemapUrl.toString());
    if (sitemap.ok && sitemap.text && /<urlset|<sitemapindex/i.test(sitemap.text)) {
      pages = mergePages(pages, pagesFromSitemapXml(sitemap.text, origin));
    }

    return Response.json({
      site: start.hostname.replace(/^www\./i, ''),
      pages,
      blocked: false,
    });
  } catch {
    return jsonError('Could not fetch that website', 502);
  }
}
