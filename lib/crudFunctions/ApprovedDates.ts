'use server';
import { db } from '@/lib/db';
import { ApprovedDate, DatabaseApprovedDate } from '@/types/approvedDate';

export async function getApprovedDates() {
  const response = await db.approved_dates.findMany();
  if (response) return response;
}

export async function createApproveDates(payload: any) {
  const response = await db.approved_dates.create({
    data: payload
  });
  if (response) return { success: true };
  return { success: false, error: 'Failed!' };
}

export async function updateApproveDates(payload: any) {
  const response = await db.approved_dates.update({
    where: {
      staff_id_request_id_date: {
        staff_id: payload.staff_id,
        request_id: payload.request_id,
        date: new Date(payload.date) // Ensure date is a Date object
      }
    },
    data: payload // Only update non-key fields
  });
  if (response) return { success: true };
  return { success: false, error: 'Failed!' };
}

export async function deleteApproveDates(payload: any) {
  const response = await db.approved_dates.delete({
    where: {
      staff_id_request_id_date: {
        staff_id: payload.staff_id,
        request_id: payload.request_id,
        date: new Date(payload.date) // Ensure date is a Date object
      }
    }
  });
  if (response) return { success: true };
  return { success: false, error: 'Failed!' };
}

// Annette : Function to get the department for the logged-in user and their staff
export const getStaffInDepartment = async (userId: number) => {
  try {
    // First, find the user's reporting manager
    const user = await db.users.findUnique({
      where: { staff_id: userId },
      select: { reporting_manager: true, dept_id: true } // Get the reporting manager and department ID
    });

    if (!user || !user.reporting_manager) {
      throw new Error('User or reporting manager not found');
    }

    // Now find staff who report to this manager
    const staffInDepartment = await db.users.findMany({
      where: { reporting_manager: user.reporting_manager },
      select: {
        staff_id: true,
        staff_fname: true,
        staff_lname: true // Assuming you have first and last name fields
        // Include any other fields you want
      }
    });

    return staffInDepartment; // Return the staff list
  } catch (error) {
    console.error('Error fetching staff in department:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

export async function getApprovedDatesWithUserDetails(): Promise<
  ApprovedDate[]
> {
  try {
    const response = await db.approved_dates.findMany({
      include: {
        users: {
          select: {
            staff_id: true,
            staff_fname: true,
            staff_lname: true,
            dept_id: true,
            position: true,
            email: true,
            reporting_manager: true
          }
        }
      }
    });

    // Convert the database result to our ApprovedDate type
    const convertedResponse: ApprovedDate[] = response.map(
      (item: DatabaseApprovedDate) => ({
        ...item,
        date: item.date.toISOString().split('T')[0] // Convert Date to 'YYYY-MM-DD' string
      })
    );

    return convertedResponse;
  } catch (error) {
    console.error('Error fetching approved dates:', error);
    throw error;
  }
}
