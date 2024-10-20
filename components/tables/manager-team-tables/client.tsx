'use client';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { columns } from './columns'; // Import the updated columns
import React from 'react';
import { requests } from '@prisma/client';

interface UserClientProps {
  data: requests[]; // Update the prop type to match request data
}

export const UserClient: React.FC<UserClientProps> = ({ data }) => {
  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-4"></div>
      <Separator />
      <DataTable searchKey="reason" columns={columns} data={data} />{' '}
      {/* Update searchKey as appropriate */}
    </div>
  );
};
