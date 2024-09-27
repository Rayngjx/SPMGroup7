import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { createRole, getRoles } from '@/lib/crudFunctions/Role';

// Handle GET request to fetch all roles
export async function GET() {
  try {
    const roles = await getRoles();
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// Handle POST request to create a new role
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const result = await createRole(payload);

    return result.success
      ? NextResponse.json(result, { status: 201 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({ allow: ['GET', 'POST'] }, { status: 200 });
}
