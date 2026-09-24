import Link from "next/link";

const workflowSteps = [
  ["01", "Capture context", "Start with the system, process, or vendor under review."],
  ["02", "Assess risk", "Document likelihood, impact, controls, and ownership."],
  ["03", "Prioritize action", "Turn the assessment into a clear, reviewable plan."],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 sm:px-10 lg:px-16">
      <nav className="mx-auto flex max-w-6xl items-center justify-between"><span className="text-lg font-semibold tracking-tight">AI-GRC Workflows</span><Link className="text-sm font-medium text-slate-600 hover:text-slate-950" href="/risk-assessment">Open assessment</Link></nav>
      <section className="mx-auto grid max-w-6xl gap-12 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div><p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Risk assessment, made clearer</p><h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">A focused workflow for AI-assisted GRC decisions.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Gather business context, identify risks, and create a transparent assessment your stakeholders can review with confidence.</p><Link className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700" href="/risk-assessment">Start a risk assessment</Link></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-slate-500">Assessment snapshot</p><div className="mt-6 space-y-5"><div><p className="text-sm text-slate-500">Assessment scope</p><p className="mt-1 font-medium">Third-party AI vendor</p></div><div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-5"><div><p className="text-sm text-slate-500">Inherent risk</p><p className="mt-1 text-2xl font-semibold text-amber-600">Medium</p></div><div><p className="text-sm text-slate-500">Control status</p><p className="mt-1 text-2xl font-semibold text-teal-700">In review</p></div></div><p className="text-sm leading-6 text-slate-600">Designed for human review. AI assistance will be introduced in a later iteration.</p></div></div>
      </section>
      <section className="mx-auto max-w-6xl border-t border-slate-200 py-12"><h2 className="text-2xl font-semibold tracking-tight">A practical assessment flow</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{workflowSteps.map(([number, title, description]) => <article key={number} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm font-semibold text-teal-700">{number}</p><h3 className="mt-6 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}</div></section>
    </main>
  );
}
