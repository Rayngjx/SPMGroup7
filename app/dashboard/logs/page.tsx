'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogsDeleTab } from '@/components/dashboard/logs/LogsDeleTab';
import LogsTab from '@/components/dashboard/logs/LogsTab';

export default function LogsPage() {
  return (
    <Tabs defaultValue="logs" className="h-[calc(100vh-100px)] p-5">
      <TabsList className="ml-4">
        <TabsTrigger value="logs">General Logs</TabsTrigger>
        <TabsTrigger value="delegation">Delegation Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="logs">
        <LogsTab />
      </TabsContent>
      <TabsContent value="delegation">
        <LogsDeleTab />
      </TabsContent>
    </Tabs>
  );
}
