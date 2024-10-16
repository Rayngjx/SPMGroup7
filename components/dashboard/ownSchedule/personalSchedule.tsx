'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    status: 'WFH' | 'PendingWFH' | 'PendingWithdraw';
    reason?: string;
  };
}

export default function PersonalSchedule() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.staff_id) {
      fetchCalendarData(session.user.staff_id);
    }
  }, [session, status]);

  const fetchCalendarData = async (staffId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        approvedResponse,
        withdrawnDatesResponse,
        withdrawRequestsResponse,
        wfhRequestsResponse
      ] = await Promise.all([
        fetch(`/api/approved-dates/${staffId}`),
        fetch(`/api/withdrawn-dates?staffId=${staffId}`),
        fetch(`/api/withdrawRequests/by-staff/${staffId}`),
        fetch(`/api/requests/by-staff/${staffId}`)
      ]);

      if (
        !approvedResponse.ok ||
        !withdrawnDatesResponse.ok ||
        !withdrawRequestsResponse.ok ||
        !wfhRequestsResponse.ok
      ) {
        throw new Error('Failed to fetch calendar data');
      }

      const approvedDates = await approvedResponse.json();
      const withdrawnDates = await withdrawnDatesResponse.json();
      const withdrawRequests = await withdrawRequestsResponse.json();
      const wfhRequests = await wfhRequestsResponse.json();

      const calendarEvents = processCalendarData(
        approvedDates,
        withdrawnDates,
        withdrawRequests,
        wfhRequests
      );
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError('Failed to load calendar data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const processCalendarData = (
    approvedDates: any[],
    withdrawnDates: any[],
    withdrawRequests: any[],
    wfhRequests: any[]
  ): CalendarEvent[] => {
    const dateMap = new Map<string, { approved: number; withdrawn: number }>();
    const events: CalendarEvent[] = [];

    // Process approved and withdrawn dates
    approvedDates.forEach((item: any) => {
      const date = format(new Date(item.date), 'yyyy-MM-dd');
      dateMap.set(date, {
        approved: (dateMap.get(date)?.approved || 0) + 1,
        withdrawn: dateMap.get(date)?.withdrawn || 0
      });
    });

    withdrawnDates.forEach((item: any) => {
      const date = format(new Date(item.date), 'yyyy-MM-dd');
      dateMap.set(date, {
        approved: dateMap.get(date)?.approved || 0,
        withdrawn: (dateMap.get(date)?.withdrawn || 0) + 1
      });
    });

    // Create WFH events
    dateMap.forEach((value, date) => {
      if (value.approved - value.withdrawn === 1) {
        events.push({
          id: `wfh-${date}`,
          title: 'WFH',
          start: new Date(date),
          end: new Date(date),
          extendedProps: {
            status: 'WFH'
          }
        });
      }
    });

    // Process pending WFH requests
    wfhRequests.forEach((request: any) => {
      if (request.approved === 'Pending' && Array.isArray(request.dates)) {
        request.dates.forEach((date: string) => {
          const formattedDate = format(new Date(date), 'yyyy-MM-dd');
          if (
            !dateMap.has(formattedDate) ||
            dateMap.get(formattedDate)!.approved -
              dateMap.get(formattedDate)!.withdrawn ===
              0
          ) {
            events.push({
              id: `pending-wfh-${request.request_id}-${formattedDate}`,
              title: 'Pending WFH',
              start: new Date(date),
              end: new Date(date),
              extendedProps: {
                status: 'PendingWFH',
                reason: request.reason
              }
            });
          }
        });
      }
    });

    // Process pending withdraw requests
    withdrawRequests.forEach((request: any) => {
      if (request.approved === 'Pending') {
        const date = format(new Date(request.date), 'yyyy-MM-dd');
        // Replace WFH event with Withdraw Request if it exists
        const index = events.findIndex(
          (e) =>
            format(e.start, 'yyyy-MM-dd') === date &&
            e.extendedProps.status === 'WFH'
        );
        if (index !== -1) {
          events[index] = {
            id: `withdraw-${request.withdraw_request_id}`,
            title: 'Pending Withdraw',
            start: new Date(request.date),
            end: new Date(request.date),
            extendedProps: {
              status: 'PendingWithdraw',
              reason: request.reason
            }
          };
        }
      }
    });
    console.log(events);
    return events;
  };

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const color = getEventColor(event.extendedProps.status);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className={`h-full w-full ${color} rounded p-1 text-white`}
          >
            {event.title}
          </TooltipTrigger>
          <TooltipContent>
            <p>
              <strong>Date:</strong> {format(event.start, 'MMM d, yyyy')}
            </p>
            <p>
              <strong>Status:</strong> {event.extendedProps.status}
            </p>
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

  const getEventColor = (status: CalendarEvent['extendedProps']['status']) => {
    switch (status) {
      case 'WFH':
        return 'bg-blue-600';
      case 'PendingWFH':
        return 'bg-blue-300';
      case 'PendingWithdraw':
        return 'bg-gray-600';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work From Home Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading calendar data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
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
  );
}
