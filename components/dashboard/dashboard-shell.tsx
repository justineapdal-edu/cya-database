'use client';

import { Home, Settings, User } from 'lucide-react';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button } from '@/components/ui/button';
import { SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/sidebar';
import type { NavItem } from '@/components/sidebar';

const navigationItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#f7f8fa]">
        <SidebarContent
          items={navigationItems}
          brand={{ label: 'CYA Database', href: '/dashboard' }}
          footer={
            <Button
              className="w-full justify-start gap-3 px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              variant="ghost"
              asChild
            >
              <SignOutButton />
            </Button>
          }
        />

        <div className="md:pl-64">
          <div className="fixed left-4 top-4 z-20 md:hidden">
            <SidebarTrigger />
          </div>
          <main className="min-h-screen w-full px-4 pb-6 pt-16 md:px-6 md:pt-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
