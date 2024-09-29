import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { updateRole, deleteRole } from '@/lib/crudFunctions/Role';

// Handle GET request to fetch a specific role by roleId
export async function GET(
  req: Request,
  { params }: { params: { roleId: string } }
) {
  const roleId = parseInt(params.roleId);

  if (!roleId) {
    return NextResponse.json({ error: 'Invalid roleId' }, { status: 400 });
  }

  try {
    const role = await db.role.findUnique({
      where: { role_id: roleId }
    });

    return role
      ? NextResponse.json(role)
      : NextResponse.json({ error: 'Role not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// Handle PUT request to update a specific role by roleId
export async function PUT(
  req: Request,
  { params }: { params: { roleId: string } }
) {
  const roleId = parseInt(params.roleId);

  if (!roleId) {
    return NextResponse.json({ error: 'Invalid roleId' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const payload = { ...body, role_id: roleId }; // Attach roleId to the payload
    const result = await updateRole(payload);

    return result.success
      ? NextResponse.json(result, { status: 200 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete a specific role by roleId
export async function DELETE(
  req: Request,
  { params }: { params: { roleId: string } }
) {
  const roleId = parseInt(params.roleId);

  if (!roleId) {
    return NextResponse.json({ error: 'Invalid roleId' }, { status: 400 });
  }

  try {
    const result = await deleteRole(roleId);

    return result.success
      ? NextResponse.json(result, { status: 200 })
      : NextResponse.json({ error: result.error }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json(
    { allow: ['GET', 'PUT', 'DELETE'] },
    { status: 200 }
  );
}
