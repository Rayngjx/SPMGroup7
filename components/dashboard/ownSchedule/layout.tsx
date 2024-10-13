// remove later

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Schedule',
  description: 'View your approved Work From Home arrangements'
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-full items-center justify-center">{children}</main>
  );
}
