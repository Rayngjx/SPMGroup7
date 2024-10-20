import React from 'react';
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
import { format, isWeekend } from 'date-fns';

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

interface PersonalCalendarProps {
  events: CalendarEvent[];
}

export default function PersonalCalendar({ events }: PersonalCalendarProps) {
  // Filter to show only approved, pending, and withdraw_pending requests
  const filteredEvents = events.filter((event) =>
    ['approved', 'pending', 'withdraw_pending'].includes(
      event.extendedProps.status
    )
  );

  const renderEventContent = (eventInfo: any) => {
    const { event } = eventInfo;
    const color = getEventColor(event.extendedProps.status);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className={`h-full w-full ${color} overflow-hidden rounded p-1 text-xs text-white`}
          >
            {getEventTitle(event.extendedProps.status)}
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
        return 'bg-yellow-600';
      case 'withdraw_pending':
        return 'bg-blue-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getEventTitle = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'WFH';
      case 'pending':
        return 'WFH Pending';
      case 'withdraw_pending':
        return 'Withdraw Pending';
      default:
        return 'Unknown';
    }
  };

  const getDisplayStatus = (status: string): string => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work From Home Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={filteredEvents}
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
      </CardContent>
    </Card>
  );
}
