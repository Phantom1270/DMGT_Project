import { useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Theme } from "../lib/useTheme";
import { LatticeExperiment } from "./landing/LatticeExperiment";
import { ExperimentCatalog } from "./landing/ExperimentCatalog";
import { LabFigure } from "./landing/LabFigure";
import { labs } from "./landing/labs";
import { useLandingReveals } from "./landing/useLandingReveals";
const wideQuery = "(min-width: 768px)";
function subscribeWide(change: () => void) {
  const media = window.matchMedia(wideQuery);
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}
export default function Landing({ theme }: { theme: Theme }) {
  const [a, setA] = useState(true),
    [b, setB] = useState(false);
  const wide = useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(wideQuery).matches,
    () => false,
  );
  const root = useRef<HTMLDivElement>(null);
  useLandingReveals(root);
  return (
    <div className="landing atlas" ref={root}>
      <section className="atlas-hero" aria-labelledby="atlas-title">
        <div className="atlas-intro">
          <h1 id="atlas-title">DiscreteLab.</h1>
          <p className="atlas-proposition">
            See the structure.
            <br />
            Follow the logic.
          </p>
          <div className="atlas-summary">
            <p className="atlas-lead">
              Five interactive labs for lattices and Boolean algebra.
            </p>
            <p>
              Change an input, trace the relationships, and discover why the
              result follows.
            </p>
            <Link className="primary-link atlas-action" to="/tasks">
              Enter the laboratory <ArrowRight size={19} />
            </Link>
          </div>
        </div>
        <div className="atlas-proof-band">
          <LatticeExperiment a={a} b={b} onAChange={setA} onBChange={setB} />
          {wide && (
            <div className="atlas-hero-evidence">
              <LabFigure
                theme={theme}
                stem="tasks-gantt"
                eager
                alt="Five real project tasks scheduled over four units, including a parallel frontend branch."
                caption="A sample project, seen as a schedule. Four units from database design to deployment."
              />
            </div>
          )}
        </div>
      </section>
      <ExperimentCatalog labs={labs} theme={theme} />
      <div className="atlas-close">
        <p>
          Change an input <span aria-hidden="true">→</span> trace the
          mathematics <span aria-hidden="true">→</span> understand the result
        </p>
        <p>Five connected ideas. Five real-world experiments.</p>
      </div>
    </div>
  );
}
