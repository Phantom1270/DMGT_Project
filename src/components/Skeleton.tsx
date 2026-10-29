export function Skeleton() {
  return (
    <div
      className="module-skeleton"
      role="status"
      aria-label="Loading laboratory"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
      <div className="lab-grid">
        <div className="skeleton skeleton-panel" />
        <div className="skeleton skeleton-panel" />
      </div>
      <span className="sr-only">Loading laboratory…</span>
    </div>
  );
}
