'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalCalendar from '@/components/dashboard/ownSchedule/PersonalCalendar';
import PendingRequestList from '@/components/dashboard/ownSchedule/pendingrequestlist';
import RequestList from '@/components/dashboard/ownSchedule/requestlist';
import WfhDayList from '@/components/dashboard/ownSchedule/wfhDayList';
import { requests } from '@prisma/client';
import { parseISO, isAfter, startOfDay } from 'date-fns';
import { string } from 'zod';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    status: 'approved' | 'pending' | 'withdraw_pending';
    reason?: string;
    timeslot?: string;
  };
}

export default function Page() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [pendingRequests, setPendingRequests] = useState<requests[]>([]);
  const [wfhDays, setwfhDays] = useState<requests[]>([]);
  const [allRequests, setAllRequests] = useState<requests[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staff_fname, setStaffFname] = useState<string | null>(null);
  const [role_id, setRoleId] = useState<string | null>(null);
  const [position, setPosition] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.staff_id) {
      fetchCalendarData(session.user.staff_id);
      setStaffId(String(session.user.staff_id));
      setStaffFname(String(session.user.staff_fname));
      setRoleId(String(session.user.role_id));
      setPosition(String(session.user.position));
      setDepartment(String(session.user.department));
    }
  }, [session, status]);

  const fetchCalendarData = async (staffId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/requests?staff_id=${staffId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }
      const requests = await response.json();
      const calendarEvents = processCalendarData(requests);
      setEvents(calendarEvents);

      const today = startOfDay(new Date());

      const futureWfhReqs = requests.filter(
        (req: requests) =>
          (req.status === 'approved' || req.status === 'withdraw_pending') &&
          isAfter(parseISO(req.date), today)
      );

      const pendingReqs = requests.filter(
        (req: requests) =>
          req.status === 'pending' || req.status === 'withdraw_pending'
      );

      setwfhDays(futureWfhReqs);
      setPendingRequests(pendingReqs);
      setAllRequests(requests);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const processCalendarData = (requests: requests[]): CalendarEvent[] => {
    return requests.map((request) => ({
      id: `request-${request.request_id}`,
      title: getEventTitle(request.status),
      start: new Date(request.date),
      end: new Date(request.date),
      extendedProps: {
        status: request.status as 'approved' | 'pending' | 'withdraw_pending',
        reason: request.reason ?? undefined,
        timeslot: request.timeslot ?? undefined
      }
    }));
  };

  const getEventTitle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'WFH';
      case 'pending':
      case 'withdraw_pending':
        return 'Pending';
      case 'withdrawn':
        return 'Withdrawn';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: requestId,
          status: 'cancelled',
          reason: 'User cancelled request',
          processor_id: session?.user.staff_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      // Refresh the calendar data after cancelling
      fetchCalendarData(session.user.staff_id);
    } catch (error) {
      console.error('Error cancelling request:', error);
      setError('Failed to cancel request. Please try again later.');
    }
  };

  const handleWithdrawRequest = async (requestId: number, reason: string) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: requestId,
          status: 'withdraw_pending',
          reason: reason,
          processor_id: session?.user.reporting_manager
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit withdraw request');
      }

      // Refresh the calendar data after submitting withdraw request
      fetchCalendarData(session.user.staff_id);
    } catch (error) {
      console.error('Error submitting withdraw request:', error);
      setError('Failed to submit withdraw request. Please try again later.');
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-2">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome back {position}, {staff_fname} {staffId}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Tabs defaultValue="schedule" className="space-y-4">
              <TabsList>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="reqList">Request List</TabsTrigger>
              </TabsList>
              <TabsContent value="schedule" className="space-y-4">
                {isLoading && <p>Loading calendar data...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <PersonalCalendar events={events} />
                    </div>
                    <div>
                      <PendingRequestList
                        requests={pendingRequests}
                        onCancelRequest={handleCancelRequest}
                      />
                      <WfhDayList
                        requests={wfhDays}
                        onWithdrawRequest={handleWithdrawRequest}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="reqList" className="space-y-4">
                <RequestList requests={allRequests} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
