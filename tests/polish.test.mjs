import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applicantBits,
  fault,
  scholarshipScenario,
  faultScenario,
} from "../src/lib/analysis.ts";
import { buildReport } from "../src/lib/report.ts";
import { taskSample } from "../src/lib/samples.ts";
import { renderReport } from "../src/lib/renderReport.ts";
test("every representable K-map combination maps back to actual applicant and machine inputs", () => {
  const policy = { cgpa: 8.5, income: 300000, attendance: 75 };
  for (let n = 0; n < 16; n++) {
    const bits = Array.from({ length: 4 }, (_, i) => !!(n & (1 << i)));
    assert.deepEqual(
      applicantBits(scholarshipScenario(bits, policy), policy),
      bits,
    );
  }
  const limits = { temperature: 80, vibration: 10 };
  for (let n = 0; n < 8; n++) {
    const bits = Array.from({ length: 3 }, (_, i) => !!(n & (1 << i))),
      s = faultScenario(bits, limits),
      result = fault(
        s.temperature,
        s.vibration,
        s.cooling,
        limits.temperature,
        limits.vibration,
      );
    assert.deepEqual([result.t, result.v, result.c], bits);
  }
});
test("K-map application explains impossible zero-threshold cases and rejects invalid thresholds", () => {
  assert.throws(
    () =>
      scholarshipScenario([false, true, true, false], {
        cgpa: 0,
        income: 0,
        attendance: 75,
      }),
    /cannot be represented/,
  );
  assert.throws(
    () =>
      scholarshipScenario([true, true, false, false], {
        cgpa: 8,
        income: 0,
        attendance: 0,
      }),
    /cannot be represented/,
  );
  assert.throws(() =>
    faultScenario([true, true, false], { temperature: NaN, vibration: 10 }),
  );
});
test("structured reports reflect active values and computed summaries instead of a UI text dump", () => {
  const tasks = taskSample.map((x) =>
      x.id === "t2" ? { ...x, duration: 3 } : x,
    ),
    report = buildReport("tasks", { tasks }, [
      ["Selected task", "Build backend"],
    ]);
  assert.equal(
    report.summary.find(([label]) => label === "Project duration")[1],
    "6 units",
  );
  assert.ok(report.tables.some((t) => t.title === "Schedule analysis"));
  assert.deepEqual(report.parameters, [["Selected task", "Build backend"]]);
  const machine = buildReport(
    "fault",
    { machine: { temperature: 80, vibration: 20, cooling: true } },
    [],
  );
  assert.equal(
    machine.summary.find(([label]) => label === "Machine status")[1],
    "No defined fault condition active",
  );
  assert.equal(
    machine.tables.find((t) => t.title === "Distributive-law equivalence").rows
      .length,
    8,
  );
  const scholarship = buildReport(
    "scholarship",
    {
      applicant: {
        cgpa: 8.5,
        income: 300000,
        attendance: 75,
        achievement: false,
      },
    },
    [],
  );
  assert.equal(
    scholarship.summary.find(([label]) => label === "Eligibility")[1],
    "Eligible",
  );
  const invalidApplicant = buildReport(
    "scholarship",
    { applicant: { cgpa: NaN, income: 0, attendance: 75, achievement: false } },
    [],
  );
  assert.ok(
    invalidApplicant.tables[0].rows.every((row) => row[3] === "Unavailable"),
  );
  const invalidMachine = buildReport(
    "fault",
    { machine: { temperature: NaN, vibration: 20, cooling: true } },
    [],
  );
  assert.ok(
    invalidMachine.tables[0].rows.every((row) => row[3] === "Unavailable"),
  );
});
test("editorial PDF tables paginate long cells without clipping or failing on empty continuation cells", () => {
  const report = {
    module: "Long project fixture",
    parameters: [["Example", "Active"]],
    summary: [["Status", "Valid"]],
    tables: [
      {
        title: "Long prerequisite list",
        headers: ["Task", "Requirements"],
        rows: [["Target task", "Prerequisite ".repeat(750)]],
      },
    ],
    notes: ["A deterministic pagination fixture."],
  };
  const doc = renderReport(report);
  assert.ok(doc.getNumberOfPages() > 1);
  assert.ok(doc.output().startsWith("%PDF"));
});
