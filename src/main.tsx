import { LazyMotion } from "framer-motion";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const loadFeatures = () =>
  import("./lib/motionFeatures").then((module) => module.default);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LazyMotion features={loadFeatures} strict>
      <App />
    </LazyMotion>
  </StrictMode>,
);
