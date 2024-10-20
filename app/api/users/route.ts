import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const staff_id = searchParams.get('staff_id');
  const department = searchParams.get('department');
  const reportingManager = searchParams.get('reportingManager');

  let users;

  if (staff_id) {
    users = await prisma.users.findUnique({
      where: { staff_id: parseInt(staff_id) }
    });
  } else if (department) {
    users = await prisma.users.findMany({ where: { department } });
  } else if (reportingManager) {
    users = await prisma.users.findMany({
      where: { reporting_manager: parseInt(reportingManager) }
    });
  } else if (staff_id) {
    users = await prisma.users.findUnique({
      where: { staff_id: parseInt(staff_id) }
    });
  } else {
    users = await prisma.users.findMany();
  }

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newUser = await prisma.users.create({ data: body });
  return NextResponse.json(newUser);
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  return new NextResponse(null, { headers });
}
