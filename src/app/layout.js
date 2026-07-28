import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "AgroPredict - Intelligent Crop Prediction & Soil Analysis",
  description: "Leverage advanced machine learning to predict optimal crop types based on soil parameters, temperature, humidity, and moisture.",
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-emerald-500/30 bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="top-right" closeButton richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
