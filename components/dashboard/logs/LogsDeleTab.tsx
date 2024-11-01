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

interface LogDele {
  log_id: number;
  staff_id: number;
  delegation_request_id: number;
  processor_id: number;
  reason: string;
  action: string;
  created_at: string;
  users_logs_dele_staff_idTousers: {
    staff_fname: string;
    staff_lname: string;
    department: string;
    position: string;
  };
  users_logs_dele_processor_idTousers: {
    staff_fname: string;
    staff_lname: string;
    department: string;
    position: string;
  };
}

type DepartmentType =
  | 'CEO'
  | 'Sales'
  | 'Solutioning'
  | 'Engineering'
  | 'HR'
  | 'Finance'
  | 'Consultancy'
  | 'IT';

const departments: DepartmentType[] = [
  'CEO',
  'Sales',
  'Solutioning',
  'Engineering',
  'HR',
  'Finance',
  'Consultancy',
  'IT'
];

export function LogsDeleTab() {
  const [logs, setLogs] = useState<LogDele[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogDele[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LogDele;
    direction: 'asc' | 'desc';
  } | null>(null);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs-dele');
      const data = await response.json();
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const nameMatch =
        log.users_logs_dele_staff_idTousers.staff_fname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        log.users_logs_dele_staff_idTousers.staff_lname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        log.users_logs_dele_processor_idTousers.staff_fname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        log.users_logs_dele_processor_idTousers.staff_lname
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const actionMatch = !actionFilter || log.action === actionFilter;
      const departmentMatch =
        !departmentFilter ||
        log.users_logs_dele_staff_idTousers.department === departmentFilter;

      return nameMatch && actionMatch && departmentMatch;
    });

    setFilteredLogs(filtered);
  }, [searchTerm, actionFilter, departmentFilter, logs]);

  const sortData = (key: keyof LogDele) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
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
      case 'delegation_approve':
        return 'bg-green-500';
      case 'delegation_reject':
        return 'bg-red-500';
      case 'request':
        return 'bg-blue-300';
      case 'redacted':
        return 'bg-purple-500';
      case 'cancelled':
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Delegation Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex flex-wrap gap-4">
          <Input
            placeholder="Search by Staff or Processor Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="delegation_approve">Approve</SelectItem>
              <SelectItem value="delegation_reject">Reject</SelectItem>
              <SelectItem value="request">Request</SelectItem>
              <SelectItem value="redacted">Redacted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={setDepartmentFilter}>
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
        <div className="max-h-[calc(100vh-300px)] overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => sortData('log_id')}>
                  Log ID{' '}
                  {sortConfig?.key === 'log_id' && (
                    <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  )}
                </TableHead>
                <TableHead onClick={() => sortData('delegation_request_id')}>
                  Delegation ID{' '}
                  {sortConfig?.key === 'delegation_request_id' && (
                    <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  )}
                </TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Staff Department</TableHead>
                <TableHead>Processor</TableHead>
                <TableHead>Processor Position</TableHead>
                <TableHead onClick={() => sortData('action')}>
                  Action{' '}
                  {sortConfig?.key === 'action' && (
                    <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  )}
                </TableHead>
                <TableHead onClick={() => sortData('created_at')}>
                  Date{' '}
                  {sortConfig?.key === 'created_at' && (
                    <ArrowUpDown className="ml-2 inline h-4 w-4" />
                  )}
                </TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedData().map((log) => (
                <TableRow key={log.log_id}>
                  <TableCell>{log.log_id}</TableCell>
                  <TableCell>{log.delegation_request_id}</TableCell>
                  <TableCell>
                    {`${log.users_logs_dele_staff_idTousers.staff_fname} ${log.users_logs_dele_staff_idTousers.staff_lname}`}
                  </TableCell>
                  <TableCell>
                    {log.users_logs_dele_staff_idTousers.department}
                  </TableCell>
                  <TableCell>
                    {`${log.users_logs_dele_processor_idTousers.staff_fname} ${log.users_logs_dele_processor_idTousers.staff_lname}`}
                  </TableCell>
                  <TableCell>
                    {log.users_logs_dele_processor_idTousers.position}
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/logs/delegation/${log.delegation_request_id}`}
                    >
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
