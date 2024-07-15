import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s by AI Logo Generator | AI Logo Shop",
    default: "AI Logo Generator | AI Logo Shop",
  },
  description:
    "AI Logo Shop is an AI Logo Generator, used to generate beautiful logos with AI.",
  keywords: "AI Logo, AI Logo Shop, AI Logo Generator, AI Logo image",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Toaster position="top-center" richColors />
          {children}
          <Script 
            src="https://js.stripe.com/v3/buy-button.js"
            strategy="lazyOnload"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}