import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, Link as LinkIcon, FileText, Image } from "lucide-react";
import { encodeScenario, sharePayload, useSession } from "../lib/sessionStore";
function save(data: Blob, name: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ExportMenu() {
  const { pathname } = useLocation(),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const module = pathname.slice(1);
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Export failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  };
  const diagram = () =>
    document.querySelector<HTMLElement>(
      "#workspace .flow-canvas, #workspace .circuit-scroll, #workspace .gantt-chart, #workspace .semester-timeline",
    );
  const image = async (format: "svg" | "png") => {
    const target = diagram();
    if (!target) throw new Error("Open a graph or circuit before exporting.");
    const { toSvg, toPng } = await import("html-to-image");
    const data = await (format === "svg" ? toSvg : toPng)(target, {
      cacheBust: false,
      pixelRatio: 2,
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-secondary")
        .trim(),
      filter: (node) =>
        !(node as HTMLElement).classList?.contains("react-flow__controls"),
    });
    const blob = await (await fetch(data)).blob();
    save(blob, `discretelab-${module}.${format}`);
    setMessage(`${format.toUpperCase()} diagram exported.`);
  };
  const csv = async () => {
    const tables = [
      ...document.querySelectorAll<HTMLTableElement>("#workspace table"),
    ];
    if (!tables.length) throw new Error("No table is available in this lab.");
    const csv = tables
      .map((table) => {
        const excluded = [...(table.tHead?.rows[0]?.cells ?? [])].flatMap(
          (cell, i) => (cell.textContent?.trim() === "Explore" ? [i] : []),
        );
        return [...table.rows]
          .map((row) =>
            [...row.cells]
              .filter((_, i) => !excluded.includes(i))
              .map((cell) => {
                let value = cell.textContent?.trim() ?? "";
                if (/^[=+\-@\t\r]/.test(value)) value = "'" + value;
                return `"${value.replaceAll('"', '""')}"`;
              })
              .join(","),
          )
          .join("\r\n");
      })
      .join("\r\n\r\n");
    save(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
      `discretelab-${module}.csv`,
    );
    setMessage("Table data exported as CSV.");
  };
  const pdf = async () => {
    const [{ buildReport }, { renderReport }] = await Promise.all([
      import("../lib/report"),
      import("../lib/renderReport"),
    ]);
    const fields = [
      ...document.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        "#workspace input, #workspace select",
      ),
    ];
    const parameters: [string, string][] = fields.flatMap((field) => {
      const label = field.closest("label")?.cloneNode(true) as
        HTMLElement | undefined;
      label
        ?.querySelectorAll("input,select,button")
        .forEach((node) => node.remove());
      const name =
        label?.textContent?.trim() ||
        field.getAttribute("aria-label") ||
        "Input";
      if (name === "New item name" && !field.value) return [];
      const context =
        field
          .closest("fieldset")
          ?.querySelector("legend")
          ?.textContent?.trim() ||
        field.closest("section")?.querySelector("h2")?.textContent?.trim();
      const value =
        field instanceof HTMLSelectElement
          ? (field.selectedOptions[0]?.textContent ?? "None")
          : field.type === "checkbox"
            ? field.checked
              ? "Yes"
              : "No"
            : field.value || "Not set";
      return [[context ? `${context} / ${name}` : name, value]];
    });
    renderReport(
      buildReport(module, useSession.getState().values, parameters),
    ).save(`discretelab-${module}-analysis.pdf`);
    setMessage("Editorial mathematical report exported as PDF.");
  };
  const share = async () => {
    const encoded = encodeScenario(sharePayload(module));
    const url = new URL(location.href);
    url.search = "";
    url.searchParams.set("scenario", encoded);
    await navigator.clipboard.writeText(url.href);
    setMessage("Share link copied, including current lab inputs.");
  };
  return (
    <div className="export-controls">
      <details>
        <summary>
          <Download size={15} /> Export / share
        </summary>
        <div className="export-popover">
          <button disabled={busy} onClick={() => run(() => image("svg"))}>
            <Image size={15} /> Diagram as SVG
          </button>
          <button disabled={busy} onClick={() => run(() => image("png"))}>
            <Image size={15} /> Diagram as PNG
          </button>
          <button disabled={busy} onClick={() => run(csv)}>
            <FileText size={15} /> Tables as CSV
          </button>
          <button disabled={busy} onClick={() => run(pdf)}>
            <FileText size={15} /> Analysis as PDF
          </button>
          <button disabled={busy} onClick={() => run(share)}>
            <LinkIcon size={15} /> Copy scenario link
          </button>
        </div>
      </details>
      <span role="status">{busy ? "Preparing export…" : message}</span>
    </div>
  );
}
