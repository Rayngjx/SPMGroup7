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
import { format } from 'date-fns';

interface ScheduleEntry {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
}

interface ApprovedDate {
  staff_id: number;
  request_id: number;
  date: Date;
}

export default function PersonalSchedule() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<ScheduleEntry[]>([]);
  const [approvedDates, setApprovedDates] = useState<ApprovedDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.staff_id) {
      const fetchApprovedDates = async (staffId: number) => {
        try {
          const response = await fetch(`/api/approved-dates/${staffId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch approved dates');
          }
          const data = await response.json();
          const formattedDates = data.map((item: any) => ({
            staff_id: item.staff_id,
            request_id: item.request_id,
            date: new Date(item.date)
          }));
          setApprovedDates(formattedDates);

          const calendarEvents = formattedDates.map((date: ApprovedDate) => ({
            id: date.request_id,
            title: 'WFH',
            start: format(date.date, 'yyyy-MM-dd'),
            end: format(date.date, 'yyyy-MM-dd'),
            allDay: true
          }));
          setEvents(calendarEvents);
        } catch (error) {
          console.error('Error fetching approved dates:', error);
        }
      };

      fetchApprovedDates(session.user.staff_id);
    }
  }, [session, status]);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date);
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
                    <div className="flex items-center space-x-2 rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      <span className="text-xs text-foreground">
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
              <CardTitle>Approved WFH Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <ul className="space-y-2">
                  {approvedDates.map((date) => (
                    <li
                      key={date.request_id}
                      className="flex items-center justify-between border-b py-2 last:border-b-0"
                    >
                      <span>{format(date.date, 'MMMM d, yyyy')}</span>
                      <span className="text-sm font-semibold text-green-600">
                        WFH
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
