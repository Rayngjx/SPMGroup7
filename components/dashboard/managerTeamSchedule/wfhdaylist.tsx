'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from 'lucide-react';
import { requests, users } from '@prisma/client';

interface EnrichedRequest extends requests {
  userDetails?: users;
}

export default function WfhdayList() {
  const { data: session } = useSession();
  const [teamRequests, setTeamRequests] = useState<EnrichedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [selectedRequest, setSelectedRequest] =
    useState<EnrichedRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.staff_id) return;

      try {
        // Fetch requests
        const requestsResponse = await fetch(
          `/api/requests?reportingManager=${session.user.staff_id}`
        );
        if (!requestsResponse.ok) {
          throw new Error('Failed to fetch requests');
        }
        const requestsData = await requestsResponse.json();

        // Filter for approved/withdraw_pending requests and future dates
        const filteredRequests = requestsData
          .filter(
            (request: requests) =>
              (request.status === 'approved' ||
                request.status === 'withdraw_pending') &&
              new Date(request.date) >= new Date()
          )
          .sort(
            (a: requests, b: requests) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        // Get unique staff IDs from filtered requests
        const staffIds = [
          ...new Set(
            filteredRequests
              .map((request) => request.staff_id)
              .filter((id): id is number => id !== null)
          )
        ];

        // Fetch user details for all staff IDs
        const userDetailsPromises = staffIds.map((staffId) =>
          fetch(`/api/users?staff_id=${staffId}`).then((res) => res.json())
        );

        const userDetailsResponses = await Promise.all(userDetailsPromises);

        // Create a map of staff_id to user details
        const userMap = new Map<number, users>();
        userDetailsResponses.forEach((user) => {
          if (user && user.staff_id) {
            userMap.set(user.staff_id, user);
          }
        });

        // Combine requests with user details
        const enrichedRequests = filteredRequests.map(
          (request: EnrichedRequest) => ({
            ...request,
            userDetails: request.staff_id
              ? userMap.get(request.staff_id)
              : undefined
          })
        );

        setTeamRequests(enrichedRequests);
      } catch (error) {
        setError('Failed to fetch team requests');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleForceWithdraw = async () => {
    if (!selectedRequest || !withdrawReason.trim() || !session?.user?.staff_id)
      return;

    try {
      const response = await fetch('/api/requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: selectedRequest.request_id,
          status: 'withdrawn',
          reason: withdrawReason,
          processor_id: session.user.staff_id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to withdraw request');
      }

      // Update local state
      setTeamRequests((prev) =>
        prev.filter((req) => req.request_id !== selectedRequest.request_id)
      );

      setShowDialog(false);
      setWithdrawReason('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to withdraw request');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Team WFH Days Management
        </CardTitle>
        <CardDescription>
          Manage upcoming work from home days for your team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {teamRequests.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No upcoming WFH days found for your team members
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timeslot</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamRequests.map((request) => (
                <TableRow key={request.request_id}>
                  <TableCell className="font-medium">
                    {request.userDetails &&
                      `${request.userDetails.staff_fname} ${request.userDetails.staff_lname}`}
                  </TableCell>
                  <TableCell>{formatDate(request.date)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell>{request.timeslot}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={
                        showDialog &&
                        selectedRequest?.request_id === request.request_id
                      }
                      onOpenChange={(open) => {
                        setShowDialog(open);
                        if (!open) setSelectedRequest(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Force Withdraw
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Force Withdraw WFH Request</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to force withdraw this WFH
                            request for&nbsp;
                            {request.userDetails &&
                              `${request.userDetails.staff_fname} ${request.userDetails.staff_lname}`}
                            ? Please provide a reason for withdrawing.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <Input
                            placeholder="Enter reason for withdrawal"
                            value={withdrawReason}
                            onChange={(e) => setWithdrawReason(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDialog(false);
                              setSelectedRequest(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleForceWithdraw}
                            disabled={!withdrawReason.trim()}
                          >
                            Confirm Withdrawal
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
