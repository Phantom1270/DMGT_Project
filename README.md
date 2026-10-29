# DiscreteLab

An interactive mathematics lab demonstrating five real-world applications of Module 4: Lattices and Boolean Algebra.

## Applications

- **Task planner:** edit names, durations and prerequisites; explore real dependency/Hasse diagrams; analyze earliest/latest times, slack and critical edges; compare a baseline; undo/redo; step through topological sorting.
- **Course eligibility:** edit the curriculum, inspect prerequisite paths, choose a target, generate capacity-limited feasible semester plans and apply/discard hypothetical completions. Inconsistent academic histories are explained and retained.
- **Smart home:** numeric sensors and configurable thresholds drive the default light, AC and alarm rules. Explore live gate circuits, presets, deterministic daily playback and truth-table rows that apply real sensor changes.
- **Scholarship checker:** configure three hypothetical policies, compare temporary applicants, inspect minimal correction sets and single-condition sensitivity, and test exact numeric boundaries. Default: `E = C AND ((A AND B) OR D)`.
- **Fault detection:** configure strict thresholds, inject faults, replay a deterministic sensor sequence, inspect root causes and transition history, and compare synchronized original/simplified circuits with exhaustive equivalence checks.

## Stack

React 19, strict TypeScript, Vite, React Router, Zustand, `@xyflow/react`, Dagre, Framer Motion, KaTeX, and Lucide React. Client-side export uses html-to-image and jsPDF, loaded only when needed. Calculations run in the browser; no backend or external API is required.

The Mathematical Atelier design starts with a live Boolean-lattice overview. All five labs support dark/light themes, responsive layouts, mathematical typesetting, guided highlights and keyboard controls. Graph, math and animation engines load separately so they do not block the first useful module content. Newsreader, Inter and JetBrains Mono are bundled locally with their font licenses.

## Navigation and presentation

- `/` — overview and interactive four-element Boolean lattice.
- `/tasks` — dependency graph or Gantt chart, critical paths and schedule analysis.
- `/courses` — editable curriculum, prerequisite graph and connected semester timeline.
- `/home` — sensor simulation and live Boolean circuits.
- `/scholarship` — policies, applicant comparisons and four-variable Karnaugh map with explicit input application.
- `/fault` — fault simulation, equivalent circuits and three-variable Karnaugh map with explicit sensor application.

Routes support refresh, links and browser back/forward. Unknown routes show a useful 404 screen. Production hosting must rewrite SPA paths to `index.html`; the GitHub repository itself is not a hosting deployment. Vite development/preview servers already provide the fallback.

Use the header to toggle themes, follow the system theme or open shortcut help. Explicit theme preference persists locally; applicant inputs do not. `1–5` select a lab, `D` changes theme, `R` resets the active lab, Space plays/pauses a simulation, and Ctrl/⌘+Z or Y undo/redo task edits. Shortcuts do not intercept field editing.

## Export and share

Each lab has an Export / share menu: current diagram as SVG or PNG, available tables as CSV, an editorial PDF report with active parameters, computed summary tables, metadata and numbered pages, and a copied scenario link. Links include the current inputs and restore them on a fresh page. Decoded inputs are size-limited and validated before applying; unknown keys, invalid ranges and invalid course graphs are rejected. Task cycle examples can be shared for teaching. SVG and PNG exports preserve the currently displayed theme/viewport. Reports use serif headings, warm table rules and plain-text mathematical operators for portable PDF fonts.

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

Tests use Node's built-in test runner and TypeScript type stripping. The original seven mathematical suites remain intact. Three additional suites cover scenario encoding, round-trip Unicode data, rejected imports and shareable cycle examples. Four polish suites verify exhaustive K-map input application, impossible thresholds, computed report models and long-row PDF pagination (14 total). Mathematical coverage includes exhaustive Boolean states, exact boundaries, all 64 forward-edge DAGs on four nodes, Hasse reachability preservation, cycle/reference validation, critical paths, and semester constraints.

Browser regression tests use Python Playwright:

```sh
python -m pip install playwright
python -m playwright install chromium
npm run dev -- --host 127.0.0.1 --port 5180
# In another terminal:
python tests/browser.py
python tests/redesign.py
python tests/warm-polish.py
```

The original browser suite operates all five workflows. The redesign suite additionally checks routing, focus, browser history, Gantt selection, semester connections, K-map inspection, KaTeX, actual CSV/SVG/PNG/PDF downloads, shared-state restoration, invalid links, themes at 1440px/390px, keyboard shortcuts and reduced motion. It fails on unexpected console errors or warnings. Screenshots and Lighthouse reports are generated under `tests/` and ignored by Git. Set `DISCRETELAB_TEST_URL` to test a production preview on another port.

## Project structure

- `src/App.tsx` — routed shell, navigation, focus, transitions and keyboard controls.
- `src/modules/` — focused task/course, home, scholarship and machine workflows; shared planning editor and project history hook.
- `src/components/DependencyGraph.tsx` — Dagre-laid-out React Flow graph with direct and Hasse modes.
- `src/lib/graphAlgorithms.ts` — cycle detection, topological order/layers, reachability, reduction, and readiness helpers.
- `src/lib/booleanLogic.ts` — typed Boolean operators, generated truth tables, and equivalence verification.
- `src/lib/analysis.ts` — validated critical path, feasible semester planning, policies, correction sets and sensor rules.
- `src/components/` — shared controls, circuits, truth/Karnaugh tables, Gantt/timeline, exports, skeletons and error boundary.
- `src/lib/sessionStore.ts`, `src/lib/useLabState.ts` — Zustand session state and validated sharing. Reloading restores defaults unless a scenario link is supplied.
- `src/styles/` — documented theme tokens, component styling and reduced-motion-aware animations; imported once from `src/index.css`.
- `PRODUCT.md`, `DESIGN.md` — product constraints and the Mathematical Atelier design language.

## Current limitations

All sensor data and policies are illustrative. Semester scheduling is feasible and deterministic, with no claim of global optimality. Critical-path timing assumes unlimited parallel workers and positive durations; completion selection affects readiness rather than rewriting the full-project timing model. Task graphs allow cycle experiments but block schedules until resolved; course catalog edits reject invalid dependencies. State survives tab changes within one page session, not reloads. Editors support up to 20 items. Event history retains the latest 50 transitions.

Cloud infrastructure, a general Boolean expression parser, arbitrary JSON-file imports, persistent applicant storage and actual hardware integration remain excluded. Share links provide a validated scenario handoff. Truth tables are bounded to at most 16 rows, so virtualization would add complexity and reduce native table accessibility. The web manifest and adaptive SVG icon are included; there is no service worker or claim of offline page reload support.

See [DEMO_GUIDE.md](DEMO_GUIDE.md) for reproducible demonstrations and [FEATURE_AUDIT.md](FEATURE_AUDIT.md) for the audit and implementation decisions.
