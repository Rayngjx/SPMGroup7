'use server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface RequestsPayload {
  request_id?: number; // Optional for create
  staff_id: number;
  timeslot: string;
  dates: string[] | string; // Changed from daterange to dates
  reason?: string;
  approved: string;
  document_url?: string | null;
}

// Get all requests
export async function getRequests() {
  const response = await db.requests.findMany();
  return response ? response : null;
}

// Get user requests
export async function getUserRequests(staff_id: number) {
  const response = await db.requests.findMany({
    where: {
      staff_id: staff_id
    }
  });
  return response ? response : null;
}

// Get team requests as manager
export async function getTeamRequests(managerStaffId: number) {
  const teamMembers = await db.users.findMany({
    where: {
      reporting_manager: managerStaffId
    },
    select: {
      staff_id: true
    }
  });

  const staffIds = teamMembers.map((member) => member.staff_id);

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
    let datesArray: Date[];

    if (typeof payload.dates === 'string') {
      try {
        datesArray = JSON.parse(payload.dates).map(
          (date: string) => new Date(date)
        );
      } catch (parseError) {
        console.error('Failed to parse dates:', parseError);
        return {
          success: false,
          error: `Failed to parse dates: ${(parseError as Error).message}`
        };
      }
    } else if (Array.isArray(payload.dates)) {
      datesArray = payload.dates.map((date) => new Date(date));
    } else {
      console.error('Invalid dates format:', payload.dates);
      return {
        success: false,
        error:
          'Invalid dates format. Expected an array of date strings or a JSON string.'
      };
    }

    const response = await db.requests.create({
      data: {
        staff_id: payload.staff_id,
        timeslot: payload.timeslot,
        dates: datesArray,
        reason: payload.reason,
        approved: payload.approved,
        document_url: payload.document_url
      }
    });
    console.log('Request created successfully:', response);
    return { success: true, request: response };
  } catch (error) {
    console.error('Error in createRequest:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error message:', error.message);
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'A request with this ID already exists. Please try again.'
        };
      }
    }
    return {
      success: false,
      error: `Failed to create request: ${(error as Error).message}`
    };
  }
}

// Update an existing request
export async function updateRequest(payload: RequestsPayload) {
  if (!payload.request_id) {
    return { success: false, error: 'Request ID is required for updating!' };
  }

  try {
    let datesArray: string[];

    // Parse dates if it's a string, otherwise use it directly
    if (typeof payload.dates === 'string') {
      try {
        datesArray = JSON.parse(payload.dates);
      } catch (parseError) {
        return {
          success: false,
          error: `Failed to parse dates: ${(parseError as Error).message}`
        };
      }
    } else if (Array.isArray(payload.dates)) {
      datesArray = payload.dates;
    } else {
      return {
        success: false,
        error: 'Invalid dates format. Expected an array of date strings.'
      };
    }

    // Validate that we have an array of strings
    if (
      !Array.isArray(datesArray) ||
      !datesArray.every((date) => typeof date === 'string')
    ) {
      return {
        success: false,
        error: 'Invalid dates format. Expected an array of date strings.'
      };
    }

    const response = await db.requests.update({
      where: { request_id: payload.request_id },
      data: {
        staff_id: payload.staff_id,
        timeslot: payload.timeslot,
        dates: { set: datesArray.map((date) => new Date(date)) },
        reason: payload.reason,
        approved: payload.approved,
        document_url: payload.document_url
      }
    });
    return { success: true, request: response };
  } catch (error) {
    return {
      success: false,
      error: `Failed to update request: ${(error as Error).message}`
    };
  }
}
// Delete a request
export async function deleteRequest(request_id: number) {
  try {
    const response = await db.requests.delete({
      where: { request_id }
    });
    return { success: true, request: response };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete request: ${(error as Error).message}`
    };
  }
}
