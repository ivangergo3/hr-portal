import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { createClientServer } from '@/utils/supabase/server';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HR Portal',
  description: 'Internal HR management system',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClientServer();

  // TODO: This might be unnecessary
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-50`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
