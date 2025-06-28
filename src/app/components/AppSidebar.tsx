'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Rocket, GanttChartSquare, ShieldCheck, LogOut } from 'lucide-react';
import { logout } from '@/app/actions';

const navLinks = [
  { href: '/', label: 'My Tickets', icon: GanttChartSquare },
  { href: '/submit-ticket', label: 'Submit Ticket', icon: Rocket },
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
];

export function AppSidebar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <Rocket className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            DeployTrack
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => (
             <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{ children: link.label }}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {isLoggedIn && (
        <SidebarFooter>
            <form action={logout} className="w-full">
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip={{children: 'Logout'}} asChild>
                             <button type="submit" className="w-full">
                                <LogOut />
                                <span>Logout</span>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarMenu>
            </form>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
