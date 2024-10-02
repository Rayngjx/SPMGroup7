import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { UserClient } from '@/components/tables/staff-tables/client';
import { users } from '@/constants/data';
import { db } from '@/lib/db';
import { cache } from 'react';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Staff', link: '/dashboard/staff' }
];

export default async function page() {
  let getUsers;
  try {
    // getUsers = cache(async () => {
    //   return await db.users.findMany();
    // });
    getUsers = await db.users.findMany();
  } catch (error) {
    console.error(error);
  }

  getUsers = getUsers ?? []; // Provide a default value if getUsers is undefined

  return (
    <PageContainer>
      <div className="space-y-2">
        <Breadcrumbs items={breadcrumbItems} />
        <UserClient data={getUsers} />
      </div>
    </PageContainer>
  );
}
