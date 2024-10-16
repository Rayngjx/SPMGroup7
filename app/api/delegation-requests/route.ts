import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get('staffId');

  const delegationRequests = await prisma.delegation_requests.findMany({
    where: staffId ? { staff_id: parseInt(staffId) } : {}
  });

  return NextResponse.json(delegationRequests);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newDelegationRequest = await prisma.delegation_requests.create({
    data: body
  });
  return NextResponse.json(newDelegationRequest);
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  return new NextResponse(null, { headers });
}
