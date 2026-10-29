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

## Warm atelier polish (current presentation)

Replaced the cold palette and neon effects with the brief's warm obsidian/espresso, honey amber, terracotta, sage and parchment tokens. Headings and the wordmark now use self-hosted Newsreader. SVG fills, wire colors, lattice accents, minimaps, graph statuses, Gantt bars and timeline cards use theme variables. Removed unused Vite assets and the empty applications directory. Existing features and routes remain intact.

K-map inspection now offers an explicit Apply combination to scenario action. Scholarship application adjusts the active applicant (including a temporary comparison); machine application pauses playback, sets readings around the actual strict thresholds and records real transitions. Zero-minimum policies that cannot represent a failed condition produce an explanation and preserve inputs. Unit tests exhaust every representable combination.

PDF export now creates an editorial report model rather than dumping interface text. Reports include a serif header, India-time metadata, active parameters, computed summaries, module-specific tables, assumptions, repeated table headers and page numbers. Long cells paginate safely. The exported two-page machine report was extracted and rendered with Poppler; both pages were visually inspected for clipping, alignment and legibility.

Four added polish suites cover K-map input conversion, boundary errors, report correctness and long-row pagination. Existing ten suites remain intact. Browser regression screenshots now assert the exact warm tokens and Newsreader in both themes at 1440px and 390px; an additional workflow checks actual K-map application and report download.

## Proof Atlas implementation (29 October 2026)

The approved overview now uses an oversized editorial masthead, a controlled live B₂ lattice and an illustrated five-lab index. Its 24 responsive WebP files are captured from actual sample sessions in both themes; the capture manifest records revision, routes, inputs and bounds. The six 1280px views total about 96 KB per theme. No mathematical engine, module implementation or session-store logic changed.

The shell passes its resolved theme to figures. Overview navigation keeps all six names visible, including exactly 768px; a dedicated regression covers that breakpoint. Lattice controls have 44px minimum targets and reserved layout width, verified at 1100px by hit-testing their edges so diagram nodes cannot intercept presses. The tablet title uses the full row. The overview overrides the existing 360px page minimum to support 320px; enlarged text also remains in flow. Space scrolls the overview while simulation playback remains intact in labs.

GSAP/ScrollTrigger is a separate optional chunk of about 45.9 KB gzip, limited to one 240px native-scroll comparison of a dependency graph and its Gantt schedule. Enhancement starts only while the scene remains below the viewport. Static paired figures survive reduced motion, short screens, missing images, blocked modules and delayed imports after navigation. Dynamic preference changes revert the scene. No scroll hijacking or semantic-state animation is used.

Verification: all 14 existing Node tests, lint and production build pass. Existing browser, redesign and warm-polish workflows pass, including actual exports/sharing and all five labs. New landing coverage checks all four lattice states, rapid input, named navigation, six viewport sizes in both themes, 200% text, intermediate widths, missing images, scene progress, blocked/delayed modules and reduced-motion changes. An independent source review identified the 768px label and 1100px hit-target defects; focused tests reproduced both before correction.

Two mobile Lighthouse runs against the production preview measured performance 99–100, accessibility 100, LCP 0.8–1.6s, CLS 0.001 and blocking time 20–40ms, with roughly 525 KiB transferred. These describe the local audited route/device profile, not every host or scenario. QA output lives under ignored `.tmp/atlas/`.

The taste inspection's secondary-text heuristic classified the deliberately approved 14px navigation/captions as body copy; actual descriptions are 18px desktop and 16px phone. That exact rule is allowed alongside the existing warm-palette brand exception, without marking the whole page as an app fragment. No stock footage was added: the live experiment and genuine product imagery carry the explanation. The size-count and restrained-motion warnings are retained as documented design choices.

Final visual inspection reported zero rule failures with those two specific allowances and three documented warnings. A real AND-to-OR mutation in an isolated build was rejected by the browser lattice test, then the source was restored byte-for-byte. Intermediate scroll captures also exposed overlapping figure captions; the explanatory caption now stays fully opaque and fixed outside the crossfading image layers, with a regression checking its position.
