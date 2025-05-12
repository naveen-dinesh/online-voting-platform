
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed as it's not found and not essential for now
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: 'VoteWise - Secure Online Voting System',
    template: '%s | VoteWise',
  },
  description: 'VoteWise is a secure, accessible, and transparent online voting system designed for modern democratic processes and organizational decision-making.',
  icons: {
    icon: "/favicon.ico", // Actual favicon.ico not generated, this is a placeholder reference
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable}`}> {/* Removed GeistMono variable */}
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased"
        )}
      >
        <AuthProvider>
          <div className="relative flex min-h-dvh flex-col"> {/* Use dvh for better mobile viewport handling */}
            <SiteHeader />
            <main className="flex-1 py-6 md:py-10">{children}</main>
            <SiteFooter />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

