// 'use client'

// import React, { useState, useEffect, useRef } from 'react'
// import FullCalendar from '@fullcalendar/react'
// import dayGridPlugin from '@fullcalendar/daygrid'
// import timeGridPlugin from '@fullcalendar/timegrid'
// import interactionPlugin from '@fullcalendar/interaction'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// import { Button } from '@/components/ui/button'
// import { format, isValid, parseISO, isSaturday, isSunday } from 'date-fns'

// interface Staff {
//   id: number
//   name: string
//   position: string
//   reportingManager: number
//   wfhDates: string[]
// }

// interface TeamScheduleCalendarProps {
//   currentUser: Staff
//   departmentStaff: Staff[]
// }

// export default function TeamScheduleCalendar({ currentUser, departmentStaff }: TeamScheduleCalendarProps) {
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date())
//   const [selectedDateStaff, setSelectedDateStaff] = useState<{ wfh: Staff[], inOffice: Staff[] }>({ wfh: [], inOffice: [] })
//   const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth')
//   const calendarRef = useRef<FullCalendar | null>(null)

//   const updateSelectedDateStaff = (date: Date) => {
//     if (!isValid(date)) {
//       console.error('Invalid date:', date)
//       return
//     }
//     const dateString = format(date, 'yyyy-MM-dd')
//     if (isSaturday(date) || isSunday(date)) {
//       setSelectedDateStaff({ wfh: [], inOffice: [] })
//     } else {
//       const wfh = departmentStaff.filter(staff => staff.wfhDates.includes(dateString))
//       const inOffice = departmentStaff.filter(staff => !staff.wfhDates.includes(dateString))
//       setSelectedDateStaff({ wfh, inOffice })
//     }
//   }

//   const handleDateClick = (arg: { date: Date | string }) => {
//     const newDate = arg.date instanceof Date ? arg.date : parseISO(arg.date as string)
//     if (isValid(newDate)) {
//       setSelectedDate(newDate)
//       updateSelectedDateStaff(newDate)
//     } else {
//       console.error('Invalid date selected:', arg.date)
//     }
//   }

//   const handleTodayClick = () => {
//     const today = new Date()
//     setSelectedDate(today)
//     updateSelectedDateStaff(today)
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi()
//       calendarApi.today()
//     }
//   }

//   const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
//     setCalendarView(view)
//     if (calendarRef.current) {
//       const calendarApi = calendarRef.current.getApi()
//       calendarApi.changeView(view)
//     }
//   }

//   const dayCellDidMount = (arg: { date: Date; el: HTMLElement }) => {
//     const { date, el } = arg
//     if (isSaturday(date) || isSunday(date)) {
//       el.style.background = 'white'
//       return
//     }

//     const dateString = format(date, 'yyyy-MM-dd')
//     const inOfficeCount = departmentStaff.filter(staff => !staff.wfhDates.includes(dateString)).length
//     const totalStaff = departmentStaff.length

//     const inOfficeRatio = inOfficeCount / totalStaff
//     const opacity = inOfficeRatio.toFixed(2) // Convert to a string with 2 decimal places

//     el.style.background = `rgba(96, 165, 250, ${opacity})`
//   }

//   useEffect(() => {
//     updateSelectedDateStaff(selectedDate)
//   }, [selectedDate, departmentStaff])

//   const calendarEvents = departmentStaff.flatMap(staff => 
//     staff.wfhDates
//       .filter(date => {
//         const dateObj = new Date(date)
//         return !isSaturday(dateObj) && !isSunday(dateObj)
//       })
//       .map(date => ({
//         title: `${staff.name} - WFH`,
//         date: date,
//         color: 'transparent',
//         textColor: 'black'
//       }))
//   )

//   return (
//     <div className="grid grid-cols-3 gap-6">
//       <Card className="col-span-2 shadow-sm">
//         <CardHeader>
//           <CardTitle className="flex justify-between items-center">
//             <span>Team Schedule Calendar</span>
//             <div className="space-x-2">
//               <Button onClick={() => handleViewChange('dayGridMonth')} variant={calendarView === 'dayGridMonth' ? 'default' : 'outline'}>Month</Button>
//               <Button onClick={() => handleViewChange('timeGridWeek')} variant={calendarView === 'timeGridWeek' ? 'default' : 'outline'}>Week</Button>
//               <Button onClick={() => handleViewChange('timeGridDay')} variant={calendarView === 'timeGridDay' ? 'default' : 'outline'}>Day</Button>
//               <Button onClick={handleTodayClick}>Today</Button>
//             </div>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="h-[600px]">
//             <FullCalendar
//               ref={calendarRef}
//               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//               initialView={calendarView}
//               dateClick={handleDateClick}
//               dayCellDidMount={dayCellDidMount}
//               headerToolbar={{
//                 left: 'prev,next',
//                 center: 'title',
//                 right: ''
//               }}
//               height="100%"
//               selectable={true}
//               select={handleDateClick}
//               events={calendarEvents}
//             />
//           </div>
//         </CardContent>
//       </Card>
//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle>
//             Staff Status for {isValid(selectedDate) ? format(selectedDate, 'MMMM d, yyyy') : 'Invalid Date'}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {isSaturday(selectedDate) || isSunday(selectedDate) ? (
//             <p>No one working on weekends</p>
//           ) : (
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold mb-2">Working From Home</h3>
//                 {selectedDateStaff.wfh.length > 0 ? (
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Name</TableHead>
//                         <TableHead>Position</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {selectedDateStaff.wfh.map((staff) => (
//                         <TableRow key={staff.id}>
//                           <TableCell>{staff.name}</TableCell>
//                           <TableCell>{staff.position}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 ) : (
//                   <p>No staff working from home on this date.</p>
//                 )}
//               </div>
//               <div>
//                 <h3 className="font-semibold mb-2">In Office</h3>
//                 {selectedDateStaff.inOffice.length > 0 ? (
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Name</TableHead>
//                         <TableHead>Position</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {selectedDateStaff.inOffice.map((staff) => (
//                         <TableRow key={staff.id}>
//                           <TableCell>{staff.name}</TableCell>
//                           <TableCell>{staff.position}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 ) : (
//                   <p>No staff in office on this date.</p>
//                 )}
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

'use client'

import React, { useState, useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { format, isValid, parseISO, isSaturday, isSunday, isToday } from 'date-fns'

interface Staff {
  id: number
  name: string
  position: string
  reportingManager: number
  wfhDates: string[]
}

interface TeamScheduleCalendarProps {
  currentUser: Staff
  departmentStaff: Staff[]
}

export default function TeamScheduleCalendar({ currentUser, departmentStaff }: TeamScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedDateStaff, setSelectedDateStaff] = useState<{ wfh: Staff[], inOffice: Staff[] }>({ wfh: [], inOffice: [] })
  const [calendarView, setCalendarView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth')
  const calendarRef = useRef<FullCalendar | null>(null)

  const updateSelectedDateStaff = (date: Date) => {
    if (!isValid(date)) {
      console.error('Invalid date:', date)
      return
    }
    const dateString = format(date, 'yyyy-MM-dd')
    if (isSaturday(date) || isSunday(date)) {
      setSelectedDateStaff({ wfh: [], inOffice: [] })
    } else {
      const wfh = departmentStaff.filter(staff => staff.wfhDates.includes(dateString))
      const inOffice = departmentStaff.filter(staff => !staff.wfhDates.includes(dateString))
      setSelectedDateStaff({ wfh, inOffice })
    }
  }

  const handleDateClick = (arg: { date: Date | string }) => {
    const newDate = arg.date instanceof Date ? arg.date : parseISO(arg.date as string)
    if (isValid(newDate)) {
      setSelectedDate(newDate)
      updateSelectedDateStaff(newDate)
    } else {
      console.error('Invalid date selected:', arg.date)
    }
  }

  const handleTodayClick = () => {
    const today = new Date()
    setSelectedDate(today)
    updateSelectedDateStaff(today)
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.today()
    }
  }

  const handleViewChange = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setCalendarView(view)
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi()
      calendarApi.changeView(view)
    }
  }

  const dayCellDidMount = (arg: { date: Date; el: HTMLElement }) => {
    const { date, el } = arg
    if (isSaturday(date) || isSunday(date)) {
      el.style.background = 'white'
      return
    }

    const dateString = format(date, 'yyyy-MM-dd')
    const inOfficeCount = departmentStaff.filter(staff => !staff.wfhDates.includes(dateString)).length
    const totalStaff = departmentStaff.length

    const inOfficeRatio = inOfficeCount / totalStaff
    const opacity = inOfficeRatio.toFixed(2) // Convert to a string with 2 decimal places

    el.style.background = `rgba(96, 165, 250, ${opacity})`

    if (isToday(date)) {
      el.style.backgroundColor = 'rgba(209, 213, 219, 0.5)' // Light grey for today's date
    }
  }

  useEffect(() => {
    updateSelectedDateStaff(selectedDate)
  }, [selectedDate, departmentStaff])

  const calendarEvents = departmentStaff.flatMap(staff => 
    staff.wfhDates
      .filter(date => {
        const dateObj = new Date(date)
        return !isSaturday(dateObj) && !isSunday(dateObj)
      })
      .map(date => ({
        title: `${staff.name} - WFH`,
        date: date,
        color: 'transparent',
        textColor: 'black'
      }))
  )

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card className="col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Team Schedule Calendar</span>
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
              events={calendarEvents}
              eventContent={(eventInfo) => {
                return (
                  <div className="text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                    {eventInfo.event.title}
                  </div>
                )
              }}
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
          {isSaturday(selectedDate) || isSunday(selectedDate) ? (
            <p>No one working on weekends</p>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}