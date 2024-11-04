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
  try {
    const { searchParams } = new URL(request.url);
    const staff_id = searchParams.get('staff_id');
    const reportingManager = searchParams.get('reportingManager');
    const department = searchParams.get('department');
    const requestId = searchParams.get('requestId');

    let requests;
    if (requestId) {
      const specificRequest = await prisma.requests.findUnique({
        where: { request_id: parseInt(requestId) },
        include: {
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

      if (!specificRequest) {
        throw new Error('Request not found');
      }

      return NextResponse.json(specificRequest);
    } else if (staff_id) {
      requests = await prisma.requests.findMany({
        where: { staff_id: parseInt(staff_id) }
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
          processor_id: true,
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
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body as an array of requests
    const validatedData = requestArraySchema.parse(body);

    // Use a transaction to ensure both request and log creation succeed
    const results = await prisma.$transaction(async (prisma) => {
      return Promise.all(
        validatedData.map(async (requestData) => {
          // Create the request
          const newRequest = await prisma.requests.create({
            data: {
              staff_id: requestData.staff_id,
              timeslot: requestData.timeslot,
              date: new Date(requestData.date),
              reason: requestData.reason,
              status: requestData.status,
              document_url: requestData.document_url,
              processor_id: requestData.processor_id
            }
          });

          // Create the corresponding log entry
          const newLog = await prisma.logs.create({
            data: {
              staff_id: requestData.staff_id,
              request_id: newRequest.request_id, // Ensure newRequest is defined
              processor_id: requestData.staff_id, // processor is the staff making the request
              reason: requestData.reason,
              action: 'request',
              created_at: new Date()
            }
          });

          return { request: newRequest, log: newLog };
        })
      );
    });

    return NextResponse.json(results, { status: 201 });
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
  console.log(body);
  const { request_id, status, reason, processor_id, new_date } = body;

  // Start a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Fetch the current request
    let currentRequest = await prisma.requests.findUnique({
      where: { request_id: parseInt(request_id) }
    });

    if (!currentRequest) {
      throw new Error('Request not found');
    }

    // Handle date change for pending requests
    if (new_date && currentRequest.status === 'pending') {
      // Check if the new date is available
      const existingRequest = await prisma.requests.findFirst({
        where: {
          staff_id: currentRequest.staff_id,
          date: new Date(new_date),
          status: {
            in: ['pending', 'approved', 'withdraw_pending']
          },
          request_id: {
            not: parseInt(request_id) // Exclude current request
          }
        }
      });
      console.log(existingRequest);
      // if (existingRequest) {
      //   throw new Error('Date not available');
      // }

      // Update the request with new date
      const updatedRequest = await prisma.requests.update({
        where: { request_id: parseInt(request_id) },
        data: {
          date: new Date(new_date),
          last_updated: new Date()
        }
      });

      // Create a log entry for date change
      const newLog = await prisma.logs.create({
        data: {
          staff_id: currentRequest.staff_id,
          request_id: parseInt(request_id),
          processor_id: currentRequest.staff_id,
          reason: `Date changed from ${
            currentRequest.date.toISOString().split('T')[0]
          } to ${new_date}`,
          action: 'change_date',
          created_at: new Date()
        }
      });

      return { updatedRequest, newLog };
    }

    // Handle status changes

    // Determine the log action based on current and new status
    let logAction;
    let newstatus;
    if (currentRequest.status === 'pending' && status === 'approved') {
      logAction = 'approve';
      newstatus = 'approved';
    } else if (currentRequest.status === 'pending' && status === 'rejected') {
      logAction = 'reject';
      newstatus = 'rejected';
    } else if (
      currentRequest.status === 'withdraw_pending' &&
      status === 'rejected'
    ) {
      logAction = 'withdraw_reject';
      newstatus = 'approved';
    } else if (
      currentRequest.status === 'withdraw_pending' &&
      status === 'approved'
    ) {
      logAction = 'withdraw_approve';
      newstatus = 'withdrawn';
    } else if (status === 'cancelled') {
      logAction = 'cancel';
      newstatus = 'cancelled';
    } else if (status === 'withdraw_pending') {
      logAction = 'withdraw';
      newstatus = 'withdraw_pending';
    } else if (currentRequest.status === 'approved' && status === 'withdrawn') {
      logAction = 'forced_withdraw';
      newstatus = 'withdrawn';
    } else if (
      currentRequest.status === 'withdraw_pending' &&
      status === 'withdrawn'
    ) {
      logAction = 'forced_withdraw';
      newstatus = 'withdrawn';
    } else {
      throw new Error('Invalid status transition');
    }

    // Update the request
    const updatedRequest = await prisma.requests.update({
      where: { request_id: parseInt(request_id) },
      data: {
        status: newstatus,
        last_updated: new Date()
      }
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
