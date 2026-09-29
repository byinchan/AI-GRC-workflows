"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
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
};

const RegisterContext = createContext<RegisterContextValue | null>(null);

export function RiskRegisterProvider({ children }: { children: ReactNode }) {
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
        }
      }
    } catch {} finally {
      setRestorationComplete(true);
    }
  }, []);

  useEffect(() => {
    if (!restorationComplete) return;
    try {
      const snapshot = createWorkflowSessionSnapshot(stakeholderSubmissions, records);
      window.sessionStorage.setItem(workflowSessionStorageKey, JSON.stringify(snapshot));
    } catch {}
  }, [records, restorationComplete, stakeholderSubmissions]);

  if (!restorationComplete) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-sm text-slate-600" role="status">Restoring current session...</div>;
  }

  return <RegisterContext.Provider value={{ records, addRecord, stakeholderSubmissions, addStakeholderSubmission, markSubmissionRegistered }}>{children}</RegisterContext.Provider>;
}

export function useRiskRegister() {
  const context = useContext(RegisterContext);
  if (!context) throw new Error("RiskRegisterProvider is required");
  return context;
}
