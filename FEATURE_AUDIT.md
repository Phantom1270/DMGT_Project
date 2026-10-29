# Expansion audit and implementation plan (historical)

The existing five views compute live outputs, but tab changes unmount and reset them. Task graph rendering is real; course graphs and Boolean circuits are missing. Task names and existing prerequisites cannot be edited. Scheduling and closure calculations are duplicated in the UI. Scholarship uses the wrong policy; machine thresholds include equality despite the new brief requiring strict comparisons.

Implementation order:

1. Consolidate graph validation, critical path, feasible semester scheduling and Boolean policies into pure functions. Test cycles, missing references, closure preservation, schedule constraints and exact boundaries.
2. Split module views; preserve independent state across navigation. Add shared accessible controls, truth-table exploration and state-driven gate circuits.
3. Expand task editing, impact analysis, duration/slack, baseline comparison, undo/redo and topological walkthrough. Expand course editing, target plans and hypothetical completions.
4. Add home thresholds/presets/playback, scholarship policy/sensitivity/scenario analysis, and deterministic machine simulation/history/injection.
5. Verify tests, TypeScript/build, lint and desktop/mobile browser workflows. Review correctness, readability, architecture, security and performance.

Keep the incumbent restrained green palette and readable sans typography. Make diagrams larger than input forms. Use labels and text alongside status colors, visible keyboard focus, responsive tables, and reduced-motion rules. Optional cloud infrastructure, a general expression parser, globally optimal bounded semester scheduling and persistent applicant storage are excluded: they add complexity without improving the requested demonstrations.

## Review outcome

Corrected the default scholarship rule and strict fault thresholds. Removed duplicated graph computations from application views. Added cycle/reference validation, valid Hasse reduction, full-project critical-path timing, target-based feasible semester schedules, and minimal Boolean correction sets. Cyclic task experiments retain the graph but block timing and Hasse mode; invalid course edits are rejected. Invalid sensor readings do not create fabricated threshold-transition events.

React modules load on demand. Session inputs survive navigation without storing applicant data on disk. Inputs, gate explanations and graph nodes have keyboard controls. Desktop and 390px mobile views were rendered and inspected; a circuit grid overflow found by the browser suite was corrected. Animations respect reduced-motion preferences; playback remains user-controlled.

Verification: seven mathematical suites, including exhaustive Boolean tests and all 64 four-node forward-edge DAGs; browser workflows for all five modules; type validation/production build; and Oxlint. A mutation check changed the strict temperature comparator to inclusive and confirmed that the boundary regression failed, then restored the source. The installed Oxlint binary was truncated; the same package/version was re-fetched from npm and its native file repaired without changing dependency versions.

Deliberately excluded in that expansion: cloud services, real sensor commands, arbitrary expression parsing, JSON import/export and cross-refresh persistence. The subsequent redesign below supersedes the original presentation and sharing decisions.

## Mathematical Observatory redesign

- Replaced the muted green presentation with the requested navy/cyan design system, persistent light/dark/system themes, locally bundled variable fonts and an interactive lattice overview.
- Added real routes, back/forward behavior, focus management, a 404 page, skeletons and isolated error recovery.
- Split the planning module into task/course views, a shared editor, samples and project-history hook. Enabled strict TypeScript, replaced the ad-hoc memory map with Zustand, and extracted documented limits.
- Added Gantt and connected semester timelines, minimaps, zoom readouts, animated true signal paths, value badges, KaTeX and computed three/four-variable Karnaugh maps. Maps expose existing rules rather than claiming to be a general minimizer.
- Added real SVG/PNG/CSV/PDF downloads and validated, size-limited share URLs. CSV formula-like cell content is neutralized; decoded scenarios are checked before applying. No applicant data is persisted on disk.
- Added keyboard controls, guided UI highlights, contextual help, adaptive favicon, a web manifest and educational metadata. Sixteen-row truth tables retain native semantics instead of adding virtualization.

### Audit corrections and quality review

The old `App.css` was unused and is removed, but because it was not imported, it was not actually increasing the shipped CSS bundle. Vite also deduplicates repeated CSS module imports; the redundant source import was removed for clarity. The simulation now uses the requested callback/ref pattern without relying on the brief's claim that `useEffectEvent` is experimental. React Flow attribution is visible.

Reviewed correctness, readability, architecture, security and performance. Existing mathematical algorithms and seven test suites are retained. Three added suites exercise shared-state encoding and validation. Browser tests retain all five original workflows and additionally verify navigation/history, both themes at desktop/mobile sizes, actual export file contents, share restoration, K-map inspection, shortcuts, reduced motion, invalid URLs and crash recovery.

The reduced-motion regression exposed a dependency hook that cached the initial preference. The app now subscribes to OS preference changes directly, and removes signal motion when it changes. Performance measurements prompted graph, animation and mathematical typesetting to load separately; below-the-fold formulas initialize near the viewport rather than blocking the first useful content.

Not implemented: cloud services, arbitrary expression parsing, multiplayer, automatic PDF typography with embedded math fonts, sound effects or a service worker. They are outside the five requested classroom workflows or add complexity without improving their correctness. The PDF is a portable text analysis report. The manifest does not imply offline reload support. Production hosting requires SPA route rewrites.

### Production measurement

Lighthouse mobile/simulated-throttling measurements against the local production preview on 29 October 2026:

| Route                    | Performance | Accessibility |
| ------------------------ | ----------: | ------------: |
| Overview `/`             |         100 |           100 |
| Task planner `/tasks`    |          99 |           100 |
| Fault detection `/fault` |          91 |           100 |

Scores vary with host load and deployment. These are measured routes, not an assertion that every possible user scenario has the same score. The initial heavy-route performance scores were 83/84; splitting initial dependencies and deferring offscreen typesetting improved the observed result. Generated reports are ignored by Git and can be recreated with Lighthouse against `npm run preview`.

The final source review also hardened shared scenarios against reserved graph identifiers, missing target/simulation references and writer/reader size-limit mismatches. A mutation check confirmed that weakening a shared brightness boundary causes the sharing regression suite to fail. Original mathematical regression coverage remains unchanged.
