// 'use client';

// import React, { useState, useEffect } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table';
// import { format } from 'date-fns';

// import { getApprovedDatesWithUserDetails } from '@/lib/crudFunctions/ApprovedDates';
// import { ApprovedDate, Employee } from '@/types/approvedDate';

// export default function WFHCalendar() {
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [approvedDates, setApprovedDates] = useState<ApprovedDate[]>([]);
//   const [currentUserDept, setCurrentUserDept] = useState<number | null>(null);
//   const [events, setEvents] = useState<any[]>([]);
//   const [inOfficeStaff, setInOfficeStaff] = useState<Employee[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [debugInfo, setDebugInfo] = useState<string>('');

//   useEffect(() => {
//     const fetchApprovedDates = async () => {
//       setIsLoading(true);
//       setError(null);
//       setDebugInfo('');
//       try {
//         const response = await getApprovedDatesWithUserDetails();
//         setDebugInfo(`Raw response: ${JSON.stringify(response, null, 2)}`);

//         if (Array.isArray(response) && response.length > 0) {
//           setApprovedDates(response);
//           setCurrentUserDept(response[0].users.dept_id);
//           setDebugInfo(
//             (prevInfo) =>
//               `${prevInfo}\n\nProcessed data: ${JSON.stringify(
//                 response[0],
//                 null,
//                 2
//               )}`
//           );
//         } else {
//           setError('No data available or invalid data format');
//           setDebugInfo(
//             (prevInfo) => `${prevInfo}\n\nError: Empty or invalid response`
//           );
//         }
//       } catch (error) {
//         console.error('Error fetching approved dates:', error);
//         setError('Failed to fetch data. Please try again later.');
//         setDebugInfo(
//           (prevInfo) =>
//             `${prevInfo}\n\nError: ${
//               error instanceof Error ? error.message : String(error)
//             }`
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchApprovedDates();
//   }, []);

//   useEffect(() => {
//     if (approvedDates.length > 0) {
//       const formattedEvents = approvedDates.map((date) => ({
//         title: `${date.users.staff_fname} ${date.users.staff_lname}`,
//         start: date.date,
//         end: date.date,
//         allDay: true,
//         extendedProps: { employee: date.users }
//       }));

//       setEvents(formattedEvents);
//       setDebugInfo(
//         (prevInfo) =>
//           `${prevInfo}\n\nFormatted events: ${JSON.stringify(
//             formattedEvents[0],
//             null,
//             2
//           )}`
//       );
//     }
//   }, [approvedDates]);

//   useEffect(() => {
//     if (approvedDates.length > 0 && currentUserDept !== null) {
//       const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
//       const wfhStaffIds = approvedDates
//         .filter((date) => date.date === selectedDateStr)
//         .map((date) => date.staff_id);

//       const inOffice = approvedDates
//         .filter(
//           (date) =>
//             date.users.dept_id === currentUserDept &&
//             !wfhStaffIds.includes(date.staff_id)
//         )
//         .map((date) => date.users);

//       setInOfficeStaff(inOffice);
//       setDebugInfo(
//         (prevInfo) =>
//           `${prevInfo}\n\nIn-office staff: ${JSON.stringify(inOffice, null, 2)}`
//       );
//     }
//   }, [selectedDate, approvedDates, currentUserDept]);

//   const handleDateClick = (arg: { date: Date }) => {
//     setSelectedDate(arg.date);
//   };

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return (
//       <div>
//         <div>Error: {error}</div>
//         <pre>{debugInfo}</pre>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-3 gap-6">
//       <Card className="col-span-2 shadow-sm">
//         <CardHeader>
//           <CardTitle>WFH Calendar</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[600px]">
//             <FullCalendar
//               plugins={[dayGridPlugin, interactionPlugin]}
//               initialView="dayGridMonth"
//               events={events}
//               dateClick={handleDateClick}
//               headerToolbar={{
//                 left: 'prev,next',
//                 center: 'title',
//                 right: 'today'
//               }}
//               height="100%"
//               eventContent={(eventInfo) => (
//                 <div className="flex items-center space-x-2 rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
//                   <span className="text-xs text-foreground">
//                     {eventInfo.event.title}
//                   </span>
//                 </div>
//               )}
//             />
//           </div>
//         </CardContent>
//       </Card>
//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle>In Office Today</CardTitle>
//           <div className="text-sm text-muted-foreground">
//             {format(selectedDate, 'MMMM d, yyyy')}
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Position</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {inOfficeStaff.map((staff) => (
//                 <TableRow key={staff.staff_id}>
//                   <TableCell>
//                     {staff.staff_fname} {staff.staff_lname}
//                   </TableCell>
//                   <TableCell>{staff.position || 'N/A'}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//       <Card className="col-span-3">
//         <CardHeader>
//           <CardTitle>Debug Information</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <pre className="whitespace-pre-wrap">{debugInfo}</pre>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { format, addDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { getApprovedDatesWithUserDetails } from '@/lib/crudFunctions/ApprovedDates';
import { ApprovedDate, Employee } from '@/types/approvedDate';

// Dummy data for WFH staff
const dummyWfhStaff: Employee[] = [
  { staff_id: 1001, staff_fname: 'John', staff_lname: 'Doe', dept_id: 1, position: 'Developer', email: 'john.doe@example.com', reporting_manager: 2001 },
  { staff_id: 1002, staff_fname: 'Jane', staff_lname: 'Smith', dept_id: 1, position: 'Designer', email: 'jane.smith@example.com', reporting_manager: 2001 },
  { staff_id: 1003, staff_fname: 'Bob', staff_lname: 'Johnson', dept_id: 2, position: 'Manager', email: 'bob.johnson@example.com', reporting_manager: 2002 },
];

export default function WFHCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [approvedDates, setApprovedDates] = useState<ApprovedDate[]>([]);
  const [currentUserDept, setCurrentUserDept] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [inOfficeStaff, setInOfficeStaff] = useState<Employee[]>([]);
  const [wfhStaff, setWfhStaff] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const fetchApprovedDates = async () => {
      setIsLoading(true);
      setError(null);
      setDebugInfo('');
      try {
        const response = await getApprovedDatesWithUserDetails();
        setDebugInfo(`Raw response: ${JSON.stringify(response, null, 2)}`);
        
        if (Array.isArray(response) && response.length > 0) {
          setApprovedDates(response);
          setCurrentUserDept(response[0].users.dept_id);
          setDebugInfo(prevInfo => `${prevInfo}\n\nProcessed data: ${JSON.stringify(response[0], null, 2)}`);
        } else {
          setError('No data available or invalid data format');
          setDebugInfo(prevInfo => `${prevInfo}\n\nError: Empty or invalid response`);
        }
      } catch (error) {
        console.error('Error fetching approved dates:', error);
        setError('Failed to fetch data. Please try again later.');
        setDebugInfo(prevInfo => `${prevInfo}\n\nError: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedDates();
  }, []);

  useEffect(() => {
    if (approvedDates.length > 0) {
      const formattedEvents = approvedDates.map((date) => ({
        title: `${date.users.staff_fname} ${date.users.staff_lname} (WFH)`,
        start: date.date,
        end: date.date,
        allDay: true,
        extendedProps: { employee: date.users, type: 'wfh' }
      }));

      // Add dummy in-office events
      const inOfficeEvents = approvedDates.map((date) => ({
        title: `${date.users.staff_fname} ${date.users.staff_lname} (Office)`,
        start: addDays(new Date(date.date), 1).toISOString().split('T')[0],
        end: addDays(new Date(date.date), 1).toISOString().split('T')[0],
        allDay: true,
        extendedProps: { employee: date.users, type: 'office' }
      }));

      setEvents([...formattedEvents, ...inOfficeEvents]);
      setDebugInfo(prevInfo => `${prevInfo}\n\nFormatted events: ${JSON.stringify([...formattedEvents, ...inOfficeEvents], null, 2)}`);
    }
  }, [approvedDates]);

  useEffect(() => {
    if (approvedDates.length > 0 && currentUserDept !== null) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      const wfhStaffData = approvedDates
        .filter((date) => date.date === selectedDateStr)
        .map((date) => date.users);

      const allStaff = approvedDates.map((date) => date.users);
      const uniqueStaff = Array.from(new Set(allStaff.map(staff => staff.staff_id)))
        .map(id => allStaff.find(staff => staff.staff_id === id));

      const inOffice = uniqueStaff.filter(
        (staff) => staff && staff.dept_id === currentUserDept && !wfhStaffData.some(wfhStaff => wfhStaff.staff_id === staff.staff_id)
      ) as Employee[];

      // Use dummy WFH staff data
      setWfhStaff(dummyWfhStaff);
      setInOfficeStaff(inOffice);
      setDebugInfo(prevInfo => `${prevInfo}\n\nWFH staff: ${JSON.stringify(dummyWfhStaff, null, 2)}\n\nIn-office staff: ${JSON.stringify(inOffice, null, 2)}`);
    }
  }, [selectedDate, approvedDates, currentUserDept]);

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <div>Error: {error}</div>
        <pre>{debugInfo}</pre>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle>WFH Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'today'
              }}
              height="100%"
              eventContent={(eventInfo) => (
                <div className={`flex items-center space-x-2 rounded p-1 transition-colors ${
                  eventInfo.event.extendedProps.type === 'wfh' 
                    ? 'bg-blue-200 hover:bg-blue-300' 
                    : 'bg-green-200 hover:bg-green-300'
                }`}>
                  <span className="text-xs text-foreground">
                    {eventInfo.event.title}
                  </span>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Staff Status for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inOffice">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inOffice">In Office</TabsTrigger>
              <TabsTrigger value="wfh">WFH</TabsTrigger>
            </TabsList>
            <TabsContent value="inOffice">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inOfficeStaff.map((staff) => (
                    <TableRow key={staff.staff_id}>
                      <TableCell>
                        {staff.staff_fname} {staff.staff_lname}
                      </TableCell>
                      <TableCell>{staff.position || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="wfh">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wfhStaff.map((staff) => (
                    <TableRow key={staff.staff_id}>
                      <TableCell>
                        {staff.staff_fname} {staff.staff_lname}
                      </TableCell>
                      <TableCell>{staff.position || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </CardContent>
      </Card>
    </div>
  );
}