import Link from "next/link";

const workflowSteps = [
  ["01", "Business context", "A stakeholder describes the service, concern, and existing safeguards in plain language."],
  ["02", "AI-assisted structuring", "The application organizes the submitted context into a clearly labeled draft for review."],
  ["03", "Human GRC review", "An analyst confirms or edits the draft, then makes the final likelihood and impact decisions."],
  ["04", "Deterministic result", "The application calculates the score and rating, then the analyst may add an approved record to the register."],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 sm:px-10 lg:px-16">
      <nav className="mx-auto flex max-w-6xl items-center justify-between"><span className="text-lg font-semibold tracking-tight">AI-GRC Workflows</span><Link className="text-sm font-medium text-slate-600 hover:text-slate-950" href="/risk-assessment">Open assessment</Link></nav>
      <section className="mx-auto grid max-w-6xl gap-12 py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div><p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Risk assessment, made clearer</p><h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">A focused workflow for AI-assisted GRC decisions.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Gather business context, identify risks, and create a transparent assessment your stakeholders can review with confidence.</p><Link className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700" href="/risk-assessment">Start a risk assessment</Link></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-teal-700">How this prototype works</p><ol className="mt-6 space-y-4"><li className="flex gap-3"><span className="font-semibold text-slate-400">01</span><span><b>Stakeholder intake</b><br /><span className="text-sm text-slate-600">Business context is captured without asking stakeholders to score risk.</span></span></li><li className="flex gap-3"><span className="font-semibold text-slate-400">02</span><span><b>Advisory AI draft</b><br /><span className="text-sm text-slate-600">AI suggestions remain visible as a draft—not a decision.</span></span></li><li className="flex gap-3"><span className="font-semibold text-slate-400">03</span><span><b>Analyst-approved record</b><br /><span className="text-sm text-slate-600">Final analyst inputs drive the deterministic score and risk register record.</span></span></li></ol></div>
      </section>
      <section className="mx-auto max-w-6xl border-t border-slate-200 py-12"><h2 className="text-2xl font-semibold tracking-tight">A practical assessment flow</h2><div className="mt-8 grid gap-5 md:grid-cols-2">{workflowSteps.map(([number, title, description]) => <article key={number} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-teal-700">{number}</p><h3 className="mt-6 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}</div></section>
    </main>
  );
}
