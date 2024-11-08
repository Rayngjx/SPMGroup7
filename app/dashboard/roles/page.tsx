import {
  checkIfSeniorManagementOrHR,
  checkIfStaff
} from '@/app/helper/userService';
import { auth } from '@/auth';
import { Breadcrumbs } from '@/components/breadcrumbs';
import Component_Roles from '@/components/dashboard/roles/RolesPannel';
import PageContainer from '@/components/layout/page-container';
import { is } from 'date-fns/locale';
import React from 'react';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Roles', link: '/dashboard/roles' }
];

export default async function page() {
  //   let getUsers;
  //   try {
  //     let data = await fetch('http://localhost:3000/api/users/all')
  //     getUsers = await data.json()
  //   } catch (error) {
  //     console.error(error);
  //   }

  const session = await auth();

  const data = await fetch('https://spm-group7.vercel.app/api/roles');
  const roles = await data.json();

  let isSeniorOrHR = false;

  if (session) {
    isSeniorOrHR = await checkIfSeniorManagementOrHR(session.user.staff_id);
  }

  //   getUsers = getUsers ?? []; // Provide a default value if getUsers is undefined

  return (
    <PageContainer>
      {
        // This is a conditional rendering of the page title
        isSeniorOrHR ? (
          <>
            <h1 className="text-3xl font-semibold">Roles</h1>
            <div className="space-y-2">
              <Breadcrumbs items={breadcrumbItems} />
              <Component_Roles dataRoles={roles} />
              {/* <UserClient data={getUsers} /> */}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold">Staff Dashboard</h1>
            <p>Access Denied. Ask HR or sr mgr</p>
          </>
        )
      }
    </PageContainer>
  );
}
