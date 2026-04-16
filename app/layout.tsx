import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const instrumentSans = Instrument_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AIJob - Умный поиск работы и ИИ-подбор вакансий",
  description: "AIJob — карьерный интеллект нового поколения. Платформа для интеллектуального поиска работы и подбора талантов с использованием искусственного интеллекта. Найдите работу, которая вам действительно подходит.",
  keywords: ["поиск работы", "вакансии", "искусственный интеллект", "подбор персонала", "карьера", "AIJob", "умный поиск", "работа с ИИ"],
  authors: [{ name: "AIJob Team" }],
  robots: "index, follow",
  openGraph: {
    title: "AIJob - Умный поиск работы и ИИ-подбор вакансий",
    description: "Найдите работу своей мечты с помощью ИИ. Персонализированный подбор вакансий и глубокий анализ навыков.",
    url: "https://ai-jobbb.vercel.app/",
    siteName: "AIJob",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIJob - Умный поиск работы",
    description: "Карьерный интеллект нового поколения для вашего успеха.",
  },
};

import { Toaster } from 'sonner';
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", instrumentSans.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
