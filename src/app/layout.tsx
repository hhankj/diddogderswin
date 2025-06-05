import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Did the Dodgers Win at Home?",
  description: "Track whether the LA Dodgers won their most recent home game. Updates automatically every 30 minutes with the latest game results.",
  keywords: ["Dodgers", "LA Dodgers", "baseball", "home games", "game results"],
  authors: [{ name: "Dodgers Win Tracker" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e293b',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
