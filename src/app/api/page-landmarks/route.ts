import { fetchLimited, isBlockedPage, jsonError, normalizeInputUrl } from '@/data/site-fetch';
import { landmarksFromHtml } from '@/data/site-page-utils';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = (await request.json()) as { url?: string };
  } catch {
    return jsonError('Enter a page URL');
  }

  const start = normalizeInputUrl(body.url ?? '');
  if (!start) {
    return jsonError('Enter a public http(s) page URL');
  }

  try {
    const page = await fetchLimited(start.toString());
    if (page.text && isBlockedPage(page.text, page.status)) {
      return jsonError('This page blocked the request. Try another public URL.', 422);
    }
    if (!page.ok || !page.text) {
      return jsonError('Could not reach that page', 422);
    }

    const landmarks = landmarksFromHtml(page.text);
    return Response.json(landmarks);
  } catch {
    return jsonError('Could not fetch that page', 502);
  }
}
