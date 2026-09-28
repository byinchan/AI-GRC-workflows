import type { ExecutiveAnalysis } from "./executive-analysis";
import type { executiveReportModel } from "./executive-report";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 842;
const MARGIN = 42;
const BOTTOM = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BODY_SIZE = 10;
const BODY_LEADING = 12;
const BODY_COLUMNS = Math.floor(CONTENT_WIDTH / 5.15);
const SECTION_SIZE = 14;
const SECTION_LEADING = 17;
const ITEM_TITLE_SIZE = 12;
const ITEM_TITLE_LEADING = 14;
const SECTION_BEFORE = 9;
const SECTION_AFTER = 4;
const ITEM_GAP = 7;
const esc = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, " ");
const heatColor = { Low: "0.82 0.98 0.90", Medium: "1 0.95 0.78", High: "1 0.93 0.84", Critical: "0.99 0.89 0.89" } as const;
type ReportModel = ReturnType<typeof executiveReportModel>;
type Page = { commands: string[]; y: number };
type CollectionItem = { title?: string; action?: string; analysis?: string; rationale: string; relatedRiskIds: string[] };

function wrap(text: string, width = BODY_COLUMNS) { return text.replace(/\s+/g, " ").trim().split(" ").reduce<string[]>((lines, word) => { const previous = lines.at(-1) ?? ""; if (`${previous} ${word}`.trim().length > width) lines.push(word); else lines[lines.length - 1] = `${previous} ${word}`.trim(); return lines; }, [""]).filter(Boolean); }
function paragraphs(text: string) { return text.trim().split(/\n\s*\n/).map((paragraph) => wrap(paragraph, BODY_COLUMNS)).filter((lines) => lines.length); }
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
  const addLine = (value: string, size = BODY_SIZE, font = "F1", leading = BODY_LEADING, x = MARGIN) => { ensure(leading); page().commands.push(text(value, x, page().y, size, font)); page().y -= leading; };
  const gap = (height: number) => { page().y -= height; };
  const heading = (value: string, minimumContentHeight: number) => { ensure(SECTION_BEFORE + SECTION_LEADING + SECTION_AFTER + minimumContentHeight); gap(SECTION_BEFORE); addLine(value, SECTION_SIZE, "F2", SECTION_LEADING); gap(SECTION_AFTER); };
  const narrative = (value: string) => { const parts = paragraphs(value); parts.forEach((lines, index) => { lines.forEach((line) => addLine(line)); if (index < parts.length - 1) gap(5); }); };
  const itemHeight = (item: CollectionItem) => {
    const title = item.title ?? item.action ?? "";
    const body = item.analysis ?? item.rationale;
    return wrap(title, 98).length * ITEM_TITLE_LEADING + wrap(body, 100).length * BODY_LEADING + (item.relatedRiskIds.length ? 11 : 0) + ITEM_GAP;
  };
  const collection = (title: string, items: CollectionItem[]) => {
    const firstHeight = items.length ? itemHeight(items[0]) : BODY_LEADING;
    heading(title, firstHeight + 5);
    if (!items.length) { addLine("No specific items identified from current approved risk records."); gap(ITEM_GAP); return; }
    items.forEach((item, index) => {
      const height = itemHeight(item);
      if (available() < height && height <= PAGE_HEIGHT - MARGIN - BOTTOM) newPage();
      const titleText = `${index + 1}. ${item.title ?? item.action ?? ""}`;
      wrap(titleText, 98).forEach((line) => addLine(line, ITEM_TITLE_SIZE, "F2", ITEM_TITLE_LEADING));
      wrap(item.analysis ?? item.rationale, 100).forEach((line) => addLine(line, BODY_SIZE, "F1", BODY_LEADING, MARGIN + 8));
      if (item.relatedRiskIds.length) addLine(`Related risks: ${item.relatedRiskIds.join(", ")}`, 9, "F1", 11, MARGIN + 8);
      gap(ITEM_GAP);
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
  collection("Next Steps", analysis.nextSteps);
  const governance = wrap("Report governance: Ratings, counts and Heat Map positions reflect analyst-approved assessments and deterministic scoring. Narrative analysis is AI-assisted and human-reviewed.", BODY_COLUMNS);
  ensure(governance.length * 11 + 8); gap(4); governance.forEach((line) => addLine(line, 9, "F1", 11));

  pages.forEach((current, index) => current.commands.push(text(`Page ${index + 1} of ${pages.length}`, PAGE_WIDTH - MARGIN - 58, 30, 9)));
  const objects: string[] = ["<< /Type /Catalog /Pages 2 0 R >>", `<< /Type /Pages /Kids [${pages.map((_, index) => `${5 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"];
  pages.forEach((current, index) => { const content = current.commands.join("\n"); objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + index * 2} 0 R >>`, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`); });
  let output = "%PDF-1.4\n"; const offsets = [0]; objects.forEach((object, index) => { offsets.push(output.length); output += `${index + 1} 0 obj\n${object}\nendobj\n`; }); const start = output.length; output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return output;
}

export function downloadExecutivePdf(model: ReportModel, analysis: ExecutiveAnalysis) { const url = URL.createObjectURL(new Blob([executivePdfDocument(model, analysis)], { type: "application/pdf" })); const link = document.createElement("a"); link.href = url; link.download = "executive-risk-report.pdf"; link.click(); URL.revokeObjectURL(url); }
