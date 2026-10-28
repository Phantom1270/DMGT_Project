import { test } from "node:test";
import assert from "node:assert/strict";
import {
  criticalPath,
  applicantBits,
  semesterPlan,
  scholarship,
  corrections,
  home,
  fault,
  validate,
} from "../src/lib/analysis.ts";
import {
  detectCycle,
  topologicalSort,
  topologicalLayers,
  transitiveClosure,
  transitiveReduction,
  getReadyNodes,
} from "../src/lib/graphAlgorithms.ts";
import {
  generateTruthTable,
  verifyEquivalence,
  and,
  or,
} from "../src/lib/booleanLogic.ts";
test("applicant numeric boundaries map to the exact policy conditions", () => {
  const thresholds = { cgpa: 8.5, income: 300000, attendance: 75 };
  const base = {
    cgpa: 8.5,
    income: 300000,
    attendance: 75,
    achievement: false,
  };
  assert.deepEqual(applicantBits(base, thresholds), [true, true, true, false]);
  assert.equal(
    scholarship(applicantBits({ ...base, cgpa: 8.4 }, thresholds)),
    false,
  );
  assert.equal(
    scholarship(applicantBits({ ...base, income: 300001 }, thresholds)),
    false,
  );
  assert.equal(
    scholarship(
      applicantBits({ ...base, attendance: 74, achievement: true }, thresholds),
    ),
    false,
  );
  assert.equal(
    scholarship(
      applicantBits(
        { ...base, cgpa: 0, income: 1000000, achievement: true },
        thresholds,
      ),
    ),
    true,
  );
});
const make = (id, prerequisites = [], duration = 1) => ({
  id,
  name: id,
  prerequisites,
  duration,
  completed: false,
});
const graph = [
  make("a"),
  make("b", ["a"], 3),
  make("c", [], 2),
  make("d", ["b", "c"]),
];
test("DAG layers, order, readiness and hand-worked critical path", () => {
  assert.deepEqual(topologicalLayers(graph), [["a", "c"], ["b"], ["d"]]);
  assert.deepEqual(getReadyNodes(graph, ["a"]), ["b", "c"]);
  const r = criticalPath(graph);
  assert.equal(r.duration, 5);
  assert.deepEqual(r.critical, ["a", "b", "d"]);
  assert.equal(r.times.c.slack, 2);
  for (const n of graph)
    for (const p of n.prerequisites)
      assert.ok(
        topologicalSort(graph).indexOf(p) <
          topologicalSort(graph).indexOf(n.id),
      );
});
test("cycles, missing references, duplicates and invalid durations block schedules", () => {
  const cycle = [make("a", ["b"]), make("b", ["a"])];
  assert.ok(detectCycle(cycle));
  assert.equal(criticalPath(cycle), null);
  assert.equal(topologicalSort([make("a", ["missing"])]), null);
  assert.ok(validate([make("a", [], 0)]).length);
  assert.ok(validate([make("a"), make("a")]).length);
  assert.equal(topologicalSort([make("a"), make("b", ["a", "a"])]), null);
  assert.deepEqual(topologicalLayers([]), []);
  assert.equal(criticalPath([]).duration, 0);
});
test("all 64 forward-edge DAGs preserve reachability under Hasse reduction", () => {
  const pairs = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ];
  for (let mask = 0; mask < 64; mask++) {
    const g = Array.from({ length: 4 }, (_, i) =>
      make(
        String(i),
        pairs
          .filter(([_a, b], j) => b === i && mask & (1 << j))
          .map(([a]) => String(a)),
      ),
    );
    const edges = transitiveReduction(g),
      reduced = g.map((n) => ({
        ...n,
        prerequisites: edges
          .filter(([, to]) => to === n.id)
          .map(([from]) => from),
      }));
    for (const n of g)
      assert.deepEqual(
        [...transitiveClosure(g).get(n.id)].sort(),
        [...transitiveClosure(reduced).get(n.id)].sort(),
      );
  }
});
test("semester capacity, prerequisite ordering and completed exclusions", () => {
  for (const capacity of [1, 2, 3]) {
    const done = new Set(["a"]);
    for (const term of semesterPlan(graph, ["a"], "d", capacity)) {
      assert.ok(term.length <= capacity);
      for (const id of term) {
        assert.ok(!done.has(id));
        assert.ok(
          graph
            .find((n) => n.id === id)
            .prerequisites.every((p) => done.has(p)),
        );
      }
      term.forEach((id) => done.add(id));
    }
    assert.ok(done.has("d"));
  }
});
test("exhaustive home, scholarship policies and minimal correction sets", () => {
  for (let mask = 0; mask < 64; mask++) {
    const x = Array.from({ length: 6 }, (_, i) => !!(mask & (1 << i)));
    const r = home(...x);
    assert.equal(r.light, x[2] || (x[0] && x[1]));
    assert.equal(r.ac, x[0] && x[3]);
    assert.equal(r.alarm, x[4] && x[5]);
  }
  for (let mask = 0; mask < 16; mask++) {
    const x = Array.from({ length: 4 }, (_, i) => !!(mask & (1 << i)));
    assert.equal(scholarship(x), x[2] && ((x[0] && x[1]) || x[3]));
    for (const policy of ["balanced", "merit", "assistance"])
      for (const set of corrections(x, policy)) {
        assert.ok(
          scholarship(
            x.map((b, i) => b || set.includes(i)),
            policy,
          ),
        );
        for (const removed of set)
          assert.ok(
            !scholarship(
              x.map((b, i) => b || (set.includes(i) && i !== removed)),
              policy,
            ),
          );
      }
  }
});
test("strict fault thresholds and exhaustive distributive equivalence", () => {
  assert.equal(fault(80, 11, false).original, false);
  assert.equal(fault(81, 10, false).original, false);
  assert.equal(fault(81, 10, true).original, true);
  const rows = generateTruthTable(["T", "V", "C"], (x) => [
    or(and(x.T, x.V), and(x.T, x.C)),
    and(x.T, or(x.V, x.C)),
  ]);
  assert.equal(rows.length, 8);
  assert.ok(rows.every((x) => x.result[0] === x.result[1]));
  assert.ok(
    verifyEquivalence(
      ["T", "V", "C"],
      (x) => or(and(x.T, x.V), and(x.T, x.C)),
      (x) => and(x.T, or(x.V, x.C)),
    ),
  );
});
