'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { requests } from '@prisma/client';

// Define the interface for department staff
interface DepartmentStaff {
  id: number;
  name: string;
  position: string;
  wfhDates: string[];
  reporting_manager: string;
  role_id: number;
}

const TeamScheduleCalendar = dynamic(
  () => import('@/components/dashboard/staffTeamSchedule/EnhancedWFHCalendar'),
  {
    ssr: false,
    loading: () => <p>Loading calendar...</p>
  }
);

async function getApprovedRequests(teamLeadId: number) {
  const response = await fetch(`/api/requests/?reportingManager=${teamLeadId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch approved requests');
  }

  const data = await response.json();

  return data.filter(
    (request: any) =>
      request.status === 'approved' || request.status === 'withdrawn_pending'
  );
}

async function getUserDetails(staffId: number) {
  const response = await fetch(`/api/users/?staffId=${staffId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  return response.json();
}

export default function TeamSchedulePage() {
  const { data: session } = useSession();
  const [departmentStaff, setDepartmentStaff] = useState<DepartmentStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = {
    staff_id: session?.user.staff_id ?? 0, // Provide a default value
    staff_fname: session?.user.staff_fname ?? '', // Provide a default value
    staff_lname: session?.user.staff_lname ?? '', // Provide a default value
    role_id: session?.user.role_id ?? 1 // Provide a default value
  };

  useEffect(() => {
    async function fetchTeamData() {
      if (!session?.user?.staff_id) return;

      try {
        // Fetch approved requests for the current user's team
        const approvedRequests = await getApprovedRequests(
          session.user.reporting_manager
        );
        console.log(approvedRequests);
        // Collect unique staff IDs from approved requests
        const staffIds: number[] = Array.from(
          new Set(approvedRequests.map((request: requests) => request.staff_id))
        );

        // Fetch user details for each staff member
        const userDetailsPromises = staffIds.map((id) => getUserDetails(id));
        const usersDetails = await Promise.all(userDetailsPromises);

        // Map user details with their approved requests
        const formattedDepartmentStaff = usersDetails.map((user) => {
          const userApprovedDates = approvedRequests
            .filter((request: requests) => request.staff_id === user.staff_id) // Specify the type here
            .map((request: requests) => request.date); // Explicitly define the type here

          return {
            id: user.staff_id,
            name: `${user.staff_fname} ${user.staff_lname}`,
            position: user.position,
            wfhDates: userApprovedDates,
            reporting_manager: user.reporting_manager,
            role_id: user.role_id ?? 1 // Provide a default value if role_id is null
          };
        });

        setDepartmentStaff(formattedDepartmentStaff);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, [session]);

  if (!session) {
    return <p>Please log in to see your team schedule.</p>;
  }

  if (loading) {
    return <p>Loading team data...</p>;
  }

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
