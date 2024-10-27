import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { MoreHorizontal } from 'lucide-react';
import { requests } from '@prisma/client';
import { isAfter, startOfDay } from 'date-fns';

interface RequestActionsProps {
  request: requests;
  onCancelRequest: (requestId: number) => Promise<void>;
  onWithdrawRequest: (requestId: number, reason: string) => Promise<void>;
  refreshRequests: () => void;
}

export default function RequestActions({
  request,
  onCancelRequest,
  onWithdrawRequest,
  refreshRequests
}: RequestActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    request.date ? new Date(request.date) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the request date has passed
  const isDatePassed = () => {
    const requestDate = new Date(request.date);
    const today = startOfDay(new Date());
    return !isAfter(requestDate, today);
  };

  const handleEditRequest = async () => {
    if (!selectedDate) return;
    console.log({
      request_id: request.request_id,
      new_date: selectedDate.toISOString().split('T')[0]
    });
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: request.request_id,
          new_date: selectedDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update request date');
      }

      await refreshRequests(); // Wait for refresh to complete
      setShowEditDialog(false); // Close dialog after refresh
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawCancel = async () => {
    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: request.request_id,
          status: 'approved',
          reason: 'Withdraw request cancelled',
          processor_id: request.staff_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel withdraw request');
      }

      await refreshRequests(); // Wait for refresh to complete
    } catch (error) {
      console.error('Error cancelling withdraw request:', error);
    }
  };

  const getActions = () => {
    // If date has passed, return no actions
    if (isDatePassed()) {
      return null;
    }

    switch (request.status) {
      case 'pending':
        return [
          <DropdownMenuItem key="edit" onSelect={() => setShowEditDialog(true)}>
            Edit Request
          </DropdownMenuItem>,
          <DropdownMenuItem
            key="cancel"
            onSelect={() => onCancelRequest(request.request_id)}
          >
            Cancel Request
          </DropdownMenuItem>
        ];
      case 'withdraw_pending':
        return [
          <DropdownMenuItem
            key="withdrawCancel"
            onSelect={handleWithdrawCancel}
          >
            Cancel Withdraw Request
          </DropdownMenuItem>
        ];
      case 'approved':
        return [
          <DropdownMenuItem
            key="withdraw"
            onSelect={() =>
              onWithdrawRequest(request.request_id, 'Withdrawal requested')
            }
          >
            Withdraw Request
          </DropdownMenuItem>
        ];
      default:
        return null;
    }
  };

  const actions = getActions();
  if (!actions) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{actions}</DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setShowEditDialog(open);
            if (!open) {
              setSelectedDate(
                request.date ? new Date(request.date) : undefined
              );
            }
          }
        }}
      >
        <DialogContent
          className="sm:max-w-[425px]"
          aria-describedby="dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Edit Request Date</DialogTitle>
            <DialogDescription id="dialog-description">
              Select a new date for your work from home request. Only future
              dates are available.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date < startOfDay(new Date())}
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  if (isSubmitting) {
                    e.preventDefault();
                  }
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="submit"
                disabled={!selectedDate || isSubmitting}
                onClick={async (e) => {
                  if (!selectedDate || isSubmitting) {
                    e.preventDefault();
                    return;
                  }
                  setIsSubmitting(true);
                  try {
                    // Adjust the date to local timezone
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(
                      2,
                      '0'
                    );
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;

                    const response = await fetch('/api/requests', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        request_id: request.request_id,
                        new_date: formattedDate,
                        status: 'pending',
                        processor_id: request.staff_id
                      })
                    });

                    if (!response.ok) {
                      throw new Error('Failed to update request date');
                    }

                    await refreshRequests();
                  } catch (error) {
                    console.error('Error updating request:', error);
                    e.preventDefault();
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? 'Updating...' : 'Update Date'}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
