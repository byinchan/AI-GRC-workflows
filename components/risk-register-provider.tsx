"use client";

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { appendRiskRecord, RiskRegisterRecord } from "@/lib/grc/risk-register";
import {
  createWorkflowSessionSnapshot,
  parseWorkflowSessionSnapshot,
  workflowSessionStorageKey,
  type StoredStakeholderSubmission,
} from "@/lib/grc/session-state";

export type StakeholderSubmission = StoredStakeholderSubmission;
type RegisterContextValue = {
  records: RiskRegisterRecord[];
  addRecord: (record: RiskRegisterRecord) => void;
  stakeholderSubmissions: StakeholderSubmission[];
  addStakeholderSubmission: (source: Record<string, string>) => void;
  markSubmissionRegistered: (id: string, riskRecordId: string) => void;
  diagnosticInstanceId: string;
};

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
  const [restorationComplete, setRestorationComplete] = useState(false);

  const addRecord = (record: RiskRegisterRecord) => setRecords((current) => appendRiskRecord(current, record));
  const addStakeholderSubmission = (source: Record<string, string>) => setStakeholderSubmissions((current) => [...current, { id: `submission-${current.length + 1}`, source: { ...source }, status: "Awaiting Review" }]);
  const markSubmissionRegistered = (id: string, riskRecordId: string) => setStakeholderSubmissions((current) => current.map((submission) => submission.id === id ? { ...submission, status: "Registered", riskRecordId } : submission));

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(workflowSessionStorageKey);
      if (stored) {
        const snapshot = parseWorkflowSessionSnapshot(stored);
        if (snapshot) {
          setStakeholderSubmissions(snapshot.stakeholderSubmissions);
          setRecords(snapshot.records);
        } else {
          window.sessionStorage.removeItem(workflowSessionStorageKey);
          console.warn(diagnosticPrefix, "invalid session snapshot discarded");
        }
      }
    } catch {
      console.warn(diagnosticPrefix, "session storage unavailable");
    } finally {
      setRestorationComplete(true);
    }
  }, []);

  useEffect(() => {
    if (!restorationComplete) return;
    try {
      const snapshot = createWorkflowSessionSnapshot(stakeholderSubmissions, records);
      window.sessionStorage.setItem(workflowSessionStorageKey, JSON.stringify(snapshot));
    } catch {
      console.warn(diagnosticPrefix, "session snapshot could not be saved");
    }
  }, [records, restorationComplete, stakeholderSubmissions]);

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

  if (!restorationComplete) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-sm text-slate-600" role="status">Restoring current session...</div>;
  }

  return <RegisterContext.Provider value={{ records, addRecord, stakeholderSubmissions, addStakeholderSubmission, markSubmissionRegistered, diagnosticInstanceId }}>{children}</RegisterContext.Provider>;
}

export function useRiskRegister() {
  const context = useContext(RegisterContext);
  if (!context) throw new Error("RiskRegisterProvider is required");
  return context;
}
