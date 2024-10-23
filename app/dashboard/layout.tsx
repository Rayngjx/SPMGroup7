import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import type { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'WFH',
  description: 'Your Personal WFH Schedule'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/'); // Use Next.js redirect function
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="w-full flex-1 overflow-hidden">
        <Header />
        {children}
      </main>
    </div>
  );
}
