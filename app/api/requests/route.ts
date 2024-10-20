import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const singleRequestSchema = z.object({
  staff_id: z.number(),
  timeslot: z.string(),
  date: z.string(), // Expecting a date string in 'yyyy-MM-dd' format
  reason: z.string(),
  status: z.string().default('pending'),
  document_url: z.string().optional(),
  processor_id: z.number()
});

const requestArraySchema = z.array(singleRequestSchema);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get('staffId');
  const reportingManager = searchParams.get('reportingManager');
  const department = searchParams.get('department');

  let requests;

  if (staffId) {
    requests = await prisma.requests.findMany({
      where: { staff_id: parseInt(staffId) }
    });
  } else if (reportingManager) {
    const staffIds = await prisma.users.findMany({
      where: { reporting_manager: parseInt(reportingManager) },
      select: { staff_id: true }
    });
    requests = await prisma.requests.findMany({
      where: { staff_id: { in: staffIds.map((user) => user.staff_id) } }
    });
  } else if (department) {
    const staffIds = await prisma.users.findMany({
      where: { department },
      select: { staff_id: true }
    });
    requests = await prisma.requests.findMany({
      where: { staff_id: { in: staffIds.map((user) => user.staff_id) } }
    });
  } else {
    requests = await prisma.requests.findMany({
      select: {
        staff_id: true
      }
    });
    //
    requests = await prisma.requests.findMany({
      select: {
        staff_id: true,
        request_id: true,
        date: true,
        timeslot: true,
        reason: true,
        status: true,
        document_url: true,
        created_at: true,
        last_updated: true,
        // temp_replacement: true,
        users: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true,
            email: true
          }
        }
      }
    });
  }

  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body as an array of requests
    const validatedData = requestArraySchema.parse(body);

    // Create a new request for each item in the array
    const newRequests = await Promise.all(
      validatedData.map(async (requestData) => {
        return prisma.requests.create({
          data: {
            staff_id: requestData.staff_id,
            timeslot: requestData.timeslot,
            date: new Date(requestData.date), // Convert string to Date object
            reason: requestData.reason,
            status: requestData.status,
            document_url: requestData.document_url,
            processor_id: requestData.processor_id
          }
        });
      })
    );

    return NextResponse.json(newRequests, { status: 201 });
  } catch (error) {
    console.error('Error processing request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  const body = await request.json();
  const { request_id, status, reason, processor_id } = body;

  // Start a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Fetch the current request
    let currentRequest = await prisma.requests.findUnique({
      where: { request_id: parseInt(request_id) }
    });

    if (!currentRequest) {
      throw new Error('Request not found');
    }

    // Jon added: to overwrite status if the request is already approved
    const { searchParams } = new URL(request.url);
    const reportingManager = searchParams.get('reportingManager');

    if (reportingManager) {
      if (currentRequest.status === 'approved' && status === 'withdrawn') {
        currentRequest.status = 'withdraw_pending';
      }
    }

    // Determine the log action based on current and new status
    let logAction;
    if (currentRequest.status === 'pending' && status === 'approved') {
      logAction = 'approve';
    } else if (currentRequest.status === 'pending' && status === 'rejected') {
      logAction = 'reject';
    } else if (
      currentRequest.status === 'withdraw_pending' &&
      status === 'rejected'
    ) {
      logAction = 'withdraw_reject';
    } else if (
      currentRequest.status === 'withdraw_pending' &&
      status === 'withdrawn'
    ) {
      logAction = 'withdraw';
    } else if (status === 'cancelled') {
      logAction = 'cancel';
      // Processor ID is set to staff ID when cancelled
    } else {
      throw new Error('Invalid status transition');
    }

    // Update the request
    const updatedRequest = await prisma.requests.update({
      where: { request_id: parseInt(request_id) },
      data: { status, last_updated: new Date() }
    });

    // Create a log entry
    const newLog = await prisma.logs.create({
      data: {
        staff_id: currentRequest.staff_id,
        request_id: parseInt(request_id),
        processor_id:
          status === 'cancelled'
            ? currentRequest.staff_id
            : parseInt(processor_id),
        reason,
        action: logAction,
        created_at: new Date()
      }
    });

    return { updatedRequest, newLog };
  });

  return NextResponse.json(result);
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  return new NextResponse(null, { headers });
}
