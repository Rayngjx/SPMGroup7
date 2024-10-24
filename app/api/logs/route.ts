import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('requestId');

  if (requestId) {
    const logs = await prisma.logs.findMany({
      where: { request_id: parseInt(requestId) },
      orderBy: { created_at: 'asc' },
      include: {
        users_logs_staff_idTousers: {
          select: { staff_fname: true, staff_lname: true }
        },
        users_logs_processor_idTousers: {
          select: { staff_fname: true, staff_lname: true }
        }
      }
    });
    return NextResponse.json(logs);
  }

  const logs = await prisma.logs.findMany({
    include: {
      users_logs_staff_idTousers: {
        select: { staff_fname: true, staff_lname: true }
      },
      users_logs_processor_idTousers: {
        select: { staff_fname: true, staff_lname: true }
      }
    }
  });
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newLog = await prisma.logs.create({ data: body });
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
