'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';

interface UnifiedRequest {
  request_id: number;
  staff_id: number;
  timeslot: string | null;
  date: Date;
  reason: string | null;
  status:
    | 'approved'
    | 'withdraw_pending'
    | 'rejected'
    | 'withdrawn'
    | 'pending';
  document_url: string | null;
  created_at: Date | null;
  last_updated: Date | null;
  temp_replacement: number | null;
}

export default function RequestList() {
  const { data: session, status } = useSession();
  const [pendingRequests, setPendingRequests] = useState<UnifiedRequest[]>([]);
  const [filter, setFilter] = useState<'All' | 'WFH' | 'Withdraw'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.staff_id) {
      const fetchRequests = async (staffId: number) => {
        try {
          const response = await fetch(`/api/requests/?staff_id=${staffId}`);

          if (!response.ok) {
            throw new Error('Failed to fetch requests');
          }

          const requestsData: UnifiedRequest[] = await response.json();

          const pendingRequests = requestsData.filter(
            (req) =>
              req.status === 'pending' || req.status === 'withdraw_pending'
          );

          setPendingRequests(pendingRequests);
          console.log(pendingRequests);
        } catch (error) {
          console.error('Error fetching requests:', error);
        }
      };

      fetchRequests(session.user.staff_id);

      const pollInterval = setInterval(
        () => fetchRequests(session.user.staff_id),
        30000
      );
      return () => clearInterval(pollInterval);
    }
  });

  const filteredRequests = pendingRequests.filter(
    (req) =>
      filter === 'All' ||
      (filter === 'WFH' && req.status === 'pending') ||
      (filter === 'Withdraw' && req.status === 'withdraw_pending')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Requests</CardTitle>
        <Select
          value={filter}
          onValueChange={(value: 'All' | 'WFH' | 'Withdraw') =>
            setFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter requests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Requests</SelectItem>
            <SelectItem value="WFH">WFH Requests</SelectItem>
            <SelectItem value="Withdraw">Withdraw Requests</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {filteredRequests.map((request) => (
            <RequestItem
              key={`${request.status}-${request.request_id}`}
              request={request}
            />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function RequestItem({ request }: { request: UnifiedRequest }) {
  return (
    <div className="mb-4 rounded border p-4">
      <h3 className="font-bold">
        {request.status === 'withdraw_pending' ? 'Withdraw' : 'WFH'} Request
      </h3>
      <p>Date: {format(parseISO(request.date.toString()), 'MMM d, yyyy')}</p>
      {request.timeslot && <p>Timeslot: {request.timeslot}</p>}
      {request.reason && <p>Reason: {request.reason}</p>}
      <p>Status: {request.status}</p>
    </div>
  );
}
