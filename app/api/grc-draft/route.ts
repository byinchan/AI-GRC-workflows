import { draftSchema, parseGrcDraftResponse, summarizeResponseShape } from "@/lib/grc-assessment";

const routeVersion = "grc-draft-2026-09-25-2";
const json = (body: object, status = 200) => Response.json(body, { status, headers: { "x-grc-draft-version": routeVersion } });

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return json({ error: "AI drafting is not configured. Add OPENAI_API_KEY to your server environment and try again." }, 503);
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !body.stakeholderInput || typeof body.stakeholderInput !== "object") return json({ error: "Stakeholder information is missing or invalid." }, 400);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", store: false,
        instructions: "You structure stakeholder-provided GRC context into an analyst draft. This is a recommendation, never a final decision. Do not invent facts: put absent or unclear facts in missingInformation, assumptions, or uncertainties. Do not calculate final risk or change methodology/thresholds. Use only the supplied controlled enum values. Return concise JSON only.",
        input: JSON.stringify(body.stakeholderInput), text: { format: { type: "json_schema", name: "grc_assessment_draft", strict: true, schema: draftSchema } },
      }),
    });
    if (!response.ok) {
      console.error("GRC draft OpenAI request failed", { status: response.status, requestId: response.headers.get("x-request-id") });
      return json({ error: "The AI service could not prepare a draft. Please try again." }, 502);
    }
    const payload = await response.json();
    const parsed = parseGrcDraftResponse(payload);
    if (!parsed.draft) {
      console.error("GRC draft response could not be validated", { routeVersion, issue: parsed.issue, requestId: response.headers.get("x-request-id"), responseShape: summarizeResponseShape(payload) });
      return json({ error: "The AI service returned an unusable assessment draft. Please try again." }, 502);
    }
    return json({ draft: parsed.draft });
  } catch (error) {
    console.error("GRC draft route failed", { name: error instanceof Error ? error.name : "unknown" });
    return json({ error: "Unable to prepare an AI draft right now. Your stakeholder input has not been lost in this session." }, 500);
  }
}
