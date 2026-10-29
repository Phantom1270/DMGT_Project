import type { Theme } from "../../lib/useTheme";
import { useEffect, useRef } from "react";
import { useReducedMotionPreference } from "../../lib/useReducedMotionPreference";
import { LabFigure } from "./LabFigure";
export function TaskProofScene({ theme }: { theme: Theme }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotionPreference();
  useEffect(() => {
    if (
      reduced ||
      !root.current ||
      !window.matchMedia(
        "(min-width: 1100px) and (min-height: 800px) and (pointer: fine)",
      ).matches
    )
      return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void import("./taskProofMotion")
          .then(async ({ initTaskProofMotion }) => {
            if (disposed || !root.current) return;
            const revert = await initTaskProofMotion(root.current);
            if (disposed) revert();
            else cleanup = revert;
          })
          .catch(() => {
            /* The complete static pair remains readable if the optional chunk fails. */
          });
      },
      { rootMargin: "600px" },
    );
    observer.observe(root.current);
    return () => {
      disposed = true;
      observer.disconnect();
      cleanup?.();
    };
  }, [reduced]);
  return (
    <div className="atlas-task-proof" ref={root}>
      <div className="atlas-task-stage">
        <div className="atlas-task-graph">
          <LabFigure
            theme={theme}
            stem="tasks-graph"
            alt="The five-task dependency graph. Database design precedes backend, integration and deployment; frontend runs in parallel."
            caption="First, the order. A dependency says what must happen before the next task."
          />
        </div>
        <div className="atlas-task-gantt">
          <LabFigure
            theme={theme}
            stem="tasks-gantt"
            alt="The same five tasks in a Gantt chart, with earliest starts and one unit of frontend slack."
            caption="Then, the schedule. The critical route takes four units; frontend has one unit of slack."
          />
        </div>
        <p className="atlas-sample-note">
          Same sample project. Dependency order becomes a four-unit schedule.
          The parallel frontend has one unit of slack.
        </p>
      </div>
    </div>
  );
}
