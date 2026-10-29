import { MAX_ITEMS } from "../../lib/constants";
import { SemesterTimeline } from "../../components/SemesterTimeline";
import { useState, useMemo } from "react";
import { useLabState } from "../../lib/useLabState";
import { semesterPlan, validate } from "../../lib/analysis";
import { getAllPrerequisites, getReadyNodes } from "../../lib/graphAlgorithms";
import { DependencyGraph } from "../../components/LazyDependencyGraph";
import {
  Demo,
  Check,
  Explanation,
  NumberInput,
  Panel,
} from "../../components/Lab";
import Editor from "../planning/Editor";
import { useProject } from "../task-planner/useProject";
import { courseSample } from "../../lib/samples";
export default function CoursePlanner() {
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
  const plan = useMemo(
      () => semesterPlan(items, done, actualTarget, limit),
      [items, done, actualTarget, limit],
    ),
    unlimited = semesterPlan(items, done, actualTarget, MAX_ITEMS);
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
                if (!next.some((course) => course.id === target))
                  setTarget(next[0]?.id ?? "");
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
            <p role="status">Eligible now: {names(ready)}.</p>
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
              max={MAX_ITEMS}
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
            <SemesterTimeline
              items={items}
              plan={plan}
              completed={done}
              onSelect={setSelected}
            />
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
