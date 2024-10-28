'use client';
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Separator } from '@/components/ui/separator';
import { Filter, CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { requests, users } from '@prisma/client';
import { columns } from './columns';

interface ProductsClientProps {
  user_data: users[];
  request_data: requests[];
}

export const UserClient: React.FC<ProductsClientProps> = ({
  user_data,
  request_data
}) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [filteredData, setFilteredData] = React.useState(user_data);
  const [workStatus, setWorkStatus] = React.useState<
    'all' | 'wfh' | 'office' | 'leave'
  >('all');

  // Extract unique departments
  const departments = React.useMemo(() => {
    const deptSet = new Set(user_data.map((user) => user.department));
    return Array.from(deptSet);
  }, [user_data]);

  // Function to check if a user has an approved WFH request for the selected date
  const isUserWFH = React.useCallback(
    (userId: number, selectedDate: Date | undefined) => {
      if (!selectedDate) return false;

      return request_data.some(
        (request) =>
          request.staff_id === userId &&
          ['approved', 'withdraw_pending'].includes(request.status) &&
          format(new Date(request.date), 'yyyy-MM-dd') ===
            format(selectedDate, 'yyyy-MM-dd')
      );
    },
    [request_data]
  );

  const isUserOnLeave = React.useCallback(
    (userId: number, selectedDate: Date | undefined) => {
      if (!selectedDate) return false;

      // Assuming leave data is being passed through request_data with a status of 'leave'
      return request_data.some(
        (request) =>
          request.staff_id === userId &&
          request.status === 'leave' &&
          format(new Date(request.date), 'yyyy-MM-dd') ===
            format(selectedDate, 'yyyy-MM-dd')
      );
    },
    [request_data]
  );

  const getUserWorkStatus = React.useCallback(
    (userId: number, selectedDate: Date | undefined) => {
      if (!selectedDate) return 'In Office';

      const onLeave = isUserOnLeave(userId, selectedDate);
      if (onLeave) return 'On Leave';

      const onWfh = isUserWFH(userId, selectedDate);
      if (onWfh) return 'WFH';

      return 'In Office';
    },
    [isUserWFH, isUserOnLeave]
  );

  // Filter users based on department and WFH status
  const filterUsers = React.useCallback(
    (department: string) => {
      let filtered = [...user_data];

      // Apply department filter
      if (department !== 'all') {
        filtered = filtered.filter((user) => user.department === department);
      }

      // Apply status filter
      if (workStatus !== 'all') {
        filtered = filtered.filter((user) => {
          const status = getUserWorkStatus(user.staff_id, date);
          return status.toLowerCase() === workStatus;
        });
      }

      setFilteredData(filtered);
    },
    [user_data, date, workStatus, getUserWorkStatus]
  );

  // Enhanced columns with WFH status
  const enhancedColumns = [
    ...columns,
    {
      accessorKey: 'workStatus',
      header: 'Work Status',
      cell: ({ row }: { row: any }) => {
        const status = getUserWorkStatus(row.original.staff_id, date);
        return (
          <div
            className={cn(
              'font-medium',
              status === 'WFH' && 'text-green-600',
              status === 'In Office' && 'text-blue-600',
              status === 'On Leave' && 'text-orange-600'
            )}
          >
            {status}
          </div>
        );
      }
    }
  ];

  const handleDepartmentFilter = (value: string) => {
    filterUsers(value);
  };

  const handleWorkStatusFilter = (
    value: 'all' | 'wfh' | 'office' | 'leave'
  ) => {
    setWorkStatus(value);
    filterUsers('all');
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[240px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                filterUsers('all');
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select onValueChange={handleDepartmentFilter} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select onValueChange={handleWorkStatusFilter} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Work Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="wfh">WFH</SelectItem>
              <SelectItem value="office">In Office</SelectItem>
              <SelectItem value="leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <DataTable
        columns={enhancedColumns}
        data={filteredData}
        searchKey="fullName"
      />
    </>
  );
};

export default UserClient;
