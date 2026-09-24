"use client";

import { FormEvent, useState } from "react";

type EntryMethod = "guided" | "findings";
type Stage = "intake" | "submitted" | "review";
type Submission = { method: EntryMethod; details: Record<string, string> };

const inputClassName = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-100";

const fieldLabels: Record<string, string> = {
  assessmentSubject: "What is being assessed?",
  businessPurpose: "What does it do, and why is it important?",
  businessOwner: "Who owns it?",
  businessImportance: "How important is it to the business?",
  identifiedConcern: "What risk, concern, or situation has been identified?",
  possibleOutcome: "What could happen if it occurred?",
  affectedAreas: "What could be affected?",
  existingSafeguards: "What safeguards or controls already exist?",
  additionalContext: "Anything else that is relevant?",
  stakeholderFindings: "Prepared stakeholder findings",
};

function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-sm leading-5 text-slate-500">{children}</p>;
}

function InfoHint({ definition }: { definition: string }) {
  return <span className="ml-1 inline-flex size-4 cursor-help items-center justify-center rounded-full border border-slate-400 text-[10px] font-bold text-slate-500" title={definition} aria-label={definition}>i</span>;
}

export function RiskAssessmentForm() {
  const [entryMethod, setEntryMethod] = useState<EntryMethod>("guided");
  const [stage, setStage] = useState<Stage>("intake");
  const [submission, setSubmission] = useState<Submission | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const details = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value)]));
    setSubmission({ method: entryMethod, details });
    setStage("submitted");
  }

  function restartIntake() {
    setSubmission(null);
    setStage("intake");
  }

  if (stage === "submitted") {
    return <SubmissionConfirmation onOpenReview={() => setStage("review")} onRestart={restartIntake} />;
  }

  if (stage === "review" && submission) {
    return <GrcReview submission={submission} onReturnToIntake={restartIntake} />;
  }

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" onSubmit={handleSubmit}>
        <PerspectiveBadge perspective="Business Stakeholder" description="You provide business context. You are not being asked to judge likelihood, impact, or a risk rating." />
        <fieldset className="mt-7">
          <legend className="text-base font-semibold">How would you like to provide the information?</legend>
          <p className="mt-1 text-sm text-slate-600">Choose the path that best matches what you have available.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button className={`rounded-xl border p-4 text-left transition ${entryMethod === "guided" ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700" : "border-slate-200 hover:border-slate-300"}`} type="button" onClick={() => setEntryMethod("guided")} aria-pressed={entryMethod === "guided"}><span className="block text-sm font-semibold">Answer guided questions</span><span className="mt-1 block text-sm leading-5 text-slate-600">Best when you are starting from scratch or collecting information live.</span></button>
            <button className={`rounded-xl border p-4 text-left transition ${entryMethod === "findings" ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700" : "border-slate-200 hover:border-slate-300"}`} type="button" onClick={() => setEntryMethod("findings")} aria-pressed={entryMethod === "findings"}><span className="block text-sm font-semibold">Paste stakeholder findings</span><span className="mt-1 block text-sm leading-5 text-slate-600">Best when discovery notes or interview findings are already prepared.</span></button>
          </div>
        </fieldset>
        {entryMethod === "guided" ? <GuidedQuestions /> : <FindingsInput />}
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-6"><button className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700" type="submit">Submit to GRC Team</button><p className="text-sm text-slate-500">This sends the context for GRC review in this prototype.</p></div>
      </form>
      <StakeholderSidebar />
    </section>
  );
}

function PerspectiveBadge({ perspective, description }: { perspective: string; description: string }) {
  return <div className="rounded-xl border border-teal-100 bg-teal-50 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-800">Current perspective</p><p className="mt-1 font-semibold text-teal-950">{perspective}</p><p className="mt-1 text-sm leading-5 text-teal-900">{description}</p></div>;
}

function SubmissionConfirmation({ onOpenReview, onRestart }: { onOpenReview: () => void; onRestart: () => void }) {
  return <section className="mt-10 max-w-3xl rounded-2xl border border-teal-200 bg-white p-8 shadow-sm sm:p-10"><div className="flex size-11 items-center justify-center rounded-full bg-teal-100 text-xl font-semibold text-teal-800">✓</div><p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Business Stakeholder</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Submitted for GRC Review</h2><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">The stakeholder context is ready for the GRC team. In a production application, this is where the assessment would enter their review queue.</p><div className="mt-7 rounded-xl bg-slate-50 p-5"><p className="font-medium">Demo path</p><p className="mt-2 text-sm leading-6 text-slate-600">Business Stakeholder → Submit to GRC Team → Submitted for GRC Review → Open GRC Review</p></div><div className="mt-8 flex flex-wrap gap-3"><button className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700" type="button" onClick={onOpenReview}>Open GRC Review</button><button className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onRestart}>Start another intake</button></div><p className="mt-5 text-sm text-slate-500">This role switch is a prototype demo feature, not authentication or a security control.</p></section>;
}

function GrcReview({ submission, onReturnToIntake }: { submission: Submission; onReturnToIntake: () => void }) {
  const suppliedDetails = Object.entries(submission.details).filter(([, value]) => value.trim());
  return <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-6"><PerspectiveBadge perspective="GRC Analyst" description="Review the submitted business context. The structured assessment, recommendations, and calculation are intentionally staged for future phases." /><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Submitted stakeholder information</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Review the context before assessing it.</h2></div><span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">Awaiting analyst review</span></div><dl className="mt-7 divide-y divide-slate-100">{suppliedDetails.map(([key, value]) => <div className="py-5 first:pt-0" key={key}><dt className="text-sm font-medium text-slate-500">{fieldLabels[key] ?? key}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-900">{formatValue(key, value)}</dd></div>)}</dl></section></div><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">GRC review workspace</h2><p className="mt-2 text-sm leading-6 text-slate-600">This is the analyst view that will mature as the workflow is built out.</p><ReviewItem title="Structured GRC fields" status="Not yet assessed" detail="The analyst will structure the business context into GRC assessment fields." /><ReviewItem title="Missing information" status="Not yet identified" detail="The workflow will highlight gaps that need clarification." /><ReviewItem title="Assumptions & uncertainties" status="Not yet documented" detail="The analyst will record what is known, assumed, and uncertain." /><ReviewItem title="AI recommendations" status="Not enabled" detail="Future AI assistance will support, not replace, analyst judgment." /><ReviewItem title="Deterministic risk calculation" status="Not calculated" detail="Risk logic and scoring are intentionally not implemented yet." /><button className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onReturnToIntake}>Return to stakeholder intake</button><p className="mt-3 text-xs leading-5 text-slate-500">The handoff exists only in this browser session. Nothing is stored or sent externally.</p></aside></section>;
}

function ReviewItem({ title, status, detail }: { title: string; status: string; detail: string }) {
  return <div className="border-t border-slate-100 py-4"><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-medium">{title}</h3><span className="shrink-0 text-xs text-slate-500">{status}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>;
}

function formatValue(key: string, value: string) {
  if (key !== "businessImportance") return value;
  return { foundational: "Foundational — the business depends on it day to day", important: "Important — it supports a key business activity", supporting: "Supporting — it helps, but work can continue without it" }[value] ?? value;
}

function StakeholderSidebar() {
  return <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold">A quick note before you begin</h2><p className="mt-3 text-sm leading-6 text-slate-600">Use everyday business language. It is more useful to explain what could go wrong than to assign a technical risk rating.</p><div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-sm font-semibold">What happens next</h3><ol className="mt-4 space-y-4 text-sm leading-6 text-slate-600"><li><span className="mr-2 font-semibold text-slate-900">1.</span>You share the business context.</li><li><span className="mr-2 font-semibold text-slate-900">2.</span>The GRC team reviews it.</li><li><span className="mr-2 font-semibold text-slate-900">3.</span>The assessment is developed with their expertise.</li></ol></div><p className="mt-6 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">You will not be asked to set likelihood, impact, or a risk rating. Those are GRC assessment decisions.</p></aside>;
}

function GuidedQuestions() {
  return <div className="mt-8 space-y-8"><section><h2 className="text-lg font-semibold">Business context</h2><p className="mt-1 text-sm text-slate-600">Start with the thing being reviewed and why it matters.</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="text-sm font-medium">What is being assessed?</span><HelpText>Name the product, service, supplier, process, project, or change under review.</HelpText><input className={inputClassName} name="assessmentSubject" placeholder="For example: Customer support AI assistant" /></label><label className="block sm:col-span-2"><span className="text-sm font-medium">What does it do, and why is it important?</span><textarea className={`${inputClassName} min-h-28`} name="businessPurpose" placeholder="Describe its purpose, the people who rely on it, and the outcome it supports." /></label><label className="block"><span className="text-sm font-medium">Who owns it?</span><HelpText>The team or person accountable for this area.</HelpText><input className={inputClassName} name="businessOwner" placeholder="For example: Head of Customer Operations" /></label><fieldset><legend className="text-sm font-medium">How important is it to the business? <InfoHint definition="This means how much the business, customers, operations, revenue, or compliance activities rely on it." /></legend><HelpText>Choose the description that feels closest. This is not a risk rating.</HelpText><select className={inputClassName} defaultValue="" name="businessImportance"><option disabled value="">Select an option</option><option value="foundational">Foundational — the business depends on it day to day</option><option value="important">Important — it supports a key business activity</option><option value="supporting">Supporting — it helps, but work can continue without it</option></select></fieldset></div></section><section className="border-t border-slate-100 pt-8"><h2 className="text-lg font-semibold">The concern</h2><div className="mt-5 space-y-5"><Field label="What risk, concern, or situation has been identified?" helper="Describe what you have noticed, heard, or want to understand better." name="identifiedConcern" placeholder="For example: We are unsure how customer information is handled when the assistant responds to requests." /><Field label="What could happen if it occurred?" helper="Describe possible business, customer, operational, or compliance consequences in plain language." name="possibleOutcome" placeholder="For example: Customer information could be shared incorrectly, leading to complaints or regulatory attention." /><Field label="What could be affected?" helper="Include any systems, information, services, processes, customers, or teams that may be involved." name="affectedAreas" placeholder="For example: Customer records, the support team, our CRM, and service quality." /></div></section><section className="border-t border-slate-100 pt-8"><h2 className="text-lg font-semibold">Existing safeguards</h2><Field label="What safeguards or controls already exist?" helper="Include anything that is already in place, even if it is informal or only partly effective." name="existingSafeguards" placeholder="For example: Access is limited to support staff, prompt templates are reviewed, and unusual responses are sampled weekly." definition="Safeguards are the checks, rules, tools, approvals, training, or monitoring already used to reduce a problem or catch it early." /><Field label="Anything else that is relevant?" helper="Share dependencies, deadlines, prior incidents, known limitations, or questions for the assessment team." name="additionalContext" placeholder="Add any helpful context here." /></section></div>;
}

function Field({ label, helper, name, placeholder, definition }: { label: string; helper: string; name: string; placeholder: string; definition?: string }) {
  return <label className="block"><span className="text-sm font-medium">{label}{definition && <InfoHint definition={definition} />}</span><HelpText>{helper}</HelpText><textarea className={`${inputClassName} min-h-28`} name={name} placeholder={placeholder} /></label>;
}

function FindingsInput() {
  return <section className="mt-8 border-t border-slate-100 pt-8"><h2 className="text-lg font-semibold">Paste prepared stakeholder findings</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Paste notes from discovery, interviews, workshops, or an existing brief. Bullet points and unpolished notes are welcome.</p><label className="mt-5 block"><span className="text-sm font-medium">Stakeholder findings</span><textarea className={`${inputClassName} min-h-80`} name="stakeholderFindings" placeholder={`Helpful details include:\n• What is being assessed and what it does\n• The owner and business importance\n• The concern and what could happen\n• Systems, information, services, or processes involved\n• Existing safeguards and any remaining questions`} /></label><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"><p className="font-medium text-slate-800">Good to know</p><p className="mt-1">You do not need to organize these notes perfectly or assign likelihood or impact. The GRC team will structure the information during review.</p></div></section>;
}
