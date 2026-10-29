import { applicantSample as sample } from "../../lib/samples";
import { MathFormula } from "../../components/Math";
import { KarnaughMap } from "../../components/KarnaughMap";
import { useLabState } from "../../lib/useLabState";
import {
  applicantBits,
  scholarshipScenario,
  corrections,
  policyExpressions,
  policyNames,
  scholarship,
  type Policy,
} from "../../lib/analysis";
import { BooleanCircuit } from "../../components/BooleanCircuit";
import { inputGate, gate } from "../../lib/circuit";
import {
  Demo,
  Check,
  Explanation,
  NumberInput,
  Panel,
  TruthTable,
} from "../../components/Lab";
export default function Scholarship() {
  const [applicant, set] = useLabState("applicant", sample),
    [draft, setDraft] = useLabState<typeof sample | null>(
      "applicant-draft",
      null,
    ),
    [policy, setPolicy] = useLabState<Policy>("policy", "balanced"),
    [thresholds, setThresholds] = useLabState("scholarship-thresholds", {
      cgpa: 8.5,
      income: 300000,
      attendance: 75,
    });
  const state = draft ?? applicant,
    update = (next: Partial<typeof sample>) =>
      draft ? setDraft({ ...draft, ...next }) : set({ ...applicant, ...next });
  const getBits = (s: typeof sample) => applicantBits(s, thresholds);
  const bits = getBits(state),
    [a, b, c, d] = bits,
    output = scholarship(bits, policy),
    fixes = corrections(bits, policy),
    symbols = ["A", "B", "C", "D"];
  const valid =
    [
      state.cgpa,
      state.income,
      state.attendance,
      thresholds.cgpa,
      thresholds.income,
      thresholds.attendance,
    ].every(Number.isFinite) &&
    state.cgpa >= 0 &&
    state.cgpa <= 10 &&
    state.income >= 0 &&
    state.attendance >= 0 &&
    state.attendance <= 100 &&
    thresholds.cgpa >= 0 &&
    thresholds.cgpa <= 10 &&
    thresholds.income >= 0 &&
    thresholds.attendance >= 0 &&
    thresholds.attendance <= 100;
  const circuit =
    policy === "balanced"
      ? [
          ...symbols.map((id, i) => inputGate(id, bits[i])),
          gate("AB", "AND", ["A", "B"], a && b),
          gate("Pathway", "OR", ["AB", "D"], (a && b) || d),
          gate("Eligible", "AND", ["C", "Pathway"], output),
        ]
      : [
          inputGate("C", c),
          inputGate(policy === "merit" ? "A" : "B", policy === "merit" ? a : b),
          gate(
            "Eligible",
            "AND",
            ["C", policy === "merit" ? "A" : "B"],
            output,
          ),
        ];
  return (
    <>
      <h1>Scholarship policy laboratory</h1>
      <p className="lede">
        Explore hypothetical eligibility rules, qualifying pathways, and exact
        threshold boundaries.
      </p>
      <Demo
        onStart={() => {
          set(sample);
          setDraft(null);
          setPolicy("balanced");
          setThresholds({ cgpa: 8.5, income: 300000, attendance: 75 });
        }}
        steps={[
          "The example misses CGPA by 0.1; inspect the minimal correction sets.",
          "Click CGPA at threshold. Eligibility becomes true at 8.5.",
          "Compare an applicant with 74% attendance. Both qualifying pathways remain blocked by C. Discard the comparison.",
        ]}
      />
      <div className="actions">
        <button
          onClick={() => {
            set(sample);
            setDraft(null);
            setThresholds({ cgpa: 8.5, income: 300000, attendance: 75 });
            setPolicy("balanced");
          }}
        >
          Reset scholarship
        </button>
        <button onClick={() => setDraft({ ...applicant })}>
          Compare applicant
        </button>
        {draft && (
          <>
            <button
              onClick={() => {
                set(draft);
                setDraft(null);
              }}
            >
              Apply applicant
            </button>
            <button onClick={() => setDraft(null)}>Discard applicant</button>
          </>
        )}
        <button onClick={() => update({ cgpa: thresholds.cgpa })}>
          CGPA at threshold
        </button>
        <button
          onClick={() => update({ cgpa: Math.max(0, thresholds.cgpa - 0.1) })}
        >
          CGPA below threshold
        </button>
        <button onClick={() => update({ attendance: thresholds.attendance })}>
          Attendance at threshold
        </button>
        <button
          onClick={() =>
            update({ attendance: Math.max(0, thresholds.attendance - 1) })
          }
        >
          Attendance below threshold
        </button>
        <button onClick={() => update({ income: thresholds.income + 1 })}>
          Income above threshold
        </button>
      </div>
      <div className="lab-grid">
        <aside>
          <Panel title={draft ? "Alternative applicant" : "Applicant inputs"}>
            <NumberInput
              label="CGPA"
              value={state.cgpa}
              min={0}
              max={10}
              step={0.1}
              onChange={(cgpa) => update({ cgpa })}
            />
            <NumberInput
              label="Annual family income (₹)"
              value={state.income}
              max={10000000}
              onChange={(income) => update({ income })}
            />
            <NumberInput
              label="Attendance (%)"
              value={state.attendance}
              onChange={(attendance) => update({ attendance })}
            />
            <Check
              label="Recognized achievement"
              value={state.achievement}
              onChange={(achievement) => update({ achievement })}
            />
          </Panel>
          <Panel title="Demonstration policy">
            <label className="field-label">
              Policy
              <select
                value={policy}
                onChange={(e) => setPolicy(e.target.value as Policy)}
              >
                {Object.entries(policyNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <NumberInput
              label="Minimum CGPA"
              value={thresholds.cgpa}
              max={10}
              step={0.1}
              onChange={(cgpa) => setThresholds({ ...thresholds, cgpa })}
            />
            <NumberInput
              label="Maximum income (₹)"
              value={thresholds.income}
              max={10000000}
              onChange={(income) => setThresholds({ ...thresholds, income })}
            />
            <NumberInput
              label="Minimum attendance (%)"
              value={thresholds.attendance}
              onChange={(attendance) =>
                setThresholds({ ...thresholds, attendance })
              }
            />
          </Panel>
        </aside>
        <div className="stack">
          <Panel title="Decision pathways">
            {!valid ? (
              <p className="alert" role="alert">
                Enter finite, valid ranges: CGPA 0–10, attendance 0–100%, and
                nonnegative income.
              </p>
            ) : (
              <>
                <div
                  className={`banner ${output ? "success" : "failure"}`}
                  role="status"
                >
                  {output
                    ? "Eligible under demonstration policy"
                    : "Not eligible under demonstration policy"}
                </div>
                <MathFormula
                  block
                  expression={
                    policy === "balanced"
                      ? String.raw`E=C\land((A\land B)\lor D)`
                      : policy === "merit"
                        ? String.raw`E=C\land A`
                        : String.raw`E=C\land B`
                  }
                />
                <BooleanCircuit title="Active policy circuit" gates={circuit} />
                <div className="condition-list">
                  {[
                    `A: CGPA ${state.cgpa} ≥ ${thresholds.cgpa}`,
                    `B: Income ₹${state.income.toLocaleString("en-IN")} ≤ ₹${thresholds.income.toLocaleString("en-IN")}`,
                    `C: Attendance ${state.attendance}% ≥ ${thresholds.attendance}%`,
                    "D: Recognized achievement",
                  ].map((label, i) => (
                    <div key={label}>
                      {label}
                      <b>{bits[i] ? "PASS" : "FAIL"}</b>
                    </div>
                  ))}
                </div>
                {draft && (
                  <div className="comparison">
                    Original result{" "}
                    {Number(scholarship(getBits(applicant), policy))} →
                    alternative {Number(output)}. Criteria:{" "}
                    {symbols
                      .map(
                        (s, i) =>
                          `${s}: ${Number(getBits(applicant)[i])} → ${Number(bits[i])}`,
                      )
                      .join("; ")}
                    .
                  </div>
                )}
              </>
            )}
          </Panel>
          <Panel title="Sensitivity and policy comparison">
            {valid && (
              <>
                <p>
                  Failed conditions:{" "}
                  {symbols.filter((_, i) => !bits[i]).join(", ") || "None"}.
                </p>
                <p>
                  Conditions whose single flip changes the result:{" "}
                  {symbols
                    .filter(
                      (_, i) =>
                        scholarship(
                          bits.map((x, j) => (i === j ? !x : x)),
                          policy,
                        ) !== output,
                    )
                    .join(", ") || "None"}
                  .
                </p>
                <p>
                  Minimal sets of failed conditions to correct:{" "}
                  {fixes
                    .map((set) => set.map((i) => symbols[i]).join(" + "))
                    .join(" OR ") ||
                    (output ? "Already eligible" : "No correction set")}
                  .
                </p>
                {Object.entries(policyNames).map(([id, name]) => (
                  <p key={id}>
                    {name}:{" "}
                    {scholarship(bits, id as Policy)
                      ? "eligible"
                      : "not eligible"}{" "}
                    · {policyExpressions[id as Policy]}
                  </p>
                ))}
              </>
            )}
          </Panel>
          <Explanation>
            <p>
              Attendance {c ? "passes" : "fails"}. The academic and financial
              branch {a && b ? "passes" : "fails"} (A={Number(a)}, B={Number(b)}
              ); the achievement branch {d ? "passes" : "fails"}. In the default
              rule, C is mandatory and either qualifying branch suffices.
            </p>
            <p>
              These policies are illustrative academic rules. Truth-table
              inspection changes no applicant values.
            </p>
          </Explanation>
          <KarnaughMap
            onApply={(chosen) =>
              update(scholarshipScenario(chosen, thresholds))
            }
            variables={symbols}
            evaluate={(x) => scholarship(x, policy)}
            current={bits}
          />
          <TruthTable
            variables={symbols}
            evaluate={(x) => scholarship(x, policy)}
            current={bits}
          />
        </div>
      </div>
    </>
  );
}
