import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Assistant",
  description: "RAG-powered job application assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <nav className="border-b">
          <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-6">
            <Link href="/" className="font-semibold text-sm hover:text-primary">
              Apply
            </Link>
            <Link href="/scout" className="text-sm text-muted-foreground hover:text-primary">
              Scout
            </Link>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
