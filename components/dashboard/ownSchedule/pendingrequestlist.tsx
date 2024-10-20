import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';

interface PendingRequest {
  id?: number;
  request_id: number; // Add this line
  date: string;
  status: string;
  reason?: string;
  timeslot?: string;
}

interface PendingRequestListProps {
  requests: PendingRequest[];
  onCancelRequest: (requestId: number) => void;
}

export default function PendingRequestList({
  requests,
  onCancelRequest
}: PendingRequestListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'withdraw_pending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRequestType = (status: string) => {
    return status === 'pending' ? 'WFH Request' : 'Withdraw Request';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {requests.map((request) => (
            <AccordionItem
              key={request.request_id}
              value={request.request_id.toString()}
            >
              <AccordionTrigger className="flex justify-between">
                <span className={getStatusColor(request.status)}>
                  {getRequestType(request.status)}
                </span>
                <span>{format(parseISO(request.date), 'MMM d, yyyy')}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  <strong>Status:</strong> Pending
                </p>
                {request.timeslot && (
                  <p>
                    <strong>Timeslot:</strong> {request.timeslot}
                  </p>
                )}
                {request.reason && (
                  <p>
                    <strong>Reason:</strong> {request.reason}
                  </p>
                )}
                <Button
                  onClick={() => onCancelRequest(request.request_id)}
                  className="mt-2"
                  variant="destructive"
                >
                  Cancel Request
                </Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
