import { useLabState } from "../lib/useLabState";
import { useState } from "react";
import { home } from "../lib/analysis";
import { BooleanCircuit } from "../components/BooleanCircuit";
import { inputGate, gate } from "../lib/circuit";
import {
  Demo,
  Check,
  Explanation,
  NumberInput,
  Panel,
  Playback,
  TruthTable,
} from "../components/Lab";
const sample = {
  brightness: 20,
  temperature: 30,
  darkness: 30,
  hot: 28,
  p: true,
  m: false,
  s: false,
  o: false,
};
const presets = [
  {
    name: "Empty daytime",
    brightness: 80,
    temperature: 24,
    p: false,
    m: false,
    s: false,
    o: false,
  },
  {
    name: "Occupied night",
    brightness: 20,
    temperature: 24,
    p: true,
    m: false,
    s: false,
    o: false,
  },
  {
    name: "Hot afternoon",
    brightness: 80,
    temperature: 34,
    p: true,
    m: false,
    s: false,
    o: false,
  },
  {
    name: "Security breach",
    brightness: 20,
    temperature: 24,
    p: false,
    m: false,
    s: true,
    o: true,
  },
  {
    name: "Manual override",
    brightness: 80,
    temperature: 24,
    p: false,
    m: true,
    s: false,
    o: false,
  },
];
export default function SmartHome() {
  const [state, set] = useLabState("home", sample),
    [device, setDevice] = useState("light");
  const update = (next: Partial<typeof sample>) => set({ ...state, ...next }),
    d = state.brightness < state.darkness,
    h = state.temperature >= state.hot;
  const output = home(state.p, d, state.m, h, state.s, state.o),
    valid =
      Object.values(state).every(
        (v) => typeof v !== "number" || Number.isFinite(v),
      ) &&
      state.brightness >= 0 &&
      state.brightness <= 100 &&
      state.darkness >= 0 &&
      state.darkness <= 100;
  const variables =
    device === "light"
      ? ["P", "D", "M"]
      : device === "ac"
        ? ["P", "H"]
        : ["S", "O"];
  const bits =
    device === "light"
      ? [state.p, d, state.m]
      : device === "ac"
        ? [state.p, h]
        : [state.s, state.o];
  const evaluate = (x: boolean[]) =>
    device === "light" ? (x[0] && x[1]) || x[2] : x[0] && x[1];
  const apply = (x: boolean[]) => {
    if (device === "light")
      update({
        p: x[0],
        brightness: x[1] ? Math.max(0, state.darkness - 1) : state.darkness,
        m: x[2],
        darkness: x[1] && state.darkness === 0 ? 1 : state.darkness,
      });
    else if (device === "ac")
      update({ p: x[0], temperature: x[1] ? state.hot : state.hot - 1 });
    else update({ s: x[0], o: x[1] });
  };
  return (
    <>
      <h1>Smart home automation</h1>
      <p className="lede">
        Translate numeric sensors into Boolean conditions, then follow each
        decision through its gates.
      </p>
      <Demo
        onStart={() => set(sample)}
        steps={[
          "Inspect the light and AC outputs for an occupied dark room.",
          "Load Empty daytime, then Manual override. The light turns on even in daylight.",
          "Inspect the light OR gate, then apply a truth-table row. Numeric sensors update to match it.",
        ]}
      />
      <div className="actions">
        <button onClick={() => set(sample)}>Reset home</button>
        {presets.map((p) => (
          <button key={p.name} onClick={() => update(p)}>
            {p.name}
          </button>
        ))}
      </div>
      <div className="lab-grid">
        <aside>
          <Panel title="Sensors and thresholds">
            <NumberInput
              label="Ambient brightness (%)"
              value={state.brightness}
              onChange={(brightness) => update({ brightness })}
            />
            <NumberInput
              label="Darkness threshold (%)"
              value={state.darkness}
              onChange={(darkness) => update({ darkness })}
            />
            <NumberInput
              label="Room temperature (°C)"
              value={state.temperature}
              min={-10}
              max={50}
              onChange={(temperature) => update({ temperature })}
            />
            <NumberInput
              label="High temperature threshold (°C)"
              value={state.hot}
              min={-10}
              max={50}
              onChange={(hot) => update({ hot })}
            />
            {(
              [
                ["p", "Room occupied"],
                ["m", "Manual light override"],
                ["s", "Security armed"],
                ["o", "Door opened"],
              ] as const
            ).map(([key, label]) => (
              <Check
                key={key}
                label={label}
                value={state[key]}
                onChange={(value) => update({ [key]: value })}
              />
            ))}
            <Playback
              label="Play daily scenario"
              length={4}
              onFrame={(i) =>
                update(
                  [
                    { ...presets[0] },
                    { ...presets[0], p: true },
                    { ...presets[1] },
                    { ...presets[2], brightness: 20 },
                  ][i],
                )
              }
            />
          </Panel>
        </aside>
        <div className="stack">
          <Panel title="Live home decisions">
            {!valid ? (
              <p role="alert">
                Enter finite readings and brightness thresholds between 0 and
                100.
              </p>
            ) : (
              <>
                {Object.entries(output).map(([name, on]) => (
                  <div className={`device ${on ? "active" : ""}`} key={name}>
                    <b>
                      {name === "ac"
                        ? "Air conditioner"
                        : name === "light"
                          ? "Room light"
                          : "Security alarm"}
                    </b>
                    <strong>{on ? "ON" : "OFF"}</strong>
                  </div>
                ))}
                <BooleanCircuit
                  title="Light = PD + M"
                  gates={[
                    inputGate("P", state.p),
                    inputGate("D", d),
                    inputGate("M", state.m),
                    gate("PD", "AND", ["P", "D"], state.p && d),
                    gate("Light", "OR", ["PD", "M"], output.light),
                  ]}
                />
                <BooleanCircuit
                  title="AC = PH"
                  gates={[
                    inputGate("P", state.p),
                    inputGate("H", h),
                    gate("AC", "AND", ["P", "H"], output.ac),
                  ]}
                />
                <BooleanCircuit
                  title="Alarm = SO"
                  gates={[
                    inputGate("S", state.s),
                    inputGate("O", state.o),
                    gate("Alarm", "AND", ["S", "O"], output.alarm),
                  ]}
                />
              </>
            )}
          </Panel>
          <Explanation>
            <ol>
              <li>
                Brightness {state.brightness}% &lt; {state.darkness}% gives D=
                {Number(d)}.
              </li>
              <li>
                Temperature {state.temperature}°C ≥ {state.hot}°C gives H=
                {Number(h)}.
              </li>
              <li>
                Light = ({Number(state.p)} ∧ {Number(d)}) ∨ {Number(state.m)} ={" "}
                {Number(output.light)}.
              </li>
              <li>
                AC = {Number(state.p)} ∧ {Number(h)} = {Number(output.ac)};
                Alarm = {Number(state.s)} ∧ {Number(state.o)} ={" "}
                {Number(output.alarm)}.
              </li>
            </ol>
            <p>
              Alternative rule D(P + M) differs from PD + M when D=0 and M=1.
              Manual override in the default rule works even in daylight.
            </p>
          </Explanation>
          <Panel title="Apply a Boolean experiment">
            <label className="field-label">
              Device
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="ac">AC</option>
                <option value="alarm">Alarm</option>
              </select>
            </label>
            <TruthTable
              variables={variables}
              evaluate={evaluate}
              current={bits}
              onApply={apply}
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
