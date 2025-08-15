import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { CompanySetupModal } from "@/components/company-setup-modal";

export const metadata: Metadata = {
  title: "Dinex - Restaurant Management",
  description: "Professional restaurant management dashboard",
  viewport: "width=device-width, initial-scale=1",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon512_rounded.png",
    apple: "/icon512_maskable.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className="font-sans antialiased"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        {children}
        <Toaster />
        <CompanySetupModal />
      </body>
    </html>
  );
}
