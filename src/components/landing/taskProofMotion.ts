import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/** Enhance only below the viewport, so lazy initialization cannot move what is being read. */
export async function initTaskProofMotion(
  root: HTMLElement,
): Promise<() => void> {
  const images = [...root.querySelectorAll<HTMLImageElement>("img")];
  await Promise.all(
    images.map((image) => image.decode().catch(() => undefined)),
  );
  const media = gsap.matchMedia();
  const context = gsap.context(() => {
    media.add(
      {
        desktop:
          "(min-width: 1100px) and (min-height: 800px) and (pointer: fine)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (match) => {
        if (
          !match.conditions?.desktop ||
          match.conditions?.reduced ||
          !root.isConnected ||
          images.some((image) => !image.naturalWidth) ||
          root.getBoundingClientRect().top <= innerHeight + 32
        )
          return;
        const graph = root.querySelector<HTMLElement>(".atlas-task-graph")!;
        const gantt = root.querySelector<HTMLElement>(".atlas-task-gantt")!;
        root.classList.add("atlas-scene-enhanced");
        root.dataset.enhanced = "true";
        gsap.set(gantt, { opacity: 0, y: 12 });
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top+=96",
            end: "+=240",
            scrub: true,
            id: "atlas-task-proof",
          },
        });
        timeline
          .to(graph, { opacity: 0, duration: 0.3 }, 0.35)
          .to(gantt, { opacity: 1, y: 0, duration: 0.3 }, 0.35)
          .to(gantt, { opacity: 1, duration: 0.35 }, 0.65);
        ScrollTrigger.refresh();
        return () => {
          root.classList.remove("atlas-scene-enhanced");
          delete root.dataset.enhanced;
        };
      },
    );
  }, root);
  return () => {
    media.revert();
    context.revert();
  };
}
