'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { requests } from '@prisma/client';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession
import { useToast } from '@/components/ui/use-toast';

interface CellActionProps {
  data: requests;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const { data: session } = useSession(); // Get the session object
  const router = useRouter();

  const { toast } = useToast();
  const handleWithdraw = async () => {
    if (session?.user?.staff_id) {
      try {
        await updateWithdrawnRequest();
        toast({
          title: 'Withdrawn successfully',
          description: 'Cool beans! The request has been withdrawn.'
        });
        // router.push("/dashboard/manager/my-slaves");
        router.refresh();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'There was a problem with your request.'
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
    }
    setOpen(false);
  };

  async function updateWithdrawnRequest() {
    const response = await fetch(
      `/api/requests?reportingManager=${session?.user.staff_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_id: data.request_id, // Use the actual request ID from the data
          status: 'withdrawn',
          processor_id: session?.user?.staff_id, // Get processor_id from session
          reason: `Withdrawn by manager: [${reason}]` // Reason with input from the modal
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${error.message}`);
    }
  }

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason"
                className="mb-4 mt-2 w-full rounded border border-gray-300 p-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw}>
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">hi</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Withdraw
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
