# Expansion audit and implementation plan

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

Deliberately excluded: cloud services, real sensor commands, arbitrary expression parsing, JSON import/export and cross-refresh persistence. Existing example resets, reversible comparisons and session state provide the requested classroom experimentation without introducing untrusted import schemas or persistent applicant data. The capacity-limited course scheduler provides a feasible deterministic proposal, not an optimal timetable. Current presentation remains a light theme.
