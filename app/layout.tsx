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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://fora-do-feed.com"),
  title: {
    default: "Fora do Feed",
    template: "%s | Fora do Feed",
  },
  description: "Newsletter com curadoria de tecnologia, software, IA, negócios tech e sinais relevantes do Brasil e do mundo.",
  openGraph: {
    title: "Fora do Feed",
    description: "Tecnologia, software e IA sem ruído de feed.",
    url: "https://fora-do-feed.com",
    siteName: "Fora do Feed",
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
