import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { FloatingPrayerTime } from '@/components/ui/FloatingPrayerTime'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: "Deeni - Islamic Learning Platform",
    template: "%s | Deeni"
  },
  description: "A modern platform for learning and understanding Islam",
  keywords: ["Islamic learning", "Quran", "Hadith", "Islamic education", "Muslim app", "Islamic app"],
  authors: [{ name: "SAFR+" }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: "Deeni - Islamic Learning Platform",
    description: "A modern platform for learning and understanding Islam",
    url: "https://deeni.app",
    siteName: "Deeni",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deeni - Islamic Learning Platform",
    description: "A modern platform for learning and understanding Islam",
    creator: "@deeniapp",
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#10b981" }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} antialiased min-h-screen bg-background font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <FloatingPrayerTime />
        </ThemeProvider>
      </body>
    </html>
  )
}
