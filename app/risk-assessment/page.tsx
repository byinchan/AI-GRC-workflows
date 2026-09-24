import Link from "next/link";
import { RiskAssessmentForm } from "./risk-assessment-form";

export default function RiskAssessmentPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-10 sm:py-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between">
          <Link className="text-lg font-semibold tracking-tight" href="/">AI-GRC Workflows</Link>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">Portfolio prototype</span>
        </nav>
        <header className="mt-12 max-w-3xl sm:mt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Business intake → GRC review</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">A clearer path from business context to GRC review.</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">Business stakeholders share what they know in plain language. GRC analysts use that context to guide the assessment—without asking the stakeholder to make risk judgments.</p>
        </header>
        <RiskAssessmentForm />
      </div>
    </main>
  );
}
