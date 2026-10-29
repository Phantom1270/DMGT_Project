import { useState } from "react";
export function LatticeExperiment({ a, b, onAChange, onBChange }: {
  a: boolean; b: boolean; onAChange: (next: boolean) => void; onBChange: (next: boolean) => void;
}) {
  const [pointer, setPointer] = useState(false);
  return (
    <figure className={`atlas-lattice ${pointer ? "atlas-input-pointer" : ""}`}>
      <figcaption>Boolean lattice B₂ <span>Try the inputs</span></figcaption>
      <div className="lattice-controls" onPointerDown={() => setPointer(true)} onKeyDown={() => setPointer(false)}>
        <div className="atlas-inputs">
          <button aria-pressed={a} onClick={() => onAChange(!a)}>a = {Number(a)}</button>
          <button aria-pressed={b} onClick={() => onBChange(!b)}>b = {Number(b)}</button>
        </div>
        <span aria-live="polite" aria-atomic="true">a ∧ b = {Number(a && b)}<br />a ∨ b = {Number(a || b)}</span>
      </div>
      <svg className="atlas-lattice-svg" viewBox="45 0 330 260" role="img" aria-label="Four-element subset lattice. Meet is intersection and join is union.">
        <path d="M210 30 L85 130 L210 230 L335 130 Z" className="atlas-lattice-edges" />
        {[
          { x: 210, y: 30, label: "{a, b}", active: a && b },
          { x: 85, y: 130, label: "{a}", active: a && !b },
          { x: 335, y: 130, label: "{b}", active: !a && b },
          { x: 210, y: 230, label: "∅", active: !a && !b },
        ].map((node) => <g key={node.label} className={`lattice-point ${node.active ? "active" : ""}`}>
          <circle className="atlas-state-base" cx={node.x} cy={node.y} r="29" />
          <circle className="atlas-state-wash" cx={node.x} cy={node.y} r="29" />
          <text x={node.x} y={node.y + 6} textAnchor="middle">{node.label}</text>
        </g>)}
      </svg>
    </figure>
  );
}
