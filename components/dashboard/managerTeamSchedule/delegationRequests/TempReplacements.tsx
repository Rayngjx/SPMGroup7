import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { User } from '../types';

// Add interface for delegation requests
interface DelegationRequest {
  delegation_request: number;
  delegated_to: number;
  status: string;
  users_delegation_requests_delegated_toTousers: {
    staff_fname: string;
    staff_lname: string;
    department: string;
    position: string;
  };
}

const TempReplacements = () => {
  const { data: session } = useSession();
  const [replacements, setReplacements] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DelegationRequest[]>(
    []
  );
  const { toast } = useToast();

  const fetchReplacements = async () => {
    try {
      const response = await fetch(
        `/api/users?temp_replacement=${session?.user?.staff_id}`
      );
      const users = await response.json();
      setReplacements(Array.isArray(users) ? users : [users].filter(Boolean));
    } catch (error) {
      console.error('Error fetching replacements:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch replacements',
        variant: 'destructive'
      });
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(
        `/api/delegation-requests?staff_id=${session?.user?.staff_id}`
      );
      const requests = await response.json();
      // Filter for pending requests
      const pendingReqs = Array.isArray(requests)
        ? requests.filter((req: DelegationRequest) => req.status === 'pending')
        : [];
      setPendingRequests(pendingReqs);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending requests',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (session?.user?.staff_id) {
      fetchReplacements();
      fetchPendingRequests();
    }
  }, [session]);

  const handleRedact = async (userId: number) => {
    try {
      const response = await fetch(
        `/api/delegation-requests?delegated_to=${userId}&staff_id=${session?.user?.staff_id}`
      );
      const requests = await response.json();
      const approvedRequest = requests.find(
        (req: any) => req.status === 'approved'
      );

      if (approvedRequest) {
        await fetch('/api/delegation-requests', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            delegation_request: approvedRequest.delegation_request,
            status: 'redacted',
            reason: 'Delegation redacted by user',
            processor_id: session?.user?.staff_id
          })
        });

        toast({
          title: 'Success',
          description: 'Temporary replacement removed successfully'
        });
        fetchReplacements();
      } else {
        toast({
          title: 'Error',
          description: 'No active delegation request found',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error redacting replacement:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove temporary replacement',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = async (delegationRequestId: number) => {
    try {
      await fetch('/api/delegation-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delegation_request: delegationRequestId,
          status: 'cancelled',
          reason: 'Request cancelled by user',
          processor_id: session?.user?.staff_id
        })
      });

      toast({
        title: 'Success',
        description: 'Delegation request cancelled successfully'
      });
      fetchPendingRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel request',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Replacements Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Active Replacements</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {replacements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No active replacements found
                  </TableCell>
                </TableRow>
              ) : (
                replacements.map((user) => (
                  <TableRow key={user.staff_id}>
                    <TableCell>
                      {user.staff_fname} {user.staff_lname}
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleRedact(user.staff_id)}
                      >
                        Redact
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          Pending Delegation Requests
        </h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delegated To</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No pending requests found
                  </TableCell>
                </TableRow>
              ) : (
                pendingRequests.map((request) => (
                  <TableRow key={request.delegation_request}>
                    <TableCell>
                      {
                        request.users_delegation_requests_delegated_toTousers
                          .staff_fname
                      }{' '}
                      {
                        request.users_delegation_requests_delegated_toTousers
                          .staff_lname
                      }
                    </TableCell>
                    <TableCell>
                      {
                        request.users_delegation_requests_delegated_toTousers
                          .department
                      }
                    </TableCell>
                    <TableCell>
                      {
                        request.users_delegation_requests_delegated_toTousers
                          .position
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleCancel(request.delegation_request)}
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TempReplacements;
