'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { cloneUniformsGroups } from 'three/src/renderers/shaders/UniformsUtils.js';

const TeamScheduleCalendar = dynamic(
  () => import('@/components/dashboard/staffTeamSchedule/EnhancedWFHCalendar'),
  {
    ssr: false,
    loading: () => <p>Loading calendar...</p>
  }
);

async function getApprovedDates(teamLeadId: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/approved-dates/team/${teamLeadId}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch approved dates');
  }
  console.log(response);
  return response.json();
}

async function getUserDetails(staffId: number) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${staffId}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  return response.json();
}

export default function TeamSchedulePage() {
  const { data: session } = useSession();

  if (!session) {
    return <p>Please log in to see your team schedule.</p>;
  }

  const reportingManagerId = session.user.reporting_manager; // Get the reporting manager ID
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const approvedDates =
          reportingManagerId !== null
            ? await getApprovedDates(reportingManagerId)
            : [];
        console.log(approvedDates, 'lks');
        // Collect unique staff IDs from approved dates
        const staffIds = [
          ...new Set(approvedDates.map((date) => date.staff_id))
        ];

        // Fetch user details for each staff member
        const userDetailsPromises = staffIds.map((id) => getUserDetails(id));
        const usersDetails = await Promise.all(userDetailsPromises);

        // Map user details with their approved dates
        const formattedDepartmentStaff = usersDetails.map((user) => {
          const userApprovedDates = approvedDates
            .filter((date) => date.staff_id === user.staff_id)
            .map((date) => date.date); // Assuming 'date' is the approved date

          return {
            id: user.staff_id, // Assuming 'id' is required for the key in tables
            name: `${user.staff_fname} ${user.staff_lname}`,
            position: user.position,
            wfhDates: userApprovedDates,
            reporting_manager: user.reporting_manager
          };
        });
        console.log(formattedDepartmentStaff, 'fds');

        setDepartmentStaff(formattedDepartmentStaff);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamData();
  }, [reportingManagerId]);

  if (loading) {
    return <p>Loading team data...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Team Schedule</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <TeamScheduleCalendar
          currentUser={session.user} // Pass current user details if needed
          departmentStaff={departmentStaff} // Pass the formatted department staff data
        />
      </Suspense>
    </div>
  );
}

