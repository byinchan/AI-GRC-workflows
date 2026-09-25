"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { RiskRegisterRecord } from "@/lib/grc/risk-register";
const RegisterContext = createContext<{ records: RiskRegisterRecord[]; addRecord: (record: RiskRegisterRecord) => void } | null>(null);
export function RiskRegisterProvider({ children }: { children: ReactNode }) { const [records, setRecords] = useState<RiskRegisterRecord[]>([]); const addRecord = (record: RiskRegisterRecord) => setRecords((current) => current.some(({ id }) => id === record.id) ? current : [...current, record]); return <RegisterContext.Provider value={{ records, addRecord }}>{children}</RegisterContext.Provider>; }
export function useRiskRegister() { const context = useContext(RegisterContext); if (!context) throw new Error("RiskRegisterProvider is required"); return context; }
