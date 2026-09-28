"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { appendRiskRecord, RiskRegisterRecord } from "@/lib/grc/risk-register";
type StakeholderSubmission = Record<string, string>;
const RegisterContext = createContext<{ records: RiskRegisterRecord[]; addRecord: (record: RiskRegisterRecord) => void; stakeholderSubmissions: StakeholderSubmission[]; addStakeholderSubmission: (submission: StakeholderSubmission) => void } | null>(null);
export function RiskRegisterProvider({ children }: { children: ReactNode }) { const [records, setRecords] = useState<RiskRegisterRecord[]>([]); const [stakeholderSubmissions, setStakeholderSubmissions] = useState<StakeholderSubmission[]>([]); const addRecord = (record: RiskRegisterRecord) => setRecords((current) => appendRiskRecord(current, record)); const addStakeholderSubmission = (submission: StakeholderSubmission) => setStakeholderSubmissions((current) => [...current, submission]); return <RegisterContext.Provider value={{ records, addRecord, stakeholderSubmissions, addStakeholderSubmission }}>{children}</RegisterContext.Provider>; }
export function useRiskRegister() { const context = useContext(RegisterContext); if (!context) throw new Error("RiskRegisterProvider is required"); return context; }
