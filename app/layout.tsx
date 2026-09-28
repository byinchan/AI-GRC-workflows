import type { Metadata } from "next";
import "./globals.css";
import { RiskRegisterProvider } from "@/components/risk-register-provider";

export const metadata: Metadata = { title: "AI-GRC Workflows", description: "AI-assisted GRC risk assessment workflows." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><RiskRegisterProvider>{children}</RiskRegisterProvider></body></html>;
}
