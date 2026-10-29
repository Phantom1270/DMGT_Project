# Classroom demonstration guide

Use **Start demo** inside any module for a short guided walkthrough. All examples use simulated data. Navigation preserves module inputs for the current page session; reloading starts a fresh session.

The new overview includes a live Boolean lattice. Toggle `a` and `b` and inspect meet (AND) and join (OR). Launch a lab from its card or use `1–5`. Theme controls are in the header; `D` switches themes and `?` opens shortcut help.

Guided-demo steps now highlight the relevant input or visualization. Each module's Export / share menu can save a diagram, table or PDF, or copy a scenario link that restores the inputs in a fresh page.

## Task dependency planner

1. Reset the example: four unit-duration stages and a project duration of 4.
2. Select Build backend, start what-if, and set duration to 3. The project now takes 6 units. Compare earliest/latest times and zero-slack tasks; discard the scenario to restore 4.
3. Select Integrate API and add Design database as another prerequisite. Direct mode shows the extra edge; Hasse mode removes it because database already precedes backend and integration.
4. Load the cycle example. Scheduling is disabled and cycle edges turn red. Reset, then use Next/Previous or Play to explore topological sorting.

Switch to **Gantt chart** to see actual-duration bars and amber critical connections. Hover/focus a bar to inspect its times; click it to edit that task. Use Ctrl/⌘+Z and Y outside fields to undo/redo edits.

Concepts: partial orders, reachability, covering relations, topological layers, and critical path under unlimited workers. Completion switches control readiness; project timing covers the entire project.

## Course learning paths

1. Reset the curriculum and target Deep Learning. Mark Programming and Data Structures complete. Discrete Mathematics remains eligible; Algorithms remains locked.
2. Complete Discrete Mathematics. Algorithms becomes eligible. Inspect its node and missing prerequisite explanations.
3. Start what-if completion, mark Algorithms complete, and observe Machine Learning unlock. Discard to restore the transcript.
4. Change maximum courses per semester and inspect the target-based feasible plan. Marking an advanced course completed out of order produces a consistency warning rather than rewriting history.

The semester timeline draws actual prerequisite connections between course cards. Completed selections appear in a separate recorded-history lane.

Concepts: direct versus transitive prerequisites and capacity-constrained feasible schedules. This is a hypothetical plan, not official registration or a globally optimal timetable.

## Smart home

1. Load Empty daytime: all devices are off.
2. Load Manual override: the light turns on despite no occupancy or darkness. Inspect the Light OR gate explanation.
3. Set brightness to 30 and darkness threshold to 30: D=0. Lower brightness to 29: D=1. Temperature uses ≥, while darkness uses <.
4. Expand the light truth table and apply a row. Sensors and circuit values change together. Play the daily scenario and pause it at any point.

Concepts: threshold conversion, AND/OR, intermediate gate evaluation, and nonequivalence of PD+M versus D(P+M).

## Scholarship policies

1. Reset: CGPA 8.4, income ₹3,00,000, attendance 75%, no achievement. The default rule C((AB)+D) fails.
2. Click CGPA at threshold. CGPA becomes 8.5 and eligibility becomes true.
3. Compare an applicant and lower attendance to 74%. Both qualifying pathways are blocked by C. Discard the alternative.
4. Inspect minimal correction sets, switch demonstration policies, and explore truth-table rows without changing numeric inputs.

Inspect the four-variable Karnaugh map: rows and columns follow Gray-code order. Clicking a cell inspects the Boolean combination. Use Apply combination to scenario to set numeric values that realize it. With a zero CGPA/attendance minimum, the corresponding failed condition cannot be represented; the lab explains this and preserves the inputs.

Concepts: necessary conditions, alternative sufficient pathways, sensitivity to single flips, and minimal sets of failed conditions to correct. These are hypothetical scholarship policies.

## Machine fault detection

1. Reset machine to normal readings. Inject a temperature spike alone: no defined fault occurs because V and C remain false.
2. Simulate cooling failure: TC triggers a fault. Set temperature to exactly 80°C: T=0 and the fault clears.
3. Inspect synchronized original and simplified circuits, all 8 truth-table combinations, and actual event transitions.
4. Start simulation to replay six deterministic states. Pause or reset, and adjust the simulation interval.

Compare the three-variable Karnaugh map with the two circuit designs. The map's true cells form the two overlapping pairs TV and TC; both circuits still produce the same result in all eight combinations. Space plays/pauses when focus is outside a field or button.

Concepts: strict > thresholds, root-cause branches, distributive law, and gate-count reduction from 3 to 2 two-input gates. A false illustrative fault rule is not a real-world safety guarantee.

## Warm presentation and reports

The header theme toggle switches between espresso/amber dark mode and archival parchment light mode. Newsreader headings and copper/brass diagrams replace the previous neon treatment. Use Analysis as PDF in Export / share for a structured mathematical report with active inputs, computed summary tables, assumptions and page numbering. In the machine K-map, inspect T=1, V=0, C=1 and apply it: readings become temperature threshold + 1, vibration exactly at its threshold, and cooling failed. The TC branch triggers and event history records the transition.

## Proof Atlas overview

On `/`, toggle `a` and `b` to visit all four subsets. Meet/AND and join/OR values update immediately. The illustrated index links to the same five working labs; its images show documented sample states, not the current session's edits. On eligible desktop screens, scroll through the task entry to compare dependency order with a four-unit Gantt schedule. Both depict the same default project; the parallel frontend task has one unit of slack.

On a phone the destination names remain visible, controls are larger, and the two task figures appear in ordinary reading order. Enable the OS reduced-motion preference to get the same static presentation on desktop. Space scrolls the overview; inside a simulation lab it still controls playback. Theme, system-theme and shortcut controls remain available.
