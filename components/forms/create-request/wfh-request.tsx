'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { toast } from '@/components/ui/use-toast';

type RequestFormData = {
  timeslot: string;
  dates: Date[];
  reason: string;
  document: File | undefined;
};

export default function CreateRequestForm() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RequestFormData>({
    defaultValues: {
      timeslot: '',
      dates: [],
      reason: '',
      document: undefined
    }
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);

    try {
      let documentUrl = null;

      // 1. Upload the document (if it exists)
      if (data.document) {
        const fileFormData = new FormData();
        fileFormData.append('document', data.document);

        const uploadResponse = await fetch('/api/documents', {
          method: 'POST',
          body: fileFormData
        });

        if (!uploadResponse.ok) {
          const contentType = uploadResponse.headers.get('content-type');
          if (contentType && contentType.indexOf('application/json') !== -1) {
            const uploadErrorData = await uploadResponse.json();
            throw new Error(uploadErrorData.error || 'Document upload failed');
          } else {
            const textError = await uploadResponse.text();
            throw new Error(`Document upload failed: ${textError}`);
          }
        }

        const uploadData = await uploadResponse.json();
        documentUrl = uploadData.url;
      } else {
        documentUrl = null;
      }

      // 2. Submit the form data
      const formDataPayload = {
        staff_id: Number(session?.user?.staff_id),
        timeslot: data.timeslot,
        dates: JSON.stringify(
          data.dates.map((date) => format(date, 'yyyy-MM-dd'))
        ),
        reason: data.reason,
        approved: 'Pending',
        document_url: documentUrl
      };

      const response = await fetch(
        `/api/requests/by-staff/${session?.user?.staff_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formDataPayload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      toast({
        title: 'Success',
        description: 'Your WFH request has been submitted.'
      });

      form.reset();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while submitting the request',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="timeslot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timeslot</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timeslot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AM">Morning</SelectItem>
                  <SelectItem value="PM">Afternoon</SelectItem>
                  <SelectItem value="Fullday">Full Day</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the time slot for your WFH request.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dates"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select Dates</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[300px] justify-start text-left font-normal',
                        !field.value.length && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value.length > 0 ? (
                        field.value
                          .map((date) => format(date, 'MMM d, yyyy'))
                          .join(', ')
                      ) : (
                        <span>Pick dates</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="multiple"
                    selected={field.value}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the dates for your WFH request.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your reason for WFH"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a brief explanation for your WFH request.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Document</FormLabel>
              <FormControl>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormDescription>
                Attach a supporting document (optional).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </Form>
  );
}
