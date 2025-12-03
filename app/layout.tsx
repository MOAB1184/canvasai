import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CanvasAI - Master your LMS',
  description: 'The #1 AI assistant for Canvas LMS. Homework help, auto-grading, and study tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans text-neutral-50 antialiased min-h-screen bg-black flex flex-col selection:bg-brand-500 selection:text-white">
            {children}
      </body>
    </html>
  )
}
