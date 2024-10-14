import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import {
  createRole,
  deleteRole,
  getRoles,
  updateRole
} from '@/lib/crudFunctions/Role';

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
    console.log(payload);

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

export async function DELETE(req: Request) {
  try {
    // Parse role_id from request URL or body
    const { searchParams } = new URL(req.url);
    const roleId = searchParams.get('role_id'); // assuming role_id is passed in the query string

    if (!roleId) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteRole(parseInt(roleId));

    return result.success
      ? NextResponse.json(
          { message: 'Role deleted successfully' },
          { status: 200 }
        )
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const result = await updateRole(payload);
    console.log(payload);

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
