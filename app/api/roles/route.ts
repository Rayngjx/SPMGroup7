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

// PUT method for updating a role
export async function PUT(request: Request) {
  const { role_id, role_title } = await request.json();

  // Update the role in the database
  const updatedRole = await prisma.role.update({
    where: { role_id: role_id },
    data: { role_title: role_title }
  });

  return NextResponse.json(updatedRole);
}

// DELETE method for removing a role by role_id
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const role_id = searchParams.get('role_id');

  if (!role_id) {
    return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
  }

  // Delete the role in the database
  const deletedRole = await prisma.role.delete({
    where: { role_id: Number(role_id) }
  });

  return NextResponse.json(deletedRole);
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  return new NextResponse(null, { headers });
}
