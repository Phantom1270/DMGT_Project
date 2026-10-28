# DiscreteLab

An interactive mathematics lab demonstrating five real-world applications of Module 4: Lattices and Boolean Algebra.

## Applications

- **Task planner:** edit names, durations and prerequisites; explore real dependency/Hasse diagrams; analyze earliest/latest times, slack and critical edges; compare a baseline; undo/redo; step through topological sorting.
- **Course eligibility:** edit the curriculum, inspect prerequisite paths, choose a target, generate capacity-limited feasible semester plans and apply/discard hypothetical completions. Inconsistent academic histories are explained and retained.
- **Smart home:** numeric sensors and configurable thresholds drive the default light, AC and alarm rules. Explore live gate circuits, presets, deterministic daily playback and truth-table rows that apply real sensor changes.
- **Scholarship checker:** configure three hypothetical policies, compare temporary applicants, inspect minimal correction sets and single-condition sensitivity, and test exact numeric boundaries. Default: `E = C AND ((A AND B) OR D)`.
- **Fault detection:** configure strict thresholds, inject faults, replay a deterministic sensor sequence, inspect root causes and transition history, and compare synchronized original/simplified circuits with exhaustive equivalence checks.

## Stack

React, TypeScript, Vite, `@xyflow/react`, Dagre, and Lucide React. Calculations run in the browser; no backend or external API is required. The interface uses a restrained responsive layout and graph controls for zoom, pan, and fit-to-view.

## Run locally (Node.js 24+)

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Verification

```sh
npm run test
npm run lint
npm run build
```

Tests use Node's built-in test runner and TypeScript type stripping; no extra test framework is needed. The seven mathematical suites cover exhaustive Boolean states, exact boundaries, all 64 forward-edge DAGs on four nodes, Hasse reachability preservation, cycle/reference validation, critical paths, and semester constraints.

Browser regression tests use Python Playwright:

```sh
python -m pip install playwright
python -m playwright install chromium
npm run dev -- --host 127.0.0.1 --port 5180
# In another terminal:
python tests/browser.py
```

The browser suite operates all five modules, tests state changes, guided demos, Hasse reduction, scenarios, simulation, invalid inputs and mobile widths, and fails on runtime exceptions. Screenshots are generated under `tests/` and ignored by Git.

## Project structure

- `src/App.tsx` — application navigation and lazy-loaded module views.
- `src/applications/` — focused task/course, home, scholarship and machine workflows.
- `src/components/DependencyGraph.tsx` — Dagre-laid-out React Flow graph with direct and Hasse modes.
- `src/lib/graphAlgorithms.ts` — cycle detection, topological order/layers, reachability, reduction, and readiness helpers.
- `src/lib/booleanLogic.ts` — typed Boolean operators, generated truth tables, and equivalence verification.
- `src/lib/analysis.ts` — validated critical path, feasible semester planning, policies, correction sets and sensor rules.
- `src/components/` — shared controls, live gate circuits, truth tables, playback, guided demos and graphs.
- `src/lib/useLabState.ts` — independent page-session state across module navigation. Reloading restores defaults; applicant values are not persisted to storage.
- `src/index.css`, `src/expansion.css` — responsive shared styling and accessibility states.

## Current limitations

All sensor data and policies are illustrative. Semester scheduling is feasible and deterministic, with no claim of global optimality. Critical-path timing assumes unlimited parallel workers and positive durations; completion selection affects readiness rather than rewriting the full-project timing model. Task graphs allow cycle experiments but block schedules until resolved; course catalog edits reject invalid dependencies. State survives tab changes within one page session, not reloads. Editors support up to 20 items. Event history retains the latest 50 transitions.

Cloud infrastructure, a general Boolean expression parser, JSON import/export, persistent applicant storage and actual hardware integration were deliberately excluded. They add complexity without improving these classroom workflows. The interface currently uses its existing light theme.

See [DEMO_GUIDE.md](DEMO_GUIDE.md) for reproducible demonstrations and [FEATURE_AUDIT.md](FEATURE_AUDIT.md) for the audit and implementation decisions.
