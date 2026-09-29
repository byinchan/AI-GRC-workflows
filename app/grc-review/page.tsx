"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRiskRegister } from "@/components/risk-register-provider";

export default function GrcReviewPage() {
  const { stakeholderSubmissions, diagnosticInstanceId } = useRiskRegister();
  const logOpenReviewClick = (submissionId: string, href: string) => {
    console.info("[GRC_STATE_DIAGNOSTIC]", "Open Review click", {
      submissionId,
      destinationHref: href,
      documentTimeOrigin: performance.timeOrigin,
      pathname: window.location.pathname,
    });
  };
  const logOpenReviewClientNavigation = (submissionId: string, href: string) => {
    console.info("[GRC_STATE_DIAGNOSTIC]", "Open Review client navigation", {
      submissionId,
      destinationHref: href,
      documentTimeOrigin: performance.timeOrigin,
      pathname: window.location.pathname,
    });
  };
  useEffect(() => {
    console.info("[GRC_STATE_DIAGNOSTIC]", "GRC Review list state", {
      diagnosticInstanceId,
      stakeholderSubmissions: stakeholderSubmissions.map(({ id, status, riskRecordId }) => ({
        id,
        status,
        riskRecordId,
        openReviewHref: status === "Awaiting Review" ? `/grc-review/${id}` : undefined,
      })),
    });
  }, [diagnosticInstanceId, stakeholderSubmissions]);
  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-10 lg:px-16"><div className="mx-auto max-w-5xl"><nav className="flex items-center justify-between"><Link className="text-lg font-semibold" href="/">AI-GRC Workflows</Link><Link className="text-sm font-medium text-slate-600" href="/risk-assessment">Business Intake</Link></nav><header className="mt-12"><p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-700">GRC Analyst</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">GRC Review</h1><p className="mt-3 text-slate-600">Choose a submitted stakeholder risk to review. Submissions are retained only for this browser tab session.</p></header><section className="mt-8 space-y-4">{stakeholderSubmissions.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="text-xl font-semibold">No submissions awaiting review</h2><Link className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white" href="/risk-assessment">Open Business Intake</Link></div> : stakeholderSubmissions.map((submission) => { const href = `/grc-review/${submission.id}`; return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={submission.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-teal-700">{submission.status === "Registered" ? `Registered - ${submission.riskRecordId}` : "Awaiting Review"}</p><h2 className="mt-1 text-xl font-semibold">{submission.source.assessmentSubject || "Prepared stakeholder findings"}</h2><p className="mt-2 text-sm text-slate-600">Owner: {submission.source.businessOwner || "Not provided"}</p><p className="mt-2 max-w-2xl text-sm leading-6">{submission.source.identifiedConcern || submission.source.stakeholderFindings || "No concern provided."}</p></div>{submission.status === "Awaiting Review" ? <Link className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white" href={href} onClick={() => logOpenReviewClick(submission.id, href)} onNavigate={() => logOpenReviewClientNavigation(submission.id, href)}>Open Review</Link> : <span className="rounded-lg bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800">Registered - {submission.riskRecordId}</span>}</div></article>; })}</section></div></main>;
}
