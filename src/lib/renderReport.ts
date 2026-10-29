import { jsPDF } from "jspdf";
import type { Report } from "./report";
const ink: [number, number, number] = [33, 28, 24],
  muted: [number, number, number] = [92, 82, 71],
  brass: [number, number, number] = [154, 103, 0],
  paper: [number, number, number] = [251, 248, 243],
  rule: [number, number, number] = [220, 208, 191];
export function reportText(text: string) {
  return text
    .replaceAll("∧", " AND ")
    .replaceAll("∨", " OR ")
    .replaceAll("→", " -> ")
    .replaceAll("≥", " >= ")
    .replaceAll("≤", " <= ")
    .replaceAll("₹", "INR ")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function renderReport(report: Report) {
  const doc = new jsPDF(),
    margin = 18,
    width = 174;
  let y = 0;
  const date = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  doc.setProperties({
    title: "DiscreteLab Mathematical Report",
    subject: report.module,
    author: "DiscreteLab",
    creator: "DiscreteLab",
    keywords: "Discrete mathematics, analysis, Boolean algebra, dependencies",
  });
  const page = (first = false) => {
    doc.setFillColor(...paper);
    doc.rect(0, 0, 210, 297, "F");
    doc.setTextColor(...ink);
    doc.setFont("times", "bold");
    doc.setFontSize(first ? 23 : 16);
    doc.text("DiscreteLab Mathematical Report", margin, first ? 23 : 21);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text(reportText(report.module), margin, first ? 33 : 29);
    if (first) {
      doc.setFontSize(8);
      doc.text(
        `Generated ${reportText(date)} IST  |  Module 4: Lattices & Boolean Algebra`,
        margin,
        42,
      );
    }
    doc.setDrawColor(...rule);
    doc.line(margin, first ? 48 : 35, 192, first ? 48 : 35);
    y = first ? 59 : 46;
  };
  const nextPage = () => {
    doc.addPage();
    page();
  };
  const ensure = (height: number) => {
    if (y + height > 276) nextPage();
  };
  const heading = (title: string) => {
    ensure(30);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...ink);
    doc.text(title, margin, y);
    y += 8;
  };
  const table = (title: string, headers: string[], rows: string[][]) => {
    heading(title);
    const columns =
      headers.length === 2
        ? [66, 108]
        : headers.length === 6
          ? [54, 24, 24, 24, 24, 24]
          : headers.length === 5
            ? [20, 20, 20, 57, 57]
            : [42, 43, 56, 33];
    const header = () => {
      doc.setFillColor(236, 227, 212);
      doc.rect(margin, y, width, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      let x = margin;
      headers.forEach((value, i) => {
        doc.text(reportText(value), x + 3, y + 6.2);
        x += columns[i];
      });
      y += 10;
    };
    header();
    if (!rows.length)
      rows = [
        headers.map((_, i) => (i === 0 ? "No entries for this scenario" : "")),
      ];
    for (const [index, row] of rows.entries()) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.4);
      const cells = row.map(
          (cell, i) =>
            doc.splitTextToSize(reportText(cell), columns[i] - 6) as string[],
        ),
        lineCount = Math.max(1, ...cells.map((lines) => lines.length)),
        fullHeight = Math.max(10, lineCount * 4.1 + 6);
      const continued = () => {
        nextPage();
        heading(`${title} (continued)`);
        header();
      };
      if (fullHeight <= 220 && y + fullHeight > 276) continued();
      let offset = 0;
      while (offset < lineCount) {
        if (276 - y < 10) continued();
        const take = Math.min(
            lineCount - offset,
            Math.max(1, Math.floor((276 - y - 6) / 4.1)),
          ),
          height = Math.max(10, take * 4.1 + 6);
        if (index % 2 === 0) {
          doc.setFillColor(246, 240, 231);
          doc.rect(margin, y, width, height, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.4);
        doc.setTextColor(...ink);
        let x = margin;
        cells.forEach((lines, i) => {
          const part = lines.slice(offset, offset + take);
          if (part.length) doc.text(part, x + 3, y + 5.8);
          x += columns[i];
        });
        doc.setDrawColor(...rule);
        doc.line(margin, y + height, 192, y + height);
        y += height;
        offset += take;
        if (offset < lineCount) continued();
      }
    }
    y += 12;
  };
  page(true);
  table("Analysis summary", ["Measure", "Current result"], report.summary);
  table("Active parameters", ["Parameter", "Value"], report.parameters);
  for (const data of report.tables) table(data.title, data.headers, data.rows);
  heading("Assumptions and interpretation");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  for (const note of report.notes) {
    const lines = doc.splitTextToSize(reportText(note), width) as string[];
    for (const line of lines) {
      ensure(6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      doc.text(line, margin, y);
      y += 4.8;
    }
    y += 4;
  }
  const count = doc.getNumberOfPages();
  for (let n = 1; n <= count; n++) {
    doc.setPage(n);
    doc.setDrawColor(...rule);
    doc.line(margin, 282, 192, 282);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...brass);
    doc.text("DiscreteLab / Mathematical Atelier", margin, 288);
    doc.setTextColor(...muted);
    doc.text(`${n} / ${count}`, 192, 288, { align: "right" });
  }
  return doc;
}
