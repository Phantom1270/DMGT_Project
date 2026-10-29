import { useEffect } from "react";
import { animate, m, useMotionValue, useTransform } from "framer-motion";
import { useReducedMotionPreference } from "../lib/useReducedMotionPreference";
export function AnimatedNumber({ value }: { value: number }) {
  const reduced = useReducedMotionPreference(),
    number = useMotionValue(value),
    formatted = useTransform(number, (n) => Number(n.toFixed(3)).toString());
  useEffect(() => {
    if (reduced) {
      number.set(value);
      return;
    }
    const controls = animate(number, value, {
      duration: 0.25,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, reduced, number]);
  return <m.b aria-label={String(value)}>{formatted}</m.b>;
}
