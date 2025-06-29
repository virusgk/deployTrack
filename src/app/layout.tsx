import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cookies } from 'next/headers';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/AppSidebar';

export const metadata: Metadata = {
  title: 'DeployTrack',
  description: 'A deployment tracking system built with Firebase and Next.js',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('auth');
  const isLoggedIn = authCookie?.value === process.env.AUTH_SECRET;

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
            <AppSidebar isLoggedIn={isLoggedIn} />
            <SidebarInset className="p-4 sm:p-6 lg:p-8">
                {children}
            </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
