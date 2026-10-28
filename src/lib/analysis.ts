import {
  detectCycle,
  getAllPrerequisites,
  getReadyNodes,
  topologicalLayers,
  topologicalSort,
} from "./graphAlgorithms.ts";
export type Work = {
  id: string;
  name: string;
  prerequisites: string[];
  duration: number;
  completed: boolean;
};
export function validate(items: Work[]): string[] {
  const ids = new Set(items.map((x) => x.id)),
    errors: string[] = [];
  if (ids.size !== items.length) errors.push("IDs must be unique.");
  for (const x of items) {
    if (!x.name.trim()) errors.push("Every item needs a name.");
    if (!Number.isFinite(x.duration) || x.duration <= 0)
      errors.push(`${x.name}: duration must be positive.`);
    if (new Set(x.prerequisites).size !== x.prerequisites.length)
      errors.push(`${x.name}: duplicate prerequisites.`);
    if (x.prerequisites.some((id) => !ids.has(id)))
      errors.push(`${x.name}: missing prerequisite.`);
  }
  const cycle = detectCycle(items);
  if (cycle)
    errors.push(
      `Cycle: ${cycle
        .slice()
        .reverse()
        .map((id) => items.find((x) => x.id === id)?.name ?? id)
        .join(" → ")}. A task cannot precede itself; scheduling is disabled.`,
    );
  return errors;
}
export function criticalPath(items: Work[]) {
  if (validate(items).length) return null;
  const order = topologicalSort(items)!,
    byId = new Map(items.map((x) => [x.id, x]));
  const times: Record<
    string,
    { es: number; ef: number; ls: number; lf: number; slack: number }
  > = {};
  for (const id of order) {
    const x = byId.get(id)!;
    const es = Math.max(0, ...x.prerequisites.map((p) => times[p].ef));
    times[id] = { es, ef: es + x.duration, ls: 0, lf: 0, slack: 0 };
  }
  const duration = Math.max(0, ...Object.values(times).map((x) => x.ef));
  for (const id of [...order].reverse()) {
    const successors = items.filter((x) => x.prerequisites.includes(id));
    const lf = successors.length
      ? Math.min(...successors.map((x) => times[x.id].ls))
      : duration;
    times[id].lf = lf;
    times[id].ls = lf - byId.get(id)!.duration;
    times[id].slack = times[id].ls - times[id].es;
  }
  const critical = order.filter((id) => Math.abs(times[id].slack) < 1e-9);
  const edges = items.flatMap((x) =>
    x.prerequisites
      .filter(
        (p) =>
          critical.includes(p) &&
          critical.includes(x.id) &&
          Math.abs(times[p].ef - times[x.id].es) < 1e-9,
      )
      .map((p) => [p, x.id] as [string, string]),
  );
  return { duration, times, critical, edges, stages: topologicalLayers(items) };
}
export function semesterPlan(
  items: Work[],
  completed: string[],
  target: string,
  limit: number,
): string[][] {
  if (
    validate(items).length ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    !items.some((x) => x.id === target)
  )
    return [];
  const needed = new Set([...getAllPrerequisites(items, target), target]),
    done = new Set(completed),
    plan: string[][] = [];
  while ([...needed].some((id) => !done.has(id))) {
    const next = getReadyNodes(items, [...done])
      .filter((id) => needed.has(id))
      .slice(0, limit);
    if (!next.length) return [];
    plan.push(next);
    next.forEach((id) => done.add(id));
  }
  return plan;
}
export type Policy = "balanced" | "merit" | "assistance";
export function applicantBits(
  applicant: {
    cgpa: number;
    income: number;
    attendance: number;
    achievement: boolean;
  },
  thresholds: { cgpa: number; income: number; attendance: number },
) {
  return [
    applicant.cgpa >= thresholds.cgpa,
    applicant.income <= thresholds.income,
    applicant.attendance >= thresholds.attendance,
    applicant.achievement,
  ];
}
export const policyNames: Record<Policy, string> = {
  balanced: "Academic and achievement",
  merit: "Academic merit",
  assistance: "Financial assistance",
};
export const policyExpressions: Record<Policy, string> = {
  balanced: "E = C ∧ ((A ∧ B) ∨ D)",
  merit: "E = C ∧ A",
  assistance: "E = C ∧ B",
};
export function scholarship(bits: boolean[], policy: Policy = "balanced") {
  const [a, b, c, d] = bits;
  return (
    c && (policy === "merit" ? a : policy === "assistance" ? b : (a && b) || d)
  );
}
export function corrections(bits: boolean[], policy: Policy) {
  if (scholarship(bits, policy)) return [];
  const choices = Array.from({ length: 16 }, (_, mask) =>
    bits
      .map((b, i) => (!b && Boolean(mask & (1 << i)) ? i : -1))
      .filter((i) => i >= 0),
  ).filter(
    (indices) =>
      indices.length &&
      scholarship(
        bits.map((b, i) => b || indices.includes(i)),
        policy,
      ),
  );
  return choices
    .filter(
      (set, i) =>
        !choices.some(
          (other, j) =>
            j !== i &&
            other.length < set.length &&
            other.every((x) => set.includes(x)),
        ),
    )
    .filter(
      (set, i, all) => all.findIndex((x) => String(x) === String(set)) === i,
    );
}
export function home(
  p: boolean,
  d: boolean,
  m: boolean,
  h: boolean,
  s: boolean,
  o: boolean,
) {
  return { light: (p && d) || m, ac: p && h, alarm: s && o };
}
export function fault(
  temperature: number,
  vibration: number,
  cooling: boolean,
  tempLimit = 80,
  vibLimit = 10,
) {
  const t = temperature > tempLimit,
    v = vibration > vibLimit;
  return {
    t,
    v,
    c: cooling,
    original: (t && v) || (t && cooling),
    simplified: t && (v || cooling),
  };
}
