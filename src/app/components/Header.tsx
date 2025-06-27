
'use client';

import Link from 'next/link';
import { Rocket, GanttChartSquare, ShieldCheck, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logout } from '@/app/actions';

export function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'My Tickets', icon: GanttChartSquare },
    { href: '/submit-ticket', label: 'Submit Ticket', icon: Rocket },
    { href: '/admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Rocket className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold tracking-tight font-headline">DeployTrack</span>
          </Link>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  asChild
                  variant={pathname === link.href ? 'default' : 'ghost'}
                  className={cn('gap-2', pathname === link.href && 'font-semibold')}
                >
                  <Link href={link.href}>
                    <link.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                </Button>
              ))}
            </nav>
            {isLoggedIn && (
               <form action={logout}>
                <Button variant="ghost" size="icon" title="Logout" type="submit">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
