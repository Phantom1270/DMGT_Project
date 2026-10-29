import { useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  useNodesInitialized,
  type Edge,
  type Node,
} from "@xyflow/react";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";
import {
  detectCycle,
  transitiveClosure,
  transitiveReduction,
  type DependencyNode,
} from "../lib/graphAlgorithms";

type Item = DependencyNode & {
  name: string;
  status: "Completed" | "Ready" | "Blocked";
};
function AutoFit({ signature }: { signature: string }) {
  const { fitView } = useReactFlow(),
    initialized = useNodesInitialized();
  useEffect(() => {
    if (!initialized) return;
    const fit = () => {
      void fitView({ padding: 0.18, duration: 0 });
    };
    const frame = requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", fit);
    };
  }, [signature, initialized, fitView]);
  return null;
}
const layout = (items: Item[], hasse: boolean) => {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "TB",
    nodesep: 54,
    ranksep: 72,
    marginx: 25,
    marginy: 25,
  });
  items.forEach((item) => graph.setNode(item.id, { width: 178, height: 66 }));
  const links =
    hasse && !detectCycle(items)
      ? transitiveReduction(items)
      : items.flatMap((item) =>
          item.prerequisites
            .filter((id) => items.some((x) => x.id === id))
            .map((prereq) => [prereq, item.id] as [string, string]),
        );
  links.forEach(([from, to]) => graph.setEdge(from, to));
  dagre.layout(graph);
  return { graph, links };
};

export function DependencyGraph({
  items,
  title = "Dependency graph",
  selectedId,
  onSelect,
  criticalIds = [],
  criticalEdges = [],
  activeIds = [],
}: {
  items: Item[];
  title?: string;
  selectedId?: string;
  onSelect?: (id: string) => void;
  criticalIds?: string[];
  criticalEdges?: Array<[string, string]>;
  activeIds?: string[];
}) {
  const [zoom, setZoom] = useState(100);
  const [hasse, setHasse] = useState(true);
  const [localSelected, setSelected] = useState<string | null>(null);
  const selected = selectedId ?? localSelected;
  const cycle = detectCycle(items);
  const { nodes, edges } = useMemo(() => {
    const { graph, links } = layout(items, hasse);
    const closure = transitiveClosure(items);
    const connected = new Set<string>();
    if (selected) {
      connected.add(selected);
      closure.get(selected)?.forEach((id) => connected.add(id));
      items.forEach((item) => {
        if (closure.get(item.id)?.has(selected)) connected.add(item.id);
      });
    }
    const nodes: Node[] = items.map((item) => {
      const p = graph.node(item.id);
      return {
        id: item.id,
        position: { x: p.x - 89, y: p.y - 33 },
        data: {
          label: (
            <div
              className={`graph-node ${item.status.toLowerCase()} ${connected.size && !connected.has(item.id) ? "dimmed" : ""} ${criticalIds.includes(item.id) ? "critical" : ""} ${activeIds.includes(item.id) ? "walking" : ""}`}
            >
              <b>{item.name}</b>
              <small>
                {cycle?.includes(item.id) ? "Cycle" : item.status} ·{" "}
                {criticalIds.includes(item.id)
                  ? "Critical"
                  : `${item.prerequisites.length} prerequisites`}
              </small>
            </div>
          ),
        },
        style: { width: 178, padding: 0, border: 0, background: "transparent" },
      };
    });
    const edges: Edge[] = links.map(([from, to], index) => ({
      id: `${from}-${to}-${index}`,
      source: from,
      target: to,
      type: "smoothstep",
      animated: Boolean(selected && connected.has(from) && connected.has(to)),
      markerEnd: { type: "arrowclosed" },
      style: {
        stroke:
          selected && connected.has(from) && connected.has(to)
            ? "var(--accent-primary)"
            : "var(--text-tertiary)",
        strokeWidth:
          selected && connected.has(from) && connected.has(to) ? 2.5 : 1.5,
      },
    }));
    return { nodes, edges };
  }, [items, hasse, selected, criticalIds, activeIds, cycle]);
  const current = items.find((item) => item.id === selected);
  const ancestors = selected
    ? [...(transitiveClosure(items).get(selected) ?? [])]
    : [];
  return (
    <div className="graph-wrap">
      <div className="graph-toolbar">
        <b>{cycle ? "Cyclic dependency graph" : title}</b>
        <div>
          <button
            disabled={Boolean(cycle)}
            className={hasse && !cycle ? "active" : ""}
            onClick={() => setHasse(true)}
          >
            Hasse diagram
          </button>
          <button
            className={!hasse || cycle ? "active" : ""}
            onClick={() => setHasse(false)}
          >
            Direct dependencies
          </button>
        </div>
      </div>
      <div className="flow-canvas">
        <span className="zoom-indicator" aria-label="Graph zoom">
          {zoom}%
        </span>
        <ReactFlow
          nodes={nodes}
          edges={edges.map((edge) => ({
            ...edge,
            animated: false,
            style: {
              ...edge.style,
              stroke: cycle?.some(
                (id, i) => id === edge.target && cycle[i + 1] === edge.source,
              )
                ? "var(--accent-danger)"
                : criticalEdges.some(
                      ([from, to]) =>
                        from === edge.source && to === edge.target,
                    )
                  ? "var(--accent-warning)"
                  : edge.style?.stroke,
              strokeDasharray:
                selected && edge.source !== selected && edge.target !== selected
                  ? "5 4"
                  : undefined,
            },
          }))}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.2}
          maxZoom={1.7}
          onNodeClick={(_, node) => {
            setSelected(node.id);
            onSelect?.(node.id);
          }}
          onPaneClick={() => {
            setSelected(null);
            onSelect?.("");
          }}
          nodesDraggable={false}
          nodesConnectable={false}
          onMove={(_, viewport) => setZoom(Math.round(viewport.zoom * 100))}
        >
          <AutoFit
            signature={items
              .map((x) => `${x.id}:${x.prerequisites.join(",")}`)
              .join("|")}
          />
          <Background color="var(--grid)" gap={22} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) =>
              criticalIds.includes(node.id)
                ? "#f59e0b"
                : items.find((x) => x.id === node.id)?.status === "Completed"
                  ? "#10b981"
                  : "#06b6d4"
            }
            maskColor="rgba(10,14,26,.2)"
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div className="graph-legend">
        <span>
          <i className="legend-dot completed" />
          Completed
        </span>
        <span>
          <i className="legend-dot ready" />
          Ready
        </span>
        <span>
          <i className="legend-dot blocked" />
          Blocked
        </span>
        <span>Click a node to trace its dependency chain</span>
      </div>
      {current && (
        <div className="graph-detail">
          <b>{current.name}</b>
          <span>
            {current.status}.{" "}
            {ancestors.length
              ? `All prerequisites: ${ancestors.map((id) => items.find((item) => item.id === id)?.name ?? id).join(", ")}.`
              : "No prerequisites."}{" "}
            Clicked routes are highlighted; orange outlines indicate critical
            tasks.
          </span>
          <button
            onClick={() => {
              setSelected(null);
              onSelect?.("");
            }}
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}
