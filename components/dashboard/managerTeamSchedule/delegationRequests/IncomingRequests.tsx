import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { DelegationRequest } from '../types';

export const IncomingRequests = () => {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<DelegationRequest[]>([]);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `/api/delegation-requests?delegated_to=${session?.user?.staff_id}`
      );
      const data = await response.json();
      //filter data to only show pending requests
      const filteredData = data.filter(
        (request: DelegationRequest) =>
          request.status === 'pending' || 'approved'
      );
      setRequests(filteredData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [session]);

  const handleAction = async (
    requestId: number,
    action: string,
    reason: string
  ) => {
    try {
      await fetch('/api/delegation-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegation_request: requestId,
          status: action,
          reason,
          processor_id: session?.user?.staff_id
        })
      });

      toast({
        title: 'Success',
        description: `Request ${action} successfully`
      });
      fetchRequests();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} request`,
        variant: 'destructive'
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Requestor</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.delegation_request}>
            <TableCell>
              {request.users_delegation_requests_staff_idTousers.staff_fname}{' '}
              {request.users_delegation_requests_staff_idTousers.staff_lname}
            </TableCell>
            <TableCell>
              {request.users_delegation_requests_staff_idTousers.department}
            </TableCell>
            <TableCell>
              {request.users_delegation_requests_staff_idTousers.position}
            </TableCell>
            <TableCell>{request.status}</TableCell>
            <TableCell>
              {request.status === 'pending' && (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleAction(
                        request.delegation_request,
                        'approved',
                        'Request approved'
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleAction(
                        request.delegation_request,
                        'rejected',
                        'Request rejected'
                      )
                    }
                  >
                    Reject
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
