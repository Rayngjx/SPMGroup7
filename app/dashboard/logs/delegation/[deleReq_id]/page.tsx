'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface LogDele {
  log_id: number;
  staff_id: number;
  delegation_request_id: number;
  processor_id: number;
  reason: string;
  action: string;
  created_at: string;
  users_logs_dele_staff_idTousers: { staff_fname: string; staff_lname: string };
  users_logs_dele_processor_idTousers: {
    staff_fname: string;
    staff_lname: string;
  };
}

interface DelegationRequest {
  delegation_request: number;
  staff_id: number;
  delegated_to: number;
  status: string;
  created_at: string;
  users_delegation_requests_staff_idTousers: {
    staff_fname: string;
    staff_lname: string;
    department: string;
    position: string;
    email: string;
  };
  users_delegation_requests_delegated_toTousers: {
    staff_fname: string;
    staff_lname: string;
    department: string;
    position: string;
    email: string;
  };
}

export default function DelegationRequestLogThread() {
  const { deleReq_id } = useParams();
  const router = useRouter();
  const [logs, setLogs] = useState<LogDele[]>([]);
  const [request, setRequest] = useState<DelegationRequest | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchRequest();
  }, [deleReq_id]);

  const fetchLogs = async () => {
    const response = await fetch(
      `/api/logs-dele?delegationRequestId=${deleReq_id}`
    );
    const data = await response.json();
    setLogs(data);
  };

  const fetchRequest = async () => {
    const response = await fetch(
      `/api/delegation-requests?delegationRequestId=${deleReq_id}`
    );
    const data = await response.json();
    setRequest(data);
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy HH:mm:ss');
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'delegation_approve':
        return 'bg-green-500';
      case 'delegation_reject':
        return 'bg-red-500';
      case 'request':
        return 'bg-blue-300';
      case 'redacted':
        return 'bg-purple-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Logs
        </Button>
        <h1 className="text-2xl font-bold">
          Delegation Request Log Thread - Request ID: {deleReq_id}
        </h1>
      </div>
      <ScrollArea className="h-[calc(100vh-150px)]">
        {request && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Delegation Request Details
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Requestor:</strong>{' '}
                    {
                      request.users_delegation_requests_staff_idTousers
                        .staff_fname
                    }{' '}
                    {
                      request.users_delegation_requests_staff_idTousers
                        .staff_lname
                    }
                  </p>
                  <p>
                    <strong>Requestor Department:</strong>{' '}
                    {
                      request.users_delegation_requests_staff_idTousers
                        .department
                    }
                  </p>
                  <p>
                    <strong>Requestor Position:</strong>{' '}
                    {request.users_delegation_requests_staff_idTousers.position}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Delegated To:</strong>{' '}
                    {
                      request.users_delegation_requests_delegated_toTousers
                        .staff_fname
                    }{' '}
                    {
                      request.users_delegation_requests_delegated_toTousers
                        .staff_lname
                    }
                  </p>
                  <p>
                    <strong>Delegate Department:</strong>{' '}
                    {
                      request.users_delegation_requests_delegated_toTousers
                        .department
                    }
                  </p>
                  <p>
                    <strong>Delegate Position:</strong>{' '}
                    {
                      request.users_delegation_requests_delegated_toTousers
                        .position
                    }
                  </p>
                </div>
                <div className="col-span-2">
                  <p>
                    <strong>Created At:</strong>{' '}
                    {formatDate(request.created_at)}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge className={getActionColor(request.status)}>
                      {formatAction(request.status)}
                    </Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="space-y-4">
          {logs.map((log) => (
            <Collapsible key={log.log_id}>
              <Card className="mb-2">
                <CollapsibleTrigger className="w-full px-4 py-2 text-left hover:bg-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={getActionColor(log.action)}>
                        {formatAction(log.action)}
                      </Badge>
                      <span className="ml-2 text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p>
                          <strong>Staff:</strong>{' '}
                          {log.users_logs_dele_staff_idTousers.staff_fname}{' '}
                          {log.users_logs_dele_staff_idTousers.staff_lname}
                        </p>
                        <p>
                          <strong>Processor:</strong>{' '}
                          {log.users_logs_dele_processor_idTousers.staff_fname}{' '}
                          {log.users_logs_dele_processor_idTousers.staff_lname}
                        </p>
                      </div>
                      <div>
                        {log.reason && (
                          <p>
                            <strong>Reason:</strong> {log.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
