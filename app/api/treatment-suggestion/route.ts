import { summarizeResponseShape } from "@/lib/grc-assessment";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: "AI treatment suggestions are not configured." }, { status: 503 });
  try {
    const body = await request.json();
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", store: false, instructions: "Suggest a concise treatment plan for a GRC analyst. This is an advisory draft, not approval. Do not invent organizational capabilities, commitments, dates, or facts. State uncertainty where information is missing.", input: JSON.stringify(body) }) });
    if (!response.ok) return Response.json({ error: "The AI service could not prepare a treatment suggestion." }, { status: 502 });
    const payload = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const suggestion = payload.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("");
    if (!suggestion) { console.error("Treatment suggestion had no text", summarizeResponseShape(payload)); return Response.json({ error: "The AI service returned no treatment suggestion." }, { status: 502 }); }
    return Response.json({ suggestion });
  } catch (error) { console.error("Treatment suggestion failed", { name: error instanceof Error ? error.name : "unknown" }); return Response.json({ error: "Unable to prepare a treatment suggestion right now." }, { status: 500 }); }
}
