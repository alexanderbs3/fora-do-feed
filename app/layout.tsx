import type { Metadata } from "next";
import { Archivo_Black, Fraunces } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Newsletter Técnica",
  description: "Inscreva-se para receber artigos sobre arquitetura e desenvolvimento de software.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
