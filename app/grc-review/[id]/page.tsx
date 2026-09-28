"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRiskRegister } from "@/components/risk-register-provider";
import { fallback, Review } from "@/app/risk-assessment/risk-assessment-form";
import { GrcDraft } from "@/lib/grc-assessment";

export default function SelectedGrcReviewPage() {
  const { id } = useParams<{ id: string }>(); const { stakeholderSubmissions } = useRiskRegister(); const submission = stakeholderSubmissions.find((item) => item.id === id); const [draft, setDraft] = useState<GrcDraft | null>(null); const [message, setMessage] = useState("");
  useEffect(() => { if (!submission || submission.status === "Registered") return; fetch("/api/grc-draft", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stakeholderInput: submission.source }) }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error); setDraft(body.draft); }).catch((error) => { setMessage(`${error instanceof Error ? error.message : "AI drafting failed."} Continuing with an analyst-ready draft.`); setDraft(fallback(submission.source)); }); }, [submission]);
  if (!submission || submission.status === "Registered") return <main className="min-h-screen bg-slate-50 p-8"><Link className="text-sm font-semibold text-teal-800 underline" href="/grc-review">Back to GRC Review</Link><p className="mt-6">This submission is not available for review.</p></main>;
  if (!draft) return <main className="min-h-screen bg-slate-50 p-8"><Link className="text-sm font-semibold text-teal-800 underline" href="/grc-review">Back to GRC Review</Link><p className="mt-6">Preparing analyst review...</p>{message && <p className="mt-2 text-sm text-amber-800">{message}</p>}</main>;
  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-10 lg:px-16"><div className="mx-auto max-w-6xl"><Link className="text-sm font-semibold text-teal-800 underline" href="/grc-review">Back to GRC Review</Link>{message && <p className="mt-4 text-sm text-amber-800">{message}</p>}<Review draft={draft} source={submission.source} submissionId={submission.id} /></div></main>;
}
