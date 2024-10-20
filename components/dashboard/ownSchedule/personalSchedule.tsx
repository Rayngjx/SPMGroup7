'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useSession } from 'next-auth/react';
import { format, isWeekend, parseISO } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    status:
      | 'approved'
      | 'pending'
      | 'withdrawn'
      | 'rejected'
      | 'withdraw_pending'
      | 'cancelled';
    reason?: string;
    timeslot?: string;
  };
}

export default function PersonalSchedule() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'cancelled'
  >('all');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.staff_id) {
      fetchCalendarData(session.user.staff_id);
    }
  }, [session, status]);

  useEffect(() => {
    filterEvents();
  }, [events, filter]);

  const fetchCalendarData = async (staffId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/requests?staffId=${staffId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch calendar data');
      }

      const requests = await response.json();
      console.log('API Response:', requests);
      const calendarEvents = processCalendarData(requests);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const processCalendarData = (requests: any[]): CalendarEvent[] => {
    const calendarEvents = requests.map((request: any) => ({
      id: `request-${request.request_id}`,
      title: getEventTitle(request.status),
      start: new Date(request.date),
      end: new Date(request.date),
      extendedProps: {
        status: request.status,
        reason: request.reason,
        timeslot: request.timeslot
      }
    }));
    console.log('Processed Calendar Events:', calendarEvents);
    return calendarEvents;
  };

  const getEventTitle = (status: string): string => {
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

  const filterEvents = () => {
    let filtered;
    if (filter === 'all') {
      filtered = events;
    } else if (filter === 'pending') {
      filtered = events.filter(
        (event) =>
          event.extendedProps.status === 'pending' ||
          event.extendedProps.status === 'withdraw_pending'
      );
    } else {
      filtered = events.filter(
        (event) => event.extendedProps.status === filter
      );
    }
    console.log('Filtered Events:', filtered);
    setFilteredEvents(filtered);
  };

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const color = getEventColor(event.extendedProps.status);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`h-full w-full ${color} cursor-pointer overflow-hidden rounded p-1 text-xs text-white`}
            >
              {event.title}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              <strong>Date:</strong> {format(event.start, 'MMM d, yyyy')}
            </p>
            <p>
              <strong>Status:</strong>{' '}
              {getDisplayStatus(event.extendedProps.status)}
            </p>
            {event.extendedProps.timeslot && (
              <p>
                <strong>Timeslot:</strong> {event.extendedProps.timeslot}
              </p>
            )}
            {event.extendedProps.reason && (
              <p>
                <strong>Reason:</strong> {event.extendedProps.reason}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600';
      case 'pending':
      case 'withdraw_pending':
        return 'bg-yellow-600';
      case 'withdrawn':
        return 'bg-gray-600';
      case 'rejected':
        return 'bg-red-600';
      case 'cancelled':
        return 'bg-purple-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getDisplayStatus = (status: string): string => {
    return status === 'withdraw_pending'
      ? 'Pending'
      : status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Work From Home Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading calendar data...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              eventContent={renderEventContent}
              dayCellClassNames={(arg) =>
                isWeekend(arg.date) ? 'bg-gray-100' : ''
              }
              dayCellDidMount={(arg) => {
                if (isWeekend(arg.date)) {
                  arg.el.style.backgroundColor = '#f3f4f6';
                  arg.el.style.pointerEvents = 'none';
                }
              }}
            />
          )}
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {filteredEvents.length === 0 ? (
              <p>No requests found.</p>
            ) : (
              <ul className="space-y-4">
                {filteredEvents.map((event) => (
                  <li key={event.id} className="rounded border p-4">
                    <h3 className="font-bold">{event.title}</h3>
                    <p>Date: {format(event.start, 'MMMM d, yyyy')}</p>
                    {event.extendedProps.timeslot && (
                      <p>Timeslot: {event.extendedProps.timeslot}</p>
                    )}
                    {event.extendedProps.reason && (
                      <p>Reason: {event.extendedProps.reason}</p>
                    )}
                    <p
                      className={`font-semibold ${
                        event.extendedProps.status === 'approved'
                          ? 'text-green-600'
                          : event.extendedProps.status === 'rejected'
                          ? 'text-red-600'
                          : event.extendedProps.status === 'withdrawn'
                          ? 'text-gray-600'
                          : event.extendedProps.status === 'cancelled'
                          ? 'text-purple-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      Status: {getDisplayStatus(event.extendedProps.status)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
