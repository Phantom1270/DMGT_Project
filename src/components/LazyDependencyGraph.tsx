import { lazy, Suspense, type ComponentProps } from "react";
import type { DependencyGraph as Graph } from "./DependencyGraph";
const GraphRenderer = lazy(() =>
  import("./DependencyGraph").then((m) => ({ default: m.DependencyGraph })),
);
export function DependencyGraph(props: ComponentProps<typeof Graph>) {
  return (
    <Suspense
      fallback={
        <div
          className="graph-loading skeleton"
          role="status"
          aria-label="Loading interactive graph"
        />
      }
    >
      <GraphRenderer {...props} />
    </Suspense>
  );
}
