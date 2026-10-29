import { useReducedMotionPreference } from "./lib/useReducedMotionPreference";
import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import {
  GitBranch,
  GraduationCap,
  House,
  Award,
  Activity,
  FlaskConical,
  Sun,
  Moon,
  LayoutGrid,
  Keyboard,
  Monitor,
} from "lucide-react";
import { useTheme } from "./lib/useTheme";
import { decodeScenario, useSession } from "./lib/sessionStore";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Skeleton } from "./components/Skeleton";
import { ExportMenu } from "./components/ExportMenu";
import Landing from "./components/Landing";
const TaskPlanner = lazy(() => import("./modules/task-planner/TaskPlanner"));
const CoursePlanner = lazy(
  () => import("./modules/course-planner/CoursePlanner"),
);
const SmartHome = lazy(() => import("./modules/smart-home/SmartHome"));
const Scholarship = lazy(() => import("./modules/scholarship/Scholarship"));
const Fault = lazy(() => import("./modules/fault-detection/FaultDetection"));
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
function RouteFocus({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const focus = () => {
      const heading = root.current?.querySelector("h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        return true;
      }
      return false;
    };
    if (focus()) return;
    const observer = new MutationObserver(() => {
      if (focus()) observer.disconnect();
    });
    if (root.current)
      observer.observe(root.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return <div ref={root}>{children}</div>;
}
function Shell() {
  const routeLocation = useLocation();
  const { pathname, search } = routeLocation,
    navigate = useNavigate(),
    { theme, toggle, useSystem } = useTheme(),
    [help, setHelp] = useState(false),
    reduced = useReducedMotionPreference();
  const dialog = useRef<HTMLDialogElement>(null),
    current = modules.find((m) => pathname === `/${m.id}`),
    known = pathname === "/" || Boolean(current);
  useEffect(() => {
    document.title = current
      ? `${current.name} — DiscreteLab`
      : pathname === "/"
        ? "DiscreteLab — Mathematical Atelier"
        : "Lab not found — DiscreteLab";
  }, [pathname, current]);
  const shared = useMemo(() => {
    const encoded = new URLSearchParams(search).get("scenario");
    if (!encoded || !current) return { payload: null, error: "" };
    try {
      return { payload: decodeScenario(encoded, current.id), error: "" };
    } catch (error) {
      return {
        payload: null,
        error:
          error instanceof Error ? error.message : "Invalid shared scenario.",
      };
    }
  }, [search, current]);
  useEffect(() => {
    if (shared.payload) useSession.getState().hydrate(shared.payload);
  }, [shared]);
  useEffect(() => {
    if (help) dialog.current?.showModal();
    else dialog.current?.close();
  }, [help]);
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest("input,textarea,select,[contenteditable=true]") ||
        event.altKey
      )
        return;
      if (event.key === "Escape") {
        setHelp(false);
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        setHelp((v) => !v);
        return;
      }
      if (help || target.closest("dialog")) return;
      if (!event.ctrlKey && !event.metaKey) {
        const number = Number(event.key);
        if (number >= 1 && number <= 5) {
          event.preventDefault();
          navigate(`/${modules[number - 1].id}`);
          return;
        }
        if (event.key.toLowerCase() === "d") {
          event.preventDefault();
          toggle();
          return;
        }
        if (event.key.toLowerCase() === "r") {
          event.preventDefault();
          [...document.querySelectorAll<HTMLButtonElement>("#workspace button")]
            .find((button) =>
              [
                "Reset example",
                "Reset curriculum",
                "Reset home",
                "Reset scholarship",
                "Reset machine",
              ].includes(button.textContent?.trim() ?? ""),
            )
            ?.click();
          return;
        }
        if (current && event.code === "Space" && !target.closest("button,a,summary")) {
          event.preventDefault();
          window.dispatchEvent(new Event("lab:playback"));
          return;
        }
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        pathname === "/tasks" &&
        ["z", "y"].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
        const label =
          event.key.toLowerCase() === "y" || event.shiftKey ? "Redo" : "Undo";
        const button = [
          ...document.querySelectorAll<HTMLButtonElement>("#workspace button"),
        ].find((b) => b.textContent?.trim() === label);
        button?.click();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [help, navigate, pathname, toggle, current]);
  return (
    <div className="app-shell" data-page={pathname === "/" ? "overview" : "lab"}>
      <a className="skip" href="#workspace">
        Skip to laboratory
      </a>
      <header className="app-header">
        <Link className="brand" to="/">
          <div className="brand-mark">
            <FlaskConical size={23} />
          </div>
          <div>
            <b>
              DiscreteLab<span>.</span>
            </b>
            <small>Mathematics, made visible</small>
          </div>
        </Link>
        <div className="header-tools">
          <span className="module-badge">
            Module 4 <i /> Lattices &amp; Boolean algebra
          </span>
          <button
            className="icon-control"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={toggle}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="icon-control system-theme"
            aria-label="Use system theme"
            onClick={useSystem}
          >
            <Monitor size={17} />
          </button>
          <button
            className="icon-control"
            aria-label="Keyboard shortcuts"
            onClick={() => setHelp(true)}
          >
            <Keyboard size={18} />
          </button>
        </div>
      </header>
      <nav className="lab-navigation" aria-label="Applications">
        <NavLink to="/" end aria-label="Overview">
          {({ isActive }) => (
            <>
              {isActive && pathname !== "/" && (
                <m.span
                  className="nav-selection"
                  layoutId="lab-navigation"
                  transition={{ duration: reduced ? 0 : 0.2 }}
                />
              )}
              <LayoutGrid size={17} />
              <span>Overview</span>
            </>
          )}
        </NavLink>
        {modules.map(({ id, name, icon: Icon }) => (
          <NavLink key={id} to={`/${id}`} aria-label={name}>
            {({ isActive }) => (
              <>
                {isActive && pathname !== "/" && (
                  <m.span
                    className="nav-selection"
                    layoutId="lab-navigation"
                    transition={{ duration: reduced ? 0 : 0.2 }}
                  />
                )}
                <Icon size={17} />
                <span>{name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <main
        id="workspace"
        className={`workspace ${pathname === "/" ? "overview-workspace" : ""}`}
      >
        {current && (
          <div className="workspace-toolbar">
            <span className="workspace-context">
              <current.icon size={15} />
              {current.name} laboratory
            </span>
            <ExportMenu />
          </div>
        )}
        {shared.error && (
          <p className="alert" role="alert">
            {shared.error} The supplied scenario was not applied.
          </p>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={pathname}
            initial={reduced || pathname === "/" ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced || pathname === "/" ? { opacity: 1 } : { opacity: 0, y: -5 }}
            transition={{ duration: 0.16 }}
          >
            <RouteFocus>
              <ErrorBoundary>
                <Suspense fallback={<Skeleton />}>
                  <Routes location={routeLocation}>
                    <Route path="/" element={<Landing theme={theme} />} />
                    {modules.map((m) => (
                      <Route
                        key={m.id}
                        path={`/${m.id}`}
                        element={<m.View />}
                      />
                    ))}
                    <Route
                      path="*"
                      element={
                        <section className="error-panel">
                          <span>404 / Unknown coordinate</span>
                          <h1>This laboratory isn’t on the map.</h1>
                          <p>
                            Choose one of the five experiments or return to the
                            observatory.
                          </p>
                          <Link className="primary-link" to="/">
                            Back to overview
                          </Link>
                        </section>
                      }
                    />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </RouteFocus>
          </m.div>
        </AnimatePresence>
      </main>
      <footer>
        {pathname === "/" ? <>
          <Link to="/" className="atlas-footer-wordmark">DiscreteLab.</Link>
          <div className="atlas-footer-notes"><p>Module 4 · Lattices &amp; Boolean algebra</p><p>Explore. Change. Understand.</p></div>
        </> : <>
        <span>
          <FlaskConical size={14} /> DiscreteLab · An interactive mathematics
          atelier
        </span>
        <span>
          {known ? "Explore. Change. Understand." : "Choose a lab to begin."}
        </span>
        </>}
      </footer>
      <dialog
        ref={dialog}
        className="shortcuts-dialog"
        onCancel={() => setHelp(false)}
        onClose={() => setHelp(false)}
      >
        <div className="dialog-heading">
          <h2>Find your flow</h2>
          <button aria-label="Close shortcuts" onClick={() => setHelp(false)}>
            Close
          </button>
        </div>
        <p>Shortcuts are inactive while editing a field.</p>
        <dl>
          {[
            ["1–5", "Switch laboratory"],
            ["D", "Toggle dark / light"],
            ["R", "Reset current laboratory"],
            ["Space", "Play / pause simulation"],
            ["Ctrl / ⌘ + Z", "Undo task edit"],
            ["Ctrl / ⌘ + Y", "Redo task edit"],
            ["?", "Show these shortcuts"],
            ["Esc", "Close this dialog"],
          ].map(([keys, action]) => (
            <div key={keys}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      </dialog>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
