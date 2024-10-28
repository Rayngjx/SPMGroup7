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

const TempReplacements = () => {
  const { data: session } = useSession();
  const [replacements, setReplacements] = useState<User[]>([]);
  const { toast } = useToast();

  const fetchReplacements = async () => {
    try {
      // Fetch all users where temp_replacement equals current user's staff_id
      const response = await fetch(
        `/api/users?temp_replacement=${session?.user?.staff_id}`
      );
      const users = await response.json();

      // If the response is a single user, wrap it in an array
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

  useEffect(() => {
    if (session?.user?.staff_id) {
      fetchReplacements();
    }
  }, [session]);

  const handleRedact = async (userId: number) => {
    try {
      // Find the delegation request
      const response = await fetch(
        `/api/delegation-requests?delegated_to=${userId}&staff_id=${session?.user?.staff_id}`
      );
      const requests = await response.json();
      const approvedRequest = requests.find(
        (req: any) => req.status === 'approved'
      );

      if (approvedRequest) {
        // Update delegation request status to redacted
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

  return (
    <div className="space-y-4">
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
  );
};

export default TempReplacements;
