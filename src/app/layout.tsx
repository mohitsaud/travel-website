import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Himalaya Travel Company | Nepal Treks & Tours',
    template: '%s | Himalaya Travel Company',
  },
  description: 'Locally led treks and thoughtful journeys through Nepal, Tibet and Bhutan.',
  openGraph: {
    type: 'website',
    siteName: 'Himalaya Travel Company',
    title: 'Himalaya Travel Company | Nepal Treks & Tours',
    description: 'Locally led treks and thoughtful journeys through Nepal.',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
