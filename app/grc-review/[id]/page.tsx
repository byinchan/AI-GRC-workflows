"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRiskRegister } from "@/components/risk-register-provider";
import { fallback, Review } from "@/app/risk-assessment/risk-assessment-form";
import { GrcDraft } from "@/lib/grc-assessment";

export default function SelectedGrcReviewPage() {
  const { id } = useParams<{ id: string }>(); const { stakeholderSubmissions, diagnosticInstanceId } = useRiskRegister(); const submission = stakeholderSubmissions.find((item) => item.id === id); const [draft, setDraft] = useState<GrcDraft | null>(null); const [message, setMessage] = useState("");
  useEffect(() => { console.info("[GRC_STATE_DIAGNOSTIC]", "GRC Review detail lookup", { diagnosticInstanceId, routeId: id, visibleSubmissionIds: stakeholderSubmissions.map(({ id: submissionId }) => submissionId), resolved: Boolean(submission), missingRequestedId: submission ? undefined : id }); }, [diagnosticInstanceId, id, stakeholderSubmissions, submission]);
  useEffect(() => { if (!submission || submission.status === "Registered") return; fetch("/api/grc-draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stakeholderInput: submission.source }) }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setDraft(body.draft); }).catch((error) => { setMessage(`${error instanceof Error ? error.message : "AI drafting failed."} Continuing with an analyst-ready draft.`); setDraft(fallback(submission.source)); }); }, [submission]);
  if (!submission) return <main className="min-h-screen bg-slate-50 p-8"><Link className="text-sm font-semibold text-teal-800 underline" href="/grc-review">Back to GRC Review</Link><p className="mt-6">This submission is not available for review.</p></main>;
  if (submission.status === "Registered") return <main className="min-h-screen bg-slate-50 p-8 text-slate-900"><div className="mx-auto max-w-3xl rounded-2xl border border-teal-200 bg-white p-6"><p className="text-sm font-semibold text-teal-700">Registered - {submission.riskRecordId}</p><h1 className="mt-2 text-2xl font-semibold">Added to Risk Register</h1><p className="mt-2 text-sm text-slate-600">The final analyst-reviewed record is available in the current browser session.</p><div className="mt-5 flex flex-wrap gap-3"><Link className="rounded bg-slate-900 px-4 py-2 text-sm text-white" href="/risk-register">Open Risk Register</Link><Link className="rounded border border-slate-300 px-4 py-2 text-sm" href="/grc-review">Back to GRC Review</Link></div></div></main>;
  if (!draft) return <main className="min-h-screen bg-slate-50 p-8"><Link className="text-sm font-semibold text-teal-800 underline" href="/grc-review">Back to GRC Review</Link><p className="mt-6">Preparing analyst review...</p>{message && <p className="mt-2 text-sm text-amber-800">{message}</p>}</main>;
  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-10 lg:px-16"><div className="mx-auto max-w-6xl"><Link className="text-sm font-semibold text-teal-800 underline" href="/grc-review">Back to GRC Review</Link>{message && <p className="mt-4 text-sm text-amber-800">{message}</p>}<Review draft={draft} source={submission.source} submissionId={submission.id} /></div></main>;
}
