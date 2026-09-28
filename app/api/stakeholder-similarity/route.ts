import { parseStakeholderSimilarityResponseWithIssue, stakeholderSimilarityDiagnosticCategory, summarizeStakeholderSimilarityResponse } from "@/lib/stakeholder-similarity";

const schema = { type: "object", additionalProperties: false, properties: { potentiallySimilar: { type: "boolean" }, matchingSubmissionId: { type: ["string", "null"] }, rationale: { type: "string" } }, required: ["potentiallySimilar", "matchingSubmissionId", "rationale"] } as const;
export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return Response.json({ error: "Similarity check unavailable." }, { status: 503 });
  try { const body = await request.json(); if (!body?.candidate || !Array.isArray(body?.existing)) return Response.json({ error: "Invalid similarity request." }, { status: 400 });
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL ?? "gpt-4o-mini", store: false, instructions: "Identify only potential similarity between stakeholder risk scenarios. Compare underlying asset/process, event, weakness, and consequence. Do not call a confirmed duplicate. Do not warn from generic words or shared asset alone when the event differs. Return the matching existing ID only when potentiallySimilar is true.", input: JSON.stringify({ candidate: body.candidate, existing: body.existing }), text: { format: { type: "json_schema", name: "stakeholder_similarity", strict: true, schema } } }) });
    const requestId = response.headers.get("x-request-id");
    if (!response.ok) { console.error("Stakeholder similarity diagnostic", { category: stakeholderSimilarityDiagnosticCategory({ httpError: true }), status: response.status, requestId }); return Response.json({ error: "Similarity check unavailable." }, { status: 502 }); }
    let payload: unknown;
    try { payload = await response.json(); } catch { console.error("Stakeholder similarity diagnostic", { category: stakeholderSimilarityDiagnosticCategory({ responseJsonError: true }), requestId }); return Response.json({ error: "Similarity check unavailable." }, { status: 502 }); }
    const diagnostics = summarizeStakeholderSimilarityResponse(payload);
    const parsed = parseStakeholderSimilarityResponseWithIssue(payload);
    if (parsed.result) return Response.json(parsed.result);
    const category = stakeholderSimilarityDiagnosticCategory({ diagnostics, parseIssue: parsed.issue });
    console.error("Stakeholder similarity diagnostic", { category, requestId, responseStatus: diagnostics.responseStatus, incompleteReason: diagnostics.incompleteReason, hasTopLevelOutputText: diagnostics.hasTopLevelOutputText, hasNestedOutputText: diagnostics.hasNestedOutputText, outputTypes: diagnostics.outputTypes, contentTypes: diagnostics.contentTypes });
    return Response.json({ error: "Similarity check unavailable." }, { status: 502 });
  } catch (error) { console.error("Stakeholder similarity diagnostic", { category: "UNEXPECTED_ROUTE_ERROR", errorName: error instanceof Error ? error.name : "unknown" }); return Response.json({ error: "Similarity check unavailable." }, { status: 502 }); }
}
