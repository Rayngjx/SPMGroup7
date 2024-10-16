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
import { format } from 'date-fns';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.staff_id) {
      fetchRequests(session.user.staff_id);
    }
  }, [session, status]);

  const fetchRequests = async (staffId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const [wfhResponse, withdrawResponse] = await Promise.all([
        fetch(`/api/requests/by-staff/${staffId}`),
        fetch(`/api/withdrawRequests/by-staff/${staffId}`)
      ]);

      if (!wfhResponse.ok || !withdrawResponse.ok) {
        throw new Error('Failed to fetch requests');
      }

      const wfhData = await wfhResponse.json();
      const withdrawData = await withdrawResponse.json();

      const pendingWfh: UnifiedRequest[] = wfhData
        .filter((req: any) => req.approved === 'Pending')
        .map((req: any) => ({
          id: req.request_id,
          type: 'WFH',
          dates: req.dates.map((date: string) => new Date(date)),
          reason: req.reason,
          timeslot: req.timeslot,
          approved: req.approved
        }));

      const pendingWithdraw: UnifiedRequest[] = withdrawData
        .filter((req: any) => req.approved === 'Pending')
        .map((req: any) => ({
          id: req.withdraw_request_id,
          type: 'Withdraw',
          dates: new Date(req.date),
          reason: req.reason,
          timeslot: req.timeslot,
          approved: req.approved
        }));

      setPendingRequests([...pendingWfh, ...pendingWithdraw]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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
        {isLoading && <p>Loading requests...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <ScrollArea className="h-[400px] pr-4">
            {filteredRequests.map((request) => (
              <RequestItem
                key={`${request.type}-${request.id}`}
                request={request}
              />
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function RequestItem({ request }: { request: UnifiedRequest }) {
  const getBgColor = (type: 'WFH' | 'Withdraw') => {
    return type === 'WFH' ? 'bg-orange-100' : 'bg-gray-100';
  };

  const getTextColor = (type: 'WFH' | 'Withdraw') => {
    return type === 'WFH' ? 'text-orange-800' : 'text-gray-800';
  };

  const formatDate = (date: Date) => {
    return format(date, 'd MMM');
  };

  return (
    <div className={`mb-4 rounded-lg p-4 ${getBgColor(request.type)}`}>
      <h3 className={`font-bold ${getTextColor(request.type)}`}>
        {request.type} Request
      </h3>
      <p className="text-sm text-gray-600">
        Date(s):{' '}
        {Array.isArray(request.dates)
          ? request.dates.map(formatDate).join(', ')
          : formatDate(request.dates)}
      </p>
      {request.timeslot && (
        <p className="text-sm text-gray-600">Timeslot: {request.timeslot}</p>
      )}
      {request.reason && (
        <p className="text-sm text-gray-600">Reason: {request.reason}</p>
      )}
      <p className="mt-2 text-sm font-semibold text-yellow-600">
        Status: {request.approved}
      </p>
    </div>
  );
}
