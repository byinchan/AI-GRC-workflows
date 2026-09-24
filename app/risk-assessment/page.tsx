import Link from "next/link";

const fields = [["Assessment name", "e.g. AI vendor onboarding review"], ["Business owner", "e.g. Security & Compliance"], ["System or process", "What is being assessed?"]];

export default function RiskAssessmentPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 sm:px-10 lg:px-16"><div className="mx-auto max-w-5xl">
      <nav className="flex items-center justify-between"><Link className="text-lg font-semibold tracking-tight" href="/">AI-GRC Workflows</Link><span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">Draft assessment</span></nav>
      <header className="mt-14 max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Step 1 of 3</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Start a risk assessment</h1><p className="mt-4 text-lg leading-8 text-slate-600">Capture the basic context for the risk or use case. This information will guide future assessment and control recommendations.</p></header>
      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_280px]"><form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="space-y-6">{fields.map(([label, placeholder]) => <label className="block" key={label}><span className="text-sm font-medium">{label}</span><input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100" placeholder={placeholder} type="text" /></label>)}<label className="block"><span className="text-sm font-medium">Description</span><textarea className="mt-2 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100" placeholder="Describe the intended use, data involved, and any known concerns." /></label></div><button className="mt-8 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white opacity-50" disabled type="button">Continue to risk analysis</button><p className="mt-3 text-sm text-slate-500">Assessment analysis will be enabled in a future iteration.</p></form>
      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">What happens next</h2><ol className="mt-5 space-y-5 text-sm text-slate-600"><li><span className="mr-2 font-semibold text-slate-900">1.</span>Define the assessment context.</li><li><span className="mr-2 font-semibold text-slate-900">2.</span>Review risks and existing controls.</li><li><span className="mr-2 font-semibold text-slate-900">3.</span>Document actions and ownership.</li></ol></aside></section>
    </div></main>
  );
}
