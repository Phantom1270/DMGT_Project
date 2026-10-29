import { useRef } from "react";
import { useEffect, useState, type ReactNode } from "react";
export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="number-field">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) =>
          onChange(e.target.value === "" ? NaN : Number(e.target.value))
        }
      />
    </label>
  );
}
export function Check({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="check-field">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
export function Explanation({ children }: { children: ReactNode }) {
  return (
    <details className="explanation" open>
      <summary>How the Mathematics Works</summary>
      {children}
    </details>
  );
}
export function Demo({
  steps,
  onStart,
}: {
  steps: string[];
  onStart: () => void;
}) {
  const [step, setStep] = useState<number | null>(null);
  useEffect(() => {
    if (step === null) return;
    const targets: Record<string, string[]> = {
      tasks: [".graph-wrap", ".editor", ".stats"],
      courses: [
        ".lab-grid aside .panel:nth-child(2)",
        ".lab-grid aside .panel:nth-child(2)",
        ".semester-scroll",
      ],
      home: [".device", ".actions", ".circuit"],
      scholarship: [
        ".condition-list",
        ".number-field",
        ".comparison,.condition-list",
      ],
      fault: [".gauge", ".gauge", ".circuit"],
    };
    const selector = targets[location.pathname.slice(1)]?.[step];
    const target = selector ? document.querySelector(selector) : null;
    target?.classList.add("demo-target");
    return () => target?.classList.remove("demo-target");
  }, [step]);
  return (
    <div className="demo">
      <button
        onClick={() => {
          onStart();
          setStep(0);
        }}
      >
        Start demo
      </button>
      {step !== null && (
        <>
          <p role="status">
            Step {step + 1}/{steps.length}: {steps[step]}
          </p>
          <div className="actions">
            <button disabled={step === 0} onClick={() => setStep(step - 1)}>
              Previous demo step
            </button>
            <button
              disabled={step === steps.length - 1}
              onClick={() => setStep(step + 1)}
            >
              Next demo step
            </button>
            <button onClick={() => setStep(null)}>Close demo</button>
          </div>
        </>
      )}
    </div>
  );
}
export function TruthTable({
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
  const [inspect, setInspect] = useState<number | null>(null);
  return (
    <details className="truth">
      <summary>
        Explore truth table ({2 ** variables.length} combinations)
      </summary>
      <div className="table-scroll">
        <table aria-label="Boolean truth table">
          <caption>
            Computed values; the highlighted row matches current inputs.
          </caption>
          <thead>
            <tr>
              {variables.map((v) => (
                <th key={v}>{v}</th>
              ))}
              <th>Output</th>
              <th>Explore</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 2 ** variables.length }, (_, row) => {
              const bits = variables.map((_, i) =>
                Boolean(row & (1 << (variables.length - i - 1))),
              );
              return (
                <tr
                  key={row}
                  className={
                    bits.every((b, i) => b === current[i]) ? "highlight" : ""
                  }
                >
                  {bits.map((b, i) => (
                    <td key={i}>
                      <span className={`bit ${b ? "true" : "false"}`}>
                        {Number(b)}
                      </span>
                    </td>
                  ))}
                  <td>
                    <span
                      className={`bit ${evaluate(bits) ? "true" : "false"}`}
                    >
                      {Number(evaluate(bits))}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => setInspect(row)}>
                      Inspect row {row + 1}
                    </button>
                    {onApply && (
                      <button onClick={() => onApply(bits)}>
                        Apply row {row + 1}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {inspect !== null && (
        <p aria-live="polite">
          Inspected row {inspect + 1}:{" "}
          {variables
            .map(
              (v, i) =>
                `${v}=${Number(Boolean(inspect & (1 << (variables.length - i - 1))))}`,
            )
            .join(", ")}
          . Result ={" "}
          {Number(
            evaluate(
              variables.map((_, i) =>
                Boolean(inspect & (1 << (variables.length - i - 1))),
              ),
            ),
          )}
          . Inspection leaves numeric inputs unchanged.
        </p>
      )}
    </details>
  );
}
export function Playback({
  length,
  onFrame,
  label = "Play",
  speed = 1200,
}: {
  length: number;
  onFrame: (index: number) => void;
  label?: string;
  speed?: number;
}) {
  const [index, setIndex] = useState(-1),
    [playing, setPlaying] = useState(false);
  const frameRef = useRef(onFrame);
  useEffect(() => {
    frameRef.current = onFrame;
  }, [onFrame]);
  useEffect(() => {
    const listener = () => setPlaying((value) => !value);
    window.addEventListener("lab:playback", listener);
    return () => window.removeEventListener("lab:playback", listener);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      const next = index + 1;
      if (next >= length) {
        setPlaying(false);
        return;
      }
      setIndex(next);
      frameRef.current(next);
    }, speed);
    return () => clearTimeout(timer);
  }, [playing, index, length, speed]);
  return (
    <div className="actions">
      <button
        onClick={() => {
          setIndex(-1);
          setPlaying(true);
        }}
      >
        {label}
      </button>
      <button onClick={() => setPlaying(false)}>Pause</button>
      <button
        onClick={() => {
          setPlaying(false);
          setIndex(-1);
          onFrame(0);
        }}
      >
        Reset playback
      </button>
      <span>{index < 0 ? "Ready" : `Step ${index + 1} / ${length}`}</span>
    </div>
  );
}
