import type { Theme } from "../../lib/useTheme";
import { LabFigure } from "./LabFigure";
export function TaskProofScene({ theme }: { theme: Theme }) {
  return <div className="atlas-task-proof">
    <div className="atlas-task-stage">
      <div className="atlas-task-graph"><LabFigure theme={theme} stem="tasks-graph" alt="The five-task dependency graph. Database design precedes backend, integration and deployment; frontend runs in parallel." caption="First, the order. A dependency says what must happen before the next task." /></div>
      <div className="atlas-task-gantt"><LabFigure theme={theme} stem="tasks-gantt" alt="The same five tasks in a Gantt chart, with earliest starts and one unit of frontend slack." caption="Then, the schedule. The critical route takes four units; frontend has one unit of slack." /></div>
    </div>
    <p className="atlas-sample-note">Same sample project. Two ways to see its structure.</p>
  </div>;
}
