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
import { format, isWeekend, isAfter, startOfDay, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface TeamMember {
  staff_id: number;
  name: string;
  department: string;
  position: string;
  status: 'WFH' | 'Office' | 'Weekend' | 'Leave';
  upcomingWfhDates: string[];
  pendingRequests: number;
}

const ManagerTeamScheduleView = () => {
  const { data: session, status } = useSession();
  const [date, setDate] = useState<Date>(new Date());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'wfh' | 'office' | 'leave'
  >('all');
  const [selectedStaff, setSelectedStaff] = useState<TeamMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      if (!requestsResponse.ok) throw new Error('Failed to fetch requests');
      const requests = await requestsResponse.json();

      const teamMembersResponse = await fetch(
        `/api/users?reportingManager=${managerId}`
      );
      if (!teamMembersResponse.ok)
        throw new Error('Failed to fetch team members');
      const teamMembersData = await teamMembersResponse.json();

      // Combine team members data with their request status
      const teamMembersWithStatus = teamMembersData.map((member: any) => {
        const memberRequests = requests.filter(
          (req: any) => req.staff_id === member.staff_id
        );

        // Get future and today's date for filtering
        const today = startOfDay(new Date());

        // Get approved WFH dates (including withdraw_pending as they're still valid until withdrawn)
        const approvedWfhDates = memberRequests
          .filter(
            (req: any) =>
              (req.status === 'approved' ||
                req.status === 'withdraw_pending') &&
              (isAfter(parseISO(req.date), today) ||
                format(parseISO(req.date), 'yyyy-MM-dd') ===
                  format(today, 'yyyy-MM-dd'))
          )
          .map((req: any) => req.date);

        // Count pending requests
        const pendingRequestsCount = memberRequests.filter(
          (req: any) =>
            (req.status === 'pending' || req.status === 'withdraw_pending') &&
            (isAfter(parseISO(req.date), today) ||
              format(parseISO(req.date), 'yyyy-MM-dd') ===
                format(today, 'yyyy-MM-dd'))
        ).length;

        // Determine current status
        const isWeekendDay = isWeekend(date);
        const todayRequest = approvedWfhDates.find(
          (reqDate: string) =>
            format(new Date(reqDate), 'yyyy-MM-dd') ===
            format(date, 'yyyy-MM-dd')
        );

        return {
          staff_id: member.staff_id,
          name: `${member.staff_fname} ${member.staff_lname}`,
          department: member.department,
          position: member.position,
          status: isWeekendDay ? 'Weekend' : todayRequest ? 'WFH' : 'Office',
          upcomingWfhDates: approvedWfhDates,
          pendingRequests: pendingRequestsCount
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
      filtered = filtered.filter((member) => {
        switch (statusFilter) {
          case 'wfh':
            return member.status === 'WFH';
          case 'office':
            return member.status === 'Office';
          case 'leave':
            return member.status === 'Leave';
          default:
            return true;
        }
      });
    }

    setFilteredMembers(filtered);
  };

  const getAggregatedManpower = () => {
    const isWeekendDay = isWeekend(date);

    if (isWeekendDay) {
      return { wfhCount: 0, officeCount: 0, onLeaveCount: 0 };
    }

    const wfhCount = filteredMembers.filter(
      (member) => member.status === 'WFH'
    ).length;
    const officeCount = filteredMembers.filter(
      (member) => member.status === 'Office'
    ).length;

    return { wfhCount, officeCount, onLeaveCount: 0 };
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const { wfhCount, officeCount, onLeaveCount } = getAggregatedManpower();

  return (
    <Card className="w-full min-w-full border-none">
      <CardHeader className="px-6">
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
        <div className="mb-4 flex items-center justify-between ">
          <Input
            placeholder="Filter by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-64"
          />
          <Select
            value={statusFilter}
            onValueChange={(value: 'all' | 'wfh' | 'office' | 'leave') =>
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
              <SelectItem value="leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3 ">
          <Card>
            <CardHeader>
              <CardTitle>Working from Home</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {wfhCount}/{teamMembers.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Working in Office</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {officeCount}/{teamMembers.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {onLeaveCount}/{teamMembers.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[576px]">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Upcoming WFH Days</TableHead>
                  <TableHead>Pending Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.staff_id}>
                    <TableCell>
                      <Dialog
                        open={
                          dialogOpen &&
                          selectedStaff?.staff_id === member.staff_id
                        }
                        onOpenChange={(open) => {
                          if (!open) setSelectedStaff(null);
                          setDialogOpen(open);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSelectedStaff(member);
                              setDialogOpen(true);
                            }}
                          >
                            {member.name}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              {member.name}&apos;s Schedule
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <Card>
                              <CardHeader>
                                <CardTitle>Employee Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Department
                                    </p>
                                    <p className="font-medium">
                                      {member.department}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Position
                                    </p>
                                    <p className="font-medium">
                                      {member.position}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Current Status
                                    </p>
                                    <p className="font-medium">
                                      {member.status}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Pending Requests
                                    </p>
                                    <p className="font-medium">
                                      {member.pendingRequests}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="mt-4">
                              <CardHeader>
                                <CardTitle>Upcoming WFH Days</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-3 gap-2">
                                  {member.upcomingWfhDates.map(
                                    (date, index) => (
                                      <div
                                        key={index}
                                        className="rounded-md bg-gray-100 p-2"
                                      >
                                        {format(new Date(date), 'PPP')}
                                      </div>
                                    )
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>{member.status}</TableCell>
                    <TableCell>{member.upcomingWfhDates.length}</TableCell>
                    <TableCell>{member.pendingRequests}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerTeamScheduleView;
