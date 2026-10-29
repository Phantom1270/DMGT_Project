import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  GitBranch,
  GraduationCap,
  House,
  Award,
  Activity,
  MoveRight,
} from "lucide-react";
const labs = [
  {
    id: "tasks",
    title: "Task planner",
    concept: "Partial orders · Critical paths",
    description: "Build a dependency graph. Find the work that sets the pace.",
    icon: GitBranch,
    formula: "A ≺ B ≺ C",
    type: "graph",
  },
  {
    id: "courses",
    title: "Course eligibility",
    concept: "Transitivity · Learning paths",
    description: "Trace prerequisites and chart a route to your next course.",
    icon: GraduationCap,
    formula: "P → DS → A",
    type: "graph",
  },
  {
    id: "home",
    title: "Smart home",
    concept: "Boolean gates · Sensor rules",
    description:
      "Turn sensor readings into decisions, one logic gate at a time.",
    icon: House,
    formula: "L = PD + M",
    type: "circuit",
  },
  {
    id: "scholarship",
    title: "Scholarship",
    concept: "Policies · Sensitivity analysis",
    description:
      "Explore the conditions and pathways behind a qualifying decision.",
    icon: Award,
    formula: "E = C(AB + D)",
    type: "circuit",
  },
  {
    id: "fault",
    title: "Fault detection",
    concept: "Distributive law · Equivalence",
    description: "Inject a fault. Follow its cause. Simplify the circuit.",
    icon: Activity,
    formula: "TV + TC = T(V + C)",
    type: "circuit",
  },
];
export default function Landing() {
  const [a, setA] = useState(true),
    [b, setB] = useState(false);
  return (
    <div className="landing">
      <div className="landing-hero">
        <div>
          <div className="course-label">
            <span /> An interactive mathematics atelier
          </div>
          <h1>
            DiscreteLab<span className="title-dot">.</span>
          </h1>
          <p className="hero-subtitle">
            See the structure.
            <br />
            Follow the logic.
          </p>
          <p className="hero-description">
            Interactive explorations in lattices and Boolean algebra. Change an
            input, trace the relationships, and discover why the result follows.
          </p>
          <Link className="primary-link" to="/tasks">
            Enter the laboratory <MoveRight size={18} />
          </Link>
          <div className="hero-caption">
            Five connected ideas. Five real-world experiments.
          </div>
        </div>
        <div className="hero-experiment">
          <div className="experiment-heading">
            <span>Boolean lattice B₂</span>
            <span className="live-chip">Live experiment</span>
          </div>
          <svg
            viewBox="0 0 400 300"
            role="img"
            aria-label="Four-element subset lattice. Meet is intersection and join is union."
          >
            <defs>
              <radialGradient id="lattice-aura">
                <stop stopColor="var(--accent-primary)" stopOpacity=".14" />
                <stop
                  offset="1"
                  stopColor="var(--accent-primary)"
                  stopOpacity="0"
                />
              </radialGradient>
            </defs>
            <circle cx="200" cy="150" r="145" fill="url(#lattice-aura)" />
            {[
              [200, 45, 85, 150],
              [200, 45, 315, 150],
              [85, 150, 200, 255],
              [315, 150, 200, 255],
            ].map((line, i) => (
              <line
                key={i}
                x1={line[0]}
                y1={line[1]}
                x2={line[2]}
                y2={line[3]}
                className="lattice-line"
              />
            ))}
            {[
              { x: 200, y: 45, label: "{a, b}", active: a && b },
              { x: 85, y: 150, label: "{a}", active: a && !b },
              { x: 315, y: 150, label: "{b}", active: !a && b },
              { x: 200, y: 255, label: "∅", active: !a && !b },
            ].map((n) => (
              <g
                key={n.label}
                className={n.active ? "lattice-point active" : "lattice-point"}
              >
                <circle cx={n.x} cy={n.y} r="30" />
                <text x={n.x} y={n.y + 5} textAnchor="middle">
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
          <div className="lattice-controls">
            <button aria-pressed={a} onClick={() => setA(!a)}>
              a = {Number(a)}
            </button>
            <button aria-pressed={b} onClick={() => setB(!b)}>
              b = {Number(b)}
            </button>
            <span aria-live="polite">
              a ∧ b = {Number(a && b)} <i /> a ∨ b = {Number(a || b)}
            </span>
          </div>
          <p>Toggle the inputs. A lattice connects structure to logic.</p>
        </div>
      </div>
      <section className="lab-catalog" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <h2 id="catalog-title">Choose your experiment</h2>
            <p>
              Start anywhere. Every lab lets you change the rules of the
              scenario.
            </p>
          </div>
          <span>Module 4 / 5 labs</span>
        </div>
        <div className="module-cards">
          {labs.map(
            (
              { id, title, concept, description, icon: Icon, formula, type },
              index,
            ) => (
              <Link
                className={`module-card module-${id}`}
                to={`/${id}`}
                key={id}
              >
                <div className="module-card-top">
                  <span className="catalog-icon">
                    <Icon size={22} />
                  </span>
                  <span className="catalog-index">0{index + 1}</span>
                </div>
                <div className="mini-preview" aria-hidden="true">
                  {type === "graph" ? (
                    <svg viewBox="0 0 300 70">
                      <path d="M 40 35 H 105 M 145 35 H 210" />
                      <rect x="10" y="17" width="50" height="36" rx="8" />
                      <rect x="110" y="17" width="50" height="36" rx="8" />
                      <rect x="210" y="17" width="75" height="36" rx="8" />
                      <circle cx="35" cy="35" r="4" />
                      <circle cx="135" cy="35" r="4" />
                      <circle cx="247" cy="35" r="4" />
                    </svg>
                  ) : (
                    <div className="preview-formula">{formula}</div>
                  )}
                </div>
                <span className="card-concept">{concept}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="launch-label">
                  Launch lab <ArrowUpRight size={17} />
                </span>
              </Link>
            ),
          )}
        </div>
      </section>
      <div className="landing-note">
        <span>
          Change an input → trace the mathematics → understand the result
        </span>
        <span>Lattices &amp; Boolean Algebra</span>
      </div>
    </div>
  );
}
