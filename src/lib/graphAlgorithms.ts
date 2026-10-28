export type DependencyNode = { id: string; prerequisites: string[] };
const invalidReferences = (nodes: DependencyNode[]) =>
  new Set(nodes.map((n) => n.id)).size !== nodes.length ||
  nodes.some(
    (n) =>
      new Set(n.prerequisites).size !== n.prerequisites.length ||
      n.prerequisites.some((p) => !nodes.some((x) => x.id === p)),
  );

export function detectCycle(nodes: DependencyNode[]): string[] | null {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visited = new Set<string>();
  const active: string[] = [];
  const visit = (id: string): string[] | null => {
    const at = active.indexOf(id);
    if (at >= 0) return [...active.slice(at), id];
    if (visited.has(id)) return null;
    active.push(id);
    for (const prerequisite of byId.get(id)?.prerequisites ?? []) {
      const cycle = visit(prerequisite);
      if (cycle) return cycle;
    }
    active.pop();
    visited.add(id);
    return null;
  };
  for (const node of nodes) {
    const cycle = visit(node.id);
    if (cycle) return cycle;
  }
  return null;
}

export function topologicalSort(nodes: DependencyNode[]): string[] | null {
  if (invalidReferences(nodes) || detectCycle(nodes)) return null;
  const remaining = new Set(nodes.map((n) => n.id)),
    result: string[] = [];
  while (remaining.size) {
    const ready = [...remaining].filter((id) =>
      (nodes.find((n) => n.id === id)?.prerequisites ?? []).every(
        (p) => !remaining.has(p),
      ),
    );
    if (!ready.length) return null;
    ready.forEach((id) => {
      remaining.delete(id);
      result.push(id);
    });
  }
  return result;
}

export function topologicalLayers(nodes: DependencyNode[]): string[][] {
  if (invalidReferences(nodes) || detectCycle(nodes)) return [];
  const remaining = new Set(nodes.map((n) => n.id)),
    layers: string[][] = [];
  while (remaining.size) {
    const layer = [...remaining].filter((id) =>
      (nodes.find((n) => n.id === id)?.prerequisites ?? []).every(
        (p) => !remaining.has(p),
      ),
    );
    if (!layer.length) return [];
    layers.push(layer);
    layer.forEach((id) => remaining.delete(id));
  }
  return layers;
}

export function transitiveClosure(
  nodes: DependencyNode[],
): Map<string, Set<string>> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return new Map(
    nodes.map((node) => {
      const reachable = new Set<string>(),
        pending = [...node.prerequisites];
      while (pending.length) {
        const id = pending.pop()!;
        if (reachable.has(id)) continue;
        reachable.add(id);
        pending.push(...(byId.get(id)?.prerequisites ?? []));
      }
      return [node.id, reachable];
    }),
  );
}

export function transitiveReduction(
  nodes: DependencyNode[],
): Array<[string, string]> {
  if (invalidReferences(nodes) || detectCycle(nodes)) return [];
  const closure = transitiveClosure(nodes),
    edges: Array<[string, string]> = [];
  for (const node of nodes)
    for (const prerequisite of node.prerequisites) {
      const redundant = node.prerequisites.some(
        (other) =>
          other !== prerequisite && closure.get(other)?.has(prerequisite),
      );
      if (!redundant) edges.push([prerequisite, node.id]);
    }
  return edges;
}

export function getReadyNodes(
  nodes: DependencyNode[],
  completedIds: string[],
): string[] {
  const done = new Set(completedIds);
  return nodes
    .filter(
      (node) =>
        !done.has(node.id) && node.prerequisites.every((id) => done.has(id)),
    )
    .map((node) => node.id);
}

export function getAllPrerequisites(
  nodes: DependencyNode[],
  targetId: string,
): string[] {
  return [...(transitiveClosure(nodes).get(targetId) ?? new Set<string>())];
}
