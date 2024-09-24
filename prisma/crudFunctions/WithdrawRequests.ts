'use server';
import { db } from '@/lib/db';

interface WithdrawRequestPayload {
  withdraw_request_id?: number; // Optional for create
  staff_id: number;
  timeslot?: string;
  date: string; // Use string for date, convert later to Date object
  reason?: string;
  approved: string;
}

// Get all withdraw requests
export async function getWithdrawRequests() {
  const response = await db.withdraw_requests.findMany();
  return response ? response : null;
}

// Get withdraw requests of a user
export async function getUserWithdrawRequests(userStaffId: number) {
  const response = await db.withdraw_requests.findMany({
    where: { staff_id: userStaffId }
  });
  return response ? response : null;
}

// Get team withdraw requests as manager
export async function getTeamWithdrawRequests(managerStaffId: number) {
  // Find all staff IDs that have the specified manager as their reporting manager
  const teamMembers = await db.users.findMany({
    where: {
      reporting_manager: managerStaffId
    },
    select: {
      staff_id: true // Select only the staff_id
    }
  });

  // Extract staff IDs from the result
  const staffIds = teamMembers.map((member) => member.staff_id);

  // Find all withdraw requests for the staff IDs
  const response = await db.withdraw_requests.findMany({
    where: {
      staff_id: {
        in: staffIds
      }
    }
  });

  return response ? response : null;
}

// Create a new withdraw request
export async function createWithdrawRequest(payload: WithdrawRequestPayload) {
  const response = await db.withdraw_requests.create({
    data: {
      staff_id: payload.staff_id,
      timeslot: payload.timeslot,
      date: new Date(payload.date), // Ensure the date is stored as a Date object
      reason: payload.reason,
      approved: payload.approved
    }
  });
  return response
    ? { success: true, request: response }
    : { success: false, error: 'Failed to create withdraw request!' };
}

// Update an existing withdraw request
export async function updateWithdrawRequest(payload: WithdrawRequestPayload) {
  if (!payload.withdraw_request_id) {
    return {
      success: false,
      error: 'Withdraw Request ID is required for updating!'
    };
  }

  const response = await db.withdraw_requests.update({
    where: { withdraw_request_id: payload.withdraw_request_id },
    data: {
      staff_id: payload.staff_id,
      timeslot: payload.timeslot,
      date: new Date(payload.date), // Convert the date to a Date object
      reason: payload.reason,
      approved: payload.approved
    }
  });
  return response
    ? { success: true }
    : { success: false, error: 'Failed to update withdraw request!' };
}

// Delete a withdraw request
export async function deleteWithdrawRequest(withdraw_request_id: number) {
  const response = await db.withdraw_requests.delete({
    where: { withdraw_request_id }
  });
  return response
    ? { success: true }
    : { success: false, error: 'Failed to delete withdraw request!' };
}
