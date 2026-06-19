'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon, Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type SidebarContextValue = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { isOpen, toggle } = useSidebar();

  return (
    <Button
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      aria-expanded={isOpen}
      className={className}
      size="icon"
      variant="ghost"
      type="button"
      onClick={toggle}
    >
      {isOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
    </Button>
  );
}

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            className={cn(
              'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950',
              isActive && 'bg-primary/10 text-primary font-semibold hover:bg-primary/15 hover:text-primary',
            )}
            href={item.href}
            onClick={onNavigate}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarContent({
  items,
  brand,
  footer,
}: {
  items: NavItem[];
  brand?: { label: string; href: string };
  footer?: React.ReactNode;
}) {
  const { isOpen, close } = useSidebar();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        {brand && (
          <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-4">
            <Link className="text-base font-semibold text-slate-950" href={brand.href}>
              {brand.label}
            </Link>
          </div>
        )}
        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarNav items={items} />
        </div>
        {footer && (
          <div className="shrink-0 border-t border-slate-200 p-3">{footer}</div>
        )}
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/40 transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden="true"
        onClick={close}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82vw] flex-col border-r border-slate-200 bg-white transition-transform md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="absolute right-3 top-3">
          <Button
            aria-label="Close sidebar"
            size="icon"
            variant="ghost"
            type="button"
            onClick={close}
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col pt-12">
          {brand && (
            <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-4">
              <Link
                className="text-base font-semibold text-slate-950"
                href={brand.href}
                onClick={close}
              >
                {brand.label}
              </Link>
            </div>
          )}
          <SidebarNav items={items} onNavigate={close} />
        </div>
        {footer && (
          <div className="shrink-0 border-t border-slate-200 p-3">{footer}</div>
        )}
      </div>
    </>
  );
}
