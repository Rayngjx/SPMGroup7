import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Button } from '@/components/ui/button';
import {
  format,
  isValid,
  parseISO,
  isSaturday,
  isSunday,
  isToday,
  isSameDay
} from 'date-fns';
import { DateSelectArg } from '@fullcalendar/core';
import { Users } from 'lucide-react';

interface Staff {
  id: number;
  name: string;
  position: string;
  wfhDates: string[];
  pendingDates: string[];
  withdrawPendingDates: string[];
  reporting_manager: string;
  role_id: number;
}

interface DayStatus {
  wfh: Staff[];
  inOffice: Staff[];
  pending: Staff[];
  withdrawPending: Staff[];
}

interface TeamScheduleCalendarProps {
  staffData: Staff[];
}

const StaffList = ({
  dayStatus,
  date
}: {
  dayStatus: DayStatus;
  date: Date;
}) => {
  if (isSaturday(date) || isSunday(date)) {
    return (
      <div className="p-4 text-center text-gray-500">Weekend - No Work Day</div>
    );
  }

  return (
    <div className="space-y-6">
      <ScrollArea>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Working From Home</h3>
            <span className="text-sm text-gray-500">
              {dayStatus.wfh.length} staff
            </span>
          </div>
          <div className="space-y-2">
            {dayStatus.wfh.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between rounded bg-green-50 p-2"
              >
                <div>
                  <div className="font-medium">{staff.name}</div>
                  <div className="text-sm text-gray-500">{staff.position}</div>
                </div>
                <span className="rounded bg-green-200 px-2 py-1 text-xs">
                  WFH
                </span>
              </div>
            ))}
            {dayStatus.withdrawPending.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between rounded bg-blue-50 p-2"
              >
                <div>
                  <div className="font-medium">{staff.name}</div>
                  <div className="text-sm text-gray-500">{staff.position}</div>
                </div>
                <span className="rounded bg-blue-200 px-2 py-1 text-xs">
                  Withdraw Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">In Office</h3>
          <span className="text-sm text-gray-500">
            {dayStatus.inOffice.length + dayStatus.pending.length} staff
          </span>
        </div>
        <div className="space-y-2">
          {dayStatus.pending.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center justify-between rounded bg-yellow-50 p-2"
            >
              <div>
                <div className="font-medium">{staff.name}</div>
                <div className="text-sm text-gray-500">{staff.position}</div>
              </div>
              <span className="rounded bg-yellow-200 px-2 py-1 text-xs">
                WFH Pending
              </span>
            </div>
          ))}
          {dayStatus.inOffice.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center justify-between rounded p-2 hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{staff.name}</div>
                <div className="text-sm text-gray-500">{staff.position}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function TeamScheduleCalendar({
  staffData
}: TeamScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayStatus, setDayStatus] = useState<DayStatus>({
    wfh: [],
    inOffice: [],
    pending: [],
    withdrawPending: []
  });
  const [calendarView, setCalendarView] =
    useState<'dayGridMonth'>('dayGridMonth');
  const calendarRef = useRef<FullCalendar | null>(null);

  const updateDayStatus = useCallback(
    (date: Date) => {
      if (!isValid(date)) return;

      if (isSaturday(date) || isSunday(date)) {
        setDayStatus({
          wfh: [],
          inOffice: [],
          pending: [],
          withdrawPending: []
        });
        return;
      }

      const wfh = staffData.filter((staff) =>
        staff.wfhDates.some((wfhDate) => isSameDay(new Date(wfhDate), date))
      );

      const pending = staffData.filter((staff) =>
        staff.pendingDates.some((pendingDate) =>
          isSameDay(new Date(pendingDate), date)
        )
      );

      const withdrawPending = staffData.filter((staff) =>
        staff.withdrawPendingDates.some((withdrawDate) =>
          isSameDay(new Date(withdrawDate), date)
        )
      );

      // Everyone not WFH, pending, or withdraw pending is in office
      const inOffice = staffData.filter(
        (staff) =>
          !staff.wfhDates.some((wfhDate) =>
            isSameDay(new Date(wfhDate), date)
          ) &&
          !staff.pendingDates.some((pendingDate) =>
            isSameDay(new Date(pendingDate), date)
          ) &&
          !staff.withdrawPendingDates.some((withdrawDate) =>
            isSameDay(new Date(withdrawDate), date)
          )
      );

      setDayStatus({ wfh, inOffice, pending, withdrawPending });
    },
    [staffData]
  );

  useEffect(() => {
    updateDayStatus(selectedDate);
  }, [selectedDate, updateDayStatus]);

  const handleDateSelect = (arg: { date: Date | string }) => {
    const newDate =
      arg.date instanceof Date ? arg.date : parseISO(arg.date as string);
    if (isValid(newDate)) {
      setSelectedDate(newDate);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  const dayCellDidMount = (arg: { date: Date; el: HTMLElement }) => {
    const { date, el } = arg;

    if (isSaturday(date) || isSunday(date)) {
      el.style.backgroundColor = '#f3f4f6';
      el.style.color = '#9ca3af';
      return;
    }

    // Check for approved WFH requests (including withdraw_pending)
    const wfhCount = staffData.filter((staff) =>
      staff.wfhDates.some((wfhDate) => isSameDay(new Date(wfhDate), date))
    ).length;

    const pendingRequests = staffData.filter((staff) =>
      staff.pendingDates.some((pendingDate) =>
        isSameDay(new Date(pendingDate), date)
      )
    );

    const withdrawPendingRequests = staffData.filter((staff) =>
      staff.withdrawPendingDates.some((withdrawDate) =>
        isSameDay(new Date(withdrawDate), date)
      )
    );

    // Apply WFH background if there are approved requests
    if (wfhCount > 0) {
      const opacity = Math.max(0.1, wfhCount / staffData.length).toFixed(2);
      el.style.backgroundColor = `rgba(52, 211, 153, ${opacity})`;
    }

    // Create dot container
    if (pendingRequests.length > 0 || withdrawPendingRequests.length > 0) {
      const dotContainer = document.createElement('div');
      dotContainer.style.position = 'absolute';
      dotContainer.style.bottom = '4px';
      dotContainer.style.left = '4px';
      dotContainer.style.display = 'flex';
      dotContainer.style.gap = '2px';
      dotContainer.style.flexWrap = 'wrap';
      dotContainer.style.maxWidth = '50%';

      // Add yellow dots for pending requests
      pendingRequests.forEach(() => {
        const dot = document.createElement('div');
        dot.style.width = '4px';
        dot.style.height = '4px';
        dot.style.backgroundColor = '#fbbf24'; // Amber color
        dot.style.borderRadius = '50%';
        dotContainer.appendChild(dot);
      });

      // Add blue dots for withdraw pending requests
      withdrawPendingRequests.forEach(() => {
        const dot = document.createElement('div');
        dot.style.width = '4px';
        dot.style.height = '4px';
        dot.style.backgroundColor = '#3b82f6'; // Blue color
        dot.style.borderRadius = '50%';
        dotContainer.appendChild(dot);
      });

      el.style.position = 'relative';
      el.appendChild(dotContainer);
    }

    if (isToday(date)) {
      el.style.border = '2px solid #3B82F6';
    }
  };

  const scrollableStyle: React.CSSProperties = {
    scrollbarWidth: 'thin', // For Firefox
    scrollbarColor: '#888 #f1f1f1' // For Firefox
  };

  return (
    <div className="max-h-screen overflow-y-auto" style={{ maxHeight: '90vh' }}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col shadow-sm md:col-span-2">
          <CardHeader className="flex-none border-b">
            <CardTitle className="flex items-center justify-between">
              <span>Work From Home Schedule</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleTodayClick}>
                  today
                </Button>
                <div className="flex overflow-hidden rounded-md">
                  <Button variant="secondary" size="sm">
                    month
                  </Button>
                  <Button variant="outline" size="sm">
                    week
                  </Button>
                  <Button variant="outline" size="sm">
                    day
                  </Button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent
            className="flex-1 overflow-y-auto p-0"
            style={scrollableStyle}
          >
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              dateClick={handleDateSelect}
              dayCellDidMount={dayCellDidMount}
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: ''
              }}
              height="auto"
              selectable={true}
              select={(arg: DateSelectArg) =>
                handleDateSelect({ date: arg.start })
              }
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-sm">
          <CardHeader className="flex-none border-b">
            <CardTitle className="flex items-center justify-between">
              <span>
                {isValid(selectedDate)
                  ? format(selectedDate, 'MMMM d, yyyy')
                  : 'Invalid Date'}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} />
                <span>
                  {dayStatus.wfh.length +
                    dayStatus.inOffice.length +
                    dayStatus.pending.length}{' '}
                  total
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="lg:max-h-[800px]overflow-y-auto max-h-[500px] flex-1 md:max-h-[600px]">
            <CardContent className="overflow-y-auto pt-4">
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Working From Home</h3>
                    <span className="text-sm text-gray-500">
                      {dayStatus.wfh.length + dayStatus.withdrawPending.length}{' '}
                      staff
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayStatus.wfh
                      .concat(dayStatus.withdrawPending)
                      .map((staff) => (
                        <div
                          key={staff.id}
                          className="flex items-center justify-between py-2"
                        >
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-gray-500">
                              {staff.position}
                            </div>
                          </div>
                          {dayStatus.withdrawPending.includes(staff) && (
                            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                              Withdraw Pending
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">In Office</h3>
                    <span className="text-sm text-gray-500">
                      {dayStatus.inOffice.length + dayStatus.pending.length}{' '}
                      staff
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayStatus.pending.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-gray-500">
                            {staff.position}
                          </div>
                        </div>
                        <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                          WFH Pending
                        </span>
                      </div>
                    ))}
                    {dayStatus.inOffice.map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-gray-500">
                            {staff.position}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
