import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { requests } from '@prisma/client';

interface WfhDaysProps {
  requests: requests[];
  onWithdrawRequest: (requestId: number, reason: string) => Promise<void>;
}

export default function WfhDays({ requests, onWithdrawRequest }: WfhDaysProps) {
  const [withdrawReasons, setWithdrawReasons] = useState<{
    [key: number]: string;
  }>({});

  const handleReasonChange = (requestId: number, reason: string) => {
    setWithdrawReasons((prev) => ({ ...prev, [requestId]: reason }));
  };

  const handleWithdraw = async (requestId: number) => {
    const reason = withdrawReasons[requestId] || '';
    await onWithdrawRequest(requestId, reason);
    setWithdrawReasons((prev) => {
      const { [requestId]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Upcoming WFH Days</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {requests.map((request) => (
            <AccordionItem
              key={request.request_id}
              value={request.request_id.toString()}
            >
              <AccordionTrigger className="flex justify-between">
                <span className="text-green-600">WFH Day</span>
                <span>{format(parseISO(request.date), 'MMM d, yyyy')}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  <strong>Status:</strong> {request.status}
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
                <div className="mt-4 space-y-2">
                  <Label
                    htmlFor={`withdraw-reason-${request.request_id}`}
                    className="text-sm font-medium"
                  >
                    Reason for withdrawal:
                  </Label>
                  <Input
                    id={`withdraw-reason-${request.request_id}`}
                    className="w-full rounded-md border-2 border-gray-300 p-2 focus:border-blue-500"
                    placeholder="Enter reason for withdrawal"
                    value={withdrawReasons[request.request_id] || ''}
                    onChange={(e) =>
                      handleReasonChange(request.request_id, e.target.value)
                    }
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => handleWithdraw(request.request_id)}
                    className="px-4 py-2"
                    variant="secondary"
                  >
                    Submit Withdraw Request
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
