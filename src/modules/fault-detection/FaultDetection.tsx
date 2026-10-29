import { MathFormula } from "../../components/Math";
import { KarnaughMap } from "../../components/KarnaughMap";
import { MAX_EVENTS } from "../../lib/constants";
import { useLabState } from "../../lib/useLabState";
import { useCallback, useEffect, useRef, useState } from "react";
import { fault } from "../../lib/analysis";
import { BooleanCircuit } from "../../components/BooleanCircuit";
import { inputGate, gate } from "../../lib/circuit";
import {
  Demo,
  Check,
  Explanation,
  NumberInput,
  Panel,
} from "../../components/Lab";
import { generateTruthTable } from "../../lib/booleanLogic";
const normal = { temperature: 70, vibration: 5, cooling: false };
const sequence = [
  normal,
  { temperature: 80, vibration: 10, cooling: false },
  { temperature: 95, vibration: 12, cooling: false },
  { temperature: 95, vibration: 5, cooling: true },
  { temperature: 70, vibration: 5, cooling: true },
  normal,
];
const scenarios = [
  { name: "Normal", ...normal },
  { name: "Temperature only", ...normal, temperature: 95 },
  { name: "Vibration only", ...normal, vibration: 15 },
  { name: "Cooling only", ...normal, cooling: true },
  { name: "Combined faults", temperature: 95, vibration: 15, cooling: true },
];
export default function Fault() {
  const [s, set] = useLabState("machine", {
      temperature: 95,
      vibration: 12,
      cooling: true,
    }),
    [limits, setLimits] = useLabState("machine-limits", {
      temperature: 80,
      vibration: 10,
    }),
    [events, setEvents] = useLabState<string[]>("events", []),
    [running, setRunning] = useState(false),
    [frame, setFrame] = useState(0),
    [speed, setSpeed] = useState(1000);
  const { t, v, c, original, simplified } = fault(
    s.temperature,
    s.vibration,
    s.cooling,
    limits.temperature,
    limits.vibration,
  );
  const change = (next: typeof s, nextLimits = limits) => {
    const before = fault(
        s.temperature,
        s.vibration,
        s.cooling,
        limits.temperature,
        limits.vibration,
      ),
      after = fault(
        next.temperature,
        next.vibration,
        next.cooling,
        nextLimits.temperature,
        nextLimits.vibration,
      ),
      messages: string[] = [];
    if (before.t !== after.t)
      messages.push(
        `Temperature ${after.t ? "crossed above" : "returned to/below"} threshold`,
      );
    if (before.v !== after.v)
      messages.push(
        `Vibration ${after.v ? "crossed above" : "returned to/below"} threshold`,
      );
    if (before.c !== after.c)
      messages.push(`Cooling failure ${after.c ? "activated" : "cleared"}`);
    if (before.original !== after.original)
      messages.push(after.original ? "Fault triggered" : "Fault cleared");
    const validTransition =
      [
        s.temperature,
        s.vibration,
        limits.temperature,
        limits.vibration,
        next.temperature,
        next.vibration,
        nextLimits.temperature,
        nextLimits.vibration,
      ].every(Number.isFinite) &&
      s.vibration >= 0 &&
      next.vibration >= 0 &&
      limits.vibration >= 0 &&
      nextLimits.vibration >= 0;
    if (messages.length && validTransition)
      setEvents((previous) => [...previous, ...messages].slice(-MAX_EVENTS));
    set(next);
    setLimits(nextLimits);
  };
  const advanceRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    advanceRef.current = () => {
      change(sequence[frame]);
      if (frame === sequence.length - 1) {
        setFrame(0);
        setRunning(false);
      } else setFrame(frame + 1);
    };
  });
  const advance = useCallback(() => advanceRef.current(), []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(advance, speed);
    return () => clearTimeout(timer);
  }, [running, frame, speed, advance]);
  useEffect(() => {
    const listener = () => setRunning((value) => !value);
    window.addEventListener("lab:playback", listener);
    return () => window.removeEventListener("lab:playback", listener);
  }, []);
  const rows = generateTruthTable(["T", "V", "C"], (x) => ({
      original: Boolean((x.T && x.V) || (x.T && x.C)),
      simplified: Boolean(x.T && (x.V || x.C)),
    })),
    mismatches = rows.filter(
      (row) => row.result.original !== row.result.simplified,
    ).length;
  const valid =
      [s.temperature, s.vibration, limits.temperature, limits.vibration].every(
        Number.isFinite,
      ) &&
      s.vibration >= 0 &&
      limits.vibration >= 0,
    inputs = [inputGate("T", t), inputGate("V", v), inputGate("C", c)];
  return (
    <>
      <h1>Machine fault laboratory</h1>
      <p className="lede">
        Inject reproducible faults, inspect both circuits, and track actual
        state transitions.
      </p>
      <Demo
        onStart={() => {
          setRunning(false);
          change(normal, { temperature: 80, vibration: 10 });
          setEvents([]);
        }}
        steps={[
          "Normal readings produce no defined fault.",
          "Inject a temperature spike alone: T is true but both branches still fail.",
          "Simulate cooling failure to trigger TC. Set temperature to exactly 80 to clear it and inspect event history.",
        ]}
      />
      <div className="actions">
        <button
          onClick={() => {
            setRunning(false);
            setFrame(0);
            change(normal, { temperature: 80, vibration: 10 });
            setEvents([]);
          }}
        >
          Reset machine
        </button>
        <button
          onClick={() => change({ ...s, temperature: limits.temperature + 15 })}
        >
          Inject temperature spike
        </button>
        <button
          onClick={() => change({ ...s, vibration: limits.vibration + 5 })}
        >
          Inject excessive vibration
        </button>
        <button onClick={() => change({ ...s, cooling: true })}>
          Simulate cooling failure
        </button>
        <button onClick={() => change(normal)}>Normal readings</button>
      </div>
      <div className="lab-grid">
        <aside>
          <Panel title="Readings and thresholds">
            <NumberInput
              label="Machine temperature (°C)"
              value={s.temperature}
              min={-20}
              max={200}
              onChange={(temperature) => change({ ...s, temperature })}
            />
            <NumberInput
              label="Vibration (mm/s)"
              value={s.vibration}
              max={40}
              step={0.5}
              onChange={(vibration) => change({ ...s, vibration })}
            />
            <Check
              label="Cooling system failed"
              value={s.cooling}
              onChange={(cooling) => change({ ...s, cooling })}
            />
            <NumberInput
              label="Maximum normal temperature (°C)"
              value={limits.temperature}
              min={-20}
              max={200}
              onChange={(temperature) => change(s, { ...limits, temperature })}
            />
            <NumberInput
              label="Maximum normal vibration (mm/s)"
              value={limits.vibration}
              max={40}
              step={0.5}
              onChange={(vibration) => change(s, { ...limits, vibration })}
            />
            <div className="actions">
              <button disabled={!valid} onClick={() => setRunning(true)}>
                Start simulation
              </button>
              <button onClick={() => setRunning(false)}>
                Pause simulation
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setFrame(0);
                  change(normal);
                }}
              >
                Reset simulation
              </button>
            </div>
            <NumberInput
              label="Simulation interval (ms)"
              value={speed}
              min={250}
              max={5000}
              step={250}
              onChange={(value) =>
                setSpeed(Number.isFinite(value) ? Math.max(250, value) : 1000)
              }
            />
            <p>
              Replay: normal → boundaries → heat and vibration → heat and
              cooling → cooling only → normal. Frame {frame + 1}/
              {sequence.length}.
            </p>
          </Panel>
          <Panel title="Scenario comparison">
            {scenarios.map((scenario) => (
              <div className="scenario-row" key={scenario.name}>
                <button onClick={() => change(scenario)}>
                  {scenario.name}: {scenario.temperature}°C /{" "}
                  {scenario.vibration} mm/s / cooling{" "}
                  {scenario.cooling ? "failed" : "working"}
                </button>
                <span>
                  {fault(
                    scenario.temperature,
                    scenario.vibration,
                    scenario.cooling,
                    limits.temperature,
                    limits.vibration,
                  ).original
                    ? "Fault"
                    : "No defined fault"}
                </span>
              </div>
            ))}
          </Panel>
        </aside>
        <div className="stack">
          <Panel title="Live monitoring">
            {valid ? (
              <>
                <div
                  className={`banner ${original ? "failure" : "success"}`}
                  role="status"
                >
                  {original
                    ? "FAULT DETECTED"
                    : "NORMAL OPERATION — no defined fault condition active"}
                </div>
                {[
                  ["Temperature", s.temperature, limits.temperature, 200],
                  ["Vibration", s.vibration, limits.vibration, 40],
                ].map(([label, value, threshold, max]) => (
                  <div className="gauge" key={String(label)}>
                    <p>
                      {label}: {value}. Threshold &gt; {threshold}
                    </p>
                    <div className="gauge-track">
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, (Number(value) / Number(max)) * 100))}%`,
                        }}
                      />
                      <i
                        style={{
                          left: `${Math.min(100, Math.max(0, (Number(threshold) / Number(max)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <p>
                  {t && v ? "Temperature and vibration branch triggered. " : ""}
                  {t && c
                    ? "Temperature and cooling-failure branch triggered. "
                    : ""}
                  {!original
                    ? !t
                      ? "Temperature is false; both fault branches require T."
                      : "Vibration and cooling are false; neither branch passes."
                    : ""}
                </p>
                <BooleanCircuit
                  title="Original F = TV + TC · 3 gates"
                  gates={[
                    ...inputs,
                    gate("TV", "AND", ["T", "V"], t && v),
                    gate("TC", "AND", ["T", "C"], t && c),
                    gate("F", "OR", ["TV", "TC"], original),
                  ]}
                />
                <BooleanCircuit
                  title="Simplified F = T(V + C) · 2 gates"
                  gates={[
                    ...inputs,
                    gate("V+C", "OR", ["V", "C"], v || c),
                    gate("F", "AND", ["T", "V+C"], simplified),
                  ]}
                />
              </>
            ) : (
              <p role="alert" className="alert">
                Enter finite sensor readings and nonnegative vibration.
              </p>
            )}
          </Panel>
          <Explanation>
            <p>
              T = {s.temperature} &gt; {limits.temperature} = {Number(t)}; V ={" "}
              {s.vibration} &gt; {limits.vibration} = {Number(v)}; C ={" "}
              {Number(c)}.
            </p>
            <p>
              Original = ({Number(t)} ∧ {Number(v)}) ∨ ({Number(t)} ∧{" "}
              {Number(c)}) = {Number(original)}. Simplified = {Number(t)} ∧ (
              {Number(v)} ∨ {Number(c)}) = {Number(simplified)}.
            </p>
            <p>
              The distributive law factors T. Gate count drops from 3 to 2
              (33.3%) with two-input gates and shared input fan-out. Hardware
              energy and latency are not modeled.
            </p>
          </Explanation>
          <Panel title="Exhaustive equivalence">
            <MathFormula block expression="F=TV+TC=T(V+C)" />
            <KarnaughMap
              variables={["T", "V", "C"]}
              evaluate={(bits) => (bits[0] && bits[1]) || (bits[0] && bits[2])}
              current={[t, v, c]}
            />
            <p>
              {rows.length} combinations tested · {mismatches} mismatches ·{" "}
              {mismatches === 0
                ? "Equivalent for every input"
                : "Expressions differ"}
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>T</th>
                    <th>V</th>
                    <th>C</th>
                    <th>Original</th>
                    <th>Simplified</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        Boolean(row.values.T) === t &&
                        Boolean(row.values.V) === v &&
                        Boolean(row.values.C) === c
                          ? "highlight"
                          : ""
                      }
                    >
                      {Object.values(row.values).map((n, j) => (
                        <td key={j}>{n}</td>
                      ))}
                      <td>{Number(row.result.original)}</td>
                      <td>{Number(row.result.simplified)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
          <Panel title="Event history">
            <button onClick={() => setEvents([])}>Clear history</button>
            {events.length ? (
              <ol className="event-list">
                {events.map((event, i) => (
                  <li key={i}>{event}</li>
                ))}
              </ol>
            ) : (
              <p>No transitions recorded. Change a sensor or inject a fault.</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
