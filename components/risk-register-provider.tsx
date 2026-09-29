"use client";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { appendRiskRecord, RiskRegisterRecord } from "@/lib/grc/risk-register";
export type StakeholderSubmission = { id: string; source: Record<string, string>; status: "Awaiting Review" | "Registered"; riskRecordId?: string };
type RegisterContextValue = { records: RiskRegisterRecord[]; addRecord: (record: RiskRegisterRecord) => void; stakeholderSubmissions: StakeholderSubmission[]; addStakeholderSubmission: (source: Record<string, string>) => void; markSubmissionRegistered: (id: string, riskRecordId: string) => void; diagnosticInstanceId: string };
const RegisterContext = createContext<RegisterContextValue | null>(null);
let providerInstanceCount = 0;
const diagnosticPrefix = "[GRC_STATE_DIAGNOSTIC]";

function documentRuntimeMetadata() {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return {
    documentTimeOrigin: performance.timeOrigin,
    navigationType: navigation?.type,
    pathname: window.location.pathname,
    visibilityState: document.visibilityState,
  };
}

export function RiskRegisterProvider({ children }: { children: ReactNode }) {
  const diagnosticInstanceId = useRef(`provider-${++providerInstanceCount}`).current;
  const [records, setRecords] = useState<RiskRegisterRecord[]>([]);
  const [stakeholderSubmissions, setStakeholderSubmissions] = useState<StakeholderSubmission[]>([]);
  const addRecord = (record: RiskRegisterRecord) => setRecords((current) => appendRiskRecord(current, record));
  const addStakeholderSubmission = (source: Record<string, string>) => setStakeholderSubmissions((current) => [...current, { id: `submission-${current.length + 1}`, source: { ...source }, status: "Awaiting Review" }]);
  const markSubmissionRegistered = (id: string, riskRecordId: string) => setStakeholderSubmissions((current) => current.map((submission) => submission.id === id ? { ...submission, status: "Registered", riskRecordId } : submission));

  useEffect(() => {
    console.info(diagnosticPrefix, "provider mounted", { diagnosticInstanceId, ...documentRuntimeMetadata() });
    return () => console.info(diagnosticPrefix, "provider unmounted", { diagnosticInstanceId });
  }, [diagnosticInstanceId]);
  useEffect(() => {
    console.info(diagnosticPrefix, "provider state", {
      diagnosticInstanceId,
      stakeholderSubmissionCount: stakeholderSubmissions.length,
      stakeholderSubmissions: stakeholderSubmissions.map(({ id, status, riskRecordId }) => ({ id, status, riskRecordId })),
      registeredRiskRecordCount: records.length,
      registeredRiskIds: records.map(({ id }) => id),
    });
  }, [diagnosticInstanceId, records, stakeholderSubmissions]);

  return <RegisterContext.Provider value={{ records, addRecord, stakeholderSubmissions, addStakeholderSubmission, markSubmissionRegistered, diagnosticInstanceId }}>{children}</RegisterContext.Provider>;
}
export function useRiskRegister() { const context = useContext(RegisterContext); if (!context) throw new Error("RiskRegisterProvider is required"); return context; }
