import { test } from "node:test";
import assert from "node:assert/strict";
import {
  encodeScenario,
  decodeScenario,
  validSharedValue,
  useSession,
  sharePayload,
} from "../src/lib/sessionStore.ts";
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
test("share encoding preserves Unicode, booleans and numeric input without derived state", () => {
  const node = {
    id: "t1",
    name: "Plan α → β",
    prerequisites: [],
    duration: 2,
    completed: false,
  };
  const payload = { tasks: [node] };
  assert.deepEqual(decodeScenario(encodeScenario(payload), "tasks"), payload);
  useSession
    .getState()
    .hydrate({ home: sample, "home-history": ["not exported"] });
  assert.deepEqual(sharePayload("home"), { home: sample });
});
test("share decoder rejects unknown keys, invalid ranges, wrong module and oversized payloads", () => {
  assert.throws(() =>
    decodeScenario(
      encodeScenario({ "course-simulated": ["missing"] }),
      "courses",
    ),
  );
  assert.throws(() =>
    decodeScenario(encodeScenario({ target: "missing" }), "courses"),
  );
  assert.throws(() => encodeScenario({ payload: "x".repeat(25000) }));
  assert.equal(
    validSharedValue("tasks", [
      {
        id: "__proto__",
        name: "unsafe identifier",
        prerequisites: [],
        duration: 1,
        completed: false,
      },
    ]),
    false,
  );
  for (const value of [
    { home: { ...sample, brightness: -1 } },
    { home: { ...sample, temperature: null } },
    { unknown: "value" },
    { applicant: { cgpa: 11, income: 0, attendance: 80, achievement: false } },
  ])
    assert.throws(() => decodeScenario(encodeScenario(value), "home"));
  assert.throws(() => decodeScenario("a".repeat(25000), "home"));
  assert.throws(() => decodeScenario("not base64!", "home"));
});
test("task cycle examples remain shareable while invalid course cycles are rejected", () => {
  const nodes = [
    { id: "a", name: "A", prerequisites: ["b"], duration: 1, completed: false },
    { id: "b", name: "B", prerequisites: ["a"], duration: 1, completed: false },
  ];
  assert.equal(validSharedValue("tasks", nodes), true);
  assert.equal(validSharedValue("courses", nodes), false);
  assert.equal(
    validSharedValue("tasks", [{ ...nodes[0], prerequisites: ["missing"] }]),
    false,
  );
});
