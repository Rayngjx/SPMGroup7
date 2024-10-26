'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format, isWeekend, isAfter, startOfDay, parseISO } from 'date-fns';

// Type definitions for our data structures
type Request = {
  request_id: number;
  staff_id: number;
  date: string;
  timeslot: string;
  reason: string;
  status: string;
  created_at: string;
  users: {
    staff_fname: string;
    staff_lname: string;
    department: string;
    position: string;
    email: string;
  };
};

type GroupedRequest = {
  staff_id: number;
  created_at: string;
  staffName: string;
  department: string;
  position: string;
  requests: Request[];
  isExpanded: boolean;
  decisions: Record<number, 'approved' | 'rejected' | null>;
};

const ManagerRequestList = () => {
  const { data: session } = useSession();
  const [groupedRequests, setGroupedRequests] = useState<GroupedRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let allRequests: Request[] = [];

        // 1. Check if user is a temp replacement for another manager
        const userResponse = await fetch(
          `/api/users?staff_id=${session?.user.staff_id}`
        );
        const userData = await userResponse.json();

        // 2. Fetch requests from temp replacement team if applicable
        if (userData.temp_replacement) {
          const tempTeamResponse = await fetch(
            `/api/requests?reportingManager=${userData.temp_replacement}`
          );
          const tempTeamRequests = await tempTeamResponse.json();
          allRequests = [...allRequests, ...tempTeamRequests];
        }

        // 3. Fetch requests from manager's own team
        const ownTeamResponse = await fetch(
          `/api/requests?reportingManager=${session?.user.staff_id}`
        );
        const ownTeamRequests = await ownTeamResponse.json();
        allRequests = [...allRequests, ...ownTeamRequests];

        // 4. Filter for pending and upcoming requests
        const pendingRequests = allRequests.filter((req: Request) => {
          const isStatusValid =
            req.status === 'pending' || req.status === 'withdraw_pending';
          const requestDate = parseISO(req.date);
          const isUpcoming =
            isAfter(requestDate, startOfDay(new Date())) ||
            format(requestDate, 'yyyy-MM-dd') ===
              format(new Date(), 'yyyy-MM-dd');
          return isStatusValid && isUpcoming;
        });

        // 5. Fetch all relevant user data
        const uniqueStaffIds = [
          ...new Set(pendingRequests.map((req) => req.staff_id))
        ];
        const userDetailsPromises = uniqueStaffIds.map((staffId) =>
          fetch(`/api/users?staff_id=${staffId}`).then((res) => res.json())
        );
        const userDetails = await Promise.all(userDetailsPromises);
        const userMap = Object.fromEntries(
          userDetails.map((user) => [user.staff_id, user])
        );

        // 6. Group requests
        const grouped = pendingRequests.reduce(
          (acc: GroupedRequest[], request: Request) => {
            // Enhance request with user details
            const userData = userMap[request.staff_id];
            request.users = {
              staff_fname: userData.staff_fname,
              staff_lname: userData.staff_lname,
              department: userData.department,
              position: userData.position,
              email: userData.email
            };

            // Handle withdraw_pending requests separately (no grouping)
            if (request.status === 'withdraw_pending') {
              acc.push({
                staff_id: request.staff_id,
                created_at: request.created_at,
                staffName: `${userData.staff_fname} ${userData.staff_lname}`,
                department: userData.department,
                position: userData.position,
                requests: [request],
                isExpanded: false,
                decisions: { [request.request_id]: null }
              });
              return acc;
            }

            // Find existing group or create new one
            const existingGroupIndex = acc.findIndex(
              (group) =>
                group.staff_id === request.staff_id &&
                group.created_at === request.created_at &&
                request.status === 'pending' // Only group pending requests
            );

            if (existingGroupIndex >= 0) {
              // Add to existing group
              acc[existingGroupIndex].requests.push(request);
              acc[existingGroupIndex].decisions[request.request_id] = null;
            } else {
              // Create new group
              acc.push({
                staff_id: request.staff_id,
                created_at: request.created_at,
                staffName: `${userData.staff_fname} ${userData.staff_lname}`,
                department: userData.department,
                position: userData.position,
                requests: [request],
                isExpanded: false,
                decisions: { [request.request_id]: null }
              });
            }
            return acc;
          },
          []
        );

        // Sort groups by creation date (newest first)
        const sortedGroups = grouped.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setGroupedRequests(sortedGroups);
      } catch (err) {
        setError('Failed to fetch requests');
        console.error(err);
      }
    };

    if (session?.user.staff_id) {
      fetchRequests();
    }
  }, [session]);
  // Toggle group expansion
  const toggleGroup = (index: number) => {
    setGroupedRequests((prev) =>
      prev.map((group, i) => ({
        ...group,
        isExpanded: i === index ? !group.isExpanded : group.isExpanded
      }))
    );
  };

  // Update decision for a request
  const updateDecision = (
    groupIndex: number,
    requestId: number,
    decision: 'approved' | 'rejected'
  ) => {
    setGroupedRequests((prev) => {
      const newGroups = [...prev];
      newGroups[groupIndex].decisions[requestId] = decision;
      return newGroups;
    });
  };

  // Process group decisions
  const processGroupDecisions = async (group: GroupedRequest) => {
    setProcessingRequest(true);
    setError(null);

    // Check if all requests have decisions
    const hasAllDecisions = Object.values(group.decisions).every(
      (d) => d !== null
    );
    if (!hasAllDecisions) {
      setError('Please make decisions for all requests in the group');
      setProcessingRequest(false);
      return;
    }

    try {
      // Process each request in the group
      console.log(group.requests);
      await Promise.all(
        group.requests.map((request) => {
          const decision = group.decisions[request.request_id];
          return fetch(
            `/api/requests?reportingManager=${session?.user.staff_id}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                request_id: request.request_id,
                status: decision,
                reason: `Request ${decision} by manager`,
                processor_id: session?.user.staff_id // TODO: Replace with actual manager ID from session
              })
            }
          );
        })
      );

      // Remove processed group from state
      setGroupedRequests((prev) =>
        prev.filter(
          (g) =>
            g.staff_id !== group.staff_id || g.created_at !== group.created_at
        )
      );
    } catch (err) {
      setError('Failed to process requests');
      console.error(err);
    } finally {
      setProcessingRequest(false);
    }
  };

  return (
    <Card className="w-full min-w-full border-none">
      <CardHeader className="px-6">
        <CardTitle>Request List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {groupedRequests.map((group, groupIndex) => (
          <Card key={`${group.staff_id}-${group.created_at}`} className="mb-4">
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleGroup(groupIndex)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{group.staffName}</h3>
                  <p className="text-sm text-gray-500">
                    {group.department} - {group.position}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </div>
                {group.isExpanded ? <ChevronUp /> : <ChevronDown />}
              </div>
            </CardHeader>

            {group.isExpanded && (
              <CardContent>
                <div className="space-y-4">
                  {group.requests.map((request) => (
                    <div
                      key={request.request_id}
                      className="flex items-center justify-between rounded border p-2"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(request.date).toLocaleDateString()} -{' '}
                          {request.timeslot}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.reason}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {request.status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={
                            group.decisions[request.request_id] === 'approved'
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() =>
                            updateDecision(
                              groupIndex,
                              request.request_id,
                              'approved'
                            )
                          }
                        >
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            group.decisions[request.request_id] === 'rejected'
                              ? 'destructive'
                              : 'outline'
                          }
                          onClick={() =>
                            updateDecision(
                              groupIndex,
                              request.request_id,
                              'rejected'
                            )
                          }
                        >
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => processGroupDecisions(group)}
                      disabled={processingRequest}
                    >
                      Submit Decisions
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default ManagerRequestList;
