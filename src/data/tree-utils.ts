export interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
  desired?: boolean;
}

export interface FlatTreeNode {
  id: string;
  label: string;
  path: string;
  hasChildren: boolean;
  depth: number;
}

export type DropPosition = 'before' | 'after' | 'child';

export function cloneTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    label: node.label,
    children: cloneTree(node.children),
    desired: node.desired,
  }));
}

export function createTreeNode(label: string, children: TreeNode[] = []): TreeNode {
  return {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    children,
  };
}

export function emptyTree(): TreeNode[] {
  return [];
}

export function flattenTree(nodes: TreeNode[], trail: string[] = [], depth = 0): FlatTreeNode[] {
  const rows: FlatTreeNode[] = [];
  for (const node of nodes) {
    const pathParts = [...trail, node.label];
    rows.push({
      id: node.id,
      label: node.label,
      path: pathParts.join(' > '),
      hasChildren: node.children.length > 0,
      depth,
    });
    rows.push(...flattenTree(node.children, pathParts, depth + 1));
  }
  return rows;
}

export function setDesiredNode(nodes: TreeNode[], id: string): TreeNode[] {
  const currentlyOn = findNode(nodes, id)?.desired === true;
  const turnOn = !currentlyOn;
  function mapNode(node: TreeNode): TreeNode {
    return {
      ...node,
      desired: node.id === id ? turnOn : false,
      children: node.children.map(mapNode),
    };
  }
  return nodes.map(mapNode);
}

export function matchTreeNodes(nodes: TreeNode[], query: string): FlatTreeNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const all = flattenTree(nodes);
  const exact = all.filter(
    (row) => row.label.toLowerCase() === needle || row.path.toLowerCase() === needle
  );
  if (exact.length > 0) return exact;
  return all.filter(
    (row) => row.label.toLowerCase().includes(needle) || row.path.toLowerCase().includes(needle)
  );
}

export function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = findNode(node.children, id);
    if (nested) return nested;
  }
  return null;
}

export function isDescendant(nodes: TreeNode[], ancestorId: string, maybeChildId: string): boolean {
  const ancestor = findNode(nodes, ancestorId);
  if (!ancestor) return false;
  return Boolean(findNode(ancestor.children, maybeChildId));
}

export function getLeaves(nodes: TreeNode[]): TreeNode[] {
  const leaves: TreeNode[] = [];
  for (const node of nodes) {
    if (node.children.length === 0) leaves.push(node);
    else leaves.push(...getLeaves(node.children));
  }
  return leaves;
}

export function getNodePath(nodes: TreeNode[], id: string, trail: string[] = []): string[] | null {
  for (const node of nodes) {
    const next = [...trail, node.label];
    if (node.id === id) return next;
    const nested = getNodePath(node.children, id, next);
    if (nested) return nested;
  }
  return null;
}

function removeNodeFromList(nodes: TreeNode[], id: string): { nodes: TreeNode[]; removed: TreeNode | null } {
  const index = nodes.findIndex((node) => node.id === id);
  if (index >= 0) {
    const removed = nodes[index];
    return { nodes: [...nodes.slice(0, index), ...nodes.slice(index + 1)], removed };
  }
  let removed: TreeNode | null = null;
  const next = nodes.map((node) => {
    if (removed) return node;
    const result = removeNodeFromList(node.children, id);
    if (result.removed) {
      removed = result.removed;
      return { ...node, children: result.nodes };
    }
    return node;
  });
  return { nodes: next, removed };
}

export function removeNode(nodes: TreeNode[], id: string): { nodes: TreeNode[]; removed: TreeNode | null } {
  return removeNodeFromList(cloneTree(nodes), id);
}

export function updateNodeLabel(nodes: TreeNode[], id: string, label: string): TreeNode[] {
  return cloneTree(nodes).map(function mapNode(node): TreeNode {
    if (node.id === id) return { ...node, label };
    return { ...node, children: node.children.map(mapNode) };
  });
}

export function addChildNode(nodes: TreeNode[], parentId: string, label = 'New page'): TreeNode[] {
  const child = createTreeNode(label);
  return cloneTree(nodes).map(function mapNode(node): TreeNode {
    if (node.id === parentId) return { ...node, children: [...node.children, child] };
    return { ...node, children: node.children.map(mapNode) };
  });
}

export function insertNode(
  nodes: TreeNode[],
  draggedId: string,
  targetId: string,
  position: DropPosition
): TreeNode[] {
  if (draggedId === targetId) return nodes;
  if (isDescendant(nodes, draggedId, targetId)) return nodes;

  const extracted = removeNodeFromList(cloneTree(nodes), draggedId);
  if (!extracted.removed) return nodes;
  const dragged = extracted.removed;

  function insert(list: TreeNode[]): TreeNode[] | null {
    const targetIndex = list.findIndex((node) => node.id === targetId);
    if (targetIndex >= 0) {
      const next = [...list];
      if (position === 'before') next.splice(targetIndex, 0, dragged);
      else if (position === 'after') next.splice(targetIndex + 1, 0, dragged);
      else {
        next[targetIndex] = {
          ...next[targetIndex],
          children: [...next[targetIndex].children, dragged],
        };
      }
      return next;
    }
    for (let i = 0; i < list.length; i += 1) {
      const childResult = insert(list[i].children);
      if (childResult) {
        const next = [...list];
        next[i] = { ...list[i], children: childResult };
        return next;
      }
    }
    return null;
  }

  return insert(extracted.nodes) ?? extracted.nodes;
}

export function countNodes(nodes: TreeNode[]): number {
  return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children), 0);
}

export function parseNngCsv(csv: string): TreeNode[] {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => parseCsvRow(line))
    .filter((cells) => cells.some((cell) => cell.trim().length > 0));

  const roots: TreeNode[] = [];
  const lastAtDepth: TreeNode[] = [];

  for (const cells of rows) {
    let depth = 0;
    let label = '';
    for (let i = 0; i < cells.length; i += 1) {
      if (cells[i].trim()) {
        depth = i;
        label = cells[i].trim();
      }
    }
    if (!label) continue;
    const node = createTreeNode(label);
    if (depth === 0) {
      roots.push(node);
    } else {
      const parent = lastAtDepth[depth - 1];
      if (parent) parent.children.push(node);
      else roots.push(node);
    }
    lastAtDepth[depth] = node;
    lastAtDepth.length = depth + 1;
  }

  return roots;
}

const SKIP_URL_PATTERN =
  /\.(xml|jpg|jpeg|png|gif|webp|svg|ico|css|js|mjs|json|woff2?|ttf|map|mp4|mp3|pdf)(\?|$)/i;
const SKIP_PATH_PATTERN = /^\/(cdn-cgi|wp-admin|wp-json|_next|static|assets)\b/i;

function sentenceLabel(raw: string): string {
  const decoded = decodeURIComponent(raw.replace(/\+/g, ' '))
    .replace(/[-_]+/g, ' ')
    .replace(/\.[a-z0-9]{1,8}$/i, '')
    .trim();
  if (!decoded) return 'Page';
  const lower = decoded.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function originLabel(hostname: string): string {
  const host = hostname.replace(/^www\./i, '');
  return host.charAt(0).toUpperCase() + host.slice(1);
}

export function treeFromPageUrls(rawUrls: string[]): TreeNode[] {
  type Bucket = { label: string; children: Map<string, Bucket> };
  const roots = new Map<string, Bucket>();

  const unique = [...new Set(rawUrls)].slice(0, 400);
  for (const raw of unique) {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      continue;
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') continue;
    if (SKIP_URL_PATTERN.test(parsed.pathname)) continue;
    if (SKIP_PATH_PATTERN.test(parsed.pathname)) continue;

    const originKey = parsed.origin;
    if (!roots.has(originKey)) {
      roots.set(originKey, { label: originLabel(parsed.hostname), children: new Map() });
    }
    let cursor = roots.get(originKey)!;
    const segments = parsed.pathname.split('/').filter(Boolean).slice(0, 6);
    for (const segment of segments) {
      const key = segment.toLowerCase();
      if (!cursor.children.has(key)) {
        cursor.children.set(key, { label: sentenceLabel(segment), children: new Map() });
      }
      cursor = cursor.children.get(key)!;
    }
  }

  function toNodes(buckets: Map<string, Bucket>, prefix: string): TreeNode[] {
    return [...buckets.entries()].map(([key, bucket]) => ({
      id: `n-${prefix}-${key}`.replace(/[^a-z0-9-]/gi, '-').slice(0, 80),
      label: bucket.label,
      children: toNodes(bucket.children, `${prefix}-${key}`),
    }));
  }

  return toNodes(roots, 'site');
}

const MAX_NAV_NODES = 180;

/** Labels that are chrome, utility, or social — not global-nav taxonomy. */
const SKIP_NAV_LABEL =
  /^(skip to( content| navigation)?|skip navigation|cookie(s)?( settings)?|search( icon)?|log( ?in| ?out)|sign( ?in| ?up)|register|cart|bag|account|my account|profile|my profile|close|menu|open menu|close menu|linkedin|twitter(\s*\(x\))?|facebook|instagram|youtube|x|language(\b.*)?|call us|new customer\??|become a seller|flipkart plus zone|orders|wishlist|rewards|gift cards|notification(s| preferences| settings)?|24x7 customer care|advertise( on flipkart)?|download app|more)$/i;

const GLOBAL_NAV_LABEL = /aria-label=["'][^"']*\b(main|primary|global|site|header|product)\b[^"']*["']/i;
const GLOBAL_NAV_CLASS =
  /nav-main|main-nav|primary-nav|global-nav|header[-_ ]?nav|w-nav-menu|mega-?menu|newheader|navbar-nav|header-wrapper|nav-xshop/i;
const UTILITY_NAV_HINT =
  /breadcrumb|pagination|social|footer|cookie|skip to|utility|account|user[-_ ]?menu|language|toolbar|table of contents|\btoc\b|on this page|share[-_ ]?nav/i;

function decodeHtmlText(raw: string): string {
  return raw
    .replace(/<span[^>]*menu-subheading[\s\S]*?<\/span>/gi, ' ')
    .replace(/<img\b[^>]*>/gi, ' ')
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

function cleanNavLabel(raw: string): string {
  let label = decodeHtmlText(raw)
    .replace(/\barrow_right\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  label = label.replace(/\s+New$/i, '');
  const dup = label.match(/^(.+?)\s+\1$/i);
  if (dup) label = dup[1].trim();
  if (label.length > 80) label = label.slice(0, 80).trim();
  return label;
}

function isUsefulNavLabel(label: string): boolean {
  if (!label || label.length < 2) return false;
  if (SKIP_NAV_LABEL.test(label)) return false;
  if (/^[\W_]+$/.test(label)) return false;
  if (/^\+?\d[\d\s().-]{6,}$/.test(label)) return false;
  if (
    /^(espa[nñ]ol|portugu[eê]s|nederlandse?|deutsch|fran[cç]ais|italiano|t[uü]rk[cç]e|svenska|hebrew( il)?|thai|english)$/i.test(
      label
    )
  ) {
    return false;
  }
  return true;
}

function innerOfTags(html: string, tag: string): string[] {
  const open = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  const chunks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = open.exec(html))) {
    const start = match.index + match[0].length;
    const inner = sliceUntilClose(html, start, tag);
    if (inner) chunks.push(inner);
  }
  return chunks;
}

function sliceUntilClose(html: string, start: number, tag: string): string | null {
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 1;
  let cursor = start;
  while (cursor < html.length && depth > 0) {
    openRe.lastIndex = cursor;
    closeRe.lastIndex = cursor;
    const opened = openRe.exec(html);
    const closed = closeRe.exec(html);
    if (!closed) return html.slice(start);
    if (opened && opened.index < closed.index) {
      depth += 1;
      cursor = opened.index + opened[0].length;
    } else {
      depth -= 1;
      if (depth === 0) return html.slice(start, closed.index);
      cursor = closed.index + closed[0].length;
    }
  }
  return null;
}

interface HtmlBlock {
  attrs: string;
  inner: string;
}

function blocksOfTag(html: string, tag: string): HtmlBlock[] {
  const open = new RegExp(`<${tag}\\b([^>]*)>`, 'gi');
  const blocks: HtmlBlock[] = [];
  let match: RegExpExecArray | null;
  while ((match = open.exec(html))) {
    const start = match.index + match[0].length;
    const inner = sliceUntilClose(html, start, tag);
    if (inner !== null) blocks.push({ attrs: match[1] ?? '', inner });
  }
  return blocks;
}

function navScore(attrs: string, inner: string, inHeader: boolean): number {
  const sample = `${attrs} ${inner.slice(0, 400)}`;
  const looksUtility = UTILITY_NAV_HINT.test(sample);
  const looksGlobal = GLOBAL_NAV_LABEL.test(attrs) || GLOBAL_NAV_CLASS.test(attrs);
  if (looksUtility && !looksGlobal) return -100;
  let score = 15;
  if (GLOBAL_NAV_LABEL.test(attrs)) score += 50;
  if (GLOBAL_NAV_CLASS.test(attrs)) score += 40;
  if (inHeader) score += 20;
  if (/role=["']navigation["']/i.test(attrs)) score += 10;
  if (looksUtility) score -= 40;
  return score;
}

function blocksWithClass(html: string, classPart: string): HtmlBlock[] {
  const open = new RegExp(`<([a-z0-9]+)([^>]*class=["'][^"']*${classPart}[^"']*["'][^>]*)>`, 'gi');
  const blocks: HtmlBlock[] = [];
  let match: RegExpExecArray | null;
  while ((match = open.exec(html))) {
    const tag = match[1] ?? 'div';
    const start = match.index + match[0].length;
    const inner = sliceUntilClose(html, start, tag);
    if (inner !== null) blocks.push({ attrs: match[2] ?? '', inner });
  }
  return blocks;
}

function stripChrome(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
}

/**
 * Header / global / help-center navigation — the taxonomy tree testing evaluates.
 * Skips sitemaps, footer link farms, breadcrumbs, and utility chrome.
 */
function navChunksFromHtml(html: string): string[] {
  const cleaned = stripChrome(html);
  const headers = innerOfTags(cleaned, 'header');
  const headerBlob = headers.join('\n');
  const footerBlob = innerOfTags(cleaned, 'footer').join('\n');

  const scored = blocksOfTag(cleaned, 'nav')
    .filter((block) => !footerBlob.includes(block.inner))
    .map((block) => ({
      ...block,
      score: navScore(block.attrs, block.inner, headerBlob.includes(block.inner)),
    }))
    .filter((block) => block.score > 0)
    .sort((a, b) => b.score - a.score);

  const global = scored.filter((block) => block.score >= 30);
  const chosen = (global.length > 0 ? global : scored.slice(0, 1)).map((block) => block.inner);

  const extras: string[] = [];
  const navbarBlocks = blocksWithClass(cleaned, 'navbar-nav');
  if (navbarBlocks.length > 0) {
    extras.push(...navbarBlocks.map((block) => block.inner));
  } else {
    for (const block of blocksWithClass(cleaned, 'header-wrapper')) {
      if (!footerBlob.includes(block.inner)) extras.push(block.inner);
    }
  }
  for (const cls of ['nav-xshop', 'nav-xshop-container']) {
    for (const block of blocksWithClass(cleaned, cls)) {
      if (!footerBlob.includes(block.inner)) extras.push(block.inner);
    }
  }
  for (const id of ['nav-xshop', 'navbar', 'nav-main', 'nav-progressive-subnav']) {
    const match = cleaned.match(new RegExp(`<([a-z0-9]+)([^>]*id=["']${id}["'][^>]*)>`, 'i'));
    if (!match) continue;
    const start = (match.index ?? 0) + match[0].length;
    const inner = sliceUntilClose(cleaned, start, match[1] ?? 'div');
    if (inner) extras.push(inner);
  }

  const chunks = [...chosen, ...extras];
  if (chunks.length > 0) return chunks;
  return headers;
}

function isChromeOpenTag(openTag: string): boolean {
  const tag = openTag.toLowerCase();
  if (/\b(logo|brand|burger|social|share)\b/.test(tag)) return true;
  if (/aria-label=["'][^"']*(open|close)[^"']*nav/.test(tag)) return true;
  if (/href=["']https?:\/\/(www\.)?(linkedin|twitter|facebook|instagram|youtube|x)\.com/.test(tag)) {
    return true;
  }
  return false;
}

interface NavItem {
  label: string;
  depth: number;
}

function navItemsFromHtml(html: string): NavItem[] {
  const items: NavItem[] = [];
  let depth = 0;
  let menuChildDepth: number | null = null;
  const token =
    /<(ul|ol|menu)\b[^>]*>|<\/(ul|ol|menu)>|<h[2-4]\b[^>]*>[\s\S]*?<\/h[2-4]>|<button\b[^>]*>[\s\S]*?<\/button>|<a\b[^>]*>[\s\S]*?<\/a>|<summary\b[^>]*>[\s\S]*?<\/summary>|<p\b[^>]*>[\s\S]*?<\/p>|<span\b[^>]*class=["'][^"']*menu-heading[^"']*["'][^>]*>[\s\S]*?<\/span>/gi;
  let match: RegExpExecArray | null;
  while ((match = token.exec(html))) {
    const raw = match[0];
    const tagName = raw.replace(/^<\/?/, '').split(/[\s>]/)[0]?.toLowerCase() ?? '';
    if (tagName === 'ul' || tagName === 'ol' || tagName === 'menu') {
      if (raw.startsWith('</')) depth = Math.max(0, depth - 1);
      else depth += 1;
      continue;
    }
    const openEnd = raw.indexOf('>');
    const openTag = raw.slice(0, openEnd + 1);
    if (isChromeOpenTag(openTag)) continue;
    const inner = raw.slice(openEnd + 1).replace(/<\/[a-z0-9]+>\s*$/i, '');
    const label = cleanNavLabel(inner);
    if (!isUsefulNavLabel(label)) continue;
    if (tagName === 'p') {
      const words = label.split(/\s+/);
      if (words.length > 6 && !/framer-text/.test(openTag)) continue;
      if (words.length > 8) continue;
    }
    const listDepth = Math.max(0, depth - 1);
    if (tagName === 'span' && /menu-heading/.test(openTag)) {
      items.push({ label, depth: menuChildDepth ?? listDepth + 1 });
      continue;
    }
    if (tagName === 'a' && /nav-link|dropdown-toggle/.test(openTag)) {
      items.push({ label, depth: listDepth });
      menuChildDepth = listDepth + 1;
      continue;
    }
    const itemDepth = menuChildDepth != null ? Math.max(listDepth, menuChildDepth) : listDepth;
    items.push({ label, depth: itemDepth });
  }
  return items;
}

function itemsFromHelpAccordion(html: string): NavItem[] {
  if (!/panel-title/i.test(html) || !/list-link/i.test(html)) return [];
  const accordionOpen = html.match(/<div\b[^>]*(id=["']accordion["']|class=["'][^"']*panel-group[^"']*["'])[^>]*>/i);
  if (!accordionOpen || accordionOpen.index == null) return [];
  const start = accordionOpen.index + accordionOpen[0].length;
  const region = sliceUntilClose(html, start, 'div') ?? html.slice(start, start + 400_000);
  const items: NavItem[] = [];
  const token =
    /<h4\b([^>]*)>([\s\S]*?)<\/h4>|<a\b([^>]*class=["'][^"']*list-link[^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = token.exec(region))) {
    if (match[2] != null) {
      const attrs = `${match[1] ?? ''} ${match[2]}`;
      const label = cleanNavLabel(match[2]);
      if (!isUsefulNavLabel(label)) continue;
      items.push({ label, depth: /panel-subtitle/.test(attrs) ? 1 : 0 });
    } else {
      const label = cleanNavLabel(match[4] ?? '');
      if (!isUsefulNavLabel(label)) continue;
      items.push({ label, depth: 2 });
    }
  }
  return items;
}

function decodeJsonString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return raw.replace(/\\u002f/gi, '/').replace(/\\"/g, '"');
  }
}

function itemsFromCategoryJson(html: string): NavItem[] {
  const items: NavItem[] = [];
  const seen = new Set<string>();
  const keyRe = /"(allCatV4|allCategories|megaMenu|megaNav|headerNav|headerCategories|l1Categories|navCategories)"/gi;
  let keyMatch: RegExpExecArray | null;
  while ((keyMatch = keyRe.exec(html))) {
    const slice = html.slice(keyMatch.index, keyMatch.index + 24_000);
    const pair = /"title"\s*:\s*"((?:\\.|[^"\\])+)"\s*,\s*"targetUrl"\s*:\s*"((?:\\.|[^"\\])+)"/g;
    let pairMatch: RegExpExecArray | null;
    while ((pairMatch = pair.exec(slice))) {
      const label = cleanNavLabel(decodeJsonString(pairMatch[1]));
      const href = decodeJsonString(pairMatch[2]);
      if (!isUsefulNavLabel(label) || seen.has(label.toLowerCase())) continue;
      const fromAllCat = /allCatV4/i.test(keyMatch[1] ?? '');
      if (!fromAllCat && !/categor|\/clp\/|\/nav\//i.test(href)) continue;
      seen.add(label.toLowerCase());
      items.push({ label, depth: 0 });
      if (items.length >= 40) return items;
    }
  }
  return items;
}

function usefulCount(items: NavItem[]): number {
  return items.filter((item) => isUsefulNavLabel(item.label)).length;
}

function navSetQuality(items: NavItem[]): number {
  const useful = items.filter((item) => isUsefulNavLabel(item.label));
  if (useful.length < 2) return -1;
  const maxDepth = useful.reduce((max, item) => Math.max(max, item.depth), 0);
  const topLevel = new Set(useful.filter((item) => item.depth === 0).map((item) => item.label.toLowerCase()));
  const skipped = items.length - useful.length;
  const utilityRatio = items.length > 0 ? skipped / items.length : 1;
  if (utilityRatio > 0.65) return useful.length - 20;
  return useful.length + maxDepth * 12 + topLevel.size * 2;
}

function capNavItems(items: NavItem[], max: number): NavItem[] {
  if (items.length <= max) return items;
  const folderCount = items.filter((item) => item.depth < 2).length;
  const leafRoom = Math.max(0, max - folderCount);
  const out: NavItem[] = [];
  let leaves = 0;
  for (const item of items) {
    if (item.depth < 2) {
      out.push(item);
      continue;
    }
    if (leaves >= leafRoom) continue;
    out.push(item);
    leaves += 1;
  }
  return out;
}

function pickBestNavItems(sets: NavItem[][]): NavItem[] {
  let best: NavItem[] = [];
  let bestScore = -1;
  for (const items of sets) {
    const score = navSetQuality(items);
    if (score > bestScore) {
      best = items.filter((item) => isUsefulNavLabel(item.label));
      bestScore = score;
    }
  }
  return best;
}

function itemsToTree(items: NavItem[], homeLabel: string): TreeNode[] {
  if (items.length === 0) return [];
  const minDepth = Math.min(...items.map((item) => item.depth));
  const normalized = items.map((item) => ({
    ...item,
    depth: Math.min(4, Math.max(0, item.depth - minDepth)),
  }));

  const home = createTreeNode(homeLabel);
  const lastAtDepth: TreeNode[] = [home];

  for (const item of normalized) {
    const node = createTreeNode(item.label);
    let parent = home;
    for (let d = item.depth; d >= 0; d -= 1) {
      if (lastAtDepth[d]) {
        parent = lastAtDepth[d];
        break;
      }
    }
    const duplicate = parent.children.find(
      (child) => child.label.toLowerCase() === node.label.toLowerCase()
    );
    if (duplicate) {
      lastAtDepth[item.depth + 1] = duplicate;
      lastAtDepth.length = item.depth + 2;
      continue;
    }
    parent.children.push(node);
    lastAtDepth[item.depth + 1] = node;
    lastAtDepth.length = item.depth + 2;
    if (countNodes([home]) >= MAX_NAV_NODES) break;
  }

  return home.children.length > 0 ? [home] : [];
}

/** Build a tree-test hierarchy from global / header / help-center navigation. */
export function treeFromGlobalNavHtml(html: string, homeLabel = 'Home'): TreeNode[] {
  const htmlItems = navChunksFromHtml(html).flatMap((chunk) => navItemsFromHtml(chunk));
  const helpItems = itemsFromHelpAccordion(html);
  const jsonItems = itemsFromCategoryJson(html);
  if (helpItems.length > 10 && usefulCount(helpItems) > usefulCount(htmlItems)) {
    return itemsToTree(capNavItems(helpItems, MAX_NAV_NODES), homeLabel);
  }
  const items = pickBestNavItems([htmlItems, helpItems, jsonItems]);
  return itemsToTree(capNavItems(items, MAX_NAV_NODES), homeLabel);
}

function parseCsvRow(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}
