import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { RiskRegisterProvider } from "@/components/risk-register-provider";

export const metadata: Metadata = { title: "AI-GRC Workflows", description: "AI-assisted GRC risk assessment workflows." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><RiskRegisterProvider>{children}<footer className="bg-slate-50 px-5 pb-8 text-center text-sm sm:px-10"><Link className="font-medium text-teal-800 underline" href="/executive-risk-summary">Executive Risk Summary</Link></footer></RiskRegisterProvider></body></html>;
}
