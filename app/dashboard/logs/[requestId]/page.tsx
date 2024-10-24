'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronLeft, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Log {
  log_id: number;
  staff_id: number;
  request_id: number;
  processor_id: number;
  reason: string;
  action: string;
  created_at: string;
  users_logs_staff_idTousers: { staff_fname: string; staff_lname: string };
  users_logs_processor_idTousers: { staff_fname: string; staff_lname: string };
}

interface Request {
  request_id: number;
  staff_id: number;
  timeslot: string;
  date: string;
  reason: string;
  status: string;
  document_url: string | null;
  created_at: string;
  last_updated: string;
  processor_id: number | null;
  users: {
    staff_fname: string;
    staff_lname: string;
    department: string;
    position: string;
    email: string;
  };
}

export default function RequestLogThread() {
  const { requestId } = useParams();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [request, setRequest] = useState<Request | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchRequest();
  }, [requestId]);

  useEffect(() => {
    if (request && request.document_url) {
      fetchDocumentUrl();
    }
  }, [request]);

  const fetchLogs = async () => {
    const response = await fetch(`/api/logs?requestId=${requestId}`);
    const data = await response.json();
    setLogs(data);
  };

  const fetchRequest = async () => {
    const response = await fetch(`/api/requests?requestId=${requestId}`);
    const data = await response.json();
    setRequest(data);
  };

  const fetchDocumentUrl = async () => {
    const response = await fetch(`/api/documents?requestId=${requestId}`);
    if (response.ok) {
      const data = await response.json();
      setDocumentUrl(data.url);
    } else {
      console.error('Failed to fetch document URL');
      setDocumentUrl(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy HH:mm:ss');
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
      case 'withdraw_approve':
        return 'bg-green-500';
      case 'reject':
      case 'withdraw_reject':
        return 'bg-red-500';
      case 'withdraw':
      case 'withdraw_pending':
        return 'bg-yellow-500';
      case 'cancel':
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
          Request Log Thread - Request ID: {requestId}
        </h1>
      </div>
      <ScrollArea className="h-[calc(100vh-150px)]">
        {request && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold">WFH Request Details</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Staff:</strong> {request.users.staff_fname}{' '}
                    {request.users.staff_lname}
                  </p>
                  <p>
                    <strong>Department:</strong> {request.users.department}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {format(parseISO(request.date), 'MMM d, yyyy')}
                  </p>
                  <p>
                    <strong>Timeslot:</strong> {request.timeslot}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Reason:</strong> {request.reason}
                  </p>
                  <p>
                    <strong>Created At:</strong>{' '}
                    {formatDate(request.created_at)}
                  </p>
                  {documentUrl && (
                    <p>
                      <strong>Document:</strong>{' '}
                      <Link
                        href={documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Document{' '}
                        <ExternalLink className="inline-block h-4 w-4" />
                      </Link>
                    </p>
                  )}
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
                          {log.users_logs_staff_idTousers.staff_fname}{' '}
                          {log.users_logs_staff_idTousers.staff_lname}
                        </p>
                        <p>
                          <strong>Processor:</strong>{' '}
                          {log.users_logs_processor_idTousers.staff_fname}{' '}
                          {log.users_logs_processor_idTousers.staff_lname}
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
        {request && (
          <Card className="mt-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <p>
                  <strong>Current Status:</strong>{' '}
                  <Badge>{request.status}</Badge>
                </p>
                <p>
                  <strong>Last Updated:</strong>{' '}
                  {formatDate(request.last_updated)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </ScrollArea>
    </div>
  );
}
