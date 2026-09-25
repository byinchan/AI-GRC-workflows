"use client";

import Link from "next/link";
import { useState } from "react";
import { useRiskRegister } from "@/components/risk-register-provider";
import { RiskRegisterRecord } from "@/lib/grc/risk-register";

const badge: Record<RiskRegisterRecord["riskRating"], string> = {
  Low: "bg-emerald-50 text-emerald-900",
  Medium: "bg-amber-50 text-amber-900",
  High: "bg-orange-50 text-orange-900",
  Critical: "bg-red-50 text-red-900",
};
function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string | number;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
        {String(value) || "-"}
      </p>
    </div>
  );
}
function RecordSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800">
        {title}
      </h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function RiskRegisterPage() {
  const { records } = useRiskRegister();
  const [selected, setSelected] = useState<RiskRegisterRecord | null>(null);
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between">
          <Link className="text-lg font-semibold" href="/">
            AI-GRC Workflows
          </Link>
          <div className="flex gap-4">
            <Link
              className="text-sm font-medium text-slate-600"
              href="/risk-assessment"
            >
              Add Another Risk
            </Link>
            <Link
              className="text-sm font-medium text-teal-800"
              href="/risk-heat-map"
            >
              Risk Heat Map
            </Link>
          </div>
        </nav>
        <header className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-teal-700">
            Risk Register
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Human-approved risk records
          </h1>
          <p className="mt-3 text-slate-600">
            Records exist only for this browser session and are not persisted.
          </p>
        </header>
        {records.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">No risk records yet</h2>
            <p className="mt-2 text-slate-600">
              Complete an analyst review, then deliberately add it to the
              register.
            </p>
            <Link
              className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              href="/risk-assessment"
            >
              Open assessment
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-240 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {[
                      "Risk ID",
                      "Asset",
                      "Risk statement",
                      "Owner",
                      "L",
                      "I",
                      "Score",
                      "Rating",
                      "Treatment",
                      "Status",
                    ].map((head) => (
                      <th className="px-4 py-3 font-semibold" key={head}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr className="border-t border-slate-100" key={record.id}>
                      <td className="px-4 py-4 font-medium">{record.id}</td>
                      <td className="px-4 py-4">{record.asset}</td>
                      <td className="max-w-80 px-4 py-4">
                        {record.riskStatement}
                      </td>
                      <td className="px-4 py-4">{record.riskOwner || "-"}</td>
                      <td className="px-4 py-4">{record.likelihood}</td>
                      <td className="px-4 py-4">{record.impact}</td>
                      <td className="px-4 py-4 font-semibold">
                        {record.riskScore}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${badge[record.riskRating]}`}
                        >
                          {record.riskRating}
                        </span>
                      </td>
                      <td className="px-4 py-4">{record.treatmentStrategy}</td>
                      <td className="px-4 py-4">{record.status}</td>
                      <td className="px-4 py-4">
                        <button
                          className="font-semibold text-teal-800 underline"
                          onClick={() => setSelected(record)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            {selected && (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-teal-700">
                      {selected.id}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      Complete Risk Record
                    </h2>
                  </div>
                  <button
                    className="text-sm font-medium underline"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </div>
                <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-teal-800">
                    Risk Overview
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-5">
                    <Field label="Risk ID" value={selected.id} />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Risk Rating
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${badge[selected.riskRating]}`}
                      >
                        {selected.riskRating}
                      </span>
                    </div>
                    <Field label="Risk Score" value={selected.riskScore} />
                    <Field label="Status" value={selected.status} />
                    <Field
                      label="Treatment Strategy"
                      value={selected.treatmentStrategy}
                    />
                  </div>
                </section>
                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <RecordSection title="Ownership / Context">
                    <Field label="Asset" value={selected.asset} />
                    <Field
                      label="Business Owner"
                      value={selected.businessOwner}
                    />
                    <Field label="Risk Owner" value={selected.riskOwner} />
                    <Field label="Target Date" value={selected.targetDate} />
                    {selected.sourceSubmissionId && (
                      <Field label="Source Submission" value={selected.sourceSubmissionId} />
                    )}
                  </RecordSection>
                  <RecordSection title="Risk Analysis">
                    <Field
                      label="Final Likelihood"
                      value={selected.likelihood}
                    />
                    <Field label="Final Impact" value={selected.impact} />
                    <Field
                      label="Risk Statement"
                      value={selected.riskStatement}
                      wide
                    />
                    <Field
                      label="Analyst Rationale"
                      value={selected.rationale}
                      wide
                    />
                  </RecordSection>
                  <RecordSection title="Risk Assessment">
                    <Field
                      label="Threat / Risk Event"
                      value={selected.threat}
                      wide
                    />
                    <Field
                      label="Vulnerability / Contributing Condition"
                      value={selected.vulnerability}
                      wide
                    />
                    <Field
                      label="Business Impact / Consequence"
                      value={selected.businessImpact}
                      wide
                    />
                    <Field
                      label="Existing Controls"
                      value={selected.existingControls}
                      wide
                    />
                  </RecordSection>
                  <RecordSection title="Risk Treatment">
                    <Field
                      label="Treatment Action / Plan"
                      value={selected.treatmentPlan}
                      wide
                    />
                  </RecordSection>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
