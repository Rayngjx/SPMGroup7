'use client';

import React, { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import {
  deleteApproveDates,
  getApprovedDates
} from '@/prisma/crudFunctions/ApprovedDates';
import { approved_dates } from '@prisma/client';

type Department = 'Engineering' | 'Marketing' | 'Sales' | 'HR' | 'Finance';

const departments: Department[] = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Finance'
];
const departmentColors: Record<Department, string> = {
  Engineering: 'bg-blue-600',
  Marketing: 'bg-red-600',
  Sales: 'bg-green-600',
  HR: 'bg-yellow-600',
  Finance: 'bg-purple-600'
};

interface Employee {
  id: number;
  name: string;
  department: Department;
  role: string;
  reportingOfficer: string;
  wfhDate: string;
  email: string;
  phoneNumber: string;
  address: string;
}
// Generate dummy data for testing, replace with async api call
const dummyData: Employee[] = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  department: departments[Math.floor(Math.random() * departments.length)],
  role: ['Manager', 'Team Lead', 'Senior', 'Junior', 'Intern'][
    Math.floor(Math.random() * 5)
  ],
  reportingOfficer: `Manager ${Math.floor(i / 5) + 1}`,
  wfhDate: format(
    new Date(2024, 8, Math.floor(Math.random() * 30)),
    'yyyy-MM-dd'
  ),
  email: `employee${i + 1}@company.com`,
  phoneNumber: `+1 ${Math.floor(Math.random() * 1000)}-${Math.floor(
    Math.random() * 1000
  )}-${Math.floor(Math.random() * 10000)}`,
  address: `${Math.floor(Math.random() * 1000)} Main St, City, State, 12345`
}));

const allColumns = [
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'role', label: 'Role' },
  { key: 'reportingOfficer', label: 'Reporting Officer' }
] as const;

type ColumnKey = (typeof allColumns)[number]['key'];

export default function WFHCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDepartments, setSelectedDepartments] =
    useState<Department[]>(departments);
  const [events, setEvents] = useState<any[]>([]);
  const [staffDetails, setStaffDetails] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    employees: Employee[];
  }>({ title: '', employees: [] });
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(
    allColumns.map((col) => col.key)
  );
  const [sortConfig, setSortConfig] = useState<{
    key: ColumnKey;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const departmentCounts = useMemo(() => {
    return departments.reduce(
      (acc, dept) => {
        acc[dept] = dummyData.filter(
          (employee) => employee.department === dept
        ).length;
        return acc;
      },
      {} as Record<Department, number>
    );
  }, []);
  const [approvedDates, setApprovedDates] = useState<approved_dates[]>([]);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await getApprovedDates();
        console.log(response);
        if (!response) {
          throw new Error('Error fetching users');
        }
        // const data = await response.json();

        // Assuming response is in the format provided in the example
        const formattedData = response.map((item: any) => ({
          staff_id: item.staff_id,
          request_id: item.request_id,
          date: item.date // Formatting the date for display
        }));

        // Update state with the formatted data
        setApprovedDates(formattedData);
        console.log(formattedData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
      }
    };

    fetchDates();
  }, []);
  useEffect(() => {
    const filteredData = dummyData.filter((employee) =>
      selectedDepartments.includes(employee.department)
    );
    const groupedEvents = filteredData.reduce(
      (acc, employee) => {
        const dateStr = employee.wfhDate;
        if (!acc[dateStr]) acc[dateStr] = {};
        if (!acc[dateStr][employee.department])
          acc[dateStr][employee.department] = [];
        acc[dateStr][employee.department].push(employee);
        return acc;
      },
      {} as Record<string, Partial<Record<Department, Employee[]>>>
    );

    const formattedEvents = Object.entries(groupedEvents).flatMap(
      ([date, departments]) =>
        Object.entries(departments).map(([department, employees]) => ({
          title: `${department} : ${employees!.length}`,
          start: date,
          end: date,
          allDay: true,
          extendedProps: { department, employees }
        }))
    );

    setEvents(formattedEvents);
    updateStaffDetails(selectedDate, filteredData);
  }, [selectedDepartments, selectedDate]);

  const updateStaffDetails = (date: Date, filteredData: Employee[]) => {
    setStaffDetails(
      filteredData.filter(
        (employee) => employee.wfhDate === format(date, 'yyyy-MM-dd')
      )
    );
    setCurrentPage(1);
  };

  const toggleDepartment = (department: Department) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const handleEventClick = (info: any) => {
    const { department, employees } = info.event.extendedProps;
    setDialogContent({
      title: `${department} - ${format(
        new Date(info.event.start),
        'MMMM d, yyyy'
      )}`,
      employees
    });
    setIsDialogOpen(true);
  };

  const toggleColumn = (columnKey: ColumnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const sortData = (key: ColumnKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig) return staffDetails;
    return [...staffDetails].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = getSortedData();
  const totalPages = Math.ceil(sortedData.length / 10);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const totalWFH = staffDetails.length;
  const totalInOffice =
    selectedDepartments.reduce((sum, dept) => sum + departmentCounts[dept], 0) -
    totalWFH;

  return (
    <div className="">
      <h1 className="mb-6 text-3xl font-bold">Work From Home Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>WFH Calendar</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${dept}`}
                          checked={selectedDepartments.includes(dept)}
                          onCheckedChange={() => toggleDepartment(dept)}
                        />
                        <label htmlFor={`dept-${dept}`} className="text-sm">
                          {dept}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                dateClick={({ date }) => setSelectedDate(date)}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'today'
                }}
                height="100%"
                eventContent={(eventInfo) => (
                  <div className="flex items-center space-x-2 rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        departmentColors[
                          eventInfo.event.extendedProps.department as Department
                        ]
                      }`}
                    ></div>
                    <span className="text-xs text-foreground">
                      {eventInfo.timeText && `${eventInfo.timeText} `}
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
                dayCellClassNames={({ date }) =>
                  cn(
                    'border-t',
                    [0, 6].includes(date.getDay()) &&
                      'bg-gray-50 dark:bg-gray-800'
                  )
                }
                eventClassNames="!bg-transparent !border-0"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Daily WFH Summary</CardTitle>
            <div className="text-sm text-muted-foreground">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium">Total WFH:</span>
                <span className="text-sm font-medium">{totalWFH}</span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium">Total in Office:</span>
                <span className="text-sm font-medium">{totalInOffice}</span>
              </div>
              <div className="my-4 h-px bg-border"></div>
              {departments.map((dept) => {
                const wfhCount = staffDetails.filter(
                  (staff) => staff.department === dept
                ).length;
                const totalInDepartment = departmentCounts[dept];
                return (
                  <div key={dept} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dept}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {wfhCount} / {totalInDepartment}
                      </span>
                      <div className="h-1.5 w-24 rounded-full bg-secondary">
                        <div
                          className={`h-1.5 rounded-full ${departmentColors[dept]}`}
                          style={{
                            width: `${(wfhCount / totalInDepartment) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Staff Details</CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  {allColumns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`column-${column.key}`}
                        checked={visibleColumns.includes(column.key)}
                        onCheckedChange={() => toggleColumn(column.key)}
                      />
                      <label
                        htmlFor={`column-${column.key}`}
                        className="text-sm"
                      >
                        {column.label}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {allColumns
                  .filter((col) => visibleColumns.includes(col.key))
                  .map((column) => (
                    <TableHead
                      key={column.key}
                      className="cursor-pointer"
                      onClick={() => sortData(column.key)}
                    >
                      <div className="flex items-center">
                        {column.label}
                        {sortConfig?.key === column.key &&
                          (sortConfig.direction === 'ascending' ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((staff) => (
                <TableRow
                  key={staff.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEmployee(staff)}
                >
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((column) => (
                      <TableCell key={`${staff.id}-${column.key}`}>
                        {column.key === 'department' ? (
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                departmentColors[staff.department]
                              }`}
                            ></div>
                            <span>{staff.department}</span>
                          </div>
                        ) : (
                          staff[column.key]
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>Employees working from home:</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Reporting Officer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dialogContent.employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.reportingOfficer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!selectedEmployee}
        onOpenChange={() => setSelectedEmployee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium">Name</h3>
                <p>{selectedEmployee.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Department</h3>
                <p>{selectedEmployee.department}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Role</h3>
                <p>{selectedEmployee.role}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Reporting Officer</h3>
                <p>{selectedEmployee.reportingOfficer}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Email</h3>
                <p>{selectedEmployee.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Phone Number</h3>
                <p>{selectedEmployee.phoneNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Address</h3>
                <p>{selectedEmployee.address}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">WFH Date</h3>
                <p>{selectedEmployee.wfhDate}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
