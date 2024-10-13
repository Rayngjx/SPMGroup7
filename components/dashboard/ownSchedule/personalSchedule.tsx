'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageContainer from '@/components/layout/page-container';
import { useSession } from 'next-auth/react';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { format, isValid, parseISO } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface ScheduleEntry {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
}

interface WFHRequest {
  id: number;
  date: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
}

export default function PersonalSchedule() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<ScheduleEntry[]>([]);
  const [wfhRequests, setWfhRequests] = useState<WFHRequest[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<
    'all' | 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn'
  >('all');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.staff_id) {
      const fetchWFHRequests = async (staffId: number) => {
        try {
          const response = await fetch(`/api/wfh-requests/${staffId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch WFH requests');
          }
          const data = await response.json();

          const allRequests = [
            ...data.approvedDates.map((ad: any) => ({
              id: ad.id,
              date: new Date(ad.date),
              status: 'Approved' as const
            })),
            ...data.allRequests.flatMap((req: any) =>
              req.daterange.map((dateStr: string) => ({
                id: req.request_id,
                date: parseISO(dateStr),
                status: req.approved === 'Pending' ? 'Pending' : req.approved
              }))
            ),
            ...data.withdrawnDates.map((wd: any) => ({
              id: wd.id,
              date: new Date(wd.date),
              status: 'Withdrawn' as const
            }))
          ].filter((req) => isValid(req.date));

          setWfhRequests(allRequests);

          const calendarEvents = allRequests.map((request: WFHRequest) => ({
            id: request.id,
            title: `WFH (${request.status})`,
            start: format(request.date, 'yyyy-MM-dd'),
            end: format(request.date, 'yyyy-MM-dd'),
            allDay: true,
            status: request.status
          }));
          setEvents(calendarEvents);
        } catch (error) {
          console.error('Error fetching WFH requests:', error);
        }
      };

      fetchWFHRequests(session.user.staff_id);

      // Simulate real-time updates with polling
      const pollInterval = setInterval(
        () => fetchWFHRequests(session.user.staff_id),
        30000
      );
      return () => clearInterval(pollInterval);
    }
  }, [session, status]);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date);
  };

  const filteredRequests = wfhRequests.filter(
    (request) => filter === 'all' || request.status === filter
  );

  const getEventColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-600';
      case 'Rejected':
        return 'bg-red-600';
      case 'Withdrawn':
        return 'bg-gray-600';
      default:
        return 'bg-yellow-600';
    }
  };

  const formatDate = (date: Date) => {
    return isValid(date) ? format(date, 'MMMM d, yyyy') : 'Invalid Date';
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Your Personal Schedule
          </h2>
          <div className="hidden items-center space-x-2 md:flex">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Work From Home Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                  }}
                  events={events}
                  dateClick={handleDateClick}
                  height="100%"
                  eventContent={(eventInfo) => (
                    <div
                      className={`flex items-center space-x-2 rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${getEventColor(
                        eventInfo.event.extendedProps.status
                      )}`}
                    >
                      <span className="text-xs text-white">
                        {eventInfo.event.title}
                      </span>
                    </div>
                  )}
                  dayMaxEvents={3}
                  moreLinkContent={(args) => (
                    <div className="text-primary-600 text-xs font-medium">
                      +{args.num} more
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>WFH Requests</CardTitle>
              <Select
                value={filter}
                onValueChange={(value: any) => setFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter requests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <ul className="space-y-2">
                  {filteredRequests.map((request) => (
                    <li
                      key={`${request.id}-${request.date.toISOString()}`}
                      className="flex items-center justify-between border-b py-2 last:border-b-0"
                    >
                      <span>{formatDate(request.date)}</span>
                      <span
                        className={`text-sm font-semibold ${
                          request.status === 'Approved'
                            ? 'text-green-600'
                            : request.status === 'Rejected'
                            ? 'text-red-600'
                            : request.status === 'Withdrawn'
                            ? 'text-gray-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        {request.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
