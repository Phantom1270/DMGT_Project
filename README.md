# DiscreteLab

An interactive mathematics lab demonstrating five real-world applications of Module 4: Lattices and Boolean Algebra.

## Applications

- **Task planner:** prerequisite editing, cycle detection, ready tasks, parallel execution stages, and an interactive dependency/Hasse graph with path highlighting.
- **Course eligibility:** curriculum completion controls, eligible and locked courses, and direct/transitive prerequisite explanations.
- **Smart home:** occupancy, lighting, temperature, and security switches drive three Boolean device rules and generated truth tables.
- **Scholarship checker:** CGPA, attendance, income, and service inputs update a four-condition eligibility rule.
- **Fault detection:** temperature, vibration, and cooling inputs drive the fault rule and demonstrate distributive-law equivalence across all eight Boolean combinations.

## Stack

React, TypeScript, Vite, `@xyflow/react`, Dagre, and Lucide React. Calculations run in the browser; no backend or external API is required. The interface uses a restrained responsive layout and graph controls for zoom, pan, and fit-to-view.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Project structure

- `src/App.tsx` — five application views and their independent interactive state.
- `src/components/DependencyGraph.tsx` — Dagre-laid-out React Flow graph with direct and Hasse modes.
- `src/lib/graphAlgorithms.ts` — cycle detection, topological order/layers, reachability, reduction, and readiness helpers.
- `src/lib/booleanLogic.ts` — typed Boolean operators, generated truth tables, and equivalence verification.
- `src/index.css` — shared responsive design system and visualization styling.

## Current limitations

Course prerequisite data is fixed to the sample curriculum. The scholarship checker demonstrates a sample rule and does not verify real applications. Machine readings are simulated. Graph visualization is currently available in the task planner; the course planner presents prerequisite details as text.
