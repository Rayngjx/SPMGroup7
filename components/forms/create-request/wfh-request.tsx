'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, isWeekend, isBefore } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const schema = z.object({
  dates: z.array(z.date()).min(1).max(5),
  timeslot: z.string().min(1, 'Time slot is required'),
  reason: z.string().min(1, 'Reason is required'),
  document: z.instanceof(File).optional()
});

type FormData = z.infer<typeof schema>;

export default function CreateRequestForm() {
  const { data: session } = useSession();
  const [existingRequests, setExistingRequests] = useState<Date[]>([]);
  const [monthlyRequestCount, setMonthlyRequestCount] = useState<
    Record<string, number>
  >({});
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const selectedDates = watch('dates');

  useEffect(() => {
    const fetchExistingRequests = async () => {
      if (session?.user?.staff_id) {
        try {
          const response = await fetch(
            `/api/requests?staffId=${session.user.staff_id}`
          );
          if (response.ok) {
            const requests = await response.json();
            const approvedDates = requests
              .filter((r: any) =>
                ['approved', 'pending', 'withdraw_pending'].includes(r.status)
              )
              .map((r: any) => new Date(r.date));
            setExistingRequests(approvedDates);

            const counts: Record<string, number> = {};
            approvedDates.forEach((date: Date) => {
              const monthKey = format(date, 'yyyy-MM');
              counts[monthKey] = (counts[monthKey] || 0) + 1;
            });
            setMonthlyRequestCount(counts);
          } else {
            console.error(
              'Failed to fetch existing requests:',
              await response.text()
            );
          }
        } catch (error) {
          console.error('Error fetching existing requests:', error);
        }
      }
    };
    fetchExistingRequests();
  }, [session]);

  const onSubmit = async (data: FormData) => {
    if (!session?.user?.staff_id || !session.user.reporting_manager) {
      toast({
        title: 'Error',
        description:
          'User session or reporting manager information not found. Please log in again.',
        variant: 'destructive'
      });
      return;
    }

    try {
      let documentUrl = '';
      if (data.document) {
        const formData = new FormData();
        formData.append('document', data.document);
        const uploadResponse = await fetch('/api/documents', {
          method: 'POST',
          body: formData
        });
        if (!uploadResponse.ok) {
          console.error('Document upload failed:', await uploadResponse.text());
          throw new Error('Document upload failed');
        }
        const { url } = await uploadResponse.json();
        documentUrl = url;
      }

      const requests = data.dates.map((date) => ({
        staff_id: session.user.staff_id,
        timeslot: data.timeslot,
        date: format(date, 'yyyy-MM-dd'),
        reason: data.reason,
        status: 'pending',
        document_url: documentUrl,
        processor_id: session.user.reporting_manager
      }));

      console.log('Submitting requests:', JSON.stringify(requests, null, 2));

      const createResponse = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requests)
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Failed to create requests:', errorText);
        throw new Error(`Failed to create requests: ${errorText}`);
      }

      const result = await createResponse.json();
      console.log('Create requests result:', result);

      toast({
        title: 'Success',
        description: `Successfully submitted ${requests.length} WFH request(s).`
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while submitting your requests. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const isDateDisabled = (date: Date) => {
    return (
      isWeekend(date) ||
      isBefore(date, new Date()) ||
      existingRequests.some(
        (existingDate) =>
          format(existingDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    );
  };

  const showMonthlyLimitWarning = (dates: Date[]) => {
    const monthsExceeding = dates.filter((date) => {
      const monthKey = format(date, 'yyyy-MM');
      return (monthlyRequestCount[monthKey] || 0) + 1 > 2;
    });
    return monthsExceeding.length > 0;
  };

  if (!session?.user?.staff_id) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          User session not found. Please log in again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="dates"
        control={control}
        render={({ field }) => (
          <Calendar
            mode="multiple"
            selected={field.value}
            onSelect={field.onChange}
            disabled={isDateDisabled}
            className="rounded-md border"
          />
        )}
      />
      {errors.dates && <p className="text-red-500">{errors.dates.message}</p>}

      {selectedDates &&
        selectedDates.length > 0 &&
        showMonthlyLimitWarning(selectedDates) && (
          <Alert>
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              You are submitting WFH requests for dates in a month where you
              already have 2 confirmed WFH days.
            </AlertDescription>
          </Alert>
        )}

      <Controller
        name="timeslot"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Full Day">Full Day</SelectItem>
              <SelectItem value="AM">Morning</SelectItem>
              <SelectItem value="PM">Afternoon</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
      {errors.timeslot && (
        <p className="text-red-500">{errors.timeslot.message}</p>
      )}

      <Controller
        name="reason"
        control={control}
        render={({ field }) => (
          <Textarea {...field} placeholder="Reason for WFH request" />
        )}
      />
      {errors.reason && <p className="text-red-500">{errors.reason.message}</p>}

      <Controller
        name="document"
        control={control}
        render={({ field }) => (
          <Input
            type="file"
            onChange={(e) => field.onChange(e.target.files?.[0])}
          />
        )}
      />

      <Button type="submit">Submit Request</Button>
    </form>
  );
}
