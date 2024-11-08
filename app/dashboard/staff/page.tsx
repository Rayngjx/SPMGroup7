import { auth } from '@/auth';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { UserClient } from '@/components/tables/staff-tables/client';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Staff', link: '/dashboard/staff' }
];

export default async function Staff() {
  let getUsers;
  let getRequests;
  try {
    const data = await fetch(`https://spm-group7.vercel.app/api/users`);
    getUsers = await data.json();
    const request_data = await fetch(
      `https://spm-group7.vercel.app/api/requests`
    );
    getRequests = await request_data.json();
  } catch (error) {
    console.error(error);
  }

  const session = await auth();

  getUsers = getUsers ?? []; // Provide a default value if getUsers is undefined

  return (
    <PageContainer>
      {
        // This is a conditional rendering of the page
        session?.user?.role_id === 1 ? (
          <>
            <h1 className="p-10 text-3xl font-semibold">
              View Staff Dashboard
            </h1>
            <div className="space-y-2 pl-10">
              <Breadcrumbs items={breadcrumbItems} />
              <UserClient user_data={getUsers} request_data={getRequests} />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold sm:text-3xl">
              Staff Dashboard
            </h1>
            <p>Access Denied</p>
          </>
        )
      }
    </PageContainer>
  );
}
