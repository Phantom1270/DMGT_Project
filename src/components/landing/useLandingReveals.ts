import { useEffect, type RefObject } from "react";
import { useReducedMotionPreference } from "../../lib/useReducedMotionPreference";

export function useLandingReveals(root: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotionPreference();
  useEffect(() => {
    if (reduced || !root.current) return;
    const targets = [
      ...root.current.querySelectorAll<HTMLElement>("[data-atlas-reveal]"),
    ];
    const frames = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          element.classList.add("atlas-reveal-start");
          const frame = requestAnimationFrame(() => {
            const next = requestAnimationFrame(() =>
              element.classList.remove("atlas-reveal-start"),
            );
            frames.add(next);
          });
          frames.add(frame);
        });
      },
      { threshold: 0.15 },
    );
    targets.forEach((target) => {
      if (target.getBoundingClientRect().top >= innerHeight)
        observer.observe(target);
    });
    return () => {
      observer.disconnect();
      frames.forEach(cancelAnimationFrame);
      targets.forEach((target) =>
        target.classList.remove("atlas-reveal-start"),
      );
    };
  }, [root, reduced]);
}
