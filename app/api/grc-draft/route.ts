import { draftSchema, isGrcDraft } from "@/lib/grc-assessment";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: "AI drafting is not configured. Add OPENAI_API_KEY to your server environment and try again." }, { status: 503 });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !body.stakeholderInput || typeof body.stakeholderInput !== "object") return Response.json({ error: "Stakeholder information is missing or invalid." }, { status: 400 });
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", store: false,
        instructions: "You structure stakeholder-provided GRC context into an analyst draft. This is a recommendation, never a final decision. Do not invent facts: put absent or unclear facts in missingInformation, assumptions, or uncertainties. Do not calculate final risk or change methodology/thresholds. Use only the supplied controlled enum values. Return concise JSON only.",
        input: JSON.stringify(body.stakeholderInput), text: { format: { type: "json_schema", name: "grc_assessment_draft", strict: true, schema: draftSchema } },
      }),
    });
    if (!response.ok) return Response.json({ error: "The AI service could not prepare a draft. Please try again." }, { status: 502 });
    const payload = await response.json() as { output_text?: string };
    const draft = payload.output_text ? JSON.parse(payload.output_text) : null;
    if (!isGrcDraft(draft)) return Response.json({ error: "The AI response did not match the required assessment format. Please try again." }, { status: 502 });
    return Response.json({ draft });
  } catch {
    return Response.json({ error: "Unable to prepare an AI draft right now. Your stakeholder input has not been lost in this session." }, { status: 500 });
  }
}
