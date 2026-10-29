import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
export default function MathRenderer({
  expression,
  block = false,
}: {
  expression: string;
  block?: boolean;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(expression, {
        displayMode: block,
        throwOnError: false,
        trust: false,
        output: "htmlAndMathml",
      }),
    [expression, block],
  );
  return (
    <span
      className={`math-render ${block ? "math-block" : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
