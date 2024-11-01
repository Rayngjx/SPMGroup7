import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import type { User } from '../types';

interface DelegateRequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const DelegateRequestForm = ({
  onClose,
  onSuccess
}: DelegateRequestFormProps) => {
  const { data: session } = useSession();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const users = await response.json();

        const filteredUsers = users.filter((user: User) => {
          // First, filter out the current user
          if (user.staff_id === session?.user?.staff_id) {
            return false;
          }

          // For role_id 3 (non-directors), only filter out current user
          if (session?.user?.role_id === 3) {
            return user.role_id === 3;
          }

          // For role_id 1 (directors), filter out HR Team
          if (session?.user?.role_id === 1) {
            return user.role_id === 1 && user.position !== 'HR Team';
          }

          return false; // For any other role_id, return no users
        });

        setAvailableUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (session?.user?.staff_id && session?.user?.role_id) {
      fetchUsers();
    }
  }, [session]);

  const handleSubmit = async () => {
    if (!selectedUser || !reason) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/delegation-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: session?.user?.staff_id,
          delegated_to: parseInt(selectedUser),
          reason,
          status: 'pending'
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Delegation request created successfully'
        });
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to create request');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create delegation request',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedUser}>
        <SelectTrigger>
          <SelectValue placeholder="Select user to delegate to" />
        </SelectTrigger>
        <SelectContent>
          {availableUsers.map((user) => (
            <SelectItem key={user.staff_id} value={user.staff_id.toString()}>
              {user.staff_fname} {user.staff_lname} - {user.department} -{' '}
              {user.position}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        placeholder="Reason for delegation"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      <Button onClick={handleSubmit}>Submit Request</Button>
    </div>
  );
};

export default DelegateRequestForm;
