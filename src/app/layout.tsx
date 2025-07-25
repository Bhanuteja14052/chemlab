import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from "next/font/google";
import FloatingLabAssistant from '@/components/lab/FloatingLabAssistant'
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
  title: "AI Chemistry Lab - Virtual Chemistry Experiments",
  description: "An immersive AI-powered virtual chemistry lab for safe experimentation and learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
          style={{ 
            background: 'var(--background)', 
            color: 'var(--foreground)' 
          }}
        >
          {children}
          <FloatingLabAssistant />
        </body>
      </html>
    </ClerkProvider>
  );
}
