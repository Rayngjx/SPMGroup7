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
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

import { getApprovedDatesWithUserDetails } from '@/app/api/crudFunctions/ApprovedDates';
import { getAllUsers, getUser } from '@/app/api/crudFunctions/Staff';

const departments = [
  'Department 1',
  'Department 2',
  'Department 3',
  'Department 4',
  'Department 5',
  'Department 6',
  'Department 7',
  'Department 8'
];

const departmentColors: Record<string, string> = {
  'Department 1': 'bg-blue-600',
  'Department 2': 'bg-red-600',
  'Department 3': 'bg-green-600',
  'Department 4': 'bg-yellow-600',
  'Department 5': 'bg-purple-600',
  'Department 6': 'bg-pink-600',
  'Department 7': 'bg-indigo-600',
  'Department 8': 'bg-orange-600'
};

interface Employee {
  staff_id: number;
  request_id: number;
  date: string;
  staff_fname: string;
  staff_lname: string;
  dept_id: number;
  position: string;
  email: string;
  reason: string;
}

interface AllUserDetails {
  staff_id: number;
  staff_fname: string;
  staff_lname: string;
  dept_id: number;
  email: string;
  position: string;
  role_id: number;
  reporting_manager: number | null;
  country: string;
}

const allColumns = [
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'position', label: 'Position' },
  { key: 'reason', label: 'Reason' }
] as const;

type ColumnKey = (typeof allColumns)[number]['key'];

export default function WFHCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7, 8
  ]);
  const [events, setEvents] = useState<any[]>([]);
  const [staffDetails, setStaffDetails] = useState<Employee[]>([]);
  const [allUserDetails, setAllUserDetails] = useState<AllUserDetails[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    employees: Employee[];
    presentEmployees: AllUserDetails[];
  }>({ title: '', employees: [], presentEmployees: [] });
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
  const [error, setError] = useState<string | null>(null);
  const [presentEmployees, setPresentEmployees] = useState<AllUserDetails[]>(
    []
  );
  const [currentOfficePage, setCurrentOfficePage] = useState(1);
  const [currentWfhPage, setCurrentWfhPage] = useState(1);
  const [currentPresentPage, setCurrentPresentPage] = useState(1);
  const employeesPerPage = 10;

  useEffect(() => {
    const fetchAllUserDetails = async () => {
      try {
        const response = await getAllUsers();
        if (!response) {
          throw new Error('Error fetching users');
        }

        console.log('Raw response from getting all users:', response.length);
        setAllUserDetails(response);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch user details. Please try again later.');
      }
    };

    fetchAllUserDetails();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getApprovedDatesWithUserDetails();
        if (!response) {
          throw new Error('Error fetching users');
        }

        const formattedData: Employee[] = response
          .map((item: any) => {
            let parsedDate;
            try {
              parsedDate = new Date(item.date);
              if (!isValid(parsedDate)) {
                throw new Error('Invalid date');
              }
            } catch (error) {
              console.error('Error parsing date:', item.date, error);
              return null;
            }

            return {
              staff_id: item.staff_id,
              request_id: item.request_id,
              date: format(parsedDate, 'yyyy-MM-dd'),
              staff_fname: item.users.staff_fname,
              staff_lname: item.users.staff_lname,
              dept_id: item.users.dept_id,
              position: item.users.position,
              email: item.users.email,
              reason: item.requests.reason
            };
          })
          .filter(Boolean);

        setStaffDetails(formattedData);
        updateEvents(formattedData);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch user details. Please try again later.');
      }
    };

    fetchDetails();
  }, []);

  const updateEvents = (data: Employee[]) => {
    const filteredData = data.filter((employee) =>
      selectedDepartments.includes(employee.dept_id)
    );

    const groupedEvents = filteredData.reduce(
      (acc, employee) => {
        const dateStr = employee.date;
        if (!acc[dateStr]) acc[dateStr] = {};
        const dept = departments[employee.dept_id - 1];
        if (!acc[dateStr][dept]) acc[dateStr][dept] = [];
        acc[dateStr][dept].push(employee);
        return acc;
      },
      {} as Record<string, Partial<Record<string, Employee[]>>>
    );

    const formattedEvents = Object.entries(groupedEvents).flatMap(
      ([date, departments]) =>
        Object.entries(departments).map(([department, employees]) => ({
          title: `${department} : ${employees!.length}`,
          start: date,
          allDay: true,
          extendedProps: { department, employees }
        }))
    );

    setEvents(formattedEvents);
  };

  useEffect(() => {
    updateEvents(staffDetails);
  }, [staffDetails, selectedDepartments]);

  const updateStaffDetails = (date: Date) => {
    const filteredData = staffDetails.filter(
      (employee) =>
        employee.date === format(date, 'yyyy-MM-dd') &&
        selectedDepartments.includes(employee.dept_id)
    );
    setCurrentPage(1);
    return filteredData;
  };

  const getPresentEmployees = (date: Date, deptId: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const wfhEmployees = new Set(
      staffDetails
        .filter(
          (employee) => employee.date === dateStr && employee.dept_id === deptId
        )
        .map((employee) => employee.staff_id)
    );

    return allUserDetails.filter(
      (employee) =>
        !wfhEmployees.has(employee.staff_id) && employee.dept_id === deptId
    );
  };

  useEffect(() => {
    const filteredData = updateStaffDetails(selectedDate);
    const presentData = getPresentEmployees(selectedDate, 1); // Default to Department 1
    setPresentEmployees(presentData);
  }, [selectedDate, staffDetails, selectedDepartments, allUserDetails]);

  const toggleDepartment = (deptId: number) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId)
        ? prev.filter((d) => d !== deptId)
        : [...prev, deptId]
    );
  };

  const handleEventClick = (info: any) => {
    const { department, employees } = info.event.extendedProps;
    const deptId = departments.indexOf(department) + 1;
    const presentEmployees = getPresentEmployees(
      new Date(info.event.start),
      deptId
    );
    setDialogContent({
      title: `${department} - ${format(
        new Date(info.event.start),
        'MMMM d, yyyy'
      )}`,
      employees,
      presentEmployees
    });
    setIsDialogOpen(true);
    setCurrentWfhPage(1);
    setCurrentPresentPage(1);
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

  const getSortedData = (data: Employee[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredData = useMemo(
    () => updateStaffDetails(selectedDate),
    [selectedDate, staffDetails, selectedDepartments]
  );
  const sortedData = useMemo(
    () => getSortedData(filteredData),
    [filteredData, sortConfig]
  );
  const totalPages = Math.ceil(sortedData.length / 10);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const departmentCounts = useMemo(() => {
    return departments.reduce(
      (acc, dept, index) => {
        acc[dept] = allUserDetails.filter(
          (employee) => employee.dept_id === index + 1
        ).length;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [allUserDetails]);

  const totalWFH = filteredData.length;
  const totalEmployees = selectedDepartments.reduce(
    (sum, deptId) => sum + (departmentCounts[departments[deptId - 1]] || 0),
    0
  );
  const totalInOffice = totalEmployees - totalWFH;

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

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
                    {departments.map((dept, index) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${index + 1}`}
                          checked={selectedDepartments.includes(index + 1)}
                          onCheckedChange={() => toggleDepartment(index + 1)}
                        />
                        <label
                          htmlFor={`dept-${index + 1}`}
                          className="text-sm"
                        >
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
                          eventInfo.event.extendedProps.department
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
              {departments.map((dept, index) => {
                if (!selectedDepartments.includes(index + 1)) return null;
                const wfhCount = filteredData.filter(
                  (staff) => staff.dept_id === index + 1
                ).length;
                const totalInDepartment = departmentCounts[dept] || 0;
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
                            width: `${
                              (wfhCount / (totalInDepartment || 1)) * 100
                            }%`
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
                  key={staff.staff_id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEmployee(staff)}
                >
                  {allColumns
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((column) => (
                      <TableCell key={`${staff.staff_id}-${column.key}`}>
                        {column.key === 'name'
                          ? `${staff.staff_fname} ${staff.staff_lname}`
                          : column.key === 'department'
                          ? departments[staff.dept_id - 1]
                          : staff[column.key]}
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>Department Overview</DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Employees Working From Home
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dialogContent.employees
                    .slice(
                      (currentWfhPage - 1) * employeesPerPage,
                      currentWfhPage * employeesPerPage
                    )
                    .map((employee) => (
                      <TableRow key={employee.staff_id}>
                        <TableCell>{`${employee.staff_fname} ${employee.staff_lname}`}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.reason}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentWfhPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentWfhPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentWfhPage} of{' '}
                  {Math.ceil(dialogContent.employees.length / employeesPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentWfhPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(
                          dialogContent.employees.length / employeesPerPage
                        )
                      )
                    )
                  }
                  disabled={
                    currentWfhPage ===
                    Math.ceil(dialogContent.employees.length / employeesPerPage)
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Employees Present in Office
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dialogContent.presentEmployees
                    .slice(
                      (currentPresentPage - 1) * employeesPerPage,
                      currentPresentPage * employeesPerPage
                    )
                    .map((employee) => (
                      <TableRow key={employee.staff_id}>
                        <TableCell>{`${employee.staff_fname} ${employee.staff_lname}`}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPresentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPresentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPresentPage} of{' '}
                  {Math.ceil(
                    dialogContent.presentEmployees.length / employeesPerPage
                  )}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPresentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(
                          dialogContent.presentEmployees.length /
                            employeesPerPage
                        )
                      )
                    )
                  }
                  disabled={
                    currentPresentPage ===
                    Math.ceil(
                      dialogContent.presentEmployees.length / employeesPerPage
                    )
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
                <p>{`${selectedEmployee.staff_fname} ${selectedEmployee.staff_lname}`}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Department</h3>
                <p>{departments[selectedEmployee.dept_id - 1]}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Position</h3>
                <p>{selectedEmployee.position}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Email</h3>
                <p>{selectedEmployee.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Reason</h3>
                <p>{selectedEmployee.reason}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">WFH Date</h3>
                <p>{selectedEmployee.date}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
