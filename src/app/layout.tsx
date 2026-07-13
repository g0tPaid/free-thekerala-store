import type { Metadata, Viewport } from 'next';
import { Noto_Serif_Malayalam, Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans-family',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const editorial = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const malayalam = Noto_Serif_Malayalam({
  subsets: ['malayalam'],
  variable: '--font-malayalam',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'The Kerala Store',
    template: '%s · The Kerala Store',
  },
  description:
    'Jewellery, beauty, spices and home — curated Kerala essentials. കേരളത്തിന്റെ മനോഹാരിത നിങ്ങളുടെ വാതിൽക്കൽ.',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://thekerala.store'),
  openGraph: {
    title: 'The Kerala Store',
    description: 'Curated Kerala essentials — craft, spice, and everyday beauty.',
    siteName: 'The Kerala Store',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f8f6e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${editorial.variable} ${malayalam.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
