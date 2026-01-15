import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "TransNow",
  description: "Real-time AI Translator",
  // 👇 This fixes the logo issue on phones/tabs
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  // 👇 This ensures the manifest is linked
  manifest: "/manifest.json",
  // 👇 This makes it look like a native app on iOS
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TransNow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
