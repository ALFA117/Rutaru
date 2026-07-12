import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RutaChatbot } from "@/components/chatbot/ruta-chatbot";
import { BlockchainProviders } from "@/components/blockchain/blockchain-providers";
import { BLOCKCHAIN_ENABLED } from "@/config/flags";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Rutaru — pocas rutas, todas buenas.",
    template: "%s — Rutaru",
  },
  description:
    "Marketplace de rutas, hospedaje, traslados y eventos. Conexión de inventario turístico B2B/B2C.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Rutaru",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {BLOCKCHAIN_ENABLED ? (
          <BlockchainProviders>
            <SiteHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
            <RutaChatbot />
          </BlockchainProviders>
        ) : (
          <>
            <SiteHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
            <RutaChatbot />
          </>
        )}
      </body>
    </html>
  );
}
