import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lecture Recorder",
  description: "Automated lecture recording and summarization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <nav className="bg-slate-900 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">Lecture Recorder</h1>
              <div className="flex gap-4">
                <a href="/" className="hover:text-slate-300">Home</a>
                <a href="/recordings" className="hover:text-slate-300">Recordings</a>
              </div>
            </div>
          </nav>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-slate-100 p-4 text-center text-slate-500 text-sm">
            <p>Integrated with Canvas LMS</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
