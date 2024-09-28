'use client';

import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format, isValid, parseISO } from 'date-fns';

// Mock data for demonstration
const mockStaffData = [
  { id: 1, name: 'Susan Goh', position: 'Account Manager', reportingManager: 101, wfhDates: ['2024-09-30', '2024-10-01', '2024-10-02'] },
  { id: 2, name: 'Oliva Lim', position: 'Account Manager', reportingManager: 101, wfhDates: ['2024-10-02', '2024-10-03', '2024-10-04'] },
  { id: 3, name: 'Emma Heng', position: 'Account Manager', reportingManager: 101, wfhDates: ['2024-10-04', '2024-10-05', '2024-10-06'] },
  { id: 4, name: 'Eva Yong', position: 'Account Manager', reportingManager: 102, wfhDates: ['2024-09-30', '2024-10-01', '2024-10-02'] },
  { id: 5, name: 'Charlotte Wong', position: 'Account Manager', reportingManager: 102, wfhDates: ['2024-10-02', '2024-10-03', '2024-10-04'] },
  { id: 6, name: 'Noah Ng', position: 'Account Manager', reportingManager: 102, wfhDates: ['2024-10-04', '2024-10-05', '2024-10-06'] },
];

// Mock current user (you can replace this with actual user data)
const currentUser = { id: 1, name: 'Susan Goh', reportingManager: 101 };

export default function EnhancedWFHCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateStaff, setSelectedDateStaff] = useState<{ wfh: typeof mockStaffData, inOffice: typeof mockStaffData }>({ wfh: [], inOffice: [] });
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const calendarRef = useRef<FullCalendar | null>(null);

  const departmentStaff = mockStaffData.filter(staff => staff.reportingManager === currentUser.reportingManager);

  const updateSelectedDateStaff = (date: Date) => {
    if (!isValid(date)) {
      console.error('Invalid date:', date);
      return;
    }
    const dateString = format(date, 'yyyy-MM-dd');
    const wfh = departmentStaff.filter(staff => staff.wfhDates.includes(dateString));
    const inOffice = departmentStaff.filter(staff => !staff.wfhDates.includes(dateString));
    setSelectedDateStaff({ wfh, inOffice });
  };

  const handleDateClick = (arg: { date: Date | string }) => {
    const newDate = arg.date instanceof Date ? arg.date : parseISO(arg.date as string);
    if (isValid(newDate)) {
      setSelectedDate(newDate);
      updateSelectedDateStaff(newDate);
    } else {
      console.error('Invalid date selected:', arg.date);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    updateSelectedDateStaff(today);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
    }
  };

  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setCalendarView(view);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
    }
  };

  const dayCellDidMount = (arg: { date: Date; el: HTMLElement }) => {
    const { date, el } = arg;
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      el.style.background = 'white';
      return;
    }

    const dateString = format(date, 'yyyy-MM-dd');
    const wfhCount = departmentStaff.filter(staff => staff.wfhDates.includes(dateString)).length;
    const inOfficeCount = departmentStaff.length - wfhCount;
    const totalStaff = departmentStaff.length;

    const wfhIntensity = wfhCount / totalStaff;
    const inOfficeIntensity = inOfficeCount / totalStaff;

    el.style.background = `linear-gradient(to right, rgba(52, 211, 153, ${wfhIntensity}), rgba(52, 211, 153, ${wfhIntensity}) 50%, rgba(96, 165, 250, ${inOfficeIntensity}) 50%, rgba(96, 165, 250, ${inOfficeIntensity}))`;
  };

  useEffect(() => {
    updateSelectedDateStaff(selectedDate);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>WFH Heatmap Calendar</span>
            <div className="space-x-2">
              <Button onClick={() => handleViewChange('dayGridMonth')} variant={calendarView === 'dayGridMonth' ? 'default' : 'outline'}>Month</Button>
              <Button onClick={() => handleViewChange('timeGridWeek')} variant={calendarView === 'timeGridWeek' ? 'default' : 'outline'}>Week</Button>
              <Button onClick={() => handleViewChange('timeGridDay')} variant={calendarView === 'timeGridDay' ? 'default' : 'outline'}>Day</Button>
              <Button onClick={handleTodayClick}>Today</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              dateClick={handleDateClick}
              dayCellDidMount={dayCellDidMount}
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: ''
              }}
              height="100%"
              selectable={true}
              select={handleDateClick}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            Staff Status for {isValid(selectedDate) ? format(selectedDate, 'MMMM d, yyyy') : 'Invalid Date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Working From Home</h3>
              {selectedDateStaff.wfh.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDateStaff.wfh.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.position}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No staff working from home on this date.</p>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-2">In Office</h3>
              {selectedDateStaff.inOffice.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDateStaff.inOffice.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.position}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No staff in office on this date.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}