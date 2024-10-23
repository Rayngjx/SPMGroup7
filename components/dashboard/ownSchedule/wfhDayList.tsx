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
import { format, parseISO, isAfter, addDays, startOfDay } from 'date-fns';
import { requests } from '@prisma/client';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface WfhDaysProps {
  requests: requests[];
  onWithdrawRequest: (requestId: number, reason: string) => Promise<void>;
}

export default function WfhDays({ requests, onWithdrawRequest }: WfhDaysProps) {
  const [withdrawReasons, setWithdrawReasons] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReasonChange = (requestId: number, reason: string) => {
    setWithdrawReasons((prev) => ({ ...prev, [requestId]: reason }));
  };

  const isWithdrawAllowed = (date: string, status: string) => {
    // Don't allow withdrawal if status is already withdraw_pending
    if (status === 'withdraw_pending') {
      return false;
    }

    const wfhDate = parseISO(date);
    const today = startOfDay(new Date());
    const dayBefore = addDays(wfhDate, -1);

    // If today is the day before or later, don't allow withdrawal
    return isAfter(dayBefore, today);
  };

  const getStatusColor = (status: string) => {
    return status === 'withdraw_pending' ? 'text-blue-600' : 'text-green-600';
  };

  const getStatusText = (status: string) => {
    return status === 'withdraw_pending' ? 'WFH Day' : 'WFH Day';
  };

  const handleWithdraw = async (
    requestId: number,
    date: string,
    status: string
  ) => {
    if (!isWithdrawAllowed(date, status)) {
      const message =
        status === 'withdraw_pending'
          ? 'A withdrawal request is already pending for this date.'
          : 'Withdrawal requests must be submitted at least one day before the WFH date.';

      toast({
        title: 'Cannot withdraw request',
        description: message,
        variant: 'destructive'
      });
      return;
    }

    const reason = withdrawReasons[requestId];
    if (!reason?.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for the withdrawal request.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onWithdrawRequest(requestId, reason);
      toast({
        title: 'Success',
        description: 'Withdrawal request submitted successfully.',
        variant: 'default'
      });
      setWithdrawReasons((prev) => {
        const { [requestId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit withdrawal request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Upcoming WFH Days</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {requests.map((request) => {
            const withdrawAllowed = isWithdrawAllowed(
              request.date,
              request.status
            );
            const statusColor = getStatusColor(request.status);
            const statusText = getStatusText(request.status);

            return (
              <AccordionItem
                key={request.request_id}
                value={request.request_id.toString()}
              >
                <AccordionTrigger className="flex justify-between">
                  <span className={statusColor}>{statusText}</span>
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
                  {request.status !== 'withdraw_pending' && (
                    <>
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
                            handleReasonChange(
                              request.request_id,
                              e.target.value
                            )
                          }
                          disabled={!withdrawAllowed || isSubmitting}
                        />
                      </div>
                      <div className="mt-4 flex justify-center">
                        <Button
                          onClick={() =>
                            handleWithdraw(
                              request.request_id,
                              request.date,
                              request.status
                            )
                          }
                          className="px-4 py-2"
                          variant="secondary"
                          disabled={!withdrawAllowed || isSubmitting}
                        >
                          {!withdrawAllowed
                            ? 'Withdrawal no longer allowed'
                            : isSubmitting
                            ? 'Submitting...'
                            : 'Submit Withdraw Request'}
                        </Button>
                      </div>
                      {!withdrawAllowed &&
                        !isSubmitting &&
                        request.status !== 'withdraw_pending' && (
                          <p className="mt-2 text-sm text-red-500">
                            Withdrawal requests must be submitted at least one
                            day before the WFH date.
                          </p>
                        )}
                    </>
                  )}
                  {request.status === 'withdraw_pending' && (
                    <p className="mt-2 text-sm text-blue-500">
                      Your withdrawal request is currently pending approval.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
