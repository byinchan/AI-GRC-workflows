"use client";

import Link from "next/link";
import { useState } from "react";
import { useRiskRegister } from "@/components/risk-register-provider";
import { executiveReportModel, managementConsiderations, nextSteps, portfolioThemes } from "@/lib/grc/executive-report";
import { RiskLevel, RiskRating } from "@/lib/grc/risk";

const colors: Record<RiskRating, string> = {
  Low: "#d1fae5",
  Medium: "#fef3c7",
  High: "#ffedd5",
  Critical: "#fee2e2",
};
const cards: Record<RiskRating, string> = {
  Low: "bg-emerald-50",
  Medium: "bg-amber-50",
  High: "bg-orange-50",
  Critical: "bg-red-50",
};
function wrap(c: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = [];
  let current = "";
  text.split(/\s+/).forEach((word) => {
    const next = `${current} ${word}`.trim();
    if (c.measureText(next).width > max && current) {
      lines.push(current);
      current = word;
    } else current = next;
  });
  if (current) lines.push(current);
  return lines;
}
function downloadPdf(
  model: ReturnType<typeof executiveReportModel>,
  narrative: string,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1500;
  canvas.height = 2100;
  const c = canvas.getContext("2d");
  if (!c) return;
  c.fillStyle = "white";
  c.fillRect(0, 0, 1500, 2100);
  c.fillStyle = "#0f172a";
  c.font = "bold 42px Arial";
  c.fillText("Executive Risk Report", 80, 80);
  c.font = "20px Arial";
  c.fillStyle = "#475569";
  c.fillText(`Report date: ${model.reportDate}`, 80, 115);
  (["Total", "Critical", "High", "Medium", "Low"] as const).forEach(
    (label, i) => {
      const x = 80 + i * 270;
      c.fillStyle = "#f8fafc";
      c.fillRect(x, 160, 235, 90);
      c.fillStyle = "#334155";
      c.font = "bold 16px Arial";
      c.fillText(`${label} Risks`, x + 15, 190);
      c.fillStyle = "#0f172a";
      c.font = "bold 32px Arial";
      c.fillText(String(model.summary[label]), x + 15, 230);
    },
  );
  const left = 220,
    top = 350,
    cw = 350,
    ch = 140;
  c.fillStyle = "#0f172a";
  c.font = "bold 24px Arial";
  c.fillText("Risk Heat Map", 80, 315);
  model.heatMap.cells.forEach((cell) => {
    const x = left + (cell.impact - 1) * cw,
      y = top + (3 - cell.likelihood) * ch;
    c.fillStyle = colors[cell.rating];
    c.fillRect(x, y, cw - 10, ch - 10);
    c.fillStyle = "#0f172a";
    c.font = "bold 16px Arial";
    c.fillText(`${cell.rating} | Score ${cell.score}`, x + 12, y + 28);
    c.font = "14px Arial";
    c.fillText(cell.risks.join(", "), x + 12, y + 55);
  });
  ["3 High", "2 Medium", "1 Low"].forEach((label, i) => {
    c.font = "16px Arial";
    c.fillText(label, 85, top + i * ch + 70);
  });
  ["1 Low", "2 Medium", "3 High"].forEach((label, i) =>
    c.fillText(label, left + i * cw + 110, 335),
  );
  let y = 840;
  const section = (heading: string, text: string) => {
    c.fillStyle = "#0f172a";
    c.font = "bold 22px Arial";
    c.fillText(heading, 80, y);
    y += 30;
    c.fillStyle = "#334155";
    c.font = "17px Arial";
    wrap(c, text, 1300).forEach((line) => {
      c.fillText(line, 80, y);
      y += 24;
    });
    y += 28;
  };
  section("Human-reviewed executive summary", narrative);
  section(
    "Risks requiring management attention",
    model.attention
      .map(
        (risk) =>
          `${risk.id} | ${risk.riskRating} ${risk.riskScore} | ${risk.asset} | Owner: ${risk.riskOwner} | ${risk.treatmentStrategy} | ${risk.status} | Target: ${risk.targetDate}`,
      )
      .join("\n"),
  );
  section(
    "Governance note",
    "Risk ratings and Heat Map positions are based on final analyst-approved assessments. The executive narrative was AI-assisted and reviewed by a human analyst.",
  );
  const jpeg = Uint8Array.from(
    atob(canvas.toDataURL("image/jpeg", 0.9).split(",")[1]),
    (char) => char.charCodeAt(0),
  );
  const enc = new TextEncoder();
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 857] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>",
    "<< /Length 32 >>\nstream\nq\n612 0 0 857 0 0 cm\n/Im0 Do\nQ\nendstream",
    `<< /Type /XObject /Subtype /Image /Width 1500 /Height 2100 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,
  ];
  const parts: BlobPart[] = [enc.encode("%PDF-1.3\n") as unknown as BlobPart];
  const offsets: number[] = [0];
  let size = 9;
  objects.forEach((object, index) => {
    offsets.push(size);
    const before = enc.encode(
      `${index + 1} 0 obj\n${object}${index === 4 ? "\nstream\n" : "\n"}`,
    );
    parts.push(before as unknown as BlobPart);
    size += before.length;
    if (index === 4) {
      parts.push(jpeg as unknown as BlobPart);
      size += jpeg.length;
    }
    const after = enc.encode(
      index === 4 ? "\nendstream\nendobj\n" : "endobj\n",
    );
    parts.push(after as unknown as BlobPart);
    size += after.length;
  });
  const xref = size;
  const trailer = `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  parts.push(enc.encode(trailer) as unknown as BlobPart);
  const url = URL.createObjectURL(new Blob(parts, { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "executive-risk-report.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExecutiveRiskSummaryPage() {
  const { records } = useRiskRegister();
  const [narrative, setNarrative] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const model = executiveReportModel(records);
  const themes = portfolioThemes(records);
  const considerations = managementConsiderations(records);
  const steps = nextSteps(records);
  async function generate() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportDate: model.reportDate,
          summary: model.summary,
          risks: model.narrativeRisks,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setNarrative(body.narrative);
      setMessage("AI draft ready for analyst review.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate an executive summary right now.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between">
          <Link className="text-lg font-semibold" href="/">
            AI-GRC Workflows
          </Link>
          <div className="flex gap-4">
            <Link
              className="text-sm font-medium text-slate-600"
              href="/risk-register"
            >
              Risk Register
            </Link>
            <Link
              className="text-sm font-medium text-slate-600"
              href="/risk-heat-map"
            >
              Risk Heat Map
            </Link>
          </div>
        </nav>
        <header className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-700">
            Executive Reporting
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Executive Risk Summary
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            A concise management view based only on current-session,
            human-approved Risk Register records.
          </p>
        </header>
        {records.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              No approved risks available for executive reporting
            </h2>
            <p className="mt-2 text-slate-600">
              Executive reporting is based on human-approved Risk Register
              records.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                href="/risk-assessment"
              >
                Open Risk Assessment
              </Link>
              <Link
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
                href="/risk-register"
              >
                Open Risk Register
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-3 sm:grid-cols-5">
              {(["Total", "Critical", "High", "Medium", "Low"] as const).map(
                (item) => (
                  <div
                    className="rounded-xl border border-slate-200 bg-white p-4"
                    key={item}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item} Risks
                    </p>
                    <p className="mt-1 text-3xl font-semibold">
                      {model.summary[item]}
                    </p>
                  </div>
                ),
              )}
            </section>
            <ExecutiveHeatMap model={model} />
            <ReportSection title="Executive Summary"><p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{narrative || "Generate an AI-assisted draft, then review and edit it before producing the report."}</p></ReportSection>
            <ReportSection title="Key Risk Themes"><List items={themes} empty="No material cross-portfolio themes are supported by the current registered risks." /></ReportSection>
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold">
                Risks Requiring Management Attention
              </h2>
              <div className="mt-4 space-y-3">
                {model.attention.map((risk) => (
                  <article
                    className="rounded-xl border border-slate-200 p-4"
                    key={risk.id}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <b>{risk.id}</b>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${cards[risk.riskRating]}`}
                      >
                        {risk.riskRating} - Score {risk.riskScore}
                      </span>
                      <span className="text-sm text-slate-600">
                        {risk.asset}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6"><b>Why it matters:</b> {risk.businessImpact || risk.riskStatement}</p>
                    <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-4"><div><dt className="font-semibold">Owner</dt><dd>{risk.riskOwner || "-"}</dd></div><div><dt className="font-semibold">Treatment</dt><dd>{risk.treatmentStrategy}</dd></div><div><dt className="font-semibold">Status</dt><dd>{risk.status}</dd></div><div><dt className="font-semibold">Target Date</dt><dd>{risk.targetDate}</dd></div></dl>
                  </article>
                ))}
              </div>
            </section>
            <ReportSection title="Assessment Transparency"><Transparency title="Assumptions" items={model.transparency.assumptions} empty="No material assumptions recorded." /><Transparency title="Uncertainties / Unknowns" items={model.transparency.uncertainties} empty="No material uncertainties recorded." /><Transparency title="Information Gaps" items={model.transparency.informationGaps} empty="No material information gaps recorded." /></ReportSection>
            <ReportSection title="Management Considerations"><List items={considerations} empty="No additional management considerations are supported by the current registered risks." /></ReportSection>
            <ReportSection title="Next Steps"><List items={steps} empty="No open next steps are recorded." /></ReportSection>
            <ReportSection title="Governance Note"><p className="text-sm leading-6 text-slate-700">Risk ratings and Heat Map positions are based on final analyst-approved assessments. Portfolio counts and placement are deterministic. AI-assisted narrative content is advisory and must be human-reviewed before export.</p></ReportSection>
            <section className="mt-6 rounded-2xl border border-teal-200 bg-white p-6">
              <h2 className="text-xl font-semibold">
                AI-assisted executive summary
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Generated from human-approved Risk Register data. Review and
                edit the draft before producing the report.
              </p>
              <button
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
                disabled={loading}
                onClick={generate}
              >
                {loading ? "Generating..." : "Generate Executive Summary"}
              </button>
              {message && (
                <p className="mt-3 text-sm text-slate-600">{message}</p>
              )}
              <textarea
                className="mt-4 min-h-56 w-full rounded-xl border border-slate-300 p-4 text-sm leading-6"
                placeholder="Generate a draft, then review and edit it here."
                value={narrative}
                onChange={(event) => setNarrative(event.target.value)}
              />
              <p className="mt-3 text-xs text-slate-600">
                AI drafts - human reviews - report is produced.
              </p>
              <button
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                disabled={!narrative.trim()}
                onClick={() => downloadPdf(model, narrative)}
              >
                Download Executive Report
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
function ExecutiveHeatMap({
  model,
}: {
  model: ReturnType<typeof executiveReportModel>;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold">Portfolio Heat Map</h2>
      <p className="mt-1 text-sm text-slate-600">
        Final analyst-approved Likelihood and Impact determine placement.
      </p>
      <div className="mt-5 grid grid-cols-[6rem_repeat(3,minmax(0,1fr))] gap-2">
        <div>Likelihood</div>
        {["1 Low", "2 Medium", "3 High"].map((label) => (
          <div className="text-center text-sm font-semibold" key={label}>
            {label}
          </div>
        ))}
        {([3, 2, 1] as RiskLevel[]).flatMap((likelihood) => [
          <div
            className="flex items-center text-sm font-semibold"
            key={`label-${likelihood}`}
          >
            {likelihood}{" "}
            {likelihood === 3 ? "High" : likelihood === 2 ? "Medium" : "Low"}
          </div>,
          ...[1, 2, 3].map((impact) => {
            const cell = model.heatMap.cells.find(
              (item) =>
                item.likelihood === likelihood && item.impact === impact,
            )!;
            return (
              <div
                className={`min-h-20 rounded-lg border p-2 text-sm ${cards[cell.rating]}`}
                key={`${likelihood}-${impact}`}
              >
                <b>
                  {cell.rating} | {cell.score}
                </b>
                <br />
                {cell.risks.join(", ")}
              </div>
            );
          }),
        ])}
      </div>
    </section>
  );
}
function ReportSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-4">{children}</div></section>; }
function List({ items, empty }: { items: string[]; empty: string }) { return items.length ? <ul className="space-y-2 text-sm leading-6 text-slate-700">{items.map((item) => <li className="rounded-lg bg-slate-50 p-3" key={item}>{item}</li>)}</ul> : <p className="text-sm text-slate-600">{empty}</p>; }
function Transparency({ title, items, empty }: { title: string; items: Array<{ item: string; ids: string[] }>; empty: string }) { return <div className="mt-4"><h3 className="text-sm font-semibold">{title}</h3>{items.length ? <ul className="mt-2 space-y-2 text-sm text-slate-700">{items.map(({ item, ids }) => <li className="rounded-lg bg-slate-50 p-3" key={item}>{item} <span className="text-xs text-slate-500">({ids.join(", ")})</span></li>)}</ul> : <p className="mt-2 text-sm text-slate-600">{empty}</p>}</div>; }
