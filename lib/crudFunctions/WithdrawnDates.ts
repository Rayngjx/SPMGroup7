'use server';
import { db } from '@/lib/db';

interface WithdrawnDatesPayload {
  staff_id: number;
  withdraw_request_id: number;
  date: string; // Use string for date, convert later to Date object
}

// Get all withdrawn dates
export async function getWithdrawnDates() {
  const response = await db.withdrawn_dates.findMany();
  return response ? response : null;
}

// Get withdrawn dates of a user
export async function getUserWithdrawnDates(userStaffId: number) {
  const response = await db.withdrawn_dates.findMany({
    where: { staff_id: userStaffId }
  });
  return response ? response : null;
}

// Get withdrawn dates of team members
export async function getTeamWithdrawnDates(teamleadId: number) {
  // Find all staff_ids where reporting_manager is teamleadId
  const teamMembers = await db.users.findMany({
    where: { reporting_manager: teamleadId },
    select: { staff_id: true }
  });

  const staffIds = teamMembers.map((member) => member.staff_id);

  // Pull all withdrawn dates for those staff_ids
  const withdrawnDates = await db.withdrawn_dates.findMany({
    where: {
      staff_id: { in: staffIds }
    }
  });

  return withdrawnDates.length > 0 ? withdrawnDates : null;
}

// Get withdrawn dates of a department
export async function getDpmtWithdrawnDates(deptId: number) {
  // Find all users with dept_id equal to deptId
  const departmentMembers = await db.users.findMany({
    where: { dept_id: deptId },
    select: { staff_id: true }
  });

  const staffIds = departmentMembers.map((member) => member.staff_id);

  // Get withdrawn dates for those staff_ids
  const withdrawnDates = await db.withdrawn_dates.findMany({
    where: {
      staff_id: { in: staffIds }
    }
  });

  return withdrawnDates.length > 0 ? withdrawnDates : null;
}

// Create withdrawn dates entry
export async function createWithdrawnDates(payload: WithdrawnDatesPayload) {
  const response = await db.withdrawn_dates.create({
    data: {
      ...payload,
      date: new Date(payload.date) // Ensure date is stored as a Date object
    }
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}

// Update withdrawn dates entry
export async function updateWithdrawnDates(payload: WithdrawnDatesPayload) {
  const response = await db.withdrawn_dates.update({
    where: {
      staff_id_withdraw_request_id_date: {
        staff_id: payload.staff_id,
        withdraw_request_id: payload.withdraw_request_id,
        date: new Date(payload.date) // Convert to Date object
      }
    },
    data: payload // Update non-key fields if applicable
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}

// Delete withdrawn dates entry
export async function deleteWithdrawnDates(payload: WithdrawnDatesPayload) {
  const response = await db.withdrawn_dates.delete({
    where: {
      staff_id_withdraw_request_id_date: {
        staff_id: payload.staff_id,
        withdraw_request_id: payload.withdraw_request_id,
        date: new Date(payload.date) // Ensure date is handled as a Date object
      }
    }
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}
