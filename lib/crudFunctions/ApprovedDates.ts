'use server';
import { db } from '@/lib/db';

interface ApprovedDatesPayload {
  staff_id: number;
  request_id: number;
  date: string; // Use string for date, convert later to Date object
}

// Get all approved dates
export async function getApprovedDates() {
  const response = await db.approved_dates.findMany();
  return response ? response : null;
}

// Get approved dates of user
export async function getUserApprovedDates(userStaffId: number) {
  const response = await db.approved_dates.findMany({
    where: { staff_id: userStaffId }
  });
  return response ? response : null;
}
//Get approved dates of team members
export async function getTeamApprovedDates(teamleadId: number) {
  // Find all staff_ids where reporting_manager is teamleadId
  const teamMembers = await db.users.findMany({
    where: { reporting_manager: teamleadId },
    select: { staff_id: true }
  });

  const staffIds = teamMembers.map((member) => member.staff_id);

  // Pull all approved dates for those staff_ids
  const approvedDates = await db.approved_dates.findMany({
    where: {
      staff_id: { in: staffIds }
    }
  });

  return approvedDates.length > 0 ? approvedDates : null;
}

// Get approved dates of department
export async function getDpmtApprovedDates(deptId: String) {
  // Find all users with dept_id equal to deptId
  const departmentMembers = await db.users.findMany({
    where: { dept_id: deptId },
    select: { staff_id: true }
  });

  const staffIds = departmentMembers.map((member) => member.staff_id);

  // Get approved dates for those staff_ids
  const approvedDates = await db.approved_dates.findMany({
    where: {
      staff_id: { in: staffIds }
    }
  });

  return approvedDates.length > 0 ? approvedDates : null;
}

// Create approved dates entry
export async function createApproveDates(payload: ApprovedDatesPayload) {
  const response = await db.approved_dates.create({
    data: {
      ...payload,
      date: new Date(payload.date) // Ensure date is stored as a Date object
    }
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}

// Update approved dates entry
export async function updateApproveDates(payload: ApprovedDatesPayload) {
  const response = await db.approved_dates.update({
    where: {
      staff_id_request_id_date: {
        staff_id: payload.staff_id,
        request_id: payload.request_id,
        date: new Date(payload.date) // Convert to Date object
      }
    },
    data: payload // Update non-key fields if applicable
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}

// Delete approved dates entry
export async function deleteApproveDates(payload: ApprovedDatesPayload) {
  const response = await db.approved_dates.delete({
    where: {
      staff_id_request_id_date: {
        staff_id: payload.staff_id,
        request_id: payload.request_id,
        date: new Date(payload.date) // Ensure date is handled as a Date object
      }
    }
  });
  return response ? { success: true } : { success: false, error: 'Failed!' };
}

export async function getApprovedDatesWithUserDetails() {
  try {
    // const response = await db.approved_dates.findMany();
    const response = await db.approved_dates.findMany({
      select: {
        staff_id: true,
        request_id: true,
        date: true,
        users: {
          select: {
            staff_fname: true,
            staff_lname: true,
            dept_id: true,
            position: true,
            email: true
          }
        }
      }
    });
    console.log(response);
    return response;
    console.log('approvedDates');
    console.log('response detail', response);
  } catch (error) {
    console.error('Error fetching approved dates:', error);
  }
}
