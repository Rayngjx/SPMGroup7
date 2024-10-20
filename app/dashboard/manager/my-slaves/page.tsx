'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { UserClient } from '@/components/tables/manager-team-tables/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'; // Import dropdown components
import { Heading } from '@/components/ui/heading';

const TeamScheduleCalendar = dynamic(
  () => import('@/components/dashboard/manager/EnhancedWFHCalendar'),
  {
    ssr: false,
    loading: () => <p>Loading calendar...</p>
  }
);

async function getTeam(teamLeadId: number) {
  const response = await fetch(`/api/users?reportingManager=${teamLeadId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch approved dates');
  }
  return response.json();
}

async function getTeamWfhData(teamLeadId: number) {
  const response = await fetch(`/api/requests?reportingManager=${teamLeadId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch approved dates');
  }
  return response.json();
}

export default function TeamSchedulePage() {
  const { data: session } = useSession();
  const reportingManagerId = session?.user.staff_id; // Get the reporting manager ID
  const [WfhData, setWfhData] = useState([]);
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all'); // Track selected status
  const [statuses, setStatuses] = useState<string[]>([]); // Track available statuses

  useEffect(() => {
    async function fetchTeamData() {
      if (reportingManagerId) {
        try {
          getTeam(reportingManagerId).then((response) => {
            setDepartmentStaff(response);
          });

          getTeamWfhData(reportingManagerId).then((response) => {
            setWfhData(response);

            // Extract unique statuses from the fetched WfhData
            const uniqueStatuses: string[] = Array.from(
              new Set(response.map((request: any) => request.status))
            );
            setStatuses(uniqueStatuses);
          });
        } catch (error) {
          console.error('Error fetching team data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchTeamData();
  }, [reportingManagerId]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  // Filter WfhData based on selected status
  const filteredWfhData =
    selectedStatus === 'all'
      ? WfhData
      : WfhData.filter((request: any) => request.status === selectedStatus);

  if (!session) {
    return <p>Please log in to see your team schedule.</p>;
  }

  if (loading) {
    return <p>Loading team data...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Team Schedule</h1>
      <Heading
        title={`Requests (${WfhData.length})`} // Update title to reflect requests
        description="Manage requests (Client-side table functionalities.)"
      />

      {/* Status Filter Dropdown */}
      <div className="mt-4">
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <UserClient data={filteredWfhData} />
      </Suspense>
    </div>
  );
}
