// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const staff_id = searchParams.get('staff_id');
    const department = searchParams.get('department');
    const reportingManager = searchParams.get('reportingManager');

    let users;

    if (staff_id) {
      users = await prisma.users.findUnique({
        where: { staff_id: parseInt(staff_id) }
      });
      if (!users) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else if (department) {
      users = await prisma.users.findMany({ where: { department } });
    } else if (reportingManager) {
      users = await prisma.users.findMany({
        where: { reporting_manager: parseInt(reportingManager) }
      });
    } else {
      users = await prisma.users.findMany();
    }

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation
    if (!body.staff_id || !body.department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newUser = await prisma.users.create({ data: body });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
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
