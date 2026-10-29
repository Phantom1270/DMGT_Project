import { useReducedMotionPreference } from "../lib/useReducedMotionPreference";
import { useState } from "react";
import type { Gate } from "../lib/circuit";
export function BooleanCircuit({
  gates,
  title,
}: {
  gates: Gate[];
  title: string;
}) {
  const reduced = useReducedMotionPreference();
  const [selected, setSelected] = useState<string | null>(null);
  const levels: Record<string, number> = {};
  for (const gate of gates)
    levels[gate.id] = gate.sources.length
      ? 1 + Math.max(...gate.sources.map((id) => levels[id]))
      : 0;
  const depth = Math.max(0, ...Object.values(levels)),
    counts: Record<number, number> = {};
  const positions = Object.fromEntries(
    gates.map((g) => {
      const level = levels[g.id],
        row = counts[level] ?? 0;
      counts[level] = row + 1;
      return [g.id, { x: 25 + level * 170, y: 30 + row * 80 }];
    }),
  );
  const current = gates.find((g) => g.id === selected);
  return (
    <div className="circuit">
      <h3>{title}</h3>
      <div className="circuit-scroll">
        <svg
          viewBox={`0 0 ${220 + depth * 170} ${45 + Math.max(...Object.values(counts)) * 80}`}
          role="group"
          aria-label={`${title}. ${gates.map((g) => `${g.label}: ${Number(g.value)}`).join("; ")}`}
        >
          {gates.flatMap((g) =>
            g.sources.map((source) => {
              const from = positions[source],
                to = positions[g.id],
                active = gates.find((n) => n.id === source)!.value;
              return (
                <g key={`${source}-${g.id}`}>
                  <path
                    className={`wire ${active ? "active" : ""}`}
                    key={`${source}-${g.id}`}
                    d={`M ${from.x + 125} ${from.y + 24} H ${to.x - 20} V ${to.y + 24} H ${to.x}`}
                    fill="none"
                    stroke={active ? "var(--accent-primary)" : "var(--border)"}
                    strokeWidth="2"
                  />
                  {active && !reduced && (
                    <circle
                      className="signal-dot"
                      r="2.6"
                      key={`${source}-${g.id}-${Number(g.value)}`}
                    >
                      <animateMotion
                        dur="1.5s"
                        repeatCount="2"
                        path={`M ${from.x + 125} ${from.y + 24} H ${to.x - 20} V ${to.y + 24} H ${to.x}`}
                      />
                    </circle>
                  )}
                </g>
              );
            }),
          )}
          {gates.map((g) => {
            const p = positions[g.id];
            return (
              <g
                key={g.id}
                className={`gate ${g.value ? "active" : ""}`}
                transform={`translate(${p.x},${p.y})`}
                role={g.kind === "input" ? undefined : "button"}
                tabIndex={g.kind === "input" ? undefined : 0}
                onClick={() => {
                  if (g.kind !== "input") setSelected(g.id);
                }}
                onKeyDown={(e) => {
                  if (
                    g.kind !== "input" &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    e.preventDefault();
                    setSelected(g.id);
                  }
                }}
                style={{ cursor: g.kind === "input" ? "default" : "pointer" }}
              >
                <rect
                  width="125"
                  height="48"
                  rx="8"
                  fill={
                    g.value
                      ? "color-mix(in srgb, var(--accent-primary) 18%, var(--bg-secondary))"
                      : "var(--bg-secondary)"
                  }
                  stroke={g.value ? "var(--accent-primary)" : "var(--border)"}
                />
                <text x="62" y="20" textAnchor="middle">
                  {g.label}
                </text>
                <text x="62" y="37" textAnchor="middle">
                  {g.kind === "input"
                    ? "Input"
                    : g.kind === "AND"
                      ? "∧ AND"
                      : "∨ OR"}{" "}
                  = {Number(g.value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="actions">
        {gates
          .filter((g) => g.kind !== "input")
          .map((g) => (
            <button key={g.id} onClick={() => setSelected(g.id)}>
              Explain {g.label}
            </button>
          ))}
      </div>
      {current && (
        <p role="status">
          {current.kind} gate:{" "}
          {current.sources
            .map((id) => Number(gates.find((g) => g.id === id)!.value))
            .join(` ${current.kind} `)}{" "}
          = {Number(current.value)}.{" "}
          {current.kind === "AND"
            ? "Every input must be true."
            : "At least one input must be true."}
        </p>
      )}
    </div>
  );
}
