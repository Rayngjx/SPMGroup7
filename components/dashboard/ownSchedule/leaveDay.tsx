import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

import { format, parseISO } from 'date-fns';
import { requests } from '@prisma/client';
import { useToast } from '@/components/ui/use-toast';

interface WfhDaysProps {
  requests: requests[];
}

export default function LeaveDay({ requests }: WfhDaysProps) {
  const { toast } = useToast();

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Upcoming Leave Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {requests.map((request) => {
            return (
              <AccordionItem
                key={request.request_id}
                value={request.request_id.toString()}
              >
                <AccordionTrigger className="flex justify-between">
                  <span>
                    {format(parseISO(request.date.toString()), 'MMM d, yyyy')}
                  </span>
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
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
