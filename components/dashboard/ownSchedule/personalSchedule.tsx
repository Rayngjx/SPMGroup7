'use client';
import { auth } from '@/auth';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageContainer from '@/components/layout/page-container';
import { getApprovedDates } from '@/lib/crudFunctions/ApprovedDates';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useSession } from 'next-auth/react';

const localizer = momentLocalizer(moment);

interface ScheduleEntry {
  id: number;
  title: string;
  start: Date;
  end: Date;
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
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  //fetching using api route for specific user that is logged in
  useEffect(() => {
    // Fetch approved dates if session is loaded and user is authenticated
    console.log(session, 'test');
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
        } catch (error) {
          console.error('Error fetching approved dates:', error);
        }
      };

      fetchApprovedDates(session.user.staff_id);
    }
  }, [session, status]);

  // useEffect(() => {
  //   const fetchApprovedDates = async () => {
  //     try {
  //       const response = await getApprovedDates()
  //       const formattedDates = response.map((item: any) => ({
  //         staff_id: item.staff_id,
  //         request_id: item.request_id,
  //         date: new Date(item.date)
  //       }))
  //       setApprovedDates(formattedDates)
  //     } catch (error) {
  //       console.error('Error fetching approved dates:', error)
  //     }
  //   }

  //   fetchApprovedDates()
  // }, [])

  const generateSchedule = useCallback(() => {
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const generatedEvents: ScheduleEntry[] = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const currentDate = new Date(d);
      const isWFH = approvedDates.some(
        (dateItem) =>
          dateItem.date.toDateString() === currentDate.toDateString()
      );

      if (isWFH) {
        generatedEvents.push({
          id: currentDate.getTime(),
          title: 'WFH',
          start: new Date(currentDate),
          end: new Date(currentDate),
          allDay: true
        });
      }
    }

    setEvents(generatedEvents);
  }, [approvedDates, date]);

  useEffect(() => {
    generateSchedule();
  }, [generateSchedule]);

  const handleViewChange = (newView: string) => {
    setView(newView as any);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const eventStyleGetter = (event: ScheduleEntry) => {
    return {
      style: {
        backgroundColor: '#4CAF50',
        borderRadius: '0px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <PageContainer scrollable={true}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Your Personal Schedule
          </h2>
          <div className="flex items-center space-x-2">
            <Select onValueChange={handleViewChange} defaultValue={view}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Views.MONTH}>Month</SelectItem>
                <SelectItem value={Views.WEEK}>Week</SelectItem>
                <SelectItem value={Views.DAY}>Day</SelectItem>
              </SelectContent>
            </Select>
            <Button>Download</Button>
          </div>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <Card className="w-full lg:w-3/4">
            <CardHeader>
              <CardTitle>Work From Home Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 250px)' }}
                view={view}
                onView={setView as any}
                date={date}
                onNavigate={handleNavigate}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                eventPropGetter={eventStyleGetter}
              />
            </CardContent>
          </Card>
          <Card className="w-full lg:w-1/4">
            <CardHeader>
              <CardTitle>Approved WFH Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-250px)]">
                <ul className="space-y-2">
                  {approvedDates.map((date) => (
                    <li
                      key={date.request_id}
                      className="flex items-center justify-between border-b py-2 last:border-b-0"
                    >
                      <span>{date.date.toLocaleDateString()}</span>
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
