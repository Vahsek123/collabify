import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
});

const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Collabify',
  description: 'Real-time democratic playlist builder',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} overscroll-y-none`}>
      <body
        suppressHydrationWarning
        className={`${dmSerif.variable} antialiased`}
      >
        <div className="relative min-h-screen overflow-clip bg-[#0A0A0A]">
          <div className="bg-noise pointer-events-none fixed inset-0 z-1 bg-size-[256px] opacity-[0.035]" />
          {children}
        </div>
      </body>
    </html>
  );
}
