// 'use client';

// import React, { useState, useEffect } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table';
// import { format } from 'date-fns';

// // Mock data for demonstration
// const mockStaffData = [
//   { id: 1, name: 'Susan Goh', position: 'Account Manager', reportingManager: 101, wfhDates: ['2024-09-30', '2024-10-01', '2024-10-02'] },
//   { id: 2, name: 'Oliva Lim', position: 'Account Manager', reportingManager: 101, wfhDates: ['2024-10-02', '2024-10-03', '2024-10-04'] },
//   { id: 3, name: 'Emma Heng', position: 'Account Manager', reportingManager: 101, wfhDates: ['2024-10-04', '2024-10-05', '2024-10-06'] },
//   { id: 4, name: 'Eva Yong', position: 'Account Manager', reportingManager: 102, wfhDates: ['2024-09-30', '2024-10-01', '2024-10-02'] },
//   { id: 5, name: 'Charlotte Wong', position: 'Account Manager', reportingManager: 102, wfhDates: ['2024-10-02', '2024-10-03', '2024-10-04'] },
//   { id: 6, name: 'Noah Ng', position: 'Account Manager', reportingManager: 102, wfhDates: ['2024-10-04', '2024-10-05', '2024-10-06'] },
// ];

// // Mock current user (you can replace this with actual user data)
// const currentUser = { id: 1, name: 'Susan Goh', reportingManager: 101 };

// export default function EnhancedWFHCalendar() {
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedDateStaff, setSelectedDateStaff] = useState<{ wfh: typeof mockStaffData, inOffice: typeof mockStaffData }>({ wfh: [], inOffice: [] });

//   const departmentStaff = mockStaffData.filter(staff => staff.reportingManager === currentUser.reportingManager);

//   const updateSelectedDateStaff = (date: Date) => {
//     const dateString = format(date, 'yyyy-MM-dd');
//     const wfh = departmentStaff.filter(staff => staff.wfhDates.includes(dateString));
//     const inOffice = departmentStaff.filter(staff => !staff.wfhDates.includes(dateString));
//     setSelectedDateStaff({ wfh, inOffice });
//   };

//   const handleDateClick = (arg: { date: Date }) => {
//     setSelectedDate(arg.date);
//     updateSelectedDateStaff(arg.date);
//   };

//   const dayCellDidMount = (arg: { date: Date; el: HTMLElement }) => {
//     const { date, el } = arg;
//     const dateString = format(date, 'yyyy-MM-dd');
//     const wfhCount = departmentStaff.filter(staff => staff.wfhDates.includes(dateString)).length;
//     const inOfficeCount = departmentStaff.length - wfhCount;
//     const totalStaff = departmentStaff.length;

//     const wfhIntensity = wfhCount / totalStaff;
//     const inOfficeIntensity = inOfficeCount / totalStaff;

//     el.style.background = `linear-gradient(to right, rgba(52, 211, 153, ${wfhIntensity}), rgba(52, 211, 153, ${wfhIntensity}) 50%, rgba(96, 165, 250, ${inOfficeIntensity}) 50%, rgba(96, 165, 250, ${inOfficeIntensity}))`;
//   };

//   return (
//     <div className="grid grid-cols-3 gap-6">
//       <Card className="col-span-2 shadow-sm">
//         <CardHeader>
//           <CardTitle>WFH Heatmap Calendar</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[600px]">
//             <FullCalendar
//               plugins={[dayGridPlugin, interactionPlugin]}
//               initialView="dayGridMonth"
//               dateClick={handleDateClick}
//               dayCellDidMount={dayCellDidMount}
//               headerToolbar={{
//                 left: 'prev,next',
//                 center: 'title',
//                 right: 'today'
//               }}
//               height="100%"
//             />
//           </div>
//         </CardContent>
//       </Card>
//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle>
//             {selectedDate 
//               ? `Staff Status for ${format(selectedDate, 'MMMM d, yyyy')}`
//               : 'Select a date to view staff status'}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {selectedDate && (
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold mb-2">Working From Home</h3>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Name</TableHead>
//                       <TableHead>Position</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {selectedDateStaff.wfh.map((staff) => (
//                       <TableRow key={staff.id}>
//                         <TableCell>{staff.name}</TableCell>
//                         <TableCell>{staff.position}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-2">In Office</h3>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Name</TableHead>
//                       <TableHead>Position</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {selectedDateStaff.inOffice.map((staff) => (
//                       <TableRow key={staff.id}>
//                         <TableCell>{staff.name}</TableCell>
//                         <TableCell>{staff.position}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           )}
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { format } from 'date-fns';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateStaff, setSelectedDateStaff] = useState<{ wfh: typeof mockStaffData, inOffice: typeof mockStaffData }>({ wfh: [], inOffice: [] });

  const departmentStaff = mockStaffData.filter(staff => staff.reportingManager === currentUser.reportingManager);

  const updateSelectedDateStaff = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const wfh = departmentStaff.filter(staff => staff.wfhDates.includes(dateString));
    const inOffice = departmentStaff.filter(staff => !staff.wfhDates.includes(dateString));
    setSelectedDateStaff({ wfh, inOffice });
  };

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    updateSelectedDateStaff(arg.date);
  };

  const dayCellDidMount = (arg: { date: Date; el: HTMLElement }) => {
    const { date, el } = arg;
    const dayOfWeek = date.getDay();
    
    // Check if it's a weekend (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      el.style.background = 'white'; // or you can leave it as is
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

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle>WFH Heatmap Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              dateClick={handleDateClick}
              dayCellDidMount={dayCellDidMount}
              headerToolbar={{
                left: 'prev,next',
                center: 'title',
                right: 'today'
              }}
              height="100%"
            />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? `Staff Status for ${format(selectedDate, 'MMMM d, yyyy')}`
              : 'Select a date to view staff status'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Working From Home</h3>
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
              </div>
              <div>
                <h3 className="font-semibold mb-2">In Office</h3>
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}