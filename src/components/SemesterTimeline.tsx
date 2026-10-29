import type { Work } from "../lib/analysis";
export function SemesterTimeline({
  items,
  plan,
  completed,
  onSelect,
}: {
  items: Work[];
  plan: string[][];
  completed: string[];
  onSelect: (id: string) => void;
}) {
  const lanes = [
    ...(completed.length
      ? [{ title: "Recorded complete", ids: completed }]
      : []),
    ...plan.map((ids, i) => ({ title: `Semester ${i + 1}`, ids })),
  ];
  const positions = new Map<string, { x: number; y: number }>();
  lanes.forEach((lane, i) =>
    lane.ids.forEach((id, j) =>
      positions.set(id, { x: 20 + i * 220, y: 65 + j * 90 }),
    ),
  );
  const width = Math.max(420, lanes.length * 220 + 20),
    height = Math.max(
      200,
      Math.max(0, ...lanes.map((l) => l.ids.length)) * 90 + 80,
    );
  return (
    <div className="semester-scroll">
      <svg
        className="semester-timeline"
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: width }}
        role="group"
        aria-label="Proposed semester timeline with prerequisite connections"
      >
        <defs>
          <marker
            id="semester-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto"
          >
            <path d="M0 0 L7 3.5 L0 7" fill="var(--accent-secondary)" />
          </marker>
        </defs>
        {lanes.map((lane, i) => (
          <g key={lane.title}>
            <rect
              x={10 + i * 220}
              y="12"
              width="204"
              height={height - 24}
              rx="11"
              className="semester-lane-bg"
            />
            <text x={25 + i * 220} y="39" className="semester-label">
              {lane.title}
            </text>
          </g>
        ))}
        {items
          .filter((x) => !completed.includes(x.id) && positions.has(x.id))
          .flatMap((item) =>
            item.prerequisites
              .filter((id) => positions.has(id))
              .map((id) => {
                const from = positions.get(id)!,
                  to = positions.get(item.id)!;
                return (
                  <path
                    key={`${id}-${item.id}`}
                    d={`M ${from.x + 180} ${from.y + 25} C ${from.x + 203} ${from.y + 25},${to.x - 23} ${to.y + 25},${to.x} ${to.y + 25}`}
                    className="semester-edge"
                    markerEnd="url(#semester-arrow)"
                  />
                );
              }),
          )}
        {[...positions].map(([id, p]) => {
          const item = items.find((x) => x.id === id);
          if (!item) return null;
          return (
            <g
              className={
                completed.includes(id)
                  ? "semester-node completed"
                  : "semester-node"
              }
              key={id}
              role="button"
              tabIndex={0}
              aria-label={`Inspect ${item.name}`}
              onClick={() => onSelect(id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
            >
              <rect x={p.x} y={p.y} width="180" height="53" rx="8" />
              <text x={p.x + 10} y={p.y + 22}>
                {item.name.length > 24
                  ? item.name.slice(0, 22) + "…"
                  : item.name}
              </text>
              <text x={p.x + 10} y={p.y + 40} className="semester-node-status">
                {completed.includes(id) ? "Completed" : "Future course"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
