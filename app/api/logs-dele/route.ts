// app/api/logs-dele/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const delegationRequestId = searchParams.get('delegationRequestId');

  if (delegationRequestId) {
    const logs = await prisma.logs_dele.findMany({
      where: { delegation_request_id: parseInt(delegationRequestId) },
      orderBy: { created_at: 'asc' },
      include: {
        users_logs_dele_staff_idTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        },
        users_logs_dele_processor_idTousers: {
          select: {
            staff_fname: true,
            staff_lname: true,
            department: true,
            position: true
          }
        }
      }
    });
    return NextResponse.json(logs);
  }

  const logs = await prisma.logs_dele.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      users_logs_dele_staff_idTousers: {
        select: {
          staff_fname: true,
          staff_lname: true,
          department: true,
          position: true
        }
      },
      users_logs_dele_processor_idTousers: {
        select: {
          staff_fname: true,
          staff_lname: true,
          department: true,
          position: true
        }
      }
    }
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newLog = await prisma.logs_dele.create({
    data: body,
    include: {
      users_logs_dele_staff_idTousers: {
        select: {
          staff_fname: true,
          staff_lname: true,
          department: true,
          position: true
        }
      },
      users_logs_dele_processor_idTousers: {
        select: {
          staff_fname: true,
          staff_lname: true,
          department: true,
          position: true
        }
      }
    }
  });
  return NextResponse.json(newLog);
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  return new NextResponse(null, { headers });
}
