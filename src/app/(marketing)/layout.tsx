import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Deeni - Track Good Deeds & Islamic Insights',
    template: '%s | Deeni'
  },
  description: 'Deeni helps you consistently track good deeds while providing AI-powered insights from the Quran and Hadith, making your spiritual journey more meaningful.',
  keywords: ['Islamic app', 'habit tracking', 'good deeds', 'Quran insights', 'Hadith insights', 'Islamic AI', 'spiritual growth'],
  authors: [{ name: 'SAFR+' }],
  creator: 'SAFR+',
  publisher: 'SAFR+',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://deeni.app',
    title: 'Deeni - Track Good Deeds & Islamic Insights',
    description: 'Deeni helps you consistently track good deeds while providing AI-powered insights from the Quran and Hadith.',
    siteName: 'Deeni',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deeni - Track Good Deeds & Islamic Insights',
    description: 'Deeni helps you consistently track good deeds while providing AI-powered insights from the Quran and Hadith.',
    creator: '@deeniapp',
  },
};

// Client component for background
import BackgroundLayout from '@/components/ui/BackgroundLayout';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BackgroundLayout>
      {children}
    </BackgroundLayout>
  );
} 