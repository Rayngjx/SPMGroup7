import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const roles = await prisma.role.findMany();
  return NextResponse.json(roles);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newRole = await prisma.role.create({ data: body });
  return NextResponse.json(newRole);
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  return new NextResponse(null, { headers });
}
