import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const delegationRequestSchema = z.object({
  staff_id: z.number(),
  delegated_to: z.number(),
  reason: z.string(),
  status: z.string().default('pending')
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const staff_id = searchParams.get('staff_id');
  const delegated_to = searchParams.get('delegated_to');
  const delegationRequestId = searchParams.get('delegationRequestId');

  let delegationRequests;

  if (staff_id && delegated_to) {
    // Get specific request between staff_id and delegated_to
    delegationRequests = await prisma.delegation_requests.findMany({
      where: {
        AND: [
          { staff_id: parseInt(staff_id) },
          { delegated_to: parseInt(delegated_to) }
        ]
      },
      include: {
        users_delegation_requests_staff_idTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        },
        users_delegation_requests_delegated_toTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        }
      }
    });
  } else if (staff_id) {
    // Get requests made by staff_id
    delegationRequests = await prisma.delegation_requests.findMany({
      where: { staff_id: parseInt(staff_id) },
      include: {
        users_delegation_requests_staff_idTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        },
        users_delegation_requests_delegated_toTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        }
      }
    });
  } else if (delegated_to) {
    // Get requests where user is delegated to
    delegationRequests = await prisma.delegation_requests.findMany({
      where: { delegated_to: parseInt(delegated_to) },
      include: {
        users_delegation_requests_staff_idTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        },
        users_delegation_requests_delegated_toTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        }
      }
    });
  } else if (delegationRequestId) {
    // Get specific request
    delegationRequests = await prisma.delegation_requests.findUnique({
      where: { delegation_request: parseInt(delegationRequestId) },
      include: {
        users_delegation_requests_staff_idTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        },
        users_delegation_requests_delegated_toTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        }
      }
    });
  }

  return NextResponse.json(delegationRequests);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = delegationRequestSchema.parse(body);

    const result = await prisma.$transaction(async (prisma) => {
      // Create delegation request
      const newRequest = await prisma.delegation_requests.create({
        data: {
          staff_id: validatedData.staff_id,
          delegated_to: validatedData.delegated_to,
          status: 'pending'
        }
      });

      // Create log entry
      const newLog = await prisma.logs_dele.create({
        data: {
          staff_id: validatedData.staff_id,
          delegation_request_id: newRequest.delegation_request,
          processor_id: validatedData.staff_id,
          reason: validatedData.reason,
          action: 'request'
        }
      });

      return { request: newRequest, log: newLog };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // console.error('Error processing request:', error);
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
  try {
    const body = await request.json();
    const { delegation_request, status, reason, processor_id } = body;

    const result = await prisma.$transaction(async (prisma) => {
      // Get current request
      const currentRequest = await prisma.delegation_requests.findUnique({
        where: { delegation_request: parseInt(delegation_request) }
      });

      if (!currentRequest) {
        throw new Error('Request not found');
      }

      let logAction;
      let updatedRequest;

      switch (status) {
        case 'approved':
          // Update delegation request
          updatedRequest = await prisma.delegation_requests.update({
            where: { delegation_request: parseInt(delegation_request) },
            data: { status: 'approved' }
          });

          if (currentRequest.delegated_to !== null) {
            await prisma.users.update({
              where: { staff_id: currentRequest.delegated_to },
              data: { temp_replacement: currentRequest.staff_id }
            });
          } else {
            throw new Error('Delegated_to staff_id is missing.');
          }

          // Update user's temp_replacement

          logAction = 'delegation_approve';
          break;

        case 'rejected':
          updatedRequest = await prisma.delegation_requests.update({
            where: { delegation_request: parseInt(delegation_request) },
            data: { status: 'rejected' }
          });
          logAction = 'delegation_reject';
          break;

        case 'cancelled':
          updatedRequest = await prisma.delegation_requests.update({
            where: { delegation_request: parseInt(delegation_request) },
            data: { status: 'cancelled' }
          });
          logAction = 'cancelled';
          break;

        case 'redacted':
          // Update delegation request
          updatedRequest = await prisma.delegation_requests.update({
            where: { delegation_request: parseInt(delegation_request) },
            data: { status: 'redacted' }
          });

          // Remove temp_replacement
          if (currentRequest.delegated_to !== null) {
            await prisma.users.update({
              where: { staff_id: currentRequest.delegated_to },
              data: { temp_replacement: null }
            });
          } else {
            throw new Error('Delegated_to staff_id is missing.');
          }

          // await prisma.users.update({
          //   where: { staff_id: currentRequest.delegated_to },
          //   data: { temp_replacement: null }
          // });

          logAction = 'redacted';
          break;

        default:
          throw new Error('Invalid status');
      }

      // Create log entry
      const newLog = await prisma.logs_dele.create({
        data: {
          staff_id: currentRequest.staff_id,
          delegation_request_id: parseInt(delegation_request),
          processor_id:
            status === 'cancelled' || status === 'redacted'
              ? currentRequest.staff_id
              : parseInt(processor_id),
          reason,
          action: logAction
        }
      });

      return { updatedRequest, newLog };
    });

    return NextResponse.json(result);
  } catch (error) {
    // console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  });
}
