import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';

type Department =
  | 'CEO'
  | 'Sales'
  | 'Solutioning'
  | 'Engineering'
  | 'HR'
  | 'Finance'
  | 'Consultancy'
  | 'IT';
const departments: Department[] = [
  'CEO',
  'Sales',
  'Solutioning',
  'Engineering',
  'HR',
  'Finance',
  'Consultancy',
  'IT'
];

interface Log {
  log_id: number;
  staff_id: number;
  request_id: number;
  processor_id: number;
  department: string;
  reason: string;
  action: string;
  created_at: string;
  users_logs_staff_idTousers: {
    staff_fname: string;
    staff_lname: string;
    department: Department;
  };
  users_logs_processor_idTousers: {
    staff_fname: string;
    staff_lname: string;
  };
}

export default function LogsTab() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Log;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Fetch logs
      const logsResponse = await fetch('/api/logs');
      const logsData = await logsResponse.json();

      // Get unique staff IDs
      const staffIds = Array.from(
        new Set(logsData.map((log: Log) => log.staff_id))
      );

      // Fetch each user's details individually to ensure we get array response
      const userPromises = staffIds.map((id) =>
        fetch(`/api/users?staff_id=${id}`).then((res) => res.json())
      );

      const usersResponses = await Promise.all(userPromises);
      // Flatten and handle both array and single object responses
      const usersData = usersResponses.map((response) =>
        Array.isArray(response) ? response[0] : response
      );

      // Create a map of staff_id to department
      const departmentMap = new Map(
        usersData.map((user) => [user.staff_id, user.department])
      );

      // Add department to each log
      const logsWithDepartment = logsData.map((log: Log) => ({
        ...log,
        department: departmentMap.get(log.staff_id) || 'Unknown'
      }));
      console.log(logsWithDepartment);
      setLogs(logsWithDepartment);
      setFilteredLogs(logsWithDepartment);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    const filtered = logs.filter(
      (log) =>
        (log.users_logs_staff_idTousers.staff_fname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          log.users_logs_staff_idTousers.staff_lname
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          log.users_logs_processor_idTousers.staff_fname
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          log.users_logs_processor_idTousers.staff_lname
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (actionFilter === '' || log.action === actionFilter) &&
        (departmentFilter === '' || log.department === departmentFilter) &&
        (requestTypeFilter === '' ||
          (requestTypeFilter === 'withdraw' && isWithdrawRequest(log.action)) ||
          (requestTypeFilter === 'normal' && !isWithdrawRequest(log.action)))
    );
    setFilteredLogs(filtered);
  }, [searchTerm, actionFilter, requestTypeFilter, departmentFilter, logs]);

  const sortData = (key: keyof Log) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig) return filteredLogs;
    return [...filteredLogs].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
      case 'withdraw_approve':
        return 'bg-green-500';
      case 'reject':
      case 'withdraw_reject':
        return 'bg-red-500';
      case 'withdraw':
      case 'withdraw_pending':
        return 'bg-yellow-500';
      case 'request':
        return 'bg-blue-300';
      case 'cancel':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isWithdrawRequest = (action: string) => {
    return action.includes('withdraw');
  };

  return (
    <Card className="m-4 h-[calc(100vh-100px)]">
      <CardHeader>
        <CardTitle>Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Search by Staff or Processor Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select onValueChange={(value) => setActionFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
              <SelectItem value="withdraw">Withdraw</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setRequestTypeFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Request Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Requests</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="withdraw">Withdraw</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setDepartmentFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="max-h-[calc(100vh-300px)] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => sortData('log_id')}>
                  Log ID{' '}
                  {sortConfig?.key === 'log_id' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead onClick={() => sortData('request_id')}>
                  Request ID{' '}
                  {sortConfig?.key === 'request_id' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead>Staff</TableHead>
                <TableHead onClick={() => sortData('department')}>
                  Department{' '}
                  {sortConfig?.key === 'department' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead>Processor</TableHead>
                <TableHead onClick={() => sortData('action')}>
                  Action{' '}
                  {sortConfig?.key === 'action' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead onClick={() => sortData('created_at')}>
                  Date{' '}
                  {sortConfig?.key === 'created_at' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedData().map((log) => (
                <TableRow
                  key={log.log_id}
                  className={
                    isWithdrawRequest(log.action) ? 'bg-yellow-50' : ''
                  }
                >
                  <TableCell>{log.log_id}</TableCell>
                  <TableCell>{log.request_id}</TableCell>
                  <TableCell>{`${log.users_logs_staff_idTousers.staff_fname} ${log.users_logs_staff_idTousers.staff_lname}`}</TableCell>
                  <TableCell>{log.department}</TableCell>
                  <TableCell>{`${log.users_logs_processor_idTousers.staff_fname} ${log.users_logs_processor_idTousers.staff_lname}`}</TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/logs/${log.request_id}`}>
                      <Button variant="link">View Thread</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
