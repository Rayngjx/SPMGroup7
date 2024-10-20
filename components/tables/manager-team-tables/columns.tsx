'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action'; // Assuming you have actions to perform on the requests
import { Checkbox } from '@/components/ui/checkbox';
import { requests } from '@prisma/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const columns: ColumnDef<requests>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'request_id',
    header: 'Request ID'
  },
  {
    accessorKey: 'staff_id',
    header: 'Staff ID'
  },
  {
    accessorKey: 'timeslot',
    header: 'Timeslot'
  },
  {
    accessorKey: 'date',
    header: 'Date'
  },
  {
    accessorKey: 'reason',
    header: 'Reason'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'document_url',
    id: 'document_url',
    header: 'Document URL',
    cell: ({ row }) => {
      const url = row.getValue('document_url');
      return (
        <Button variant={url ? 'default' : 'ghost'}>
          <Link href={url || '#'} target="_blank" rel="noopener noreferrer">
            {url ? 'View Document' : 'No Document'}
          </Link>
        </Button>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} /> // Assuming you have some actions for the requests
  }
];
