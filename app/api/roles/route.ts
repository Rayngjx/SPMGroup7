import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const roles = await prisma.role.findMany();
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRole = await prisma.role.create({ data: body });
    return NextResponse.json(newRole);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { role_id, role_title } = await request.json();
    const updatedRole = await prisma.role.update({
      where: { role_id: role_id },
      data: { role_title: role_title }
    });
    return NextResponse.json(updatedRole);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role_id = searchParams.get('role_id');

    if (!role_id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    const deletedRole = await prisma.role.delete({
      where: { role_id: Number(role_id) }
    });
    return NextResponse.json(deletedRole);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  });
}
