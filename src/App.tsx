import { lazy, Suspense, useState } from "react";
import {
  GitBranch,
  GraduationCap,
  House,
  Award,
  Activity,
  FlaskConical,
} from "lucide-react";
import "./index.css";
import "./expansion.css";
const TaskPlanner = lazy(() =>
  import("./applications/Planning").then((m) => ({ default: m.TaskPlanner })),
);
const CoursePlanner = lazy(() =>
  import("./applications/Planning").then((m) => ({ default: m.CoursePlanner })),
);
const SmartHome = lazy(() => import("./applications/SmartHome"));
const Scholarship = lazy(() => import("./applications/Scholarship"));
const Fault = lazy(() => import("./applications/Fault"));
const modules = [
  { id: "tasks", name: "Task planner", icon: GitBranch, View: TaskPlanner },
  {
    id: "courses",
    name: "Course eligibility",
    icon: GraduationCap,
    View: CoursePlanner,
  },
  { id: "home", name: "Smart home", icon: House, View: SmartHome },
  { id: "scholarship", name: "Scholarship", icon: Award, View: Scholarship },
  { id: "fault", name: "Fault detection", icon: Activity, View: Fault },
];
export default function App() {
  const [active, setActive] = useState(() =>
    modules.some((m) => m.id === location.hash.slice(1))
      ? location.hash.slice(1)
      : "tasks",
  );
  const View = modules.find((m) => m.id === active)!.View;
  return (
    <div className="app-shell">
      <a className="skip" href="#workspace">
        Skip to laboratory
      </a>
      <header>
        <div className="brand">
          <div className="brand-mark">
            <FlaskConical size={23} />
          </div>
          <div>
            <b>DiscreteLab</b>
            <small>Real-world applications of discrete mathematics</small>
          </div>
        </div>
        <div className="module-badge">
          Module 4 · Lattices &amp; Boolean algebra
        </div>
      </header>
      <nav aria-label="Applications">
        {modules.map(({ id, name, icon: Icon }) => (
          <button
            aria-pressed={active === id}
            className={active === id ? "selected" : ""}
            key={id}
            onClick={() => {
              location.hash = id;
              setActive(id);
            }}
          >
            <Icon size={17} />
            {name}
          </button>
        ))}
      </nav>
      <main id="workspace" className="workspace">
        <Suspense fallback={<p role="status">Loading laboratory…</p>}>
          <View key={active} />
        </Suspense>
      </main>
      <footer>
        <span>DiscreteLab · Interactive mathematics</span>
        <span>Simulations and calculations run in your browser</span>
      </footer>
    </div>
  );
}
