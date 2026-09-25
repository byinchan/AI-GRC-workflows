import { summarizeResponseShape } from "@/lib/grc-assessment";
import { cleanTreatmentPlan } from "@/lib/grc/risk-register";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: "AI treatment suggestions are not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", store: false, instructions: "Prepare an advisory treatment plan for a GRC analyst. Return 3 to 5 concise, numbered, plain-text actions suitable for a risk register. Do not use Markdown headings, bold text, horizontal rules, tables, or preambles. Do not invent organizational capabilities, commitments, dates, owners, or facts. Mention uncertainty only when it materially affects an action. This is a draft for analyst review, not approval.", input: JSON.stringify(body) }) });
    if (!response.ok) return Response.json({ error: "The AI service could not prepare a treatment suggestion." }, { status: 502 });
    const payload = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const suggestion = payload.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("");
    const cleanedSuggestion = cleanTreatmentPlan(suggestion ?? "");
    if (!cleanedSuggestion) { console.error("Treatment suggestion had no usable text", summarizeResponseShape(payload)); return Response.json({ error: "The AI service returned no treatment suggestion." }, { status: 502 }); }
    return Response.json({ suggestion: cleanedSuggestion });
  } catch (error) { console.error("Treatment suggestion failed", { name: error instanceof Error ? error.name : "unknown" }); return Response.json({ error: "Unable to prepare a treatment suggestion right now." }, { status: 500 }); }
}
