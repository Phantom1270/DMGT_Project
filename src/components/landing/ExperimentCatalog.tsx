import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Theme } from "../../lib/useTheme";
import type { LabEntry } from "./labs";
import { LabFigure } from "./LabFigure";
import { TaskProofScene } from "./TaskProofScene";
function EntryCopy({ lab }: { lab: LabEntry }) {
  return <div className="atlas-entry-copy">
    <h3><Link to={`/${lab.id}`}>{lab.title}<ArrowUpRight aria-hidden="true" /></Link></h3>
    <p className="atlas-concept">{lab.concept}</p>
    <p>{lab.description}</p>
    <p className="atlas-formula">{lab.formula}</p>
    <Link className="atlas-destination" to={`/${lab.id}`} aria-label={`Open ${lab.title.toLowerCase()} lab`}>Launch lab <ArrowUpRight size={17} aria-hidden="true" /></Link>
  </div>;
}
export function ExperimentCatalog({ labs, theme }: { labs: readonly LabEntry[]; theme: Theme }) {
  return <section className="lab-catalog atlas-catalog" aria-labelledby="catalog-title">
    <div className="atlas-catalog-heading"><h2 id="catalog-title">Choose your experiment</h2><p>Start anywhere. Every lab lets you change the rules of the scenario.</p></div>
    {labs.map((lab) => <article key={lab.id} className={`atlas-entry atlas-entry-${lab.id}`}>
      <EntryCopy lab={lab} />
      {lab.id === "tasks" && <TaskProofScene theme={theme} />}
      {lab.id === "courses" && <LabFigure theme={theme} stem="courses-timeline" alt="A feasible five-semester prerequisite route from Programming and Discrete Mathematics to Deep Learning." caption="A sample learning path. Complete the prerequisites before moving to the next course. Capacity: three courses per semester." />}
      {lab.id === "home" && <LabFigure theme={theme} stem="home-circuit" alt="The real light circuit: presence and darkness are true, manual override false, and the light is on." caption="A sample room. Presence and darkness switch the light on; the manual override is off." />}
      {lab.id === "scholarship" && <LabFigure theme={theme} stem="scholarship-policy" alt="The active balanced policy circuit. The sample applicant's CGPA of 8.4 misses the 8.5 threshold." caption="A hypothetical policy. CGPA 8.4 misses the 8.5 threshold, with income ₹300,000, attendance 75% and no achievement." />}
      {lab.id === "fault" && <LabFigure theme={theme} stem="fault-equivalence" alt="All eight combinations of temperature, vibration and cooling produce equal original and simplified fault outputs." caption="Eight combinations. Zero mismatches. At the sample 95°C, vibration 12 and failed cooling, both expressions detect the defined fault." />}
    </article>)}
  </section>;
}
