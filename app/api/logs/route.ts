import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const logs = await prisma.logs.findMany();
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
