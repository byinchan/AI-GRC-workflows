import { cleanExecutiveNarrative } from "@/lib/grc/executive-report";
import { summarizeResponseShape } from "@/lib/grc-assessment";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: "AI executive summaries are not configured." }, { status: 503 });
  try {
    const body = await request.json();
    if (!Array.isArray(body?.risks) || body.risks.length === 0) return Response.json({ error: "Approved Risk Register records are required to generate a summary." }, { status: 400 });
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", store: false, instructions: "Draft a concise executive risk summary from the supplied, human-approved Risk Register facts only. Write 3 to 5 short business-focused paragraphs. For one risk, acknowledge that this is a limited portfolio. For multiple risks, mention only recurring themes directly supported by the facts. Do not change or restate different values for ratings, scores, owners, treatment strategies, statuses, or dates. Do not invent risks, controls, impacts, commitments, or certainty. Do not use Markdown, headings, bullets, bold text, horizontal rules, or em dashes. This is an advisory draft for human analyst review, not a governance decision.", input: JSON.stringify({ reportDate: body.reportDate, portfolio: body.summary, risks: body.risks }) }) });
    if (!response.ok) return Response.json({ error: "The AI service could not prepare an executive summary." }, { status: 502 });
    const payload = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const narrative = cleanExecutiveNarrative(payload.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("") ?? "");
    if (!narrative) { console.error("Executive summary had no usable text", summarizeResponseShape(payload)); return Response.json({ error: "The AI service returned no executive summary." }, { status: 502 }); }
    return Response.json({ narrative });
  } catch (error) { console.error("Executive summary failed", { name: error instanceof Error ? error.name : "unknown" }); return Response.json({ error: "Unable to prepare an executive summary right now." }, { status: 500 }); }
}
