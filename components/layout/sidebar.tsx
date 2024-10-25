'use client';

import React from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import {
  getAuthorizedNavItems,
  UserRole,
  UserPosition
} from '@/constants/data';
import { cn } from '@/lib/utils';
import { ChevronLeft, LogOut } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const { data: session } = useSession();

  const userRole = session?.user?.role_id as UserRole;
  const userPosition = session?.user?.position as UserPosition;

  // Filter out the logout item from nav items
  const navItemsWithoutLogout = getAuthorizedNavItems({
    role: userRole,
    position: userPosition
  });

  const handleToggle = () => {
    toggle();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <aside
      className={cn(
        `relative hidden h-screen flex-none border-r bg-card transition-[width] duration-500 md:block`,
        !isMinimized ? 'w-72' : 'w-[72px]',
        className
      )}
    >
      <div className="hidden p-5 pt-10 lg:block">
        <Link href={'/dashboard'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
        </Link>
      </div>
      <ChevronLeft
        className={cn(
          'absolute -right-3 top-10 z-50 cursor-pointer rounded-full border bg-background text-3xl text-foreground',
          isMinimized && 'rotate-180'
        )}
        onClick={handleToggle}
      />
      <div className="flex h-full flex-col justify-between py-4">
        <div className="px-3 py-2">
          <div className="mt-3 space-y-1">
            <DashboardNav items={navItemsWithoutLogout} />
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start',
                isMinimized ? 'px-2' : 'px-4'
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!isMinimized && <span className="ml-2">Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
