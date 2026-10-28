import { useLabState } from "../lib/useLabState";
import { useState } from "react";
import {
  criticalPath,
  semesterPlan,
  validate,
  type Work,
} from "../lib/analysis";
import {
  getAllPrerequisites,
  getReadyNodes,
  topologicalSort,
} from "../lib/graphAlgorithms";
import { DependencyGraph } from "../components/DependencyGraph";
import {
  Demo,
  Check,
  Explanation,
  NumberInput,
  Panel,
  Playback,
} from "../components/Lab";
const work = (
  id: string,
  name: string,
  prerequisites: string[] = [],
): Work => ({ id, name, prerequisites, duration: 1, completed: false });
const taskSample = [
  work("t1", "Design database"),
  work("t2", "Build backend", ["t1"]),
  work("t3", "Build frontend"),
  work("t4", "Integrate API", ["t2", "t3"]),
  work("t5", "Deploy website", ["t4"]),
];
const courseSample = [
  work("p", "Programming"),
  work("d", "Discrete Mathematics"),
  work("s", "Data Structures", ["p"]),
  work("a", "Algorithms", ["s", "d"]),
  work("m", "Machine Learning", ["a"]),
  work("l", "Deep Learning", ["m"]),
];
function Editor({
  items,
  onChange,
  selected,
  onSelect,
  durations,
}: {
  items: Work[];
  onChange: (items: Work[]) => void;
  selected: string;
  onSelect: (id: string) => void;
  durations: boolean;
}) {
  const [name, setName] = useState(""),
    [error, setError] = useState("");
  const current = items.find((x) => x.id === selected);
  const update = (changes: Partial<Work>) =>
    onChange(items.map((x) => (x.id === selected ? { ...x, ...changes } : x)));
  return (
    <>
      <label className="field-label">
        Select item
        <select
          aria-label="Select item"
          value={current?.id ?? ""}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">Choose an item</option>
          {items.map((x) => (
            <option value={x.id} key={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      {current && (
        <div className="editor">
          <label className="field-label">
            Name
            <input
              value={current.name}
              maxLength={80}
              onChange={(e) => update({ name: e.target.value })}
            />
          </label>
          {durations && (
            <NumberInput
              label="Duration (units)"
              value={current.duration}
              min={0.1}
              max={1000}
              step={0.5}
              onChange={(duration) => update({ duration })}
            />
          )}
          <Check
            label="Completed"
            value={current.completed}
            onChange={(completed) => update({ completed })}
          />
          <fieldset>
            <legend>Prerequisites</legend>
            {items
              .filter((x) => x.id !== selected)
              .map((x) => (
                <Check
                  key={x.id}
                  label={x.name}
                  value={current.prerequisites.includes(x.id)}
                  onChange={(checked) =>
                    update({
                      prerequisites: checked
                        ? [...current.prerequisites, x.id]
                        : current.prerequisites.filter((id) => id !== x.id),
                    })
                  }
                />
              ))}
          </fieldset>
          <button
            onClick={() => {
              onChange(
                items
                  .filter((x) => x.id !== selected)
                  .map((x) => ({
                    ...x,
                    prerequisites: x.prerequisites.filter(
                      (id) => id !== selected,
                    ),
                  })),
              );
              onSelect(items.find((x) => x.id !== selected)?.id ?? "");
            }}
          >
            Delete selected item
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) {
            setError("Enter a name before adding an item.");
            return;
          }
          if (items.length >= 20) {
            setError("This classroom lab supports up to 20 items.");
            return;
          }
          const id = crypto.randomUUID();
          onChange([...items, work(id, name.trim())]);
          onSelect(id);
          setName("");
          setError("");
        }}
      >
        <label className="field-label">
          New item name
          <input
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button>Add item</button>
        {error && <p role="alert">{error}</p>}
      </form>
    </>
  );
}
function useProject(key: string, sample: Work[]) {
  const [items, setItems] = useLabState(key, sample),
    [past, setPast] = useLabState<Work[][]>(key + "-past", []),
    [future, setFuture] = useLabState<Work[][]>(key + "-future", []);
  const edit = (next: Work[]) => {
    setPast([...past.slice(-39), items]);
    setFuture([]);
    setItems(next);
  };
  const undo = () => {
    if (!past.length) return;
    setFuture([items, ...future]);
    setItems(past[past.length - 1]);
    setPast(past.slice(0, -1));
  };
  const redo = () => {
    if (!future.length) return;
    setPast([...past, items]);
    setItems(future[0]);
    setFuture(future.slice(1));
  };
  return { items, edit, undo, redo, past, future };
}
export function TaskPlanner() {
  const { items, edit, undo, redo, past, future } = useProject(
    "tasks",
    taskSample,
  );
  const [selected, setSelected] = useState(items[0]?.id ?? ""),
    [baseline, setBaseline] = useLabState<Work[] | null>("task-baseline", null),
    [step, setStep] = useState(0);
  const errors = validate(items),
    analysis = criticalPath(items),
    base = baseline ? criticalPath(baseline) : null;
  const done = items.filter((x) => x.completed).map((x) => x.id),
    ready = getReadyNodes(items, done);
  const order = analysis ? topologicalSort(items)! : [],
    processed = order.slice(0, Math.min(step, order.length));
  const names = (ids: string[]) =>
    ids.map((id) => items.find((x) => x.id === id)?.name ?? id).join(", ") ||
    "None";
  const current = items.find((x) => x.id === selected),
    ancestors = getAllPrerequisites(items, selected),
    downstream = items.filter((x) =>
      getAllPrerequisites(items, x.id).includes(selected),
    );
  const change = (next: Work[]) => {
    edit(next);
    setStep(0);
  };
  return (
    <>
      <h1>Task dependency analysis</h1>
      <p className="lede">
        Build a project, trace its constraints, and explore the effect of
        durations.
      </p>
      <Demo
        onStart={() => {
          change(taskSample);
          setSelected("t1");
          setStep(0);
          setBaseline(null);
        }}
        steps={[
          "Inspect four stages and the four-unit critical path.",
          "Select Build backend, start what-if, and change its duration from 1 to 3.",
          "Observe project duration increase to 6; discard the scenario and step through topological sorting.",
        ]}
      />
      <div className="actions">
        <button
          onClick={() => {
            change(taskSample);
            setSelected("t1");
            setBaseline(null);
          }}
        >
          Reset example
        </button>
        <button
          onClick={() => {
            change(
              taskSample.map((x) =>
                x.id === "t1" ? { ...x, prerequisites: ["t5"] } : x,
              ),
            );
            setSelected("t1");
          }}
        >
          Load cycle example
        </button>
        <button disabled={!past.length} onClick={undo}>
          Undo
        </button>
        <button disabled={!future.length} onClick={redo}>
          Redo
        </button>
        <button onClick={() => setBaseline(structuredClone(items))}>
          Start what-if
        </button>
        {baseline && (
          <>
            <button onClick={() => setBaseline(null)}>Apply scenario</button>
            <button
              onClick={() => {
                change(baseline);
                setBaseline(null);
              }}
            >
              Discard scenario
            </button>
          </>
        )}
      </div>
      <div className="lab-grid">
        <aside>
          <Panel title="Edit project">
            <Editor
              items={items}
              onChange={change}
              selected={selected}
              onSelect={setSelected}
              durations
            />
          </Panel>
        </aside>
        <div className="stack">
          <Panel title="Project dependency network">
            <DependencyGraph
              items={items.map((x) => ({
                ...x,
                status: x.completed
                  ? "Completed"
                  : ready.includes(x.id)
                    ? "Ready"
                    : "Blocked",
              }))}
              onSelect={setSelected}
              selectedId={selected}
              criticalIds={analysis?.critical}
              criticalEdges={analysis?.edges}
              activeIds={order[step] ? [order[step]] : []}
            />
            {errors.map((error) => (
              <p className="alert" role="alert" key={error}>
                {error}
              </p>
            ))}
          </Panel>
          {analysis && (
            <Panel title="Schedule and critical path">
              <div className="stats">
                <div>
                  <b>{analysis.stages.length}</b>
                  <small>Unit-duration stages</small>
                </div>
                <div>
                  <b>{analysis.duration}</b>
                  <small>Project duration (units)</small>
                </div>
                <div>
                  <b>{ready.length}</b>
                  <small>Ready now</small>
                </div>
              </div>
              <p>
                Critical tasks: {names(analysis.critical)}. Zero slack means a
                delay increases project completion time.
              </p>
              <div className="table-scroll">
                <table>
                  <caption>
                    Unlimited workers; project times include all tasks,
                    regardless of completion selection.
                  </caption>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>ES</th>
                      <th>EF</th>
                      <th>LS</th>
                      <th>LF</th>
                      <th>Slack</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((x) => (
                      <tr
                        key={x.id}
                        className={
                          analysis.critical.includes(x.id) ? "highlight" : ""
                        }
                      >
                        <td>{x.name}</td>
                        {Object.values(analysis.times[x.id]).map((v, i) => (
                          <td key={i}>{Number(v.toFixed(3))}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {base && (
                <div className="comparison">
                  Baseline → experiment: duration {base.duration} →{" "}
                  {analysis.duration}; stages {base.stages.length} →{" "}
                  {analysis.stages.length}; ready{" "}
                  {
                    getReadyNodes(
                      baseline!,
                      baseline!.filter((x) => x.completed).map((x) => x.id),
                    ).length
                  }{" "}
                  → {ready.length}. Baseline critical:{" "}
                  {baseline!
                    .filter((x) => base.critical.includes(x.id))
                    .map((x) => x.name)
                    .join(", ")}
                  .
                </div>
              )}
            </Panel>
          )}
          <Panel title="Topological sort walkthrough">
            <p>Processed: {names(processed)}</p>
            <p>
              Zero remaining indegree: {names(getReadyNodes(items, processed))}
            </p>
            <div className="actions">
              <button disabled={!step} onClick={() => setStep(step - 1)}>
                Previous step
              </button>
              <button
                disabled={!analysis || step >= order.length}
                onClick={() => setStep(step + 1)}
              >
                Next step
              </button>
              <button onClick={() => setStep(0)}>Reset walkthrough</button>
            </div>
            {analysis && (
              <Playback
                length={order.length}
                label="Play walkthrough"
                onFrame={(i) => setStep(i + 1)}
              />
            )}
            <div className="stage-list">
              {analysis?.stages.map((ids, i) => (
                <div className="stage" key={i}>
                  <b>Stage {i + 1}</b>
                  {names(ids)}
                </div>
              ))}
            </div>
          </Panel>
          <Explanation>
            <p>
              Reachability plus reflexive pairs defines the partial order. Hasse
              mode keeps only covering edges. Earliest start is the maximum
              predecessor finish; latest finish is the minimum successor start.
              Slack = latest start − earliest start.
            </p>
            {current && (
              <>
                <p>
                  {current.name}: direct prerequisites{" "}
                  {names(current.prerequisites)}; all prerequisites{" "}
                  {names(ancestors)}.
                </p>
                <p>
                  Direct dependents:{" "}
                  {names(
                    items
                      .filter((x) => x.prerequisites.includes(selected))
                      .map((x) => x.id),
                  )}
                  . All downstream: {names(downstream.map((x) => x.id))}.
                </p>
                <p>
                  Unfinished direct blockers:{" "}
                  {names(
                    current.prerequisites.filter((id) => !done.includes(id)),
                  )}
                  . State:{" "}
                  {current.completed
                    ? "completed"
                    : ready.includes(current.id)
                      ? "ready"
                      : "blocked"}
                  .
                </p>
              </>
            )}
          </Explanation>
        </div>
      </div>
    </>
  );
}
export function CoursePlanner() {
  const { items, edit, undo, past } = useProject("courses", courseSample),
    [selected, setSelected] = useState(items[0]?.id ?? ""),
    [target, setTarget] = useLabState("target", "l"),
    [limit, setLimit] = useLabState("course-capacity", 3),
    [simulated, setSimulated] = useLabState<string[] | null>(
      "course-simulated",
      null,
    ),
    [catalogError, setCatalogError] = useState("");
  const completed = items.filter((x) => x.completed).map((x) => x.id),
    done = simulated ?? completed,
    errors = validate(items),
    ready = errors.length ? [] : getReadyNodes(items, done);
  const actualTarget = items.some((x) => x.id === target)
      ? target
      : (items[0]?.id ?? ""),
    all = getAllPrerequisites(items, actualTarget);
  const plan = semesterPlan(items, done, actualTarget, limit),
    unlimited = semesterPlan(items, done, actualTarget, 20);
  const names = (ids: string[]) =>
    ids.map((id) => items.find((x) => x.id === id)?.name ?? id).join(", ") ||
    "None";
  const inconsistent = items.filter(
    (x) =>
      done.includes(x.id) && x.prerequisites.some((p) => !done.includes(p)),
  );
  return (
    <>
      <h1>Course learning paths</h1>
      <p className="lede">
        Explore a curriculum, plan toward a target, and simulate future
        completions.
      </p>
      <Demo
        onStart={() => {
          edit(courseSample);
          setSimulated(null);
          setTarget("l");
        }}
        steps={[
          "Mark Programming and Data Structures completed.",
          "Complete Discrete Mathematics and observe Algorithms become eligible.",
          "Start a what-if completion and mark Algorithms; Machine Learning unlocks. Discard to restore your transcript.",
        ]}
      />
      <div className="actions">
        <button
          onClick={() => {
            edit(courseSample);
            setTarget("l");
            setSelected("p");
            setSimulated(null);
          }}
        >
          Reset curriculum
        </button>
        <button onClick={() => setSimulated([...completed])}>
          Start what-if completion
        </button>
        {simulated && (
          <>
            <button
              onClick={() => {
                edit(
                  items.map((x) => ({
                    ...x,
                    completed: simulated.includes(x.id),
                  })),
                );
                setSimulated(null);
              }}
            >
              Apply completions
            </button>
            <button onClick={() => setSimulated(null)}>
              Discard completions
            </button>
          </>
        )}
        <button disabled={!past.length} onClick={undo}>
          Undo edit
        </button>
      </div>
      <div className="lab-grid">
        <aside>
          <Panel title="Edit curriculum">
            <Editor
              items={items}
              onChange={(next) => {
                const problems = validate(next);
                if (problems.length) {
                  setCatalogError(problems.join(" "));
                  return;
                }
                setCatalogError("");
                edit(next);
                setSimulated(null);
              }}
              selected={selected}
              onSelect={setSelected}
              durations={false}
            />
          </Panel>
          <Panel
            title={simulated ? "Simulated completions" : "Completed courses"}
          >
            {items.map((x) => (
              <Check
                key={x.id}
                label={x.name}
                value={done.includes(x.id)}
                onChange={(v) =>
                  simulated
                    ? setSimulated(
                        v ? [...done, x.id] : done.filter((id) => id !== x.id),
                      )
                    : edit(
                        items.map((n) =>
                          n.id === x.id ? { ...n, completed: v } : n,
                        ),
                      )
                }
              />
            ))}
          </Panel>
        </aside>
        <div className="stack">
          <Panel title="Interactive curriculum">
            {catalogError && (
              <p role="alert" className="alert">
                {catalogError}
              </p>
            )}
            <DependencyGraph
              items={items.map((x) => ({
                ...x,
                status: done.includes(x.id)
                  ? "Completed"
                  : ready.includes(x.id)
                    ? "Ready"
                    : "Blocked",
              }))}
              selectedId={selected}
              onSelect={setSelected}
            />
            {errors.map((e) => (
              <p className="alert" key={e}>
                {e}
              </p>
            ))}
            {inconsistent.length > 0 && (
              <p className="alert">
                Inconsistent history: {names(inconsistent.map((x) => x.id))}{" "}
                completed before prerequisites. Your selections are retained.
              </p>
            )}
            <p>Eligible now: {names(ready)}.</p>
            {simulated && (
              <p>
                Newly eligible:{" "}
                {names(
                  ready.filter(
                    (id) => !getReadyNodes(items, completed).includes(id),
                  ),
                )}
                . Remaining locked:{" "}
                {names(
                  items
                    .filter(
                      (x) => !done.includes(x.id) && !ready.includes(x.id),
                    )
                    .map((x) => x.id),
                )}
                .
              </p>
            )}
          </Panel>
          <Panel title="Target course plan">
            <label className="field-label">
              Target course
              <select
                value={actualTarget}
                onChange={(e) => setTarget(e.target.value)}
              >
                {items.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <NumberInput
              label="Maximum courses per semester"
              value={limit}
              min={1}
              max={20}
              onChange={setLimit}
            />
            <p>
              Prerequisites already completed:{" "}
              {names(all.filter((id) => done.includes(id)))}.
            </p>
            <p>
              Missing in full chain:{" "}
              {names(all.filter((id) => !done.includes(id)))}.
            </p>
            <p>
              Minimum future layers including target: {unlimited.length}.
              Capacity-limited plan below is feasible; global optimality is not
              guaranteed.
            </p>
            <div className="stage-list">
              {plan.map((ids, i) => (
                <div className="stage" key={i}>
                  <b>Semester {i + 1}</b>
                  {names(ids)}
                </div>
              ))}
            </div>
            {!plan.length && (
              <p>
                {done.includes(actualTarget)
                  ? "Target already completed."
                  : "Choose a valid target, catalog and positive integer capacity."}
              </p>
            )}
          </Panel>
          <Explanation>
            <p>
              A course is eligible exactly when it is incomplete and every
              direct prerequisite is complete. Each proposed semester uses only
              courses eligible at its start; completed courses are excluded.
              This is a hypothetical study path.
            </p>
            {items.find((x) => x.id === selected) && (
              <>
                <p>
                  Selected direct requirements:{" "}
                  {names(items.find((x) => x.id === selected)!.prerequisites)}.
                  All ancestors: {names(getAllPrerequisites(items, selected))}.
                </p>
                <p>
                  Completing this course unlocks:{" "}
                  {names(
                    getReadyNodes(items, [...done, selected]).filter(
                      (id) => !ready.includes(id),
                    ),
                  )}
                  .
                </p>
              </>
            )}
          </Explanation>
        </div>
      </div>
    </>
  );
}
