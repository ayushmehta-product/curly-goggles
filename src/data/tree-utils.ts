export interface TreeNode {
  id: string;
  label: string;
  children: TreeNode[];
}

export type DropPosition = 'before' | 'after' | 'child';

export function cloneTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((node) => ({
    id: node.id,
    label: node.label,
    children: cloneTree(node.children),
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
  return [createTreeNode('Home')];
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

  return roots.length > 0 ? roots : emptyTree();
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
