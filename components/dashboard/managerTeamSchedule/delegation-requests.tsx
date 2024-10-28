'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IncomingRequests } from './delegationRequests/IncomingRequests';
import { DelegateRequestForm } from './delegationRequests/DelegationRequestForm';
import TempReplacements from './delegationRequests/TempReplacements';

const DelegationRequests = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [key, setKey] = useState(0); // For forcing re-render of child components

  const handleSuccess = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Delegation Requests</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Delegation Request</DialogTitle>
              </DialogHeader>
              <DelegateRequestForm
                onClose={() => setIsCreateOpen(false)}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="incoming">
          <TabsList>
            <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
            <TabsTrigger value="replacements">My Replacements</TabsTrigger>
          </TabsList>
          <TabsContent value="incoming">
            <IncomingRequests key={`incoming-${key}`} />
          </TabsContent>
          <TabsContent value="replacements">
            <TempReplacements key={`replacements-${key}`} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DelegationRequests;
