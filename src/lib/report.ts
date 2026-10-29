import {
  applicantBits,
  criticalPath,
  fault,
  home,
  policyExpressions,
  policyNames,
  scholarship,
  semesterPlan,
  validate,
  type Policy,
  type Work,
} from "./analysis.ts";
import { getReadyNodes, getAllPrerequisites } from "./graphAlgorithms.ts";
import {
  applicantSample,
  courseSample,
  homeSample,
  machineLimits,
  machineSample,
  scholarshipThresholds,
  taskSample,
} from "./samples.ts";
export type ReportRow = [string, string];
export type ReportTable = {
  title: string;
  headers: string[];
  rows: string[][];
};
export type Report = {
  module: string;
  parameters: ReportRow[];
  summary: ReportRow[];
  tables: ReportTable[];
  notes: string[];
};
export function buildReport(
  module: string,
  values: Record<string, unknown>,
  parameters: ReportRow[],
): Report {
  const report: Report = {
    module,
    parameters,
    summary: [],
    tables: [],
    notes: [
      "Illustrative academic analysis. All calculations use the active scenario.",
    ],
  };
  if (module === "tasks") {
    report.module = "Task dependency analysis";
    const items = (values.tasks ?? taskSample) as Work[],
      analysis = criticalPath(items),
      names = (ids: string[]) =>
        ids
          .map((id) => items.find((x) => x.id === id)?.name ?? id)
          .join(", ") || "None";
    report.summary = [
      ["Project items", String(items.length)],
      [
        "Execution stages",
        analysis
          ? String(analysis.stages.length)
          : "Unavailable: invalid dependencies",
      ],
      [
        "Project duration",
        analysis ? `${analysis.duration} units` : "Unavailable",
      ],
      ["Critical tasks", analysis ? names(analysis.critical) : "Unavailable"],
      [
        "Ready now",
        names(
          getReadyNodes(
            items,
            items.filter((x) => x.completed).map((x) => x.id),
          ),
        ),
      ],
    ];
    report.tables.push({
      title: "Project definition",
      headers: ["Task", "Duration", "Prerequisites", "Status"],
      rows: items.map((x) => [
        x.name,
        String(x.duration),
        names(x.prerequisites),
        x.completed ? "Completed" : "Pending",
      ]),
    });
    if (analysis)
      report.tables.push({
        title: "Schedule analysis",
        headers: ["Task", "ES", "EF", "LS", "LF", "Slack"],
        rows: items.map((x) => [
          x.name,
          ...Object.values(analysis.times[x.id]).map((n) =>
            String(Number(n.toFixed(3))),
          ),
        ]),
      });
    else report.notes.push(...validate(items));
    report.notes.push(
      "Timing assumes unlimited parallel workers and positive durations. Completion selection affects readiness; full-project timing includes every item.",
    );
  } else if (module === "courses") {
    report.module = "Course eligibility and study plan";
    const items = (values.courses ?? courseSample) as Work[],
      completed = (values["course-simulated"] ??
        items.filter((x) => x.completed).map((x) => x.id)) as string[],
      chosen = String(values.target ?? "l"),
      target = items.some((x) => x.id === chosen)
        ? chosen
        : (items[0]?.id ?? ""),
      capacity = Number(values["course-capacity"] ?? 3),
      names = (ids: string[]) =>
        ids
          .map((id) => items.find((x) => x.id === id)?.name ?? id)
          .join(", ") || "None",
      plan = semesterPlan(items, completed, target, capacity);
    report.summary = [
      ["Selected target", names([target])],
      ["Completed courses", names(completed)],
      ["Eligible next", names(getReadyNodes(items, completed))],
      [
        "Missing target prerequisites",
        names(
          getAllPrerequisites(items, target).filter(
            (id) => !completed.includes(id),
          ),
        ),
      ],
      ["Semester capacity", String(capacity)],
      ["Proposed semesters", String(plan.length)],
    ];
    report.tables.push({
      title: "Feasible semester plan",
      headers: ["Semester", "Courses"],
      rows: plan.map((ids, i) => [String(i + 1), names(ids)]),
    });
    report.notes.push(
      "This deterministic plan is feasible under prerequisite and capacity constraints, not a guaranteed globally optimal or official timetable.",
    );
  } else if (module === "home") {
    report.module = "Smart home automation";
    const s = (values.home ?? homeSample) as typeof homeSample,
      d = s.brightness < s.darkness,
      h = s.temperature >= s.hot,
      result = home(s.p, d, s.m, h, s.s, s.o);
    const valid =
      Object.values(s).every(
        (v) => typeof v !== "number" || Number.isFinite(v),
      ) &&
      s.brightness >= 0 &&
      s.brightness <= 100 &&
      s.darkness >= 0 &&
      s.darkness <= 100;
    if (!valid) {
      report.summary = [
        ["Analysis status", "Unavailable: invalid sensor values"],
      ];
      report.notes.push(
        "Correct invalid readings before interpreting device outputs.",
      );
      return report;
    }
    report.summary = [
      [
        "Darkness comparison",
        `${s.brightness}% < ${s.darkness}% -> D=${Number(d)}`,
      ],
      [
        "Temperature comparison",
        `${s.temperature} C >= ${s.hot} C -> H=${Number(h)}`,
      ],
      ["Room light", result.light ? "ON" : "OFF"],
      ["Air conditioner", result.ac ? "ON" : "OFF"],
      ["Security alarm", result.alarm ? "ON" : "OFF"],
    ];
    report.tables.push({
      title: "Boolean rule evaluation",
      headers: ["Device", "Rule", "Substitution", "Output"],
      rows: [
        [
          "Light",
          "L = (P AND D) OR M",
          `(${Number(s.p)} AND ${Number(d)}) OR ${Number(s.m)}`,
          String(Number(result.light)),
        ],
        [
          "AC",
          "AC = P AND H",
          `${Number(s.p)} AND ${Number(h)}`,
          String(Number(result.ac)),
        ],
        [
          "Alarm",
          "Alarm = S AND O",
          `${Number(s.s)} AND ${Number(s.o)}`,
          String(Number(result.alarm)),
        ],
      ],
    });
  } else if (module === "scholarship") {
    report.module = "Scholarship policy analysis";
    const applicant = (values["applicant-draft"] ??
        values.applicant ??
        applicantSample) as typeof applicantSample,
      thresholds = (values["scholarship-thresholds"] ??
        scholarshipThresholds) as typeof scholarshipThresholds,
      policy = (values.policy ?? "balanced") as Policy,
      bits = applicantBits(applicant, thresholds),
      valid =
        [
          applicant.cgpa,
          applicant.income,
          applicant.attendance,
          ...Object.values(thresholds),
        ].every(Number.isFinite) &&
        applicant.cgpa >= 0 &&
        applicant.cgpa <= 10 &&
        applicant.income >= 0 &&
        applicant.attendance >= 0 &&
        applicant.attendance <= 100 &&
        thresholds.cgpa >= 0 &&
        thresholds.cgpa <= 10 &&
        thresholds.attendance >= 0 &&
        thresholds.attendance <= 100 &&
        thresholds.income >= 0;
    report.summary = [
      ["Demonstration policy", policyNames[policy]],
      ["Policy rule", policyExpressions[policy]],
      [
        "Applicant scenario",
        values["applicant-draft"]
          ? "Temporary comparison"
          : "Current applicant",
      ],
      [
        "Eligibility",
        valid
          ? scholarship(bits, policy)
            ? "Eligible"
            : "Not eligible"
          : "Unavailable: invalid inputs",
      ],
    ];
    report.tables.push({
      title: "Criteria and boundaries",
      headers: ["Criterion", "Active value", "Policy threshold", "Result"],
      rows: [
        [
          "A: CGPA",
          String(applicant.cgpa),
          `>= ${thresholds.cgpa}`,
          valid ? (bits[0] ? "Pass" : "Fail") : "Unavailable",
        ],
        [
          "B: Family income",
          `INR ${applicant.income}`,
          `<= INR ${thresholds.income}`,
          valid ? (bits[1] ? "Pass" : "Fail") : "Unavailable",
        ],
        [
          "C: Attendance",
          `${applicant.attendance}%`,
          `>= ${thresholds.attendance}%`,
          valid ? (bits[2] ? "Pass" : "Fail") : "Unavailable",
        ],
        [
          "D: Recognized achievement",
          applicant.achievement ? "Yes" : "No",
          "Achievement pathway",
          valid ? (bits[3] ? "Pass" : "Fail") : "Unavailable",
        ],
      ],
    });
    report.notes.push(
      "These are hypothetical demonstration policies, not real scholarship eligibility decisions.",
    );
  } else if (module === "fault") {
    report.module = "Machine fault detection";
    const s = (values.machine ?? machineSample) as typeof machineSample,
      limits = (values["machine-limits"] ??
        machineLimits) as typeof machineLimits,
      r = fault(
        s.temperature,
        s.vibration,
        s.cooling,
        limits.temperature,
        limits.vibration,
      ),
      valid =
        [
          s.temperature,
          s.vibration,
          limits.temperature,
          limits.vibration,
        ].every(Number.isFinite) &&
        s.vibration >= 0 &&
        limits.vibration >= 0;
    report.summary = [
      [
        "Machine status",
        valid
          ? r.original
            ? "Fault detected"
            : "No defined fault condition active"
          : "Unavailable: invalid readings",
      ],
      [
        "Sensor bits",
        valid
          ? `T=${Number(r.t)}, V=${Number(r.v)}, C=${Number(r.c)}`
          : "Unavailable",
      ],
      [
        "Original expression",
        valid ? `TV + TC = ${Number(r.original)}` : "Unavailable",
      ],
      [
        "Simplified expression",
        valid ? `T(V + C) = ${Number(r.simplified)}` : "Unavailable",
      ],
      ["Gate-count reduction", "3 to 2 two-input gates (33.3%)"],
    ];
    report.tables.push({
      title: "Sensor thresholds",
      headers: ["Sensor", "Reading", "Fault comparison", "Result"],
      rows: [
        [
          "Temperature",
          `${s.temperature} C`,
          `> ${limits.temperature} C`,
          valid ? String(Number(r.t)) : "Unavailable",
        ],
        [
          "Vibration",
          `${s.vibration} mm/s`,
          `> ${limits.vibration} mm/s`,
          valid ? String(Number(r.v)) : "Unavailable",
        ],
        [
          "Cooling",
          s.cooling ? "Failed" : "Working",
          "Cooling system failed",
          valid ? String(Number(r.c)) : "Unavailable",
        ],
      ],
    });
    report.tables.push({
      title: "Distributive-law equivalence",
      headers: ["T", "V", "C", "TV + TC", "T(V + C)"],
      rows: Array.from({ length: 8 }, (_, i) => {
        const t = !!(i & 4),
          v = !!(i & 2),
          c = !!(i & 1);
        return [
          Number(t),
          Number(v),
          Number(c),
          Number((t && v) || (t && c)),
          Number(t && (v || c)),
        ].map(String);
      }),
    });
    report.notes.push(
      "A false illustrative fault rule is not a real-world safety guarantee. Gate count does not model hardware energy or latency.",
    );
  }
  return report;
}
