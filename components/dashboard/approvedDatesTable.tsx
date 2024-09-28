'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import {
  deleteApproveDates,
  getApprovedDates
} from '@/lib/crudFunctions/ApprovedDates';
import { approved_dates } from '@prisma/client';
import { date } from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Define types for data structures
interface TimeOffHistory {
  month: string;
  days: number;
}

interface RequestedTimeOff {
  type: string;
  dateFrom: string;
  dateTo: string;
  duration: string;
  action: string;
}

interface TimeOffRequest {
  type: string;
  dateFrom: string;
  dateTo: string;
  duration: string;
}

// Define the state structure
interface LeaveInfo {
  availableDays: number;
  pendingRequests: number;
  daysPerYear: number;
  daysUpcoming: number;
  requestedTimeOff: RequestedTimeOff[];
  timeOffHistory: TimeOffHistory[];
  timeOffRequests: TimeOffRequest[];
}

export default function ApprovedDatesTable() {
  const [leaveInfo, setLeaveInfo] = useState<LeaveInfo>({
    availableDays: 7,
    pendingRequests: 4,
    daysPerYear: 25,
    daysUpcoming: 0,
    requestedTimeOff: [
      {
        type: 'Sick',
        dateFrom: '18/01/2020',
        dateTo: '18/01/2020',
        duration: '11 hours',
        action: 'Declined'
      },
      {
        type: 'Time off',
        dateFrom: '15/03/2020',
        dateTo: '15/03/2020',
        duration: '48 hours',
        action: 'Accepted'
      },
      {
        type: 'Holiday',
        dateFrom: '28/04/2020',
        dateTo: '28/04/2020',
        duration: '12 hours',
        action: 'Requested'
      }
    ],
    timeOffHistory: [
      { month: 'Jan', days: 2 },
      { month: 'Feb', days: 4 },
      { month: 'Mar', days: 7 }
    ],
    timeOffRequests: [
      {
        type: 'Holiday',
        dateFrom: '12/02/2020',
        dateTo: '12/02/2020',
        duration: '13 hours'
      },
      {
        type: 'Sick',
        dateFrom: '18/04/2020',
        dateTo: '18/04/2020',
        duration: '24 hours'
      },
      {
        type: 'Family Time',
        dateFrom: '22/05/2020',
        dateTo: '22/05/2020',
        duration: '17 hours'
      }
    ]
  });

  // useEffect( () => {
  //   // Fetch leave information from the server
  //   const getUsers = await db.users.findMany({ where: { staff_id: 130002 }
  //   })
  //   console.log(getUsers)
  // }, []);
  const [approvedDates, setApprovedDates] = useState<approved_dates[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getApprovedDates();
        console.log(response);
        if (!response) {
          throw new Error('Error fetching users');
        }
        // const data = await response.json();

        // Assuming response is in the format provided in the example
        const formattedData = response.map((item: any) => ({
          staff_id: item.staff_id,
          request_id: item.request_id,
          date: item.date // Formatting the date for display
        }));

        // Update state with the formatted data
        setApprovedDates(formattedData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
      }
    };

    fetchUsers();
  }, []);

  const handleButtonClick = async (data: any) => {
    const deleteRes = await deleteApproveDates(data);

    console.log(deleteRes);
    router.refresh();
    return deleteRes;
  };

  return (
    <>
      <h3>Approved Time Off Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Staff ID</th>
            <th>Request ID</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {approvedDates.map((dateItem, index) => (
            <tr key={index}>
              <td>{dateItem.staff_id}</td>
              <td>{dateItem.request_id}</td>
              <td>{new Date(dateItem.date).toLocaleDateString()}</td>
              <td>
                <Button
                  variant={'destructive'}
                  onClick={() => handleButtonClick(dateItem)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
