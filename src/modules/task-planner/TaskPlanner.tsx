import { AnimatedNumber } from "../../components/AnimatedNumber";
import { GanttChart } from "../../components/GanttChart";
import { Tooltip } from "../../components/Tooltip";
import { useState, useMemo } from "react";
import { useLabState } from "../../lib/useLabState";
import { criticalPath, validate, type Work } from "../../lib/analysis";
import {
  getAllPrerequisites,
  getReadyNodes,
  topologicalSort,
} from "../../lib/graphAlgorithms";
import { DependencyGraph } from "../../components/LazyDependencyGraph";
import { Demo, Explanation, Panel, Playback } from "../../components/Lab";
import Editor from "../planning/Editor";
import { useProject } from "../task-planner/useProject";
import { taskSample } from "../../lib/samples";
export default function TaskPlanner() {
  const { items, edit, undo, redo, past, future } = useProject(
    "tasks",
    taskSample,
  );
  const [selected, setSelected] = useState(items[0]?.id ?? ""),
    [baseline, setBaseline] = useLabState<Work[] | null>("task-baseline", null),
    [step, setStep] = useState(0),
    [view, setView] = useState("dag");
  const errors = validate(items),
    analysis = useMemo(() => criticalPath(items), [items]),
    base = useMemo(
      () => (baseline ? criticalPath(baseline) : null),
      [baseline],
    );
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
            <div className="view-switch">
              <button
                aria-pressed={view === "dag"}
                onClick={() => setView("dag")}
              >
                Dependency graph
              </button>
              <button
                aria-pressed={view === "gantt"}
                disabled={!analysis}
                onClick={() => setView("gantt")}
              >
                Gantt chart
              </button>
            </div>
            {view === "gantt" && analysis ? (
              <GanttChart
                items={items}
                analysis={analysis}
                onSelect={setSelected}
              />
            ) : (
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
            )}
            {errors.map((error) => (
              <p className="alert" role="alert" key={error}>
                {error}
              </p>
            ))}
          </Panel>
          {analysis && (
            <Panel title="Schedule and critical path">
              <div className="stats" aria-live="polite">
                <div>
                  <AnimatedNumber value={analysis.stages.length} />
                  <small>Unit-duration stages</small>
                </div>
                <div>
                  <AnimatedNumber value={analysis.duration} />
                  <small>Project duration (units)</small>
                </div>
                <div>
                  <AnimatedNumber value={ready.length} />
                  <small>Ready now</small>
                </div>
              </div>
              <p>
                <Tooltip term="Critical tasks">
                  Tasks with zero total slack; delaying one delays the minimum
                  completion time.
                </Tooltip>
                : {names(analysis.critical)}. Zero slack means a delay increases
                project completion time.
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
