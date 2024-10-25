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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import { requests } from '@prisma/client';
import { ArrowUpDown, Plus } from 'lucide-react';
import CreateRequestForm from '@/components/forms/create-request/wfh-request';
import RequestActions from './request-actions-dropdown';
import { useSession } from 'next-auth/react';

interface RequestListProps {
  requests: requests[];
  onCancelRequest?: (requestId: number) => Promise<void>;
  onWithdrawRequest?: (requestId: number, reason: string) => Promise<void>;
}

export default function RequestList({
  requests,
  onCancelRequest,
  onWithdrawRequest
}: RequestListProps) {
  const { data: session } = useSession();
  const [processedRequests, setProcessedRequests] = useState<
    (requests & { processorName?: string })[]
  >([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof requests;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  });

  useEffect(() => {
    const fetchProcessorNames = async () => {
      const updatedRequests = await Promise.all(
        requests.map(async (request) => {
          let processorName;
          if (request.processor_id) {
            try {
              const response = await fetch(
                `/api/users?staff_id=${request.processor_id}`
              );
              if (response.ok) {
                const userData = await response.json();
                if (userData && userData.staff_fname && userData.staff_lname) {
                  processorName = `${userData.staff_fname} ${userData.staff_lname}`;
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }
          return {
            ...request,
            processorName
          };
        })
      );
      setProcessedRequests(updatedRequests);
    };
    fetchProcessorNames();
  }, [requests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
      case 'withdraw_pending':
        return 'bg-yellow-500';
      case 'rejected':
      case 'withdraw_rejected':
        return 'bg-red-500';
      case 'withdrawn':
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getRequestType = (status: string) => {
    return ['withdraw_pending', 'withdrawn', 'withdraw_rejected'].includes(
      status
    )
      ? 'Withdraw'
      : 'WFH';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return 'N/A';
    try {
      return format(parseISO(dateTimeString), 'MMM d, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date and time:', error);
      return dateTimeString;
    }
  };

  const sortData = (key: keyof requests) => {
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
    if (!sortConfig) return processedRequests;
    return [...processedRequests].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getFilteredData = () => {
    return getSortedData().filter((request) => {
      return (
        (filters.type === '' ||
          getRequestType(request.status) === filters.type) &&
        (filters.status === '' || request.status === filters.status)
      );
    });
  };

  const refreshRequests = async () => {
    if (session?.user?.staff_id) {
      const response = await fetch(
        `/api/requests?staff_id=${session.user.staff_id}`
      );
      if (response.ok) {
        const newRequests = await response.json();
        setProcessedRequests(newRequests);
      }
    }
  };

  return (
    <Card className="h-[calc(100vh-100px)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Requests</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New WFH Request</DialogTitle>
            </DialogHeader>
            <CreateRequestForm />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <div className="mb-4 flex space-x-4 p-4">
          <Select
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="WFH">WFH</SelectItem>
              <SelectItem value="Withdraw">Withdraw</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Scrollable area */}
        <div className="relative max-h-[calc(100vh-300px)] overflow-auto">
          <Table>
            {/* Sticky Table Header */}
            <TableHeader className="sticky top-0 bg-white shadow">
              <TableRow>
                <TableHead onClick={() => sortData('status')}>
                  Type{' '}
                  {sortConfig?.key === 'status' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead onClick={() => sortData('date')}>
                  Date{' '}
                  {sortConfig?.key === 'date' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead onClick={() => sortData('last_updated')}>
                  Last Updated{' '}
                  {sortConfig?.key === 'last_updated' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Processor</TableHead>
                <TableHead onClick={() => sortData('status')}>
                  Status{' '}
                  {sortConfig?.key === 'status' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            {/* Table Body */}
            <TableBody>
              {getFilteredData().map((request) => (
                <TableRow key={request.request_id}>
                  <TableCell>{getRequestType(request.status)}</TableCell>
                  <TableCell>{formatDate(request.date.toString())}</TableCell>
                  <TableCell>
                    {formatDateTime(request.last_updated.toString())}
                  </TableCell>
                  <TableCell>
                    {request.document_url ? (
                      <a
                        href={request.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{request.timeslot || 'N/A'}</TableCell>
                  <TableCell>
                    {request.processorName ||
                      (request.processor_id
                        ? `ID: ${request.processor_id}`
                        : 'N/A')}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <RequestActions
                      request={request}
                      onCancelRequest={
                        onCancelRequest || (() => Promise.resolve())
                      }
                      onWithdrawRequest={
                        onWithdrawRequest || (() => Promise.resolve())
                      }
                      refreshRequests={refreshRequests}
                    />
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
