import { create } from "zustand";
import { MAX_ITEMS, MAX_NAME_LENGTH, MAX_SHARE_LENGTH } from "./constants.ts";
import { validate, type Work } from "./analysis.ts";
import { courseSample } from "./samples.ts";
type Session = {
  values: Record<string, unknown>;
  setValue: (key: string, value: unknown) => void;
  hydrate: (values: Record<string, unknown>) => void;
};
export const useSession = create<Session>((set) => ({
  values: {},
  setValue: (key, value) =>
    set((s) => ({ values: { ...s.values, [key]: value } })),
  hydrate: (values) => set((s) => ({ values: { ...s.values, ...values } })),
}));
const shareKeys: Record<string, string[]> = {
  tasks: ["tasks", "task-baseline"],
  courses: ["courses", "target", "course-capacity", "course-simulated"],
  home: ["home"],
  scholarship: [
    "applicant",
    "applicant-draft",
    "policy",
    "scholarship-thresholds",
  ],
  fault: ["machine", "machine-limits"],
};
const numeric = (x: unknown) => typeof x === "number" && Number.isFinite(x);
const object = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
function graph(x: unknown, course = false): boolean {
  if (!Array.isArray(x) || x.length > MAX_ITEMS) return false;
  const good = x.every(
    (n) =>
      object(n) &&
      typeof n.id === "string" &&
      n.id.length > 0 &&
      !["__proto__", "prototype", "constructor"].includes(n.id) &&
      n.id.length <= 100 &&
      typeof n.name === "string" &&
      n.name.trim().length > 0 &&
      n.name.length <= MAX_NAME_LENGTH &&
      numeric(n.duration) &&
      Number(n.duration) > 0 &&
      typeof n.completed === "boolean" &&
      Array.isArray(n.prerequisites) &&
      n.prerequisites.every((p: unknown) => typeof p === "string"),
  );
  if (!good) return false;
  const items = x as Work[];
  return validate(items).every(
    (error) => !course && error.startsWith("Cycle:"),
  );
}
export function validSharedValue(key: string, x: unknown): boolean {
  if (key === "tasks" || key === "courses") return graph(x, key === "courses");
  if (key === "task-baseline") return x === null || graph(x);
  if (key === "course-capacity")
    return (
      numeric(x) &&
      Number.isInteger(x) &&
      Number(x) >= 1 &&
      Number(x) <= MAX_ITEMS
    );
  if (key === "target") return typeof x === "string" && x.length <= 100;
  if (key === "course-simulated")
    return (
      x === null ||
      (Array.isArray(x) &&
        x.length <= MAX_ITEMS &&
        x.every((id) => typeof id === "string" && id.length <= 100))
    );
  if (key === "policy")
    return ["balanced", "merit", "assistance"].includes(String(x));
  if (key === "applicant-draft" && x === null) return true;
  if (!object(x)) return false;
  const schema: Record<string, Record<string, "number" | "boolean">> = {
    home: {
      brightness: "number",
      temperature: "number",
      darkness: "number",
      hot: "number",
      p: "boolean",
      m: "boolean",
      s: "boolean",
      o: "boolean",
    },
    machine: { temperature: "number", vibration: "number", cooling: "boolean" },
    "machine-limits": { temperature: "number", vibration: "number" },
    applicant: {
      cgpa: "number",
      income: "number",
      attendance: "number",
      achievement: "boolean",
    },
    "applicant-draft": {
      cgpa: "number",
      income: "number",
      attendance: "number",
      achievement: "boolean",
    },
    "scholarship-thresholds": {
      cgpa: "number",
      income: "number",
      attendance: "number",
    },
  };
  const fields = schema[key];
  if (
    !fields ||
    !Object.entries(fields).every(([k, type]) =>
      type === "number" ? numeric(x[k]) : typeof x[k] === "boolean",
    )
  )
    return false;
  if (key === "home")
    return (
      Number(x.brightness) >= 0 &&
      Number(x.brightness) <= 100 &&
      Number(x.darkness) >= 0 &&
      Number(x.darkness) <= 100
    );
  if (key.startsWith("applicant") || key === "scholarship-thresholds")
    return (
      Number(x.cgpa) >= 0 &&
      Number(x.cgpa) <= 10 &&
      Number(x.income) >= 0 &&
      Number(x.attendance) >= 0 &&
      Number(x.attendance) <= 100
    );
  return Number(x.vibration) >= 0;
}
export function sharePayload(module: string) {
  const state = useSession.getState().values;
  const payload = Object.fromEntries(
    (shareKeys[module] ?? [])
      .filter((key) => key in state)
      .map((key) => [key, state[key]]),
  );
  if (
    !Object.entries(payload).every(([key, value]) =>
      validSharedValue(key, value),
    ) ||
    !validCourseReferences(payload, module)
  )
    throw new Error("Correct invalid inputs before sharing this scenario.");
  return payload;
}
function validCourseReferences(
  payload: Record<string, unknown>,
  module: string,
) {
  if (module !== "courses") return true;
  const courses = (payload.courses ?? courseSample) as Work[],
    ids = new Set(courses.map((course) => course.id));
  if (
    payload.target !== undefined &&
    !(payload.target === "" && ids.size === 0) &&
    !ids.has(payload.target as string)
  )
    return false;
  return (
    !Array.isArray(payload["course-simulated"]) ||
    payload["course-simulated"].every((id) => ids.has(id))
  );
}
export function encodeScenario(payload: Record<string, unknown>) {
  const encoded = btoa(
    String.fromCharCode(...new TextEncoder().encode(JSON.stringify(payload))),
  );
  if (encoded.length > MAX_SHARE_LENGTH)
    throw new Error("This scenario is too large for a share link.");
  return encoded;
}
export function decodeScenario(
  encoded: string,
  module: string,
): Record<string, unknown> {
  if (encoded.length > MAX_SHARE_LENGTH)
    throw new Error("Shared scenario is too large.");
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
  if (
    !object(payload) ||
    !Object.entries(payload).every(
      ([key, value]) =>
        (shareKeys[module] ?? []).includes(key) && validSharedValue(key, value),
    ) ||
    !validCourseReferences(payload, module)
  )
    throw new Error("This shared scenario contains invalid inputs.");
  return payload;
}
