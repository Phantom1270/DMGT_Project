import { useState } from "react";
import type { Theme } from "../../lib/useTheme";
export type LandingAssetStem = "tasks-graph" | "tasks-gantt" | "courses-timeline" | "home-circuit" | "scholarship-policy" | "fault-equivalence";
const heights: Record<LandingAssetStem, number> = {
  "tasks-graph": 1474, "tasks-gantt": 467, "courses-timeline": 321,
  "home-circuit": 631, "scholarship-policy": 631, "fault-equivalence": 550,
};
export function LabFigure({ theme, stem, alt, caption, eager = false }: {
  theme: Theme; stem: LandingAssetStem; alt: string; caption: string; eager?: boolean;
}) {
  const src = `/images/landing/${stem}-${theme}-1280.webp`;
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <figure className={`atlas-figure atlas-figure-${stem}`}>
      <div className="atlas-figure-image" data-atlas-reveal>
        <picture>
          <source media="(max-width: 767px)" srcSet={`/images/landing/${stem}-${theme}-640.webp`} />
          <img src={src} width={1280} height={heights[stem]} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(src)} hidden={failed === src} />
        </picture>
        {failed === src && <p className="atlas-image-fallback">Sample view unavailable. {alt}</p>}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
