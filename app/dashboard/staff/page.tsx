import { auth } from '@/auth';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { UserClient } from '@/components/tables/staff-tables/client';
import { db } from '@/lib/db';
import React from 'react';
import { cache } from 'react';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Staff', link: '/dashboard/staff' }
];

export default async function page() {
  let getUsers;
  try {
    let data = await fetch('http://localhost:3000/api/users/all');
    getUsers = await data.json();
  } catch (error) {
    console.error(error);
  }

  const session = await auth();

  getUsers = getUsers ?? []; // Provide a default value if getUsers is undefined

  return (
    <PageContainer>
      {
        // This is a conditional rendering of the page title
        session?.user?.role_id === 1 ? (
          <>
            <h1 className="text-3xl font-semibold">View Staff Dashboard</h1>
            <div className="space-y-2">
              <Breadcrumbs items={breadcrumbItems} />
              <UserClient data={getUsers} />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold">Staff Dashboard</h1>
            <p>Access Denied</p>
          </>
        )
      }
    </PageContainer>
  );
}
