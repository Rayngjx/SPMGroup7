'use server';
import { db } from '@/lib/db';

interface RequestsPayload {
  request_id?: number; // Optional for create
  staff_id: number;
  timeslot: string;
  daterange: string[]; // Change this to an array of strings for multiple dates
  reason?: string;
  approved: string;
  document_url?: string;
}

// Get all requests
export async function getRequests() {
  const response = await db.requests.findMany();
  return response ? response : null;
}

// Get user requests
export async function getUserRequests(payload: RequestsPayload) {
  const response = await db.requests.findMany({
    where: {
      staff_id: payload.staff_id
    }
  });
  return response ? response : null;
}

// Get team requests as manager
export async function getTeamRequests(managerStaffId: number) {
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

  // Find all requests for the staff IDs
  const response = await db.requests.findMany({
    where: {
      staff_id: {
        in: staffIds
      }
    }
  });

  return response ? response : null;
}

// Create a new request
export async function createRequest(payload: RequestsPayload) {
  try {
    const response = await db.requests.create({
      data: {
        staff_id: payload.staff_id,
        timeslot: payload.timeslot,
        daterange: payload.daterange.map((date) => new Date(date)),
        reason: payload.reason,
        approved: payload.approved,
        document_url: payload.document_url // Make sure to include this if it's part of your schema
      }
    });
    return { success: true, request: response };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'A unique constraint would be violated.'
        };
      }
    }
    return {
      success: false,
      error: `Failed to create request: ${error.message}`
    };
  }
}

// Update an existing request
export async function updateRequest(payload: RequestsPayload) {
  if (!payload.request_id) {
    return { success: false, error: 'Request ID is required for updating!' };
  }

  const response = await db.requests.update({
    where: { request_id: payload.request_id },
    data: {
      staff_id: payload.staff_id,
      timeslot: payload.timeslot,
      daterange: payload.daterange.map((date) => new Date(date)), // Convert dates to Date objects
      reason: payload.reason,
      approved: payload.approved
    }
  });
  return response
    ? { success: true }
    : { success: false, error: 'Failed to update request!' };
}

// Delete a request
export async function deleteRequest(request_id: number) {
  const response = await db.requests.delete({
    where: { request_id }
  });
  return response
    ? { success: true }
    : { success: false, error: 'Failed to delete request!' };
}
