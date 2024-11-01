'use client';

import { DashboardNav } from '@/components/dashboard-nav';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, LogOut } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import {
  getAuthorizedNavItems,
  UserRole,
  UserPosition
} from '@/constants/data';
import { cn } from '@/lib/utils';
import { useMobileSidebar } from '@/hooks/UseMobileSidebar'; // New hook
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

type SidebarProps = {
  className?: string;
};

export function MobileSidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useMobileSidebar(); // Use the new hook
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const userRole = session?.user?.role_id as UserRole;
  const userPosition = session?.user?.position as UserPosition;

  // Filter out the logout item from nav items
  const navItemsWithoutLogout = getAuthorizedNavItems({
    role: userRole,
    position: userPosition
  });

  const handleMobileSidebarToggle = () => {
    toggle();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Overview
              </h2>
              <div className="space-y-1">
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
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
