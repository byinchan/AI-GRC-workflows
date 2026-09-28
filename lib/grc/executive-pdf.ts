import type { ExecutiveAnalysis } from "./executive-analysis";
import type { executiveReportModel } from "./executive-report";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 842;
const MARGIN = 42;
const BOTTOM = 48;
const BODY_LEADING = 13;
const esc = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, " ");
const heatColor = { Low: "0.82 0.98 0.90", Medium: "1 0.95 0.78", High: "1 0.93 0.84", Critical: "0.99 0.89 0.89" } as const;
type ReportModel = ReturnType<typeof executiveReportModel>;
type Page = { commands: string[]; y: number };
type CollectionItem = { title?: string; action?: string; analysis?: string; rationale: string; relatedRiskIds: string[] };

function wrap(text: string, width = 88) { return text.replace(/\s+/g, " ").trim().split(" ").reduce<string[]>((lines, word) => { const previous = lines.at(-1) ?? ""; if (`${previous} ${word}`.trim().length > width) lines.push(word); else lines[lines.length - 1] = `${previous} ${word}`.trim(); return lines; }, [""]).filter(Boolean); }
function paragraphs(text: string) { return text.trim().split(/\n\s*\n/).map((paragraph) => wrap(paragraph)).filter((lines) => lines.length); }
function text(value: string, x: number, y: number, size: number, font = "F1") { return `BT /${font} ${size} Tf ${x} ${y} Td (${esc(value)}) Tj ET`; }

function heatMapDrawing(model: ReportModel) {
  const x = 116, y = 542, width = 136, height = 47;
  const labels = [text("Likelihood", 42, 624, 9, "F2"), text("Impact", 312, 704, 9, "F2")];
  return [...labels, ...model.heatMap.cells.flatMap((cell) => {
    const cellX = x + (cell.impact - 1) * width, cellY = y + (3 - cell.likelihood) * height;
    return [`q ${heatColor[cell.rating]} rg ${cellX} ${cellY} ${width - 4} ${height - 4} re f 0.45 0.50 0.60 RG ${cellX} ${cellY} ${width - 4} ${height - 4} re S Q`, text(`${cell.rating} | Score ${cell.score}`, cellX + 6, cellY + 29, 8, "F2"), text(cell.risks.join(", "), cellX + 6, cellY + 15, 8)];
  })].join("\n");
}

export function executivePdfDocument(model: ReportModel, analysis: ExecutiveAnalysis) {
  const pages: Page[] = [{ commands: [], y: 800 }];
  const page = () => pages.at(-1)!;
  const newPage = () => pages.push({ commands: [], y: 800 });
  const available = () => page().y - BOTTOM;
  const ensure = (height: number) => { if (available() < height) newPage(); };
  const addLine = (value: string, size = 11, font = "F1", leading = BODY_LEADING) => { ensure(leading); page().commands.push(text(value, MARGIN, page().y, size, font)); page().y -= leading; };
  const gap = (height: number) => { page().y -= height; };
  const heading = (value: string, minimumContentHeight: number) => { ensure(20 + minimumContentHeight); gap(5); addLine(value, 14, "F2", 17); gap(2); };
  const narrative = (value: string) => { const parts = paragraphs(value); parts.forEach((lines, index) => { lines.forEach((line) => addLine(line)); if (index < parts.length - 1) gap(5); }); };
  const itemHeight = (item: CollectionItem) => {
    const title = item.title ?? item.action ?? "";
    const body = item.analysis ?? item.rationale;
    return wrap(title).length * BODY_LEADING + wrap(body).length * 12 + (item.relatedRiskIds.length ? 11 : 0) + 8;
  };
  const collection = (title: string, items: CollectionItem[], numbered = false) => {
    const firstHeight = items.length ? itemHeight(items[0]) : BODY_LEADING;
    heading(title, firstHeight + 5);
    if (!items.length) { addLine("No specific items identified from current approved risk records.", 10); gap(4); return; }
    items.forEach((item, index) => {
      const height = itemHeight(item);
      if (available() < height && height <= PAGE_HEIGHT - MARGIN - BOTTOM) newPage();
      const titleText = `${numbered ? `${index + 1}.` : "-"} ${item.title ?? item.action ?? ""}`;
      wrap(titleText, 84).forEach((line) => addLine(line, 11, "F2"));
      wrap(item.analysis ?? item.rationale, 88).forEach((line) => addLine(line, 10, "F1", 12));
      if (item.relatedRiskIds.length) addLine(`Related risks: ${item.relatedRiskIds.join(", ")}`, 9, "F1", 11);
      gap(4);
    });
  };

  page().commands.push(text("Executive Risk Report", MARGIN, 800, 17, "F2"), text(`Report date: ${model.reportDate}`, 430, 802, 9), text("Portfolio Snapshot", MARGIN, 776, 10, "F2"), text((["Total", "Critical", "High", "Medium", "Low"] as const).map((key) => `${key}: ${model.summary[key]}`).join("   |   "), MARGIN, 762, 10), text("Risk Heat Map", MARGIN, 738, 14, "F2"), heatMapDrawing(model));
  page().y = 518;
  heading("Overall Risk Posture", BODY_LEADING * 3); narrative(analysis.overallRiskPosture); gap(3);
  collection("Key Risk Themes and Concentrations", analysis.keyRiskThemes.map((item) => ({ ...item, rationale: item.analysis })));
  heading("Material Exposure and Business Implications", BODY_LEADING * 3); narrative(analysis.materialExposure); gap(3);
  heading("Risk Interdependencies and Compounding Exposure", BODY_LEADING * 3); narrative(analysis.interdependencies); gap(3);
  heading("Assessment Uncertainty", BODY_LEADING * 3); narrative(analysis.assessmentUncertainty); gap(3);
  collection("Management Priorities", analysis.managementPriorities);
  collection("Decisions / Escalations / Validation Required", analysis.decisionsAndEscalations);
  collection("Next Steps", analysis.nextSteps, true);
  const governance = wrap("Report governance: Ratings, counts and Heat Map positions reflect analyst-approved assessments and deterministic scoring. Narrative analysis is AI-assisted and human-reviewed.", 108);
  ensure(governance.length * 11 + 8); gap(4); governance.forEach((line) => addLine(line, 9, "F1", 11));

  pages.forEach((current, index) => current.commands.push(text(`Page ${index + 1} of ${pages.length}`, PAGE_WIDTH - MARGIN - 58, 30, 9)));
  const objects: string[] = ["<< /Type /Catalog /Pages 2 0 R >>", `<< /Type /Pages /Kids [${pages.map((_, index) => `${5 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"];
  pages.forEach((current, index) => { const content = current.commands.join("\n"); objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + index * 2} 0 R >>`, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`); });
  let output = "%PDF-1.4\n"; const offsets = [0]; objects.forEach((object, index) => { offsets.push(output.length); output += `${index + 1} 0 obj\n${object}\nendobj\n`; }); const start = output.length; output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return output;
}

export function downloadExecutivePdf(model: ReportModel, analysis: ExecutiveAnalysis) { const url = URL.createObjectURL(new Blob([executivePdfDocument(model, analysis)], { type: "application/pdf" })); const link = document.createElement("a"); link.href = url; link.download = "executive-risk-report.pdf"; link.click(); URL.revokeObjectURL(url); }
