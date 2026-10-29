import type { Work, criticalPath } from "../lib/analysis";
export function GanttChart({
  items,
  analysis,
  onSelect,
}: {
  items: Work[];
  analysis: NonNullable<ReturnType<typeof criticalPath>>;
  onSelect: (id: string) => void;
}) {
  const duration = analysis.duration || 1;
  return (
    <div className="gantt-scroll">
      <div className="gantt-chart">
        <div className="gantt-header">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i}>{Number(((i * duration) / 4).toFixed(2))}</span>
          ))}
        </div>
        <div className="gantt-body">
          {items.map((item) => {
            const time = analysis.times[item.id],
              critical = analysis.critical.includes(item.id);
            return (
              <div className="gantt-row" key={item.id}>
                <span>{item.name}</span>
                <div className="gantt-track">
                  <button
                    className={`gantt-bar ${critical ? "critical" : ""} ${item.completed ? "completed" : ""}`}
                    style={{
                      left: `${(time.es / duration) * 100}%`,
                      width: `${(item.duration / duration) * 100}%`,
                    }}
                    onClick={() => onSelect(item.id)}
                    aria-label={`${item.name}: start ${time.es}, finish ${time.ef}, slack ${time.slack}${critical ? ", critical" : ""}`}
                    title={`ES ${time.es} · EF ${time.ef} · LS ${time.ls} · LF ${time.lf} · Slack ${time.slack}`}
                  >
                    {item.duration}
                  </button>
                </div>
              </div>
            );
          })}
          <svg
            className="gantt-links"
            viewBox={`0 0 1000 ${items.length * 55}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {analysis.edges.map(([from, to]) => (
              <path
                key={`${from}-${to}`}
                d={`M ${(analysis.times[from].ef / duration) * 1000} ${items.findIndex((x) => x.id === from) * 55 + 27.5} V ${items.findIndex((x) => x.id === to) * 55 + 27.5} H ${(analysis.times[to].es / duration) * 1000}`}
                fill="none"
                stroke="var(--accent-warning)"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
            ))}
          </svg>
        </div>
      </div>
      <p className="gantt-note">
        Bars use earliest start and actual duration. Amber routes connect
        critical tasks. Focus or hover a bar for ES, EF, LS, LF and slack.
      </p>
    </div>
  );
}
