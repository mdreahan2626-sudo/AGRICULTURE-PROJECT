import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "AgroPredict - Intelligent Crop Prediction & Soil Analysis",
  description: "Leverage advanced machine learning to predict optimal crop types based on soil parameters, temperature, humidity, and moisture.",
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0f19] text-slate-100 font-sans selection:bg-emerald-500/30">
        {children}
        <Toaster theme="dark" position="top-right" closeButton richColors />
      </body>
    </html>
  )
}
