'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

const TeamScheduleCalendar = dynamic(
  () => import('@/components/dashboard/staffTeamSchedule/EnhancedWFHCalendar'),
  {
    ssr: false,
    loading: () => <p>Loading calendar...</p>
  }
);

interface ProcessedStaffMember {
  id: number;
  name: string;
  position: string;
  wfhDates: string[];
  pendingDates: string[];
  withdrawPendingDates: string[];
  leaveDates: string[];
  reporting_manager: string;
  role_id: number;
}

async function fetchTeamData(reportingManagerId: number) {
  // Fetch all staff under the reporting manager
  const staffResponse = await fetch(
    `/api/users/?reportingManager=${reportingManagerId}`
  );
  if (!staffResponse.ok) {
    throw new Error('Failed to fetch staff details');
  }
  const staffMembers = await staffResponse.json();

  // Fetch all requests for these staff members
  const requestsResponse = await fetch(
    `/api/requests/?reportingManager=${reportingManagerId}`
  );
  if (!requestsResponse.ok) {
    throw new Error('Failed to fetch requests');
  }
  const requests = await requestsResponse.json();

  // Process and combine the data
  return staffMembers.map((staff: any) => {
    const staffRequests = requests.filter(
      (req: any) => req.staff_id === staff.staff_id
    );

    return {
      id: staff.staff_id,
      name: `${staff.staff_fname} ${staff.staff_lname}`,
      position: staff.position,
      wfhDates: staffRequests
        .filter((req: any) => req.status === 'approved')
        .map((req: any) => req.date),
      pendingDates: staffRequests
        .filter((req: any) => req.status === 'pending')
        .map((req: any) => req.date),
      withdrawPendingDates: staffRequests
        .filter((req: any) => req.status === 'withdraw_pending')
        .map((req: any) => req.date),
      leaveDates: staffRequests
        .filter((req: any) => req.status === 'leave')
        .map((req: any) => req.date),
      reporting_manager: staff.reporting_manager,
      role_id: staff.role_id
    };
  });
}

export default function TeamSchedulePage() {
  const { data: session } = useSession();
  const [staffData, setStaffData] = useState<ProcessedStaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeamData() {
      if (!session?.user?.reporting_manager) return;

      try {
        const data = await fetchTeamData(session.user.reporting_manager);
        setStaffData(data);
      } catch (error) {
        console.error('Error loading team data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTeamData();
  }, [session]);

  if (!session) {
    return <p>Please log in to view team schedule.</p>;
  }

  if (loading) {
    return <p>Loading team data...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <TeamScheduleCalendar staffData={staffData} />
      </Suspense>
    </div>
  );
}
