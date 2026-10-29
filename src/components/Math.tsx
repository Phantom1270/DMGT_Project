import { lazy, Suspense, useEffect, useRef, useState } from "react";
const Renderer = lazy(() => import("./MathRenderer"));
export function MathFormula({
  expression,
  block = false,
}: {
  expression: string;
  block?: boolean;
}) {
  const host = useRef<HTMLSpanElement>(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    let idle: number | undefined, frame: number | undefined;
    const load = () => {
      if ("requestIdleCallback" in window)
        idle = window.requestIdleCallback(() => setReady(true), {
          timeout: 800,
        });
      else frame = requestAnimationFrame(() => setReady(true));
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          load();
        }
      },
      { rootMargin: "150px" },
    );
    if (host.current) observer.observe(host.current);
    return () => {
      observer.disconnect();
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);
  const placeholder = (
    <span
      className={block ? "math-loading math-block" : "math-loading"}
      role="status"
      aria-label="Loading mathematical notation"
    />
  );
  return (
    <span
      ref={host}
      className={block ? "math-slot math-slot-block" : "math-slot"}
    >
      {ready ? (
        <Suspense fallback={placeholder}>
          <Renderer expression={expression} block={block} />
        </Suspense>
      ) : (
        placeholder
      )}
    </span>
  );
}
