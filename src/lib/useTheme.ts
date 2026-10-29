import { useEffect, useState } from "react";
export type Theme = "dark" | "light";
export function useTheme() {
  const [mode, setMode] = useState<Theme | "system">(() => {
    try {
      const saved = localStorage.getItem("discretelab-theme");
      if (saved === "light" || saved === "dark" || saved === "system")
        return saved;
    } catch {}
    return "dark";
  });
  const [system, setSystem] = useState<Theme>(() =>
    window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark",
  );
  const theme = mode === "system" ? system : mode;
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const change = () => setSystem(media.matches ? "light" : "dark");
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector("meta[name=theme-color]")
      ?.setAttribute("content", theme === "dark" ? "#151311" : "#fbf8f3");
    try {
      localStorage.setItem("discretelab-theme", mode);
    } catch {}
  }, [theme, mode]);
  return {
    theme,
    toggle: () => setMode(theme === "dark" ? "light" : "dark"),
    useSystem: () => setMode("system"),
  };
}
