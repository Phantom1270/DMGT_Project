import { useState } from "react";
import { MathFormula } from "./Math";
export function KarnaughMap({
  variables,
  evaluate,
  current,
  onApply,
}: {
  variables: string[];
  evaluate: (bits: boolean[]) => boolean;
  current: boolean[];
  onApply?: (bits: boolean[]) => void;
}) {
  const [selected, setSelected] = useState<boolean[] | null>(null),
    gray = [0, 1, 3, 2],
    four = variables.length === 4,
    rowCount = four ? 4 : 2;
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  return (
    <section className="kmap">
      <h3>Karnaugh map · Gray-code order</h3>
      <p>
        Adjacent cells differ by one bit, including wraparound edges. Select a
        cell to inspect its combination without changing the inputs.
      </p>
      <div className="kmap-grid">
        <span className="axis">
          {four ? variables.slice(0, 2).join("") : variables[0]} /{" "}
          {variables.slice(four ? 2 : 1).join("")}
        </span>
        {gray.map((n) => (
          <span className="axis" key={n}>
            {n.toString(2).padStart(2, "0")}
          </span>
        ))}
        {Array.from({ length: rowCount }, (_, row) => {
          const rowValue = four ? gray[row] : row;
          return [
            <span className="axis" key={`row-${row}`}>
              {rowValue.toString(2).padStart(four ? 2 : 1, "0")}
            </span>,
            ...gray.map((col) => {
              const bits = four
                ? [
                    Boolean(rowValue & 2),
                    Boolean(rowValue & 1),
                    Boolean(col & 2),
                    Boolean(col & 1),
                  ]
                : [Boolean(rowValue), Boolean(col & 2), Boolean(col & 1)];
              const value = evaluate(bits);
              return (
                <button
                  className={`${value ? "true" : ""} ${bits.every((b, i) => b === current[i]) ? "current" : ""}`}
                  key={`${row}-${col}`}
                  aria-label={`${variables.map((v, i) => `${v}=${Number(bits[i])}`).join(", ")}, output ${Number(value)}`}
                  onClick={() => {
                    setSelected(bits);
                    setNotice(null);
                  }}
                >
                  {Number(value)}
                </button>
              );
            }),
          ];
        })}
      </div>
      {selected && (
        <div className="kmap-inspection">
          <p aria-live="polite">
            {variables.map((v, i) => `${v}=${Number(selected[i])}`).join(", ")}{" "}
            → output {Number(evaluate(selected))}
          </p>
          {onApply && (
            <button
              onClick={() => {
                try {
                  onApply(selected);
                  setNotice({
                    text: "Combination applied. Inputs, gates and results now reflect the selected cell.",
                    error: false,
                  });
                } catch (error) {
                  setNotice({
                    text:
                      error instanceof Error
                        ? error.message
                        : "This combination could not be applied.",
                    error: true,
                  });
                }
              }}
            >
              Apply combination to scenario
            </button>
          )}
          {notice && (
            <p
              role={notice.error ? "alert" : "status"}
              className={notice.error ? "alert" : ""}
            >
              {notice.text}
            </p>
          )}
        </div>
      )}
      {variables.length === 3 && (
        <p>
          <MathFormula expression="TV+TC=T(V+C)" />: the T=1 row contains the
          two adjacent pairs TV and TC; their overlap is the 111 cell. A K-map
          shows equivalence without inventing a new fault rule.
        </p>
      )}
    </section>
  );
}
