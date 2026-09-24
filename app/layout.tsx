import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "AI-GRC Workflows", description: "AI-assisted GRC risk assessment workflows." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
