import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  const body = await request.json();
  const newRequest = await prisma.requests.create({ data: body });
  return NextResponse.json(newRequest);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { request_id, status, processor_id, reason } = body;

  // Start a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Fetch the current request
    const currentRequest = await prisma.requests.findUnique({
      where: { request_id: parseInt(request_id) }
    });

    if (!currentRequest) {
      throw new Error('Request not found');
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
        processor_id: parseInt(processor_id),
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
