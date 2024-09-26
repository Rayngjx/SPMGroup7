'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import {
  deleteApproveDates,
  getApprovedDates,
  getStaffInDepartment
} from '@/lib/crudFunctions/ApprovedDates'; // Make sure this is the correct path
import { approved_dates } from '@prisma/client';
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
    requestedTimeOff: [],
    timeOffHistory: [],
    timeOffRequests: []
  });

  const [approvedDates, setApprovedDates] = useState<approved_dates[]>([]);
  const [staffInDepartment, setStaffInDepartment] = useState<any[]>([]);
  const router = useRouter();

  // Fetch approved dates
  useEffect(() => {
    const fetchApprovedDates = async () => {
      try {
        const response = await getApprovedDates();

        // Check if the response is defined and is an array
        if (response && Array.isArray(response)) {
          const formattedData = response.map((item: any) => ({
            staff_id: item.staff_id,
            request_id: item.request_id,
            date: item.date
          }));
          setApprovedDates(formattedData);
        } else {
          console.warn('No approved dates found or response is not an array.');
        }
      } catch (error) {
        console.error('Error fetching approved dates:', error);
      }
    };

    fetchApprovedDates();
  }, []);

  // Fetch staff in the same department
  useEffect(() => {
    const fetchStaffInDepartment = async () => {
      try {
        const userId = 130002; // Replace with actual user ID
        const staff = await getStaffInDepartment(userId);

        // Check if the staff response is defined and is an array
        if (staff && Array.isArray(staff)) {
          setStaffInDepartment(staff);
        } else {
          console.warn(
            'No staff found in department or response is not an array.'
          );
        }
      } catch (error) {
        console.error('Error fetching staff in department:', error);
      }
    };

    fetchStaffInDepartment();
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
            <th>Actions</th>
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

      <h3>Staff In Your Department</h3>
      <ul>
        {staffInDepartment.map((staff) => (
          <li key={staff.staff_id}>
            {staff.staff_fname} {staff.staff_lname}
          </li>
        ))}
      </ul>
    </>
  );
}
