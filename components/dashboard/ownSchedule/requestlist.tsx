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
import { Request, WithdrawRequest } from '@/types/db-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';

interface UnifiedRequest {
  id: number;
  type: 'WFH' | 'Withdraw';
  dates: Date | Date[];
  reason?: string;
  timeslot?: string;
  approved: string;
}

export default function RequestList() {
  const { data: session, status } = useSession();
  const [pendingRequests, setPendingRequests] = useState<UnifiedRequest[]>([]);
  const [filter, setFilter] = useState<'All' | 'WFH' | 'Withdraw'>('All');

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.staff_id) {
      const fetchRequests = async (staffId: number) => {
        try {
          const [wfhResponse, withdrawResponse] = await Promise.all([
            fetch(`/api/requests/by-staff/${staffId}`),
            fetch(`/api/withdrawRequests/by-staff/${staffId}`)
          ]);

          if (!wfhResponse.ok || !withdrawResponse.ok) {
            throw new Error('Failed to fetch requests');
          }

          const wfhData: Request[] = await wfhResponse.json();
          const withdrawData: WithdrawRequest[] = await withdrawResponse.json();

          const pendingWfh: UnifiedRequest[] = wfhData
            .filter((req) => req.approved === 'Pending')
            .map((req) => ({
              id: req.request_id,
              type: 'WFH',
              dates: req.dates,
              reason: req.reason,
              timeslot: req.timeslot,
              approved: req.approved
            }));

          const pendingWithdraw: UnifiedRequest[] = withdrawData
            .filter((req) => req.approved === 'Pending')
            .map((req) => ({
              id: req.withdraw_request_id,
              type: 'Withdraw',
              dates: req.date,
              reason: req.reason,
              timeslot: req.timeslot,
              approved: req.approved
            }));
          console.log(pendingWfh, 'wfh');
          console.log(pendingWithdraw, 'wirhdraw');
          setPendingRequests([...pendingWfh, ...pendingWithdraw]);
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
  }, [session, status]);

  const filteredRequests = pendingRequests.filter(
    (req) => filter === 'All' || req.type === filter
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
          <SelectTrigger>
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
              key={`${request.type}-${request.id}`}
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
      <h3 className="font-bold">{request.type} Request</h3>
      <p>
        Date(s):{' '}
        {Array.isArray(request.dates)
          ? request.dates
              .map((d) => format(parseISO(d), 'MMM d, yyyy'))
              .join(', ')
          : format(parseISO(request.dates), 'MMM d, yyyy')}
      </p>
      {request.timeslot && <p>Timeslot: {request.timeslot}</p>}
      {request.reason && <p>Reason: {request.reason}</p>}
      <p>Status: {request.approved}</p>
    </div>
  );
}
