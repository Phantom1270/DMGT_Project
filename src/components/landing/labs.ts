export type LabId = "tasks" | "courses" | "home" | "scholarship" | "fault";
export type LabEntry = { id: LabId; title: string; concept: string; description: string; formula: string };
export const labs: readonly LabEntry[] = [
  { id: "tasks", title: "Task planner", concept: "Partial orders · Critical paths", description: "Build a dependency graph. Find the work that sets the pace.", formula: "A ≺ B ≺ C" },
  { id: "courses", title: "Course eligibility", concept: "Transitivity · Learning paths", description: "Trace prerequisites and chart a route to your next course.", formula: "P → DS → A" },
  { id: "home", title: "Smart home", concept: "Boolean gates · Sensor rules", description: "Turn sensor readings into decisions, one logic gate at a time.", formula: "L = PD + M" },
  { id: "scholarship", title: "Scholarship", concept: "Policies · Sensitivity analysis", description: "Explore the conditions and pathways behind a qualifying decision.", formula: "E = C(AB + D)" },
  { id: "fault", title: "Fault detection", concept: "Distributive law · Equivalence", description: "Inject a fault. Follow its cause. Simplify the circuit.", formula: "TV + TC = T(V + C)" },
];
