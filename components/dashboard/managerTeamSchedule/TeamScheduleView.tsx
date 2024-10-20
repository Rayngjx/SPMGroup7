'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface TeamMember {
  id: number;
  name: string;
  department: string;
  position: string;
  status: 'WFH' | 'Office';
}

const ManagerTeamScheduleView: React.FC = () => {
  const { data: session, status } = useSession();
  const [date, setDate] = useState<Date>(new Date());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'wfh' | 'office'>(
    'all'
  );

  useEffect(() => {
    if (session?.user?.staff_id) {
      fetchTeamMembers(session.user.staff_id, date);
    }
  }, [session, date]);

  useEffect(() => {
    filterMembers();
  }, [teamMembers, nameFilter, statusFilter]);

  const fetchTeamMembers = async (managerId: number, date: Date) => {
    try {
      // Fetch requests for the team members
      const requestsResponse = await fetch(
        `/api/requests?reportingManager=${managerId}`
      );
      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch requests');
      }
      const requests = await requestsResponse.json();

      // Filter requests for the selected date and statuses
      const filteredRequests = requests.filter((request: any) => {
        return (
          format(new Date(request.date), 'yyyy-MM-dd') ===
            format(date, 'yyyy-MM-dd') &&
          (request.status === 'approved' ||
            request.status === 'withdraw_pending')
        );
      });

      // Fetch team members
      const teamMembersResponse = await fetch(
        `/api/users?reportingManager=${managerId}`
      );
      if (!teamMembersResponse.ok) {
        throw new Error('Failed to fetch team members');
      }
      const teamMembersData = await teamMembersResponse.json();

      // Combine team members data with their request status
      const teamMembersWithStatus = teamMembersData.map((member: any) => {
        const memberRequest = filteredRequests.find(
          (req: any) => req.staff_id === member.staff_id
        );
        return {
          id: member.staff_id,
          name: `${member.staff_fname} ${member.staff_lname}`,
          department: member.department,
          position: member.position,
          status: memberRequest ? 'WFH' : 'Office'
        };
      });

      setTeamMembers(teamMembersWithStatus);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const filterMembers = () => {
    let filtered = teamMembers;

    if (nameFilter) {
      filtered = filtered.filter((member) =>
        member.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (member) =>
          (statusFilter === 'wfh' && member.status === 'WFH') ||
          (statusFilter === 'office' && member.status === 'Office')
      );
    }

    setFilteredMembers(filtered);
  };

  const getAggregatedManpower = () => {
    const wfhCount = filteredMembers.filter(
      (member) => member.status === 'WFH'
    ).length;
    const officeCount = filteredMembers.filter(
      (member) => member.status === 'Office'
    ).length;
    return { wfhCount, officeCount };
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const { wfhCount, officeCount } = getAggregatedManpower();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Team Schedule</span>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <Input
            placeholder="Filter by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-64"
          />
          <Select
            value={statusFilter}
            onValueChange={(value: 'all' | 'wfh' | 'office') =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="wfh">Work from Home</SelectItem>
              <SelectItem value="office">In Office</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{filteredMembers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Working from Home</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{wfhCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Working in Office</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{officeCount}</p>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.position}</TableCell>
                <TableCell>{member.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ManagerTeamScheduleView;
