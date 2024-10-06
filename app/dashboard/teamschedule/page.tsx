import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TeamScheduleCalendar = dynamic(
  () => import('@/components/dashboard/staffTeamSchedule/EnhancedWFHCalendar'),
  {
    ssr: false,
    loading: () => <p>Loading calendar...</p>
  }
);

async function getStaffData(userId: number) {
  // In a real application, you would fetch this data from your database
  // For this example, we'll use mock data
  const mockStaffData = [
    {
      id: 1,
      name: 'Susan Goh',
      position: 'Account Manager',
      reportingManager: 101,
      wfhDates: ['2024-09-30', '2024-10-01', '2024-10-02']
    },
    {
      id: 2,
      name: 'Oliva Lim',
      position: 'Account Manager',
      reportingManager: 101,
      wfhDates: ['2024-10-02', '2024-10-03', '2024-10-04']
    },
    {
      id: 3,
      name: 'Emma Heng',
      position: 'Account Manager',
      reportingManager: 101,
      wfhDates: ['2024-10-04', '2024-10-05', '2024-10-06']
    },
    {
      id: 4,
      name: 'Eva Yong',
      position: 'Account Manager',
      reportingManager: 102,
      wfhDates: ['2024-09-30', '2024-10-01', '2024-10-02']
    },
    {
      id: 5,
      name: 'Charlotte Wong',
      position: 'Account Manager',
      reportingManager: 102,
      wfhDates: ['2024-10-02', '2024-10-03', '2024-10-04']
    },
    {
      id: 6,
      name: 'Noah Ng',
      position: 'Account Manager',
      reportingManager: 102,
      wfhDates: ['2024-10-04', '2024-10-05', '2024-10-06']
    }
  ];

  const currentUser = mockStaffData.find((staff) => staff.id === userId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  const departmentStaff = mockStaffData.filter(
    (staff) => staff.reportingManager === currentUser.reportingManager
  );
  return { currentUser, departmentStaff };
}

export default async function TeamSchedulePage() {
  const { currentUser, departmentStaff } = await getStaffData(1); // Assuming current user has ID 1

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Team Schedule</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <TeamScheduleCalendar
          currentUser={currentUser}
          departmentStaff={departmentStaff}
        />
      </Suspense>
    </div>
  );
}
