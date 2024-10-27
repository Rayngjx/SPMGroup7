'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
// import { User } from '@/constants/data';
import { Checkbox } from '@/components/ui/checkbox';
import { users } from '@prisma/client';

export const columns: ColumnDef<users>[] = [
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
    accessorKey: 'staff_id',
    header: 'Staff ID'
  },
  {
    id: 'fullName', // unique identifier for the column
    header: 'Full Name',
    accessorFn: (row) => `${row.staff_fname} ${row.staff_lname}`,
    cell: ({ row }) => (
      <div>
        {row.original.staff_fname} {row.original.staff_lname}
      </div>
    )
  },
  {
    accessorKey: 'position',
    header: 'Position'
  },
  {
    accessorKey: 'department',
    header: 'Department'
  }
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <CellAction data={row.original} />
  // }
];
